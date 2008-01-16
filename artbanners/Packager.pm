package Packager;

use strict;
use warnings;

sub new
{
  my ($class, $params) = @_;

  my $self = bless($params, $class);

  return $self;
}

sub readVersion
{
  my ($self, $versionFile) = @_;

  open(local *FILE, $versionFile) or die "Could not open version file $versionFile";
  $self->{version} = <FILE>;
  $self->{version} =~ s/[^\w\.]//gs;
  $self->{version} .= $self->{devbuild} if exists $self->{devbuild};
  close(FILE);
}

sub readLocales
{
  my ($self, $localesDir) = @_;

  opendir(local *DIR, $localesDir) or die "Could not open locales directory $localesDir";
  my @locales = grep {!/[^\w\-]/ && !/CVS/} readdir(DIR);
  closedir(DIR);
  
  @locales = sort {$a eq "en-US" ? -1 : ($b eq "en-US" ? 1 : $a cmp $b)} @locales;

  $self->{locales} = \@locales;
}

sub rm_rec
{
  my ($self, $dir) = @_;

  opendir(local *DIR, $dir) or return;
  foreach my $file (readdir(DIR))
  {
    if ($file =~ /[^.]/)
    {
      if (-d "$dir/$file")
      {
        $self->rm_rec("$dir/$file");
      }
      else
      {
        unlink("$dir/$file");
      }
    }
  }
  closedir(DIR);

  rmdir($dir);
}

sub cp
{
  my ($self, $fromFile, $toFile) = @_;

  my $textMode = ($fromFile =~ /\.(manifest|xul|js|xml|xhtml|rdf|dtd|properties|css)$/);
  my $extendedTextMode = ($fromFile =~ /\.(?:js|rdf|manifest)$/);

  open(local *FROM, $fromFile) or return;
  open(local *TO, ">$toFile") or return;
  binmode(TO);
  if ($textMode)
  {
    print TO map {
      s/\r//g;
      s/^((?:  )+)/"\t" x (length($1)\/2)/e;
      s/\{\{VERSION\}\}/$self->{version}/g if $extendedTextMode;
      if ($extendedTextMode && /\{\{LOCALE\}\}/)
      {
        my $loc = "";
        for my $locale (@{$self->{locales}})
        {
          my $tmp = $_;
          $tmp =~ s/\{\{LOCALE\}\}/$locale/g;
          $loc .= $tmp;
        }
        $_ = $loc;
      }

      $_ = $self->{postprocess_line}->($fromFile, $_) if exists $self->{postprocess_line};

      $_;
    } <FROM>;
  }
  else
  {
    local $/;
    binmode(FROM);
    print TO <FROM>;
  }

  $self->{postprocess_file}->($fromFile, *TO) if exists $self->{postprocess_file};

  close(TO);
  close(FROM);
}

sub cp_rec
{
  my ($self, $fromDir, $toDir) = @_;

  my @files;
  if ($fromDir =~ /\blocale$/ && exists $self->{locales})
  {
    @files = @{$self->{locales}};
  }
  else
  {
    opendir(local *DIR, $fromDir) or return;
    @files = readdir(DIR);
    closedir(DIR);
  }

  $self->rm_rec($toDir);
  mkdir($toDir);
  foreach my $file (@files)
  {
    if ($file =~ /[^.]/ && $file ne 'CVS')
    {
      if (-d "$fromDir/$file")
      {
        $self->cp_rec("$fromDir/$file", "$toDir/$file");
      }
      else
      {
        $self->cp("$fromDir/$file", "$toDir/$file");
      }
    }
  }
}

sub createFileDir
{
  my ($self, $fileName) = @_;

  my @parts = split(/\/+/, $fileName);
  pop @parts;

  my $dir = '.';
  foreach my $part (@parts)
  {
    $dir .= '/' . $part;
    mkdir($dir);
  }
}

sub fixZipPermissions
{
  my ($self, $fileName) = @_;
  my $invalid = 0;
  my($buf, $entries, $dirlength);

  open(local *FILE, "+<", $fileName) or ($invalid = 1);
  unless ($invalid)
  {
    seek(FILE, -22, 2);
    sysread(FILE, $buf, 22);
    (my $signature, $entries, $dirlength) = unpack("Vx6vVx6", $buf);
    if ($signature != 0x06054b50)
    {
      print STDERR "Wrong end of central dir signature!\n";
      $invalid = 1;
    }
  }
  unless ($invalid)
  {
    seek(FILE, -22-$dirlength, 2);
    for (my $i = 0; $i < $entries; $i++)
    {
      sysread(FILE, $buf, 46);
      my ($signature, $namelen, $attributes) = unpack("Vx24vx8V", $buf);
      if ($signature != 0x02014b50)
      {
        print STDERR "Wrong central file header signature!\n";
        $invalid = 1;
        last;
      }
      my $attr_high = $attributes >> 16;
      $attr_high = ($attr_high & ~0777) | ($attr_high & 040000 ? 0755 : 0644);
      $attributes = ($attributes & 0xFFFF) | ($attr_high << 16);
      seek(FILE, -8, 1);
      syswrite(FILE, pack("V", $attributes));
      seek(FILE, 4 + $namelen, 1);
    }
  }
  close(FILE);

  unlink $fileName if $invalid;
}

sub makeJAR
{
  my ($self, $jarFile, @files) = @_;

  $self->rm_rec('tmp');
  unlink($jarFile);

  mkdir('tmp');

  foreach my $file (@files)
  {
    if (-d $file)
    {
      $self->cp_rec($file, "tmp/$file");
    }
    else
    {
      $self->cp($file, "tmp/$file");
    }
  }

  chdir('tmp');
  print `zip -rX0 $jarFile @files`;
  chdir('..');

  rename("tmp/$jarFile", "$jarFile");
  
  $self->rm_rec('tmp');
}

sub makeXPI
{
  my ($self, $xpiFile, @files) = @_;

  $self->rm_rec('tmp');
  unlink($xpiFile);

  mkdir('tmp');

  foreach my $file (@files)
  {
    if (-d $file)
    {
      $self->cp_rec($file, "tmp/$file");
    }
    else
    {
      $self->createFileDir("tmp/$file");
      $self->cp($file, "tmp/$file");
    }
  }

  chdir('tmp');
  print `zip -rX9 ../temp_xpi_file.xpi @files`;
  chdir('..');

  $self->fixZipPermissions("temp_xpi_file.xpi");
  
  rename("temp_xpi_file.xpi", $xpiFile);

  $self->rm_rec('tmp');
}

1;

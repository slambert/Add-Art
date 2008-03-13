#!/usr/bin/perl

use strict;
use warnings;
use lib qw(..);
use Packager;

my %params = ();

my $xpiFile = shift @ARGV || "artbanners.xpi";
if (@ARGV && $ARGV[0] =~ /^\+/)
{
  $params{devbuild} = $ARGV[0];
  shift @ARGV;
}

my $pkg = Packager->new(\%params);
$pkg->readVersion('version');

chdir('chrome');
$pkg->makeJAR('artbanners.jar', 'content', 'skin');
chdir('..');

$pkg->makeXPI($xpiFile, 'chrome/artbanners.jar', 'components', 'install.rdf', 'chrome.manifest');
unlink('chrome/artbanners.jar');

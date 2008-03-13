#!/usr/bin/perl

use strict;
use warnings;
use lib qw(..);
use Packager;

my %params = ();

my $xpiFile = shift @ARGV || "addart.xpi";
if (@ARGV && $ARGV[0] =~ /^\+/)
{
  $params{devbuild} = $ARGV[0];
  shift @ARGV;
}

my $pkg = Packager->new(\%params);
$pkg->readVersion('version');

chdir('chrome');
$pkg->makeJAR('addart.jar', 'content', 'skin');
chdir('..');

$pkg->makeXPI($xpiFile, 'chrome/addart.jar', 'components', 'install.rdf', 'chrome.manifest');
unlink('chrome/addart.jar');

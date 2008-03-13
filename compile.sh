#!/bin/sh

# duplicate the working directory
cp -r addart addart_working
mv addart addart_renamed && mv addart_working addart
cd addart

# strip .svn directories out
find . -type d -name .svn | xargs rm -rf

# package things up
cd chrome
zip -r addart.jar content skin
rm -rf content skin
cd ..
zip -r ../addart-build.xpi .

# revert & back out
cd ..
rm -rf addart
mv addart_renamed addart
exit 0

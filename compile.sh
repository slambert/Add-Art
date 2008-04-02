#!/bin/sh

# duplicate the working directory
echo "Duplicating..."
cp -r addart addart_working
mv addart addart_renamed && mv addart_working addart
cd addart

# strip .svn directories out
echo "Stripping .svn..."
find . -type d -name .svn | xargs rm -rf

# package things up
echo "Zippin..."
cd chrome
zip -rq addart.jar content skin
rm -rf content skin
cd ..
zip -rq ../addart-build.xpi .

# revert & back out
echo "Cleaning up..."
cd ..
rm -rf addart
mv addart_renamed addart

zip -q addart.xpi *.xpi install.rdf 

# MacOS can launch it right away for install, too
#echo "Opening w/ Firefox..."
#open -a Firefox addart-build.xpi

exit 0

#!/bin/sh

# duplicate the working directory
echo "Duplicating..."
cp -r addart addart_working
mv addart addart_renamed && mv addart_working addart
cd addart

# strip .svn directories out
echo "Stripping .svn..."
find . -type d -name .svn | xargs rm -rf


zip -rq ../addart-build.xpi .

# revert & back out
echo "Cleaning up..."
cd ..
rm -rf addart
mv addart_renamed addart

# MacOS can launch it right away for install, too
#echo "Opening w/ Firefox..."
#open -a Firefox addart-build.xpi

exit 0

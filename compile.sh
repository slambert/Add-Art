#!/bin/sh

# duplicate the working directory
echo "Duplicating..."
rm -f addart.xpi
cp -r addart addart_renamed
cd addart

# package things up
echo "Zippin..."

cd chrome
rm -f addart.jar
zip -rq addart.jar content skin locale -x "*.DS_Store"
rm -rf content skin locale
cd ..
rm -f ../addart-build.xpi
zip -rq ../addart-build.xpi . -x "*.DS_Store"

# revert & back out
echo "Cleaning up..."
cd ..
rm -rf addart
mv addart_renamed addart

zip -q addart.xpi *.xpi install.rdf 
rm -f addart-build.xpi

echo "BING BONG, it's ready..."

exit 0

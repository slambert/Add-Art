#!/bin/sh

# duplicate the working directory
echo "Duplicating..."
	# remove old version
	rm -f addart.xpi
	# create backup
	cp -r addart addart_backup
	cd addart

# package things up
echo "Zippin up addart.xpi..."

	cd chrome
	# Remove old addart.jar
	rm -f addart.jar
	# jar up the content and locale folders
	zip -rqv addart.jar content locale -x "*.DS_Store"
	# delete the content and locale folders
	# so they don't end up duplicated in the .xpi
	rm -rf content locale
	cd ..
	rm -f ../addart-alone.xpi
	zip -rqv ../addart.xpi . -x "*.DS_Store"

# revert & back out
echo "Cleaning up..."
	cd ..
	rm -rf addart
	mv addart_backup addart

# echo "Zippin up addart.xpi..."
# zip -qv addart.xpi *.xpi install.rdf 
# # rm -f addart-alone.xpi

echo "BING BONG, it's ready..."

exit 0

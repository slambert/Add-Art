#!/bin/sh

cd artbanners/chrome
zip -r artbanners.jar content skin
cd ..
zip -r ../artbanners-build.xpi .

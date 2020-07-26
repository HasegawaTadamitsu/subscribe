#!/bin/sh

find . -name \*~ -exec rm -rf {} \;

cd ./archive
zip -r ../subscribe_ttrss.xpi *

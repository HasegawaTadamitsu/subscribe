#!/bin/sh

find . -name \*~ -exec rm -rf {} \;
rm -rf ./subscribe.tar
rm -rf ./subscribe_ttrss.xpi
rm -rf ./subscribe.tar.gz

cd ../
tar -cvf ./subscribe.tar ./subscribe/
mv ./subscribe.tar ./subscribe/

cd ./subscribe/
gzip subscribe.tar


cd ./archive
zip -r ../subscribe_ttrss.xpi *


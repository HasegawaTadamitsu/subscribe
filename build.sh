#!/bin/sh

find . -name \*~ -exec rm -rf {} \;
rm -rf ./subscribe.tar
rm -rf ./subscribe_ttrss.xpi

cd ../
tar -cvf ./subscribe.tar ./subscribe/
mv ./subscribe.tar ./subscribe/

cd ./subscribe/

cd ./archive
zip -r ../subscribe_ttrss.xpi *


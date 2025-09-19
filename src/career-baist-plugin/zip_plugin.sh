#!/bin/bash
sudo npm run build
FILE_OR_DIR=("./assets/" "./res/" "./languages/" "./career-baist-plugin.php")
OUTPUT_ZIP="../../build/career-baist-plugin.zip"
zip -r $OUTPUT_ZIP ${FILE_OR_DIR[@]}
echo "done zip, output file: $OUTPUT_ZIP"
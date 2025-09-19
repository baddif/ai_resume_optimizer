rm -rf build
mkdir build
zip -r build/career-baist-initialization.zip src/career-baist-initialization
zip -r build/career-baist-main-plugin.zip src/career-baist-main-plugin
cd src/career-baist-plugin
./zip_plugin.sh
cd ../..

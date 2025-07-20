#!/bin/bash
set -e

echo "Preparing GitHub Pages content..."

# Create pages directory
mkdir -p _site

# Copy examples folder
echo "Copying examples..."
mkdir -p _site/examples
cp -r examples/* _site/examples/

# Copy dist folder for example pages to access the scripts
echo "Copying dist folder..."
mkdir -p _site/dist
cp -r packages/css-if-polyfill/dist/* _site/dist/

# Copy the index.html template
echo "Copying index.html template..."
cp .github/pages/index.html _site/index.html

# Update example files to use the built polyfill from dist
echo "Updating example script references..."
find _site -name "*.html" -not -name "index.html" -exec sed -i.bak 's|../src/index.js|./dist/index.modern.js|g' {} \;
# Clean up backup files
find _site -name "*.bak" -delete

echo "GitHub Pages content prepared in _site/"

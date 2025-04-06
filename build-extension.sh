#!/bin/bash
echo "Building Draftly Chrome Extension..."

# Create extension directory
rm -rf extension-build
mkdir -p extension-build/public/icons

# Build the frontend using Vite
npm run build

# Copy the built files to the extension directory
cp -r dist/* extension-build/

# Copy the popup manifest file (replacing the side panel manifest)
cp popup-manifest.json extension-build/manifest.json

# Copy the popup background script
cp popup-background.js extension-build/background.js

# Create content script
echo "
// Content script for Draftly Chrome Extension
console.log('Draftly extension content script loaded');
" > extension-build/contentScript.js

# Copy the SVG icon
mkdir -p extension-build/public/icons
cp client/public/icons/icon.svg extension-build/public/icons/

# Use the SVG as all icon sizes (Chrome will handle resizing)
cp client/public/icons/icon.svg extension-build/public/icons/icon-16.png
cp client/public/icons/icon.svg extension-build/public/icons/icon-48.png
cp client/public/icons/icon.svg extension-build/public/icons/icon-128.png

# Find the CSS file and append our popup-specific styles
CSS_FILE=$(find extension-build -name "*.css" | grep -v node_modules | head -1)
if [ -n "$CSS_FILE" ]; then
  cat popup-styles.css >> "$CSS_FILE"
  echo "Added popup styles to $CSS_FILE"
else
  echo "Warning: Could not find CSS file to add popup styles"
fi

echo "Extension built successfully! The extension is in the 'extension-build' directory."
echo "To install the extension in Chrome:"
echo "1. Go to chrome://extensions/"
echo "2. Enable 'Developer mode' using the toggle in the top-right corner"
echo "3. Click 'Load unpacked' and select the 'extension-build' directory"

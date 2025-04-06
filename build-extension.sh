#!/bin/bash
echo "Building Draftly Chrome Extension..."

# Create extension directory
rm -rf extension-build
mkdir -p extension-build/public/icons

# Build the frontend using Vite
npm run build

# Copy the built files to the extension directory
cp -r dist/* extension-build/

# Copy the manifest file
cp client/manifest.json extension-build/

# Create background script
echo "
// Background script for Draftly Chrome Extension
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
" > extension-build/background.js

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

# Update the manifest to point to the correct files
sed -i 's/"service_worker": "src\/background.ts"/"service_worker": "background.js"/g' extension-build/manifest.json
sed -i 's/"js": \["src\/contentScript.ts"\]/"js": \["contentScript.js"\]/g' extension-build/manifest.json

echo "Extension built successfully! The extension is in the 'extension-build' directory."
echo "To install the extension in Chrome:"
echo "1. Go to chrome://extensions/"
echo "2. Enable 'Developer mode' using the toggle in the top-right corner"
echo "3. Click 'Load unpacked' and select the 'extension-build' directory"
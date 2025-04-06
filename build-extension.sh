#!/bin/bash
echo "Building Draftly Chrome Extension..."

# Create extension directory
rm -rf extension-build
mkdir -p extension-build/public/icons

# Build the frontend using Vite
npm run build

# Copy the built files to the extension directory
cp -r dist/* extension-build/

# Copy index.html to the root
cp extension-build/public/index.html extension-build/

# Fix asset paths in index.html and add base tag for routing
sed -i 's|src="/assets/|src="public/assets/|g' extension-build/index.html
sed -i 's|href="/assets/|href="public/assets/|g' extension-build/index.html
sed -i '/<head>/a \    <base href="/">' extension-build/index.html

# Copy the manifest file
cp client/manifest.json extension-build/

# Create improved background script with API key management
cat > extension-build/background.js << 'EOSCRIPT'
// Background script for the Draftly Chrome extension
// This script handles setting up the side panel functionality and API key management

// Set up default API keys on install
chrome.runtime.onInstalled.addListener(() => {
  // Register the side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log('Draftly extension installed successfully');
  
  // Check if we already have API keys stored
  chrome.storage.sync.get(['openaiApiKey', 'perplexityApiKey'], (result) => {
    // If keys don't exist, initialize with empty values
    if (!result.openaiApiKey) {
      chrome.storage.sync.set({ openaiApiKey: '' });
    }
    if (!result.perplexityApiKey) {
      chrome.storage.sync.set({ perplexityApiKey: '' });
    }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content scripts or the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getApiKeys') {
    // Retrieve the API keys from storage
    chrome.storage.sync.get(['openaiApiKey', 'perplexityApiKey'], (result) => {
      sendResponse({
        openaiApiKey: result.openaiApiKey || '',
        perplexityApiKey: result.perplexityApiKey || ''
      });
    });
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  if (message.type === 'setApiKeys') {
    // Save the API keys to storage
    chrome.storage.sync.set({
      openaiApiKey: message.openaiApiKey,
      perplexityApiKey: message.perplexityApiKey
    }, () => {
      sendResponse({ success: true });
    });
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});
EOSCRIPT

# Create content script
cat > extension-build/contentScript.js << 'EOSCRIPT'
// Content script for Draftly Chrome Extension
console.log('Draftly extension content script loaded');
EOSCRIPT

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

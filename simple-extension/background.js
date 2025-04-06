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

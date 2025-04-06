// Background script for the Draftly Chrome extension
// This script handles setting up the side panel functionality

chrome.runtime.onInstalled.addListener(() => {
  // Register the side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log('Draftly extension installed successfully');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

export {};

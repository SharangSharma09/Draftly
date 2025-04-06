// Background script for the Draftly Chrome extension
console.log('Draftly extension installed successfully');

// Initialize any needed background functionality
chrome.runtime.onInstalled.addListener(() => {
  console.log('Draftly extension installed');
});
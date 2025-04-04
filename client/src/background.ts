// Background script for the Text Transformer Chrome extension
// This script handles sending messages to content script for the overlay

// Add Chrome extension type declarations
declare const chrome: {
  runtime: {
    onInstalled: {
      addListener: (callback: () => void) => void;
    };
  };
  action: {
    onClicked: {
      addListener: (callback: (tab: { id?: number }) => void) => void;
    };
  };
  tabs: {
    sendMessage: (tabId: number, message: any) => Promise<any>;
  };
  scripting: {
    executeScript: (options: {
      target: { tabId: number };
      files: string[];
    }) => Promise<any>;
  };
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Text Transformer extension installed successfully');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab: { id?: number }) => {
  if (tab.id) {
    try {
      // Send message to toggle the overlay panel
      await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    } catch (error) {
      console.error('Failed to send message to content script:', error);
      
      // If content script hasn't loaded yet, try injecting it
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/contentScript.ts']
      }).catch((err: any) => console.error('Failed to inject content script:', err));
    }
  }
});

export {};

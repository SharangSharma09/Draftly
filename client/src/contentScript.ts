// Content script for the Text Transformer Chrome extension
// This script injects the sliding panel overlay for text transformations

console.log('Text Transformer content script loaded');

// Add Chrome extension type declarations
declare const chrome: {
  runtime: {
    getURL: (path: string) => string;
    onMessage: {
      addListener: (
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ) => void;
    };
  };
};

// Create and inject the overlay container
function createOverlay(): void {
  // Create overlay elements
  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'text-transformer-overlay';
  overlayContainer.className = 'text-transformer-container';
  
  // Create iframe to load our extension
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('index.html');
  iframe.className = 'text-transformer-iframe';
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'text-transformer-toggle';
  toggleButton.className = 'text-transformer-toggle-button';
  toggleButton.innerHTML = '&lt;';
  toggleButton.setAttribute('aria-label', 'Toggle Text Transformer');
  
  // Add elements to the DOM
  overlayContainer.appendChild(iframe);
  overlayContainer.appendChild(toggleButton);
  document.body.appendChild(overlayContainer);
  
  // Add toggle functionality
  toggleButton.addEventListener('click', () => {
    if (overlayContainer.classList.contains('text-transformer-open')) {
      overlayContainer.classList.remove('text-transformer-open');
      toggleButton.innerHTML = '&gt;';
    } else {
      overlayContainer.classList.add('text-transformer-open');
      toggleButton.innerHTML = '&lt;';
    }
  });
  
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .text-transformer-container {
      position: fixed;
      top: 0;
      right: -20vw; /* Start closed */
      width: 20vw;
      height: 100vh;
      z-index: 2147483647; /* Ensure it's on top */
      transition: right 0.3s ease;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
    }
    
    .text-transformer-container.text-transformer-open {
      right: 0;
    }
    
    .text-transformer-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }
    
    .text-transformer-toggle-button {
      position: absolute;
      left: -30px;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 60px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-right: none;
      border-radius: 5px 0 0 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: -3px 0 5px rgba(0, 0, 0, 0.1);
      z-index: 2147483646;
    }
    
    .text-transformer-toggle-button:hover {
      background: #e0e0e0;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize the overlay
createOverlay();

// Listen for messages from the extension popup or background script
chrome.runtime.onMessage.addListener((
  message: { action: string }, 
  sender: any, 
  sendResponse: (response: { status: string }) => void
) => {
  if (message.action === 'togglePanel') {
    const overlay = document.getElementById('text-transformer-overlay');
    const toggleButton = document.getElementById('text-transformer-toggle');
    
    if (overlay) {
      if (overlay.classList.contains('text-transformer-open')) {
        overlay.classList.remove('text-transformer-open');
        if (toggleButton) toggleButton.innerHTML = '&gt;';
      } else {
        overlay.classList.add('text-transformer-open');
        if (toggleButton) toggleButton.innerHTML = '&lt;';
      }
    }
  }
  
  // Send response to confirm message was received
  sendResponse({ status: 'success' });
  return true; // Keep the message channel open for async responses
});

export {};

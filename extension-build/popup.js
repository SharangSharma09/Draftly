// Simple version of the Draftly app for the extension popup
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('root');
  
  // Create the app structure
  rootElement.innerHTML = `
    <div style="width: 400px; height: 600px; padding: 16px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h1 style="margin: 0; font-size: 24px; color: #333;">Draftly</h1>
        <div style="display: flex; gap: 8px;">
          <select id="modelSelector" style="padding: 8px; border-radius: 6px; border: 1px solid #ddd;">
            <option value="gpt-4o">GPT-4o (OpenAI)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 (OpenAI)</option>
            <option value="llama-3">Llama 3 (Perplexity)</option>
            <option value="llama-3-70b">Llama 3 70B (Perplexity)</option>
          </select>
        </div>
      </div>

      <textarea id="textInput" placeholder="Enter or paste your text here..." 
        style="width: 100%; height: 200px; padding: 12px; border-radius: 12px; border: 1px solid #ddd; background-color: #F6F6F6; margin-bottom: 16px; resize: none; font-family: inherit;"></textarea>

      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button id="copyButton" style="flex: 1; padding: 10px; background-color: #6668FF; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">COPY TEXT</button>
        <button id="clearButton" style="width: 42px; padding: 10px; background-color: #F95252; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; justify-content: center; align-items: center;">
          <span style="font-size: 18px;">🗑️</span>
        </button>
      </div>

      <div>
        <p style="font-weight: 500; margin-bottom: 8px;">Transform:</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
          <button class="action-btn" data-action="simplify" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">✂️ Shorten</button>
          <button class="action-btn" data-action="expand" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">✏️ Elaborate</button>
          <button class="action-btn" data-action="rephrase" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">🔄 Rephrase</button>
          <button class="action-btn" data-action="add_emoji" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">✨ Add Emoji</button>
          <button class="action-btn" data-action="fix_grammar" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">🧰 Fix Grammar</button>
        </div>

        <p style="font-weight: 500; margin-bottom: 8px;">Tone:</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="action-btn" data-action="formal" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">👨🏻‍💻 Formal</button>
          <button class="action-btn" data-action="casual" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">😎 Casual</button>
          <button class="action-btn" data-action="persuasive" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">😏 Persuasive</button>
          <button class="action-btn" data-action="witty" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">🦊 Witty</button>
          <button class="action-btn" data-action="empathetic" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">🫶 Empathetic</button>
          <button class="action-btn" data-action="direct" style="padding: 8px; border: 1px solid #ddd; background-color: white; border-radius: 6px; cursor: pointer;">🧠 Informed</button>
        </div>
      </div>

      <div id="loadingIndicator" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.8); justify-content: center; align-items: center; flex-direction: column;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(102,104,255,0.2); border-radius: 50%; border-top-color: #6668FF; animation: spin 1s ease-in-out infinite;"></div>
        <p style="margin-top: 16px; color: #333;">Processing...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .action-btn.selected {
        border: 2px solid #6668FF;
        background-color: rgba(102,104,255,0.1);
      }
      #textInput:focus {
        outline: 2px solid #6668FF;
        box-shadow: 0 0 0 2px rgba(102,104,255,0.2);
      }
    </style>
  `;

  const textInput = document.getElementById('textInput');
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');
  const modelSelector = document.getElementById('modelSelector');
  const actionButtons = document.querySelectorAll('.action-btn');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Function to get API base URL based on environment
  const getApiUrl = () => {
    // For local development, use localhost
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000/api';
    }
    // For production, use API gateway URL - this should be updated with your actual deployed API URL
    return 'https://draftly-api.example.com/api';
  };

  // Add event listeners
  copyButton.addEventListener('click', function() {
    if (textInput.value) {
      navigator.clipboard.writeText(textInput.value)
        .then(() => {
          copyButton.textContent = 'COPIED!';
          setTimeout(() => {
            copyButton.textContent = 'COPY TEXT';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          copyButton.textContent = 'FAILED TO COPY';
          setTimeout(() => {
            copyButton.textContent = 'COPY TEXT';
          }, 2000);
        });
    }
  });

  clearButton.addEventListener('click', function() {
    textInput.value = '';
    textInput.focus();
  });

  // Handle action button clicks
  actionButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const action = this.dataset.action;
      const selectedModel = modelSelector.value;
      
      // Get the text to transform (either selected text or all text)
      let transformText = textInput.value;
      const selectedText = textInput.value.substring(textInput.selectionStart, textInput.selectionEnd);
      const hasSelection = selectedText.length > 0;
      
      if (hasSelection) {
        transformText = selectedText;
      }

      if (!transformText) {
        return; // No text to transform
      }

      // Disable all buttons in the same group
      const isTransformAction = ['simplify', 'expand', 'rephrase', 'add_emoji', 'fix_grammar'].includes(action);
      const isToneAction = ['formal', 'casual', 'persuasive', 'witty', 'empathetic', 'direct'].includes(action);
      
      actionButtons.forEach(btn => {
        const btnAction = btn.dataset.action;
        const btnIsTransformAction = ['simplify', 'expand', 'rephrase', 'add_emoji', 'fix_grammar'].includes(btnAction);
        const btnIsToneAction = ['formal', 'casual', 'persuasive', 'witty', 'empathetic', 'direct'].includes(btnAction);
        
        // Deselect all buttons in the same category
        if ((isTransformAction && btnIsTransformAction) || (isToneAction && btnIsToneAction)) {
          btn.classList.remove('selected');
        }
      });
      
      // Select the clicked button
      this.classList.add('selected');

      // Show loading indicator
      loadingIndicator.style.display = 'flex';
      
      try {
        // For this simplified version, we'll just mock the transformation
        // In a real implementation, this would make an API call to your server
        const mockTransform = (text, action) => {
          switch(action) {
            case 'simplify': return `${text} (simplified)`;
            case 'expand': return `${text} (expanded with more details and examples)`;
            case 'rephrase': return `${text} (rephrased differently)`;
            case 'add_emoji': return `${text} 😊✨`;
            case 'fix_grammar': return `${text} (grammar fixed)`;
            case 'formal': return `${text} (in a formal tone)`;
            case 'casual': return `${text} (in a casual tone)`;
            case 'persuasive': return `${text} (in a persuasive tone)`;
            case 'witty': return `${text} (with a witty twist)`;
            case 'empathetic': return `${text} (with empathy)`;
            case 'direct': return `${text} (direct and informed)`;
            default: return text;
          }
        };

        // Simulate network delay
        setTimeout(() => {
          const transformedText = mockTransform(transformText, action);
          
          // Update only the selected text or entire text area
          if (hasSelection) {
            const beforeSelection = textInput.value.substring(0, textInput.selectionStart);
            const afterSelection = textInput.value.substring(textInput.selectionEnd);
            textInput.value = beforeSelection + transformedText + afterSelection;
          } else {
            textInput.value = transformedText;
          }
          
          loadingIndicator.style.display = 'none';
        }, 800);
        
      } catch (error) {
        console.error('Error transforming text:', error);
        loadingIndicator.style.display = 'none';
        alert('Failed to transform text. Please try again.');
      }
    });
  });
});
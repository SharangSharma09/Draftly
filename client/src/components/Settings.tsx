import React, { useState, useEffect } from 'react';

interface ApiKeys {
  openaiApiKey: string;
  perplexityApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  deepseekApiKey: string;
}

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openaiApiKey: '',
    perplexityApiKey: '',
    anthropicApiKey: '',
    googleApiKey: '',
    deepseekApiKey: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load API keys when component mounts
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'getApiKeys' }, (response) => {
        if (response) {
          setApiKeys({
            openaiApiKey: response.openaiApiKey || '',
            perplexityApiKey: response.perplexityApiKey || '',
            anthropicApiKey: response.anthropicApiKey || '',
            googleApiKey: response.googleApiKey || '',
            deepseekApiKey: response.deepseekApiKey || ''
          });
        }
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage('');

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        { 
          type: 'setApiKeys', 
          openaiApiKey: apiKeys.openaiApiKey,
          perplexityApiKey: apiKeys.perplexityApiKey,
          anthropicApiKey: apiKeys.anthropicApiKey,
          googleApiKey: apiKeys.googleApiKey,
          deepseekApiKey: apiKeys.deepseekApiKey
        }, 
        (response) => {
          setIsSaving(false);
          if (response && response.success) {
            setSaveMessage('API keys saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
            setIsOpen(false);
          } else {
            setSaveMessage('Failed to save API keys. Please try again.');
          }
        }
      );
    } else {
      // Handle web environment (development mode)
      console.log('API keys would be saved:', apiKeys);
      setIsSaving(false);
      setSaveMessage('API keys saved (development mode)');
      setTimeout(() => setSaveMessage(''), 3000);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-center w-9 h-9 text-gray-700 hover:text-primary rounded-md hover:bg-gray-100"
        aria-label="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-lg p-4 w-80 z-[10000] border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">API Settings</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              name="openaiApiKey"
              value={apiKeys.openaiApiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="sk-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for GPT-3.5 and GPT-4o models
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perplexity API Key
            </label>
            <input
              type="password"
              name="perplexityApiKey"
              value={apiKeys.perplexityApiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="pplx-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for Llama-3 models
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anthropic API Key
            </label>
            <input
              type="password"
              name="anthropicApiKey"
              value={apiKeys.anthropicApiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="sk-ant-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for Claude-3 models
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google API Key
            </label>
            <input
              type="password"
              name="googleApiKey"
              value={apiKeys.googleApiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="AIza..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for Gemini models
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deepseek API Key
            </label>
            <input
              type="password"
              name="deepseekApiKey"
              value={apiKeys.deepseekApiKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="ds-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for Deepseek models
            </p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">{saveMessage}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 focus:outline-none"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
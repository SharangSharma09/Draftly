import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from '@/components/ModelSelector';
import { ActionButton } from '@/components/ActionButton';
import { HistoryItem } from '@/components/HistoryItem';
import { CopyButton } from '@/components/CopyButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { transformText } from '@/lib/transformations';
import { saveHistory, getHistory, clearHistoryStorage } from '@/lib/storage';

export type ModelProvider = 'openai' | 'perplexity' | 'other';
export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4o' | 'llama-3' | 'llama-3-70b' | 'claude-2' | 'palm';
export type TransformAction = 'summarize' | 'paraphrase' | 'formalize' | 'simplify' | 'bullets' | 'expand';

export interface HistoryEntry {
  id: string;
  action: TransformAction;
  text: string;
  timestamp: number;
}

const TextTransformer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LLMModel>('gpt-3.5-turbo');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Action button definitions with their respective icons and colors
  const actionButtons = [
    { action: 'summarize' as TransformAction, icon: 'summarize', color: 'text-primary', label: 'Summarize' },
    { action: 'paraphrase' as TransformAction, icon: 'autorenew', color: 'text-accent', label: 'Paraphrase' },
    { action: 'formalize' as TransformAction, icon: 'business', color: 'text-secondary', label: 'Formalize' },
    { action: 'simplify' as TransformAction, icon: 'psychology', color: 'text-success', label: 'Simplify' },
    { action: 'bullets' as TransformAction, icon: 'format_list_bulleted', color: 'text-warning', label: 'Bullet Points' },
    { action: 'expand' as TransformAction, icon: 'add_circle', color: 'text-error', label: 'Expand' },
  ];

  // Load history from storage on component mount
  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await getHistory();
      setHistory(savedHistory);
    };
    
    loadHistory();
  }, []);

  const handleTransform = async (action: TransformAction) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    
    try {
      const transformedText = await transformText(inputText, action, selectedModel);
      setInputText(transformedText);
      
      // Save to history
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        action,
        text: transformedText,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep only 10 most recent items
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
      
    } catch (error) {
      console.error('Transformation failed:', error);
      // Could add toast notification here for error feedback
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = (entry: HistoryEntry) => {
    setInputText(entry.text);
  };

  const handleClearHistory = async () => {
    setHistory([]);
    await clearHistoryStorage();
  };

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="bg-gray-50 text-gray-800 flex flex-col h-screen">
      {/* Header section */}
      <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">Text Transformer</h1>
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </header>

      {/* Main content area */}
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
        {/* Text input section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="input-text" className="text-sm font-medium text-gray-700">
              Input Text
            </label>
            <CopyButton text={inputText} />
          </div>
          <div className="relative">
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-40"
            />
            
            {loading && <LoadingIndicator />}
          </div>
        </div>

        {/* Action buttons section */}
        <div className="grid grid-cols-2 gap-2">
          {actionButtons.map((button) => (
            <ActionButton
              key={button.action}
              action={button.action}
              icon={button.icon}
              color={button.color}
              label={button.label}
              onClick={() => handleTransform(button.action)}
              disabled={loading || !inputText.trim()}
            />
          ))}
        </div>

        {/* Recent history section */}
        {history.length > 0 && (
          <div className="mt-2">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Recent Transformations</h2>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {history.slice(0, 3).map((entry) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  timeAgo={getTimeAgo(entry.timestamp)}
                  onClick={() => handleHistoryItemClick(entry)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer section */}
      <footer className="p-2 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
        <p>
          Using <span id="current-model" className="font-medium">
            {selectedModel === 'gpt-3.5-turbo' ? 'GPT-3.5' : 
             selectedModel === 'gpt-4o' ? 'GPT-4o' : 
             selectedModel === 'llama-3' ? 'Llama 3 (Small)' :
             selectedModel === 'llama-3-70b' ? 'Llama 3 (Large)' :
             selectedModel === 'claude-2' ? 'Claude 2' : 
             selectedModel === 'palm' ? 'PaLM' : selectedModel}
          </span> • <button onClick={handleClearHistory} className="text-primary hover:underline">Clear History</button>
        </p>
      </footer>
    </div>
  );
};

export default TextTransformer;

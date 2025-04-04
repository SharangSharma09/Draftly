import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from '@/components/ModelSelector';
import { ActionButton } from '@/components/ActionButton';
import { HistoryItem } from '@/components/HistoryItem';
import { CopyButton } from '@/components/CopyButton';
import { ClearButton } from '@/components/ClearButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { transformText } from '@/lib/transformations';
import { saveHistory, getHistory, clearHistoryStorage } from '@/lib/storage';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type ModelProvider = 'openai' | 'perplexity' | 'other';
export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4o' | 'llama-3' | 'llama-3-70b' | 'claude-2' | 'palm';
export type TransformAction = 'simplify' | 'expand' | 'formal' | 'casual' | 'persuasive' | 'witty';
export type EmojiOption = 'on' | 'off';

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
  const [emojiOption, setEmojiOption] = useState<EmojiOption>('off');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usedActions, setUsedActions] = useState<TransformAction[]>([]);
  const [selectedTransformAction, setSelectedTransformAction] = useState<TransformAction | null>(null);
  const [selectedToneAction, setSelectedToneAction] = useState<TransformAction | null>(null);

  // Action button definitions with their respective icons and colors
  const actionButtons = [
    { action: 'simplify' as TransformAction, icon: 'psychology', color: 'text-success', label: 'Shorten' },
    { action: 'expand' as TransformAction, icon: 'add_circle', color: 'text-error', label: 'Elaborate' },
  ];
  
  // Tone button definitions
  const toneButtons = [
    { action: 'formal' as TransformAction, icon: 'work', color: 'text-primary', label: 'Formal' },
    { action: 'casual' as TransformAction, icon: 'chat', color: 'text-accent', label: 'Casual' },
    { action: 'persuasive' as TransformAction, icon: 'trending_up', color: 'text-warning', label: 'Persuasive' },
    { action: 'witty' as TransformAction, icon: 'emoji_objects', color: 'text-secondary', label: 'Witty' },
  ];

  // Load history from storage on component mount
  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await getHistory();
      setHistory(savedHistory);
    };
    
    loadHistory();
  }, []);

  // Helper to check if an action is a transform or tone action
  const isTransformAction = (action: TransformAction): boolean => {
    return ['simplify', 'expand'].includes(action);
  };
  
  const isToneAction = (action: TransformAction): boolean => {
    return ['formal', 'casual', 'persuasive', 'witty'].includes(action);
  };

  const handleTransform = async (action: TransformAction) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    
    // Update selection state based on action type
    if (isTransformAction(action)) {
      setSelectedTransformAction(action);
      // Deselect other transform actions
      if (action === 'simplify') {
        setUsedActions(prev => [...prev.filter(a => a !== 'expand'), 'simplify']);
      } else if (action === 'expand') {
        setUsedActions(prev => [...prev.filter(a => a !== 'simplify'), 'expand']);
      }
    } else if (isToneAction(action)) {
      setSelectedToneAction(action);
      // Deselect other tone actions
      const otherToneActions = ['formal', 'casual', 'persuasive', 'witty'].filter(a => a !== action);
      setUsedActions(prev => [
        ...prev.filter(a => !otherToneActions.includes(a as TransformAction)), 
        action
      ]);
    }
    
    try {
      const transformedText = await transformText(inputText, action, selectedModel, emojiOption);
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
  
  // Reset functionality removed as requested

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

  const handleClearText = () => {
    setInputText('');
  };

  return (
    <div className="bg-gray-50 text-gray-800 flex flex-col h-screen">
      {/* Header section */}
      <header className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex justify-center mb-2">
          <h1 className="text-xl font-semibold text-gray-800">WordFlow</h1>
        </div>
        <div className="flex justify-center">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
        {/* Text input section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="input-text" className="text-sm font-medium text-gray-700">
              Enter Text
            </label>
            <ClearButton onClick={handleClearText} disabled={!inputText.trim()} />
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
          <div className="w-full mt-1">
            <CopyButton text={inputText} />
          </div>
        </div>

        {/* Emoji toggle */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-medium text-gray-700">Add Emoji</h2>
           
            </div>
            <Switch
              id="emoji-toggle"
              checked={emojiOption === 'on'}
              onCheckedChange={(checked) => {
                const newEmojiOption = checked ? 'on' : 'off';
                setEmojiOption(newEmojiOption);
                
                // Auto-transform the text if we have text
                if (inputText.trim()) {
                  // Use the most recent transformation action or default to simplify
                  const lastAction = history.length > 0 
                    ? history[0].action 
                    : 'simplify' as TransformAction;
                  handleTransform(lastAction);
                }
              }}
            />
          </div>
        </div>
        
        {/* Action buttons section */}
        <div className="mb-4">
          <div className="mb-2">
            <h2 className="text-sm font-medium text-gray-700">Transform Text</h2>
          </div>
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
                used={usedActions.includes(button.action)}
                selected={selectedTransformAction === button.action}
              />
            ))}
          </div>
        </div>

        {/* Tone buttons section */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Adjust Tone</h2>
          <div className="grid grid-cols-2 gap-2">
            {toneButtons.map((button) => (
              <ActionButton
                key={button.action}
                action={button.action}
                icon={button.icon}
                color={button.color}
                label={button.label}
                onClick={() => handleTransform(button.action)}
                disabled={loading || !inputText.trim()}
                used={usedActions.includes(button.action)}
                selected={selectedToneAction === button.action}
              />
            ))}
          </div>
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

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from '@/components/ModelSelector';
import { ActionButton } from '@/components/ActionButton';
import { CopyButton } from '@/components/CopyButton';
import { ClearButton } from '@/components/ClearButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { EmojiToggle } from '@/components/EmojiToggle';
import { transformText } from '@/lib/transformations';

export type ModelProvider = 'openai' | 'perplexity' | 'other';
export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4o' | 'llama-3' | 'llama-3-70b' | 'claude-2' | 'palm';
export type TransformAction = 'simplify' | 'expand' | 'formal' | 'casual' | 'persuasive' | 'witty';
export type EmojiOption = 'on' | 'off';

const TextTransformer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LLMModel>('llama-3');
  const [emojiOption, setEmojiOption] = useState<EmojiOption>('off');
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
    } catch (error) {
      console.error('Transformation failed:', error);
      // Could add toast notification here for error feedback
    } finally {
      setLoading(false);
    }
  };

  const handleClearText = () => {
    setInputText('');
    // Reset action states
    setUsedActions([]);
    setSelectedTransformAction(null);
    setSelectedToneAction(null);
    // Reset emoji toggle to OFF
    setEmojiOption('off');
    // Note: We don't reset selectedModel here as requested
  };

  return (
    <div className="bg-gray-50 text-gray-800 flex flex-col h-screen">
      {/* Header section */}
      <header className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex justify-center mb-2">
          <h1 className="text-xl font-semibold text-gray-800">WordFlow</h1>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Select Model</h2>
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
          <EmojiToggle
            enabled={emojiOption === 'on'}
            onChange={(checked: boolean) => {
              const newEmojiOption = checked ? 'on' : 'off';
              setEmojiOption(newEmojiOption);
              
              // Auto-transform the text if we have text
              if (inputText.trim()) {
                // Use the active transformation action or default to simplify
                const lastAction = selectedTransformAction || selectedToneAction || 'simplify' as TransformAction;
                handleTransform(lastAction);
              }
            }}
            disabled={loading}
          />
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

        {/* Recent transformations section removed as requested */}
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
          </span>
        </p>
      </footer>
    </div>
  );
};

export default TextTransformer;

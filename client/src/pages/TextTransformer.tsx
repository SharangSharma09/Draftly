import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from '@/components/ModelSelector';
import { ActionButton } from '@/components/ActionButton';
import { CopyButton } from '@/components/CopyButton';
import { ClearButton } from '@/components/ClearButton';
import { UndoButton } from '@/components/UndoButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { EmojiToggle } from '@/components/EmojiToggle';
import { Settings } from '@/components/Settings';
import { transformText } from '@/lib/transformations';

export type ModelProvider = 'openai' | 'perplexity' | 'other';
export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4o' | 'llama-3' | 'llama-3-70b' | 'claude-2' | 'palm';
export type TransformAction = 'simplify' | 'expand' | 'rephrase' | 'formal' | 'casual' | 'persuasive' | 'witty' | 'empathetic' | 'direct' | 'add_emoji' | 'remove_emoji' | 'fix_grammar';
export type EmojiOption = 'on' | 'off';

const TextTransformer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LLMModel>('llama-3');
  const [emojiOption, setEmojiOption] = useState<EmojiOption>('off');
  const [usedActions, setUsedActions] = useState<TransformAction[]>([]);
  const [selectedTransformAction, setSelectedTransformAction] = useState<TransformAction | null>(null);
  const [selectedToneAction, setSelectedToneAction] = useState<TransformAction | null>(null);
  
  // Track text selection state
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State for previous versions (undo history)
  const [previousVersions, setPreviousVersions] = useState<string[]>([]);
  
  // Handle undo functionality
  const handleUndo = () => {
    if (previousVersions.length > 0) {
      const prevVersions = [...previousVersions];
      const lastVersion = prevVersions.pop();
      
      if (lastVersion) {
        setInputText(lastVersion);
        setPreviousVersions(prevVersions);
      }
    }
  };

  // Action button definitions with their respective emoji icons and colors
  const actionButtons = [
    { action: 'simplify' as TransformAction, icon: '✂️', color: 'text-success', label: 'Shorten', useEmoji: true, rotation: '-90deg' },
    { action: 'expand' as TransformAction, icon: '✏️', color: 'text-error', label: 'Elaborate', useEmoji: true, rotation: '0deg', flip: 'horizontal' as const },
    { action: 'rephrase' as TransformAction, icon: '🔄', color: 'text-info', label: 'Rephrase', useEmoji: true },
  ];

  // Extra buttons for text utilities
  const utilityButtons = [
    { action: 'add_emoji' as TransformAction, icon: '✨', color: 'text-amber-500', label: 'Add Emoji', useEmoji: true },
    { action: 'fix_grammar' as TransformAction, icon: '🧰', color: 'text-blue-500', label: 'Fix Grammar', useEmoji: true }
  ];
  
  // Tone button definitions
  const toneButtons = [
    { action: 'formal' as TransformAction, icon: '👨🏻‍💻', color: 'text-primary', label: 'Formal' },
    { action: 'casual' as TransformAction, icon: '😎', color: 'text-accent', label: 'Casual' },
    { action: 'persuasive' as TransformAction, icon: '😏', color: 'text-warning', label: 'Persuasive' },
    { action: 'witty' as TransformAction, icon: '🦊', color: 'text-secondary', label: 'Witty' },
    { action: 'empathetic' as TransformAction, icon: '🫶', color: 'text-rose-500', label: 'Empathetic' },
    { action: 'direct' as TransformAction, icon: '🧠', color: 'text-emerald-500', label: 'Informed' },
  ];

  // Helper to check if an action is a transform or tone action
  const isTransformAction = (action: TransformAction): boolean => {
    return ['simplify', 'expand', 'rephrase'].includes(action);
  };
  
  const isToneAction = (action: TransformAction): boolean => {
    return ['formal', 'casual', 'persuasive', 'witty', 'empathetic', 'direct'].includes(action);
    // Note: We still use 'direct' in the code since that's the action value, even though the label is "Informed"
  };

  const handleTransform = async (action: TransformAction) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    
    // Update selection state based on action type
    if (isTransformAction(action)) {
      setSelectedTransformAction(action);
      // Deselect other transform actions
      if (action === 'simplify') {
        setUsedActions(prev => [...prev.filter(a => a !== 'expand' && a !== 'rephrase'), 'simplify']);
      } else if (action === 'expand') {
        setUsedActions(prev => [...prev.filter(a => a !== 'simplify' && a !== 'rephrase'), 'expand']);
      } else if (action === 'rephrase') {
        setUsedActions(prev => [...prev.filter(a => a !== 'simplify' && a !== 'expand'), 'rephrase']);
      }
    } else if (isToneAction(action)) {
      setSelectedToneAction(action);
      // Deselect other tone actions
      const otherToneActions = ['formal', 'casual', 'persuasive', 'witty', 'empathetic', 'direct'].filter(a => a !== action);
      setUsedActions(prev => [
        ...prev.filter(a => !otherToneActions.includes(a as TransformAction)), 
        action
      ]);
    }
    
    try {
      // Check if there's a text selection
      const hasSelection = selectionStart !== null && 
                        selectionEnd !== null && 
                        selectionStart !== selectionEnd;
                        
      // Save the current text to previousVersions (limit to 3 versions)
      setPreviousVersions(prev => {
        const newPrev = [...prev];
        // Add current text to previous versions and limit to 3 items
        if (newPrev.length >= 3) {
          newPrev.shift(); // Remove oldest version if we have 3 already
        }
        newPrev.push(inputText);
        return newPrev;
      });
      
      if (hasSelection) {
        // Only transform the selected portion
        const selectedText = inputText.substring(selectionStart!, selectionEnd!);
        const before = inputText.substring(0, selectionStart!);
        const after = inputText.substring(selectionEnd!);
        
        console.log('Transforming selected text:', selectedText);
        
        // Transform only the selected text
        const transformedSelection = await transformText(selectedText, action, selectedModel, emojiOption);
        
        // Reconstruct the full text with the transformed selection
        const newText = before + transformedSelection + after;
        setInputText(newText);
        
        // Attempt to restore cursor position after transformation
        setTimeout(() => {
          if (textareaRef.current) {
            // Set selection to the end of the transformed section
            const newSelectionEnd = before.length + transformedSelection.length;
            textareaRef.current.setSelectionRange(before.length, newSelectionEnd);
            textareaRef.current.focus();
          }
        }, 50);
      } else {
        // Transform the entire text if no selection
        const transformedText = await transformText(inputText, action, selectedModel, emojiOption);
        setInputText(transformedText);
      }
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
    // Reset selection state
    setSelectionStart(null);
    setSelectionEnd(null);
    // Clear undo history
    setPreviousVersions([]);
    // Note: We don't reset selectedModel here as requested
    
    // Focus on the textarea after clearing
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-white text-gray-800 flex flex-col h-screen">
      {/* Header section */}
      <header className="p-4 bg-white">
        <div className="flex justify-between items-center mb-2 relative">
          <div className="w-9"></div> {/* Spacer equal to the width of the settings button */}
          <h1 className="text-xl font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2">Draftly</h1>
          <Settings />
        </div>
        <div className="flex flex-col w-full">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 p-4 pt-5 flex flex-col gap-4 overflow-auto">
        {/* Text input section */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Textarea
              id="input-text"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setSelectionStart(target.selectionStart);
                setSelectionEnd(target.selectionEnd);
              }}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setSelectionStart(target.selectionStart);
                setSelectionEnd(target.selectionEnd);
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setSelectionStart(target.selectionStart);
                setSelectionEnd(target.selectionEnd);
              }}
              placeholder="Enter your text here"
              className="w-full h-60 bg-[#F6F6F6] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl text-xl"
            />
            
            {loading && <LoadingIndicator />}
            
            {/* Selection indicator */}
            {selectionStart !== null && 
             selectionEnd !== null && 
             selectionStart !== selectionEnd && (
              <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                Selection active: {selectionEnd - selectionStart} chars
              </div>
            )}
          </div>
          <div className="w-full mt-1 flex gap-2">
            <CopyButton text={inputText} />
            <div className="flex gap-2">
              <UndoButton onClick={handleUndo} disabled={previousVersions.length === 0} />
              <ClearButton onClick={handleClearText} disabled={!inputText.trim()} />
            </div>
          </div>
        </div>


        
        {/* Action buttons section */}
        <div className="mb-4 pt-5">
          <div className="mb-2">
            <h2 className="text-xs font-medium text-[#7B7B7B]">TRANSFORM TEXT</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
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
                useEmoji={button.useEmoji}
                rotation={button.rotation}
                flip={button.flip}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {utilityButtons.map((button) => (
              <ActionButton
                key={button.action}
                action={button.action}
                icon={button.icon}
                color={button.color}
                label={button.label}
                onClick={() => handleTransform(button.action)}
                disabled={loading || !inputText.trim()}
                used={usedActions.includes(button.action)}
                selected={false}
                useEmoji={button.useEmoji}
              />
            ))}
          </div>
        </div>

        {/* Tone buttons section */}
        <div className="mb-4">
          <h2 className="text-xs font-medium text-[#7B7B7B] mb-2">ADJUST TONE</h2>
          <div className="grid grid-cols-3 gap-2">
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
                useEmoji={true}
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

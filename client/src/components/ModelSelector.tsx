import React, { useState } from 'react';
import { LLMModel, ModelProvider } from '@/pages/TextTransformer';

interface ModelSelectorProps {
  selectedModel: LLMModel;
  onSelectModel: (model: LLMModel) => void;
}

type ModelOption = {
  value: LLMModel;
  label: string;
  provider: ModelProvider;
  icon?: string;
};

const models: ModelOption[] = [
  // Perplexity models
  { value: 'llama-3', label: 'Llama 3 (Small)', provider: 'perplexity', icon: 'smart_toy' },
  { value: 'llama-3-70b', label: 'Llama 3 (Large)', provider: 'perplexity', icon: 'smart_toy' },
  
  // OpenAI models
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai', icon: 'auto_awesome' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai', icon: 'auto_awesome' },
  
  // Other models (mocked in this implementation)
  { value: 'claude-2', label: 'Claude 2', provider: 'other', icon: 'psychology' },
  { value: 'palm', label: 'PaLM', provider: 'other', icon: 'psychology' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = models.find(model => model.value === selectedModel) || models[0];
  
  // Group models by provider
  const getModelsByProvider = (provider: ModelProvider) => {
    return models.filter(model => model.provider === provider);
  };

  const perplexityModels = getModelsByProvider('perplexity');
  const openaiModels = getModelsByProvider('openai');
  const otherModels = getModelsByProvider('other');
  
  return (
    <div className="relative w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedOption.icon && <span className="material-icons text-sm mr-1">{selectedOption.icon}</span>}
          {selectedOption.label}
        </div>
        <span className="material-icons text-sm">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#ffffff] border border-gray-200 rounded-xl shadow-md z-[9999]">
          <div className="p-2 bg-[#ffffff] rounded-xl">
            <div className="text-xs font-bold mb-1">Perplexity</div>
            {perplexityModels.map((model) => (
              <div
                key={model.value}
                onClick={() => {
                  onSelectModel(model.value);
                  setIsOpen(false);
                }}
                className={`py-1 px-2 rounded-xl cursor-pointer flex items-center hover:bg-gray-100 ${
                  selectedModel === model.value ? 'bg-[#6668FF]/10 text-[#6668FF] font-medium' : ''
                }`}
              >
                {model.icon && <span className="material-icons text-sm mr-2">{model.icon}</span>}
                {model.label}
              </div>
            ))}
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <div className="text-xs font-bold mb-1">OpenAI</div>
            {openaiModels.map((model) => (
              <div
                key={model.value}
                onClick={() => {
                  onSelectModel(model.value);
                  setIsOpen(false);
                }}
                className={`py-1 px-2 rounded-xl cursor-pointer flex items-center hover:bg-gray-100 ${
                  selectedModel === model.value ? 'bg-[#6668FF]/10 text-[#6668FF] font-medium' : ''
                }`}
              >
                {model.icon && <span className="material-icons text-sm mr-2">{model.icon}</span>}
                {model.label}
              </div>
            ))}
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <div className="text-xs font-bold mb-1">Other Models</div>
            {otherModels.map((model) => (
              <div
                key={model.value}
                onClick={() => {
                  onSelectModel(model.value);
                  setIsOpen(false);
                }}
                className={`py-1 px-2 rounded-xl cursor-pointer flex items-center hover:bg-gray-100 ${
                  selectedModel === model.value ? 'bg-[#6668FF]/10 text-[#6668FF] font-medium' : ''
                }`}
              >
                {model.icon && <span className="material-icons text-sm mr-2">{model.icon}</span>}
                {model.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

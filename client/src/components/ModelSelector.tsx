import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
  
  // Other models (mocked in this implementation)
  { value: 'claude-2', label: 'Claude 2', provider: 'other', icon: 'psychology' },
  { value: 'palm', label: 'PaLM', provider: 'other', icon: 'psychology' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  const selectedOption = models.find(model => model.value === selectedModel) || models[0];
  
  // Group models by provider
  const getModelsByProvider = (provider: ModelProvider) => {
    return models.filter(model => model.provider === provider);
  };

  const perplexityModels = getModelsByProvider('perplexity');
  const otherModels = getModelsByProvider('other');

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer flex items-center">
            {selectedOption.icon && <span className="material-icons text-sm mr-1">{selectedOption.icon}</span>}
            {selectedOption.label}
            <span className="material-icons text-sm ml-1">expand_more</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">          
          {/* Perplexity Models */}
          <DropdownMenuLabel className="text-xs font-bold">Perplexity</DropdownMenuLabel>
          {perplexityModels.map((model) => (
            <DropdownMenuItem 
              key={model.value} 
              onClick={() => onSelectModel(model.value)}
              className={selectedModel === model.value ? 'bg-gray-100' : ''}
            >
              {model.icon && <span className="material-icons text-sm mr-2">{model.icon}</span>}
              {model.label}
            </DropdownMenuItem>
          ))}
          
          {/* Other Models */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-bold">Other Models</DropdownMenuLabel>
          {otherModels.map((model) => (
            <DropdownMenuItem 
              key={model.value} 
              onClick={() => onSelectModel(model.value)}
              className={selectedModel === model.value ? 'bg-gray-100' : ''}
            >
              {model.icon && <span className="material-icons text-sm mr-2">{model.icon}</span>}
              {model.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

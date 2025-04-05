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
  
  // OpenAI models
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai', icon: 'auto_awesome' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai', icon: 'auto_awesome' },
  
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
  const openaiModels = getModelsByProvider('openai');
  const otherModels = getModelsByProvider('other');

  return (
    <div className="relative w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer flex items-center justify-between">
            <div className="flex items-center">
              {selectedOption.icon && <span className="material-icons text-sm mr-1">{selectedOption.icon}</span>}
              {selectedOption.label}
            </div>
            <span className="material-icons text-sm">expand_more</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(20vw-2rem)] min-w-[200px]" side="bottom" sideOffset={5} align="center">          
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
          
          {/* OpenAI Models */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-bold">OpenAI</DropdownMenuLabel>
          {openaiModels.map((model) => (
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

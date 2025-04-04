import { callOpenAI } from './openai';
import { callPerplexity } from './perplexity';
import { TransformAction, LLMModel, ModelProvider } from '@/pages/TextTransformer';

// Function to determine which provider a model belongs to
function getModelProvider(model: LLMModel): ModelProvider {
  if (['gpt-3.5-turbo', 'gpt-4o'].includes(model)) {
    return 'openai';
  } else if (['llama-3', 'llama-3-70b'].includes(model)) {
    return 'perplexity';
  } else {
    return 'other';
  }
}

// Function to handle different text transformations
export async function transformText(
  text: string, 
  action: TransformAction, 
  model: LLMModel
): Promise<string> {
  if (!text.trim()) {
    return '';
  }

  const provider = getModelProvider(model);
  
  // Route to the appropriate API based on the model provider
  switch (provider) {
    case 'openai':
      return await callOpenAI(text, action, model);
    case 'perplexity':
      return await callPerplexity(text, action, model);
    default:
      // For other providers, use OpenAI as a fallback
      return await callOpenAI(text, action, 'gpt-3.5-turbo');
  }
}

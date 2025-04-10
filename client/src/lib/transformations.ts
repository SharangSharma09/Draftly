import { TransformAction, LLMModel, ModelProvider, EmojiOption } from '@/pages/TextTransformer';

// Function to determine which provider a model belongs to
function getModelProvider(model: LLMModel): ModelProvider {
  if (['gpt-3.5-turbo', 'gpt-4o'].includes(model)) {
    return 'openai';
  } else if (['llama-3', 'llama-3-70b'].includes(model)) {
    return 'perplexity';
  } else if (['claude-3-opus', 'claude-3-sonnet'].includes(model)) {
    return 'anthropic';
  } else if (['gemini-pro'].includes(model)) {
    return 'google';
  } else if (['deepseek-coder'].includes(model)) {
    return 'deepseek';
  } else {
    return 'other';
  }
}

// Import direct API calling functions
import { callOpenAI } from './openai';
import { callPerplexity } from './perplexity';
import { callAnthropic } from './anthropic';
import { callGemini } from './gemini';
import { callDeepseek } from './deepseek';

// Function to handle different text transformations
export async function transformText(
  text: string, 
  action: TransformAction, 
  model: LLMModel,
  emojiOption: EmojiOption = 'off'
): Promise<string> {
  console.log('Starting transformation with:', { 
    text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), 
    action, 
    model, 
    emojiOption 
  });
  
  if (!text.trim()) {
    console.log('Empty text, returning empty string');
    return '';
  }

  try {
    let transformedText = '';

    // Determine which API to call based on the model
    const provider = getModelProvider(model);
    console.log(`Using provider: ${provider} for model: ${model}`);
    
    // Call the appropriate API based on the model provider
    if (provider === 'openai') {
      console.log('Calling OpenAI API directly...');
      transformedText = await callOpenAI(text, action, model);
    } else if (provider === 'perplexity') {
      console.log('Calling Perplexity API directly...');
      transformedText = await callPerplexity(text, action, model);
    } else if (provider === 'anthropic') {
      console.log('Calling Anthropic API directly...');
      transformedText = await callAnthropic(text, action, model);
    } else if (provider === 'google') {
      console.log('Calling Google Gemini API directly...');
      transformedText = await callGemini(text, action, model);
    } else if (provider === 'deepseek') {
      console.log('Calling Deepseek API directly...');
      transformedText = await callDeepseek(text, action, model);
    } else {
      console.log('Unknown provider, using fallback');
      throw new Error('Unknown model provider');
    }

    console.log('API response received, length:', transformedText.length);
    console.log('First 100 characters:', transformedText.substring(0, 100) + (transformedText.length > 100 ? '...' : ''));
    
    // Add emojis if specified
    if (emojiOption === 'on') {
      transformedText = addMinimalEmojis(transformedText, action);
    }
    
    return transformedText;
  } catch (error: any) {
    console.error('Error in transformText:', error);
    return `Error: ${error.message || 'Failed to fetch. Please try again.'}`;
  }
}

// Function to add minimal, appropriate emojis based on the transformation action
function addMinimalEmojis(text: string, action: TransformAction): string {
  // Get emoji that matches the action
  const actionEmoji = getActionEmoji(action);
  
  // Add an emoji at the beginning of the text
  let result = `${actionEmoji} ${text}`;
  
  // For bullet points or lists in the text, add emojis to each point
  // Match bullet points (lines starting with •, *, -, or numbers)
  const bulletRegex = /^([•\*\-]|\d+\.)\s+(.+)$/gm;
  result = result.replace(bulletRegex, (match, bullet, content) => {
    // Select a random emoji from the list
    const randomEmoji = getBulletEmoji();
    return `${bullet} ${randomEmoji} ${content}`;
  });
  
  return result;
}

// Get an emoji based on the transformation action
function getActionEmoji(action: TransformAction): string {
  switch (action) {
    case 'simplify':
      return '✂️';
    case 'expand':
      return '📚';
    case 'rephrase':
      return '🔄';
    case 'formal':
      return '👔';
    case 'casual':
      return '😊';
    case 'persuasive':
      return '😏';
    case 'witty':
      return '😄';
    case 'empathetic':
      return '🫶';
    case 'direct':
      return '🎯';
    case 'add_emoji':
      return '😎';
    case 'remove_emoji':
      return '🧹';
    default:
      return '✨';
  }
}

// Get a random emoji for bullet points from a list
function getBulletEmoji(): string {
  const bulletEmojis = ['✅', '👉', '📌', '💡', '🔑', '📊', '🎯', '📈'];
  const randomIndex = Math.floor(Math.random() * bulletEmojis.length);
  return bulletEmojis[randomIndex];
}

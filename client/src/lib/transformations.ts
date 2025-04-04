import { callOpenAI } from './openai';
import { callPerplexity } from './perplexity';
import { TransformAction, LLMModel, ModelProvider, EmojiOption } from '@/pages/TextTransformer';
import { TonePosition } from '@/components/ToneSelector';

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
  model: LLMModel,
  emojiOption: EmojiOption = 'off',
  tonePosition: TonePosition = { formality: 50, style: 50 }
): Promise<string> {
  if (!text.trim()) {
    return '';
  }

  const provider = getModelProvider(model);
  
  // Route to the appropriate API based on the model provider
  let result = '';
  switch (provider) {
    case 'openai':
      result = await callOpenAI(text, action, model, tonePosition);
      break;
    case 'perplexity':
      result = await callPerplexity(text, action, model, tonePosition);
      break;
    default:
      // For other providers, use OpenAI as a fallback
      result = await callOpenAI(text, action, 'gpt-3.5-turbo', tonePosition);
      break;
  }

  // Add emojis if the option is turned on
  if (emojiOption === 'on') {
    result = addMinimalEmojis(result, action);
  }

  return result;
}

// Function to add minimal, appropriate emojis based on the transformation action
function addMinimalEmojis(text: string, action: TransformAction): string {
  // Get emoji that matches the action
  const actionEmoji = getActionEmoji(action);
  
  // Add an emoji at the beginning of the text
  let result = `${actionEmoji} ${text}`;
  
  // For bullet points, add emojis to each bullet point
  if (action === 'bullets') {
    // Match bullet points (lines starting with •, *, -, or numbers)
    const bulletRegex = /^([•\*\-]|\d+\.)\s+(.+)$/gm;
    result = result.replace(bulletRegex, (match, bullet, content) => {
      // Select a random emoji from the list
      const randomEmoji = getBulletEmoji();
      return `${bullet} ${randomEmoji} ${content}`;
    });
  }
  
  return result;
}

// Get an emoji based on the transformation action
function getActionEmoji(action: TransformAction): string {
  switch (action) {
    case 'summarize':
      return '📝';
    case 'paraphrase':
      return '🔄';
    case 'formalize':
      return '👔';
    case 'simplify':
      return '🔍';
    case 'bullets':
      return '📋';
    case 'expand':
      return '📚';
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

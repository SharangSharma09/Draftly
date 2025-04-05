import { TransformAction, LLMModel, ModelProvider, EmojiOption } from '@/pages/TextTransformer';

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
    // Call the server API instead of directly calling the AI providers
    console.log('Calling server API endpoint');
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        action,
        model,
        emojiOption
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server API Error:', errorData);
      
      // Check if it's an API key error
      if (errorData.message && errorData.message.includes('API key')) {
        if (errorData.message.includes('OpenAI')) {
          throw new Error(`OpenAI API key error. Please set a valid OpenAI API key.`);
        } else if (errorData.message.includes('Perplexity')) {
          throw new Error(`Perplexity API key error. Please set a valid Perplexity API key.`);
        }
      }
      
      throw new Error(`Server API error: ${errorData.message || errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.transformed) {
      console.error('Missing transformed text in response:', data);
      throw new Error('Server returned an invalid response');
    }
    
    console.log('Server API response received, length:', data.transformed.length);
    console.log('First 100 characters:', data.transformed.substring(0, 100) + (data.transformed.length > 100 ? '...' : ''));
    
    return data.transformed;
  } catch (error: any) {
    console.error('Error in transformText:', error);
    return `Error: ${error.message || 'Unknown error'}. Please try again.`;
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
    case 'formal':
      return '👔';
    case 'casual':
      return '😊';
    case 'persuasive':
      return '🎯';
    case 'witty':
      return '😄';
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

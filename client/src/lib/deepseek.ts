import { TransformAction } from '@/pages/TextTransformer';

async function getDeepseekApiKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'getApiKeys' }, (response) => {
        if (response && response.deepseekApiKey) {
          resolve(response.deepseekApiKey);
        } else {
          reject(new Error('Deepseek API key not found'));
        }
      });
    } else {
      // For development/testing environment
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (apiKey) {
        resolve(apiKey);
      } else {
        reject(new Error('Deepseek API key not found'));
      }
    }
  });
}

export async function callDeepseek(
  text: string,
  action: TransformAction,
  model: string = 'deepseek-coder'
): Promise<string> {
  try {
    const apiKey = await getDeepseekApiKey();
    
    if (!apiKey) {
      throw new Error('Please add your Deepseek API key in the settings.');
    }

    const systemPrompt = createSystemPrompt(action);
    const userPrompt = `${systemPrompt}\n\nText to transform: "${text}"`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-coder",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`Deepseek API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData && 
        responseData.choices && 
        responseData.choices.length > 0 && 
        responseData.choices[0].message &&
        responseData.choices[0].message.content) {
      
      return responseData.choices[0].message.content.trim();
    } else {
      return mockTransformResponse(text, action);
    }
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    return mockTransformResponse(text, action);
  }
}

function createSystemPrompt(action: TransformAction): string {
  switch (action) {
    case 'generate_text':
      return 'You are a helpful assistant. Generate an appropriate response to the following text, which might be a message, email, or question. The response should be natural, helpful, and conversational.';
    case 'simplify':
      return 'Simplify the following text to make it more concise and easier to understand. Remove unnecessary words and complex language while preserving the original meaning.';
    case 'expand':
      return 'Expand the following text to provide more detail, examples, and explanation. Make it more comprehensive while maintaining the original tone and intent.';
    case 'rephrase':
      return 'Rephrase the following text to express the same idea in a different way. Use synonyms and alternative sentence structures while preserving the original meaning and tone.';
    case 'formal':
      return 'Transform the following text to use a formal, professional tone. Use proper grammar, avoid contractions, and employ sophisticated vocabulary where appropriate.';
    case 'casual':
      return 'Transform the following text to use a casual, conversational tone. Use contractions, simple language, and a friendly approach.';
    case 'persuasive':
      return 'Rewrite the following text to be more persuasive and compelling. Use persuasive techniques to make the argument more convincing.';
    case 'witty':
      return 'Rewrite the following text to be more witty and clever. Add humor, wordplay, or playful elements while maintaining the core message.';
    case 'empathetic':
      return 'Rewrite the following text to be more empathetic and understanding. Show compassion and acknowledge the emotions and perspectives of others.';
    case 'direct':
      return 'Rewrite the following text to be more direct and fact-based. Focus on clear, straightforward communication of information and data.';
    case 'add_emoji':
      return 'Add appropriate emojis to the following text to enhance its meaning and emotion. Place emojis at natural points in the text, not just at the end of sentences. Don\'t overuse them.';
    case 'remove_emoji':
      return 'Remove all emojis from the following text while preserving all other content.';
    case 'fix_grammar':
      return 'Fix any grammar, spelling, or punctuation errors in the following text. Do not change the meaning or tone. Only respond with the corrected text, no explanations needed.';
    default:
      return 'Transform the following text according to the given action, while preserving its core meaning.';
  }
}

function mockTransformResponse(text: string, action: TransformAction): string {
  // For fallback when API calls fail
  switch (action) {
    case 'simplify':
      return `${text} [Simplified version would appear here with a working API key]`;
    case 'expand':
      return `${text} [Expanded version would appear here with a working API key]`;
    case 'rephrase':
      return `${text} [Rephrased version would appear here with a working API key]`;
    case 'formal':
      return `${text} [Formal version would appear here with a working API key]`;
    case 'casual':
      return `${text} [Casual version would appear here with a working API key]`;
    case 'persuasive':
      return `${text} [Persuasive version would appear here with a working API key]`;
    case 'witty':
      return `${text} [Witty version would appear here with a working API key]`;
    case 'empathetic':
      return `${text} [Empathetic version would appear here with a working API key]`;
    case 'direct':
      return `${text} [Direct version would appear here with a working API key]`;
    case 'generate_text':
      return `[Generated response would appear here with a working API key]`;
    case 'add_emoji':
      return `${text} 😊`;
    case 'remove_emoji':
      // For mock implementation, just leave text as is
      return text;
    case 'fix_grammar':
      return `${text} [Grammar fixed version would appear here with a working API key]`;
    default:
      return text;
  }
}
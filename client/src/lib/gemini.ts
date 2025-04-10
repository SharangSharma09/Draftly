import { TransformAction } from '@/pages/TextTransformer';

async function getGoogleApiKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'getApiKeys' }, (response) => {
        if (response && response.googleApiKey) {
          resolve(response.googleApiKey);
        } else {
          reject(new Error('Google API key not found'));
        }
      });
    } else {
      // For development/testing environment
      const apiKey = process.env.GOOGLE_API_KEY;
      if (apiKey) {
        resolve(apiKey);
      } else {
        reject(new Error('Google API key not found'));
      }
    }
  });
}

export async function callGemini(
  text: string,
  action: TransformAction,
  model: string = 'gemini-pro'
): Promise<string> {
  try {
    const apiKey = await getGoogleApiKey();
    
    if (!apiKey) {
      throw new Error('Please add your Google API key in the settings.');
    }

    const systemPrompt = createSystemPrompt(action);
    const userPrompt = `${systemPrompt}\n\nText to transform: "${text}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData && 
        responseData.candidates && 
        responseData.candidates.length > 0 && 
        responseData.candidates[0].content &&
        responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts.length > 0) {
      
      return responseData.candidates[0].content.parts[0].text.trim();
    } else {
      return mockTransformResponse(text, action);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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
      return text.replace(/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\\u{1F5FF}\u{1F680}-\\u{1F6FF}\u{1F700}-\\\u{1F77F}\\u{1F780}-\\u{1F7FF}\u{1F800}-\\\u{1F8FF}\\u{1F900}-\\u{1F9FF}\u{1FA00}-\\\u{1FA6F}\\u{1FA70}-\\u{1FAFF}\\u{2600}-\u{26FF}\u{2700}-\\\u{27BF}]/gu, '');
    case 'fix_grammar':
      return `${text} [Grammar fixed version would appear here with a working API key]`;
    default:
      return text;
  }
}

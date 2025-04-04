import { LLMModel, TransformAction } from '@/pages/TextTransformer';

// Function to transform text using OpenAI API
export async function callOpenAI(
  text: string,
  action: TransformAction,
  model: LLMModel = 'gpt-3.5-turbo'
): Promise<string> {
  // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
  const apiModel = model === 'gpt-4o' ? 'gpt-4o' : 'gpt-3.5-turbo';
  
  // Only use OpenAI models if selected model is OpenAI
  if (!['gpt-3.5-turbo', 'gpt-4o'].includes(model)) {
    // For non-OpenAI models, we'll mock the response for demo
    return mockTransformResponse(text, action);
  }
  
  try {
    // Create the system prompt based on the action
    const systemPrompt = createSystemPrompt(action);
    
    const requestBody = {
      model: apiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 1500
    };
    
    console.log('OpenAI API Request:', {
      action,
      model: apiModel,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      systemPrompt
    });
    
    console.log('OpenAI API Key available:', !!import.meta.env.OPENAI_API_KEY);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error Response:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', {
      model: data.model,
      content: data.choices[0].message.content.substring(0, 100) + (data.choices[0].message.content.length > 100 ? '...' : ''),
      fullResponse: data
    });
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    // Fallback to mock implementation if API call fails
    return mockTransformResponse(text, action);
  }
}

// Create system prompts based on the action
function createSystemPrompt(action: TransformAction): string {
  const baseInstruction = "Important: Do not include any introductory phrases like 'This is a processed version of' in your response - just provide the processed text directly.";
  
  switch (action) {
    case 'simplify':
      return `You are a helpful assistant that shortens text. Make the text more concise by removing unnecessary details while preserving the core message. Target a 50% reduction in length. ${baseInstruction}`;
    
    case 'expand':
      return `You are a helpful assistant that elaborates on text. Add relevant details, examples, and explanations to make the content more comprehensive and informative. ${baseInstruction}`;
    
    case 'formal':
      return `You are a helpful assistant that makes text more formal. Use complete sentence structures, sophisticated vocabulary, and a neutral, respectful tone. The text should be suitable for professional or academic contexts. ${baseInstruction}`;
    
    case 'casual':
      return `You are a helpful assistant that makes text more casual and conversational. Use relaxed sentence structures, everyday language, and an approachable, friendly tone. The text should sound natural as if spoken between friends. ${baseInstruction}`;
      
    case 'persuasive':
      return `You are a helpful assistant that makes text more persuasive. Use direct and compelling sentence structures, strong vocabulary, and a motivating, influential tone. The text should effectively convince the reader. ${baseInstruction}`;
      
    case 'witty':
      return `You are a helpful assistant that makes text more witty. Use playful sentence structures, clever wordplay, and a lighthearted, humorous tone. The text should be engaging and entertaining. ${baseInstruction}`;
    
    default:
      return `You are a helpful assistant. Process the following text as requested. ${baseInstruction}`;
  }
}

// Mock implementation for when API is not available or for non-OpenAI models
function mockTransformResponse(text: string, action: TransformAction): string {
  if (!text.trim()) return '';
  
  // Get first 100 characters for the preview
  const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  switch (action) {
    case 'simplify':
      return `${preview.substring(0, 40)}... [shortened version]`;
    
    case 'expand':
      return `${preview.substring(0, 40)}... [with additional context and elaboration on the main topics]`;
    
    case 'formal':
      return `${preview.substring(0, 40)}... [expressed in formal language]`;
    
    case 'casual':
      return `${preview.substring(0, 40)}... [expressed in casual, conversational language]`;
      
    case 'persuasive':
      return `${preview.substring(0, 40)}... [expressed persuasively]`;
      
    case 'witty':
      return `${preview.substring(0, 40)}... [expressed with wit and humor]`;
    
    default:
      return text;
  }
}

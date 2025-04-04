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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    // Fallback to mock implementation if API call fails
    return mockTransformResponse(text, action);
  }
}

// Create system prompts based on the action
function createSystemPrompt(action: TransformAction): string {
  switch (action) {
    case 'summarize':
      return 'You are a helpful assistant that summarizes text concisely while preserving the key points. Create a summary that is about 30% of the original length. Important: Do not include phrases like "This is a summary of" or "Here\'s a summary" in your response - just provide the summary directly.';
    
    case 'paraphrase':
      return 'You are a helpful assistant that paraphrases text. Rewrite the text in a different way while keeping the same meaning. Do not add or remove information. Important: Do not include phrases like "This is a paraphrased version of" or "Here\'s a paraphrase" in your response - just provide the paraphrased text directly.';
    
    case 'formalize':
      return 'You are a helpful assistant that makes text more formal and professional. Improve the language to be suitable for business or academic contexts while maintaining the original meaning. Important: Do not include phrases like "This is a formal version of" in your response - just provide the formalized text directly.';
    
    case 'simplify':
      return 'You are a helpful assistant that simplifies complex text. Make the text easier to understand by using simpler words and shorter sentences. Target a middle-school reading level. Important: Do not include phrases like "This is a simplified version of" in your response - just provide the simplified text directly.';
    
    case 'bullets':
      return 'You are a helpful assistant that converts text into bullet points. Extract the key points and organize them as a bulleted list. Each bullet should be concise and clear. Important: Do not include introductory phrases like "Here are the key points" - just provide the bullet points directly.';
    
    case 'expand':
      return 'You are a helpful assistant that expands text with additional details. Elaborate on the given text by adding explanations, examples, or context that makes the content more comprehensive. Important: Do not include phrases like "This is an expanded version of" in your response - just provide the expanded text directly.';
    
    default:
      return 'You are a helpful assistant. Process the following text as requested. Important: Do not include any introductory phrases like "This is a processed version of" in your response - just provide the processed text directly.';
  }
}

// Mock implementation for when API is not available or for non-OpenAI models
function mockTransformResponse(text: string, action: TransformAction): string {
  if (!text.trim()) return '';
  
  // Get first 100 characters for the preview
  const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  switch (action) {
    case 'summarize':
      return `The main points of the text focus on ${preview.substring(0, 40)}...`;
    
    case 'paraphrase':
      return `${preview.substring(0, 40)}... [content rewritten differently]`;
    
    case 'formalize':
      return `${preview.substring(0, 40)}... [expressed in more formal language]`;
    
    case 'simplify':
      return `${preview.substring(0, 40)}... [presented in simpler terms]`;
    
    case 'bullets':
      return `• Key point about ${preview.substring(0, 30)}\n• Important insight from the text\n• Final conclusion`;
    
    case 'expand':
      return `${preview.substring(0, 40)}... [with additional context and elaboration on the main topics]`;
    
    default:
      return text;
  }
}

import { LLMModel, TransformAction } from '@/pages/TextTransformer';

// Function to transform text using Perplexity API
export async function callPerplexity(
  text: string,
  action: TransformAction,
  model: LLMModel = 'llama-3'
): Promise<string> {
  // The newest Perplexity model is "llama-3.1-sonar-small-128k-online"
  const apiModel = 'llama-3.1-sonar-small-128k-online';
  
  // Only use Perplexity if the selected model is perplexity-based
  if (!['llama-3', 'llama-3-70b'].includes(model)) {
    // For non-Perplexity models, we'll mock the response for demo
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
      temperature: 0.2,
      max_tokens: 1500,
      top_p: 0.9,
      stream: false
    };
    
    console.log('Perplexity API Request:', {
      action,
      model: apiModel, 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      systemPrompt
    });
    
    console.log('Perplexity API Key available:', !!import.meta.env.PERPLEXITY_API_KEY);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API Error Response:', errorData);
      throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Perplexity API Response:', {
      model: data.model,
      content: data.choices[0].message.content.substring(0, 100) + (data.choices[0].message.content.length > 100 ? '...' : ''),
      fullResponse: data
    });
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API call failed:', error);
    // Fallback to mock implementation if API call fails
    return mockTransformResponse(text, action);
  }
}

// Create system prompts based on the action
function createSystemPrompt(action: TransformAction): string {
  const baseInstruction = "IMPORTANT: DO NOT add any introductory phrases, disclaimers, or explanations like 'Here's a simplified version' or 'I've made this more formal'. Return ONLY the transformed text.";
  
  switch (action) {
    case 'simplify':
      return `You are an expert text editor specializing in concision and clarity.
      
TASK: Simplify the text to make it shorter and easier to understand while preserving all key information.
- Remove unnecessary jargon, redundancies, and filler words
- Break down complex sentences into simpler ones
- Use clearer, more direct language
- Target a 40-50% reduction in length
- Maintain the original meaning and all essential facts
- Keep the same overall structure and flow of ideas

${baseInstruction}`;
    
    case 'expand':
      return `You are an expert content developer with a talent for enriching and elaborating text.
      
TASK: Expand the provided text to make it more comprehensive and detailed.
- Add relevant context, examples, and supporting details
- Elaborate on key points with additional explanation
- Include relevant analogies or clarifications where helpful
- Double the original length while maintaining coherent flow
- Ensure all additions are factually consistent with the original
- Maintain the original tone and perspective

${baseInstruction}`;
    
    case 'formal':
      return `You are an expert in professional and academic writing.
      
TASK: Transform the text to make it more formal and professional.
- Use proper, sophisticated vocabulary appropriate for professional settings
- Employ complete, well-structured sentences and paragraphs
- Remove colloquialisms, contractions, and casual expressions
- Maintain a neutral, objective, and respectful tone
- Use passive voice where appropriate
- Ensure proper transitions between ideas
- Keep the original meaning intact

${baseInstruction}`;
    
    case 'casual':
      return `You are an expert in conversational writing and friendly communication.
      
TASK: Transform the text to make it more casual and conversational.
- Use everyday language and natural speech patterns
- Include contractions (don't, can't, we're, etc.)
- Add conversational connectors (well, actually, you know, etc. where appropriate)
- Simplify complex terminology
- Use more direct second-person address where appropriate
- Make sentences shorter and more digestible
- Maintain a warm, friendly tone

${baseInstruction}`;
      
    case 'persuasive':
      return `You are an expert in persuasive writing and compelling communication.
      
TASK: Transform the text to make it more persuasive and convincing.
- Use strong, confident language that inspires action
- Emphasize benefits and positive outcomes
- Include rhetorical questions where appropriate
- Add emotional appeals that resonate with readers
- Use power words and compelling phrases
- Structure arguments logically with clear reasoning
- Create a sense of urgency or importance
- Maintain credibility while being compelling

${baseInstruction}`;
      
    case 'witty':
      return `You are an expert in clever, engaging writing with a gift for humor.
      
TASK: Transform the text to make it more witty and entertaining.
- Add clever wordplay, puns, or intelligent humor
- Introduce playful analogies or metaphors
- Incorporate lighthearted observations
- Use a conversational, engaging tone
- Balance humor with the original message
- Avoid sarcasm that might be misinterpreted
- Keep the original meaning while making it more entertaining

${baseInstruction}`;
    
    default:
      return `You are a professional text transformation specialist.
      
TASK: Transform the provided text according to the requested style while preserving its core message and meaning.

${baseInstruction}`;
  }
}

// Mock implementation for when API is not available
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
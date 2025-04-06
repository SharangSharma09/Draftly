import { LLMModel, TransformAction } from '@/pages/TextTransformer';

// Function to get the API key from Chrome storage or environment
async function getOpenAIApiKey(): Promise<string> {
  // Check if we're in a Chrome extension context
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        resolve(result.openaiApiKey || '');
      });
    });
  } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getApiKeys' }, (response) => {
        resolve(response?.openaiApiKey || '');
      });
    });
  } else {
    // Fallback to environment variable when not in extension context
    return import.meta.env.OPENAI_API_KEY || '';
  }
}

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
    // Get the API key from storage
    const apiKey = await getOpenAIApiKey();
    
    if (!apiKey) {
      console.warn('OpenAI API key not available');
      return `Error: OpenAI API key not set. Please set your API key in the extension settings.`;
    }
    
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
    
    console.log('OpenAI API Key available:', !!apiKey);
    
    // Perform the actual API request
    console.log('Making OpenAI API request...');
    let apiResponse;
    try {
      apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        // Add these options to improve cross-origin request handling
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin'
      });

      console.log('OpenAI API response status:', apiResponse.status);
      
      if (!apiResponse.ok) {
        let errorMessage = `HTTP error! Status: ${apiResponse.status}`;
        try {
          const errorData = await apiResponse.json();
          console.error('OpenAI API Error Response:', errorData);
          errorMessage = `OpenAI API error: ${errorData.error?.message || apiResponse.statusText}`;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
    } catch (fetchError) {
      console.error('Fetch to OpenAI API failed:', fetchError);
      throw fetchError;
    }

    const data = await apiResponse.json();
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
  const baseInstruction = "IMPORTANT: DO NOT add any introductory phrases, disclaimers, or explanations like 'Here's a simplified version' or 'I've made this more formal'. Return ONLY the transformed text.";
  
  switch (action) {
    case 'generate_text':
      return `You are an expert communication assistant.
Your task is to generate an appropriate and thoughtful reply to a given message, taking into account both the length and tone of the original input.

Follow these guidelines:
- Match the tone of the input message. If the message is casual, keep the reply friendly and conversational. If it's formal, ensure the reply is professional and respectful.
- Adjust the length of your reply to align with the input:
  - For short messages, keep the response concise and to the point.
  - For longer or more detailed messages, provide a well-rounded and complete reply that acknowledges the key points.
- Always maintain clarity, coherence, and relevance to the original message.
- Feel free to include appreciation, confirmation, follow-ups, or questions where appropriate, depending on the context.
- Ensure the reply feels natural and human, not templated.

${baseInstruction}`;
    
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
      
    case 'rephrase':
      return `You are an expert text editor specialized in rewording and rephrasing.
      
TASK: Rephrase the provided text while keeping the same meaning.
- Use different vocabulary and sentence structures
- Maintain the same tone and level of formality
- Preserve the original meaning completely
- Be creative with word choice but keep it natural
- Ensure the output stays approximately the same length as the input
- Don't add or remove any key information

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

    case 'empathetic':
      return `You are an expert in empathetic communication and emotionally intelligent writing.
      
TASK: Transform the text to be more empathetic and emotionally sensitive.
- Use compassionate, understanding, and inclusive language
- Acknowledge the emotions, challenges, or needs of the audience
- Soften direct statements to sound more considerate and supportive
- Maintain a warm, respectful tone without being overly sentimental
- Ensure the final output feels encouraging, respectful, and human
- Keep the original meaning and content intact

${baseInstruction}`;

    case 'direct':
      return `You are an expert in clear, concise, and direct communication.
      
TASK: Transform the text to be more direct and to-the-point.
- Eliminate unnecessary filler words, qualifiers, or vague phrases
- Use clear, concise, and assertive language
- Favor shorter, active sentences and remove indirect expressions
- Avoid softening or hedging the message unless necessary
- Ensure the tone feels confident, focused, and unambiguous
- Keep all essential facts and meaning intact

${baseInstruction}`;

    case 'add_emoji':
      return `You are an expert text editor which adds appropriate emojis to enhance the text.

TASK: Add suitable, contextual emojis to the provided text.
- Insert relevant emojis next to key nouns, verbs, and concepts
- Use emojis that match the tone and topic of the text
- Place emojis strategically to enhance readability and engagement
- Don't overuse emojis - aim for balance (approximately 1 emoji per sentence or idea)
- Do not add emojis if the text already contains them
- Do not change any of the original text content

${baseInstruction}`;

    case 'fix_grammar':
      return `You are an expert writing assistant.
Your task is to correct the grammar in the given input text without changing its meaning, tone, or structure.

Follow these guidelines:
- Fix all grammatical errors, including verb tense, subject-verb agreement, punctuation, article usage, prepositions, and sentence structure.
- Do not rewrite or rephrase unnecessarily—only make grammatical improvements.
- Preserve the original voice, tone, and style of the input text.
- Ensure the corrected version reads naturally and fluently, as if written by a native speaker.
- Avoid changing the length or intent of the original text.

${baseInstruction}`;
    
    default:
      return `You are a professional text transformation specialist.
      
TASK: Transform the provided text according to the requested style while preserving its core message and meaning.

${baseInstruction}`;
  }
}

// Mock implementation for when API is not available or for non-OpenAI models
function mockTransformResponse(text: string, action: TransformAction): string {
  if (!text.trim()) return '';
  
  // Get first 100 characters for the preview
  const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  switch (action) {
    case 'generate_text':
      return `Thank you for your message. I've carefully considered your points and would like to respond in a way that addresses your concerns while maintaining a constructive dialogue. Let me know if you would like any clarification on the points I've shared.`;
      
    case 'simplify':
      return `${preview.substring(0, 40)}... [shortened version]`;
    
    case 'expand':
      return `${preview.substring(0, 40)}... [with additional context and elaboration on the main topics]`;
      
    case 'rephrase':
      return `${preview.substring(0, 40)}... [reworded with different vocabulary and structures]`;
    
    case 'formal':
      return `${preview.substring(0, 40)}... [expressed in formal language]`;
    
    case 'casual':
      return `${preview.substring(0, 40)}... [expressed in casual, conversational language]`;
      
    case 'persuasive':
      return `${preview.substring(0, 40)}... [expressed persuasively]`;
      
    case 'witty':
      return `${preview.substring(0, 40)}... [expressed with wit and humor]`;
      
    case 'empathetic':
      return `${preview.substring(0, 40)}... [expressed with empathy and emotional sensitivity]`;
      
    case 'direct':
      return `${preview.substring(0, 40)}... [expressed in a direct, to-the-point manner]`;
      
    case 'add_emoji':
      return `${preview.substring(0, 40)}... [with appropriate emojis added 😊]`;
      
    case 'fix_grammar':
      return `${preview.substring(0, 40)}... [with grammar errors corrected]`;
    
    default:
      return text;
  }
}

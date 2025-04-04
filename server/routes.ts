import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a route to handle text transformations
  app.post('/api/transform', async (req: Request, res: Response) => {
    try {
      console.log('Received transformation request:', {
        text: req.body.text?.substring(0, 50) + '...',
        action: req.body.action,
        model: req.body.model,
        emojiOption: req.body.emojiOption
      });
      
      const { text, action, model, emojiOption } = req.body;
      
      // Validate input
      if (!text || !action || !model) {
        return res.status(400).json({ 
          error: 'Missing required parameters', 
          details: { 
            text: !text ? 'missing' : 'ok',
            action: !action ? 'missing' : 'ok',
            model: !model ? 'missing' : 'ok'
          }
        });
      }
      
      // Route to the appropriate API based on the model
      let result = '';
      
      if (['llama-3', 'llama-3-70b'].includes(model)) {
        // Call Perplexity API
        result = await callPerplexityApi(text, action, model);
      } else if (['claude-2', 'palm'].includes(model)) {
        // For mock models, use Perplexity API but log the requested model
        console.log(`Mock model ${model} requested, using Perplexity API instead`);
        result = await callPerplexityApi(text, action, 'llama-3');
      } else {
        return res.status(400).json({ error: 'Invalid model specified' });
      }
      
      // Add emojis if the option is turned on
      if (emojiOption === 'on') {
        result = addEmojis(result, action);
      }
      
      // Return the transformed text
      return res.json({ transformed: result });
    } catch (error: any) {
      console.error('Error in /api/transform:', error);
      return res.status(500).json({ 
        error: 'Failed to transform text',
        message: error.message || 'Unknown error'
      });
    }
  });
  
  // Health check endpoint to ensure the server is running
  app.get('/api/health', (_req: Request, res: Response) => {
    // Check API key without exposing them
    const perplexityKeyValid = process.env.PERPLEXITY_API_KEY?.startsWith('pplx-') || false;
    
    const apiKeys = {
      perplexity: {
        exists: !!process.env.PERPLEXITY_API_KEY,
        validFormat: perplexityKeyValid,
        prefix: process.env.PERPLEXITY_API_KEY?.substring(0, 5) || 'N/A'
      }
    };
    
    // Overall status is good if Perplexity API key is valid
    const overallStatus = perplexityKeyValid ? 'ok' : 'error';
    
    res.json({ 
      status: overallStatus, 
      timestamp: new Date().toISOString(),
      apiKeys
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}



// Perplexity API function
async function callPerplexityApi(text: string, action: string, model: string): Promise<string> {
  const systemPrompt = createSystemPrompt(action);
  // Use larger model if llama-3-70b was requested
  const apiModel = model === 'llama-3-70b' 
    ? 'llama-3.1-sonar-large-128k-online' 
    : 'llama-3.1-sonar-small-128k-online';
  
  console.log('Calling Perplexity API with:', {
    model: apiModel,
    action,
    systemPrompt
  });
  
  // Debug environment variables (without revealing actual values)
  console.log('Checking environment variables:');
  console.log('PERPLEXITY_API_KEY available:', !!process.env.PERPLEXITY_API_KEY);
  console.log('PERPLEXITY_API_KEY starts with:', process.env.PERPLEXITY_API_KEY?.substring(0, 5));
  
  try {
    // Verify we have the correct API key format for Perplexity
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey || !apiKey.startsWith('pplx-')) {
      throw new Error('Invalid Perplexity API key format. Perplexity keys should start with pplx-');
    }
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API Error:', errorData);
      throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Perplexity API Response:', {
      model: data.model,
      contentLength: data.choices[0].message.content.length
    });
    
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Perplexity API call failed:', error);
    throw new Error(error.message || 'Perplexity API error');
  }
}

// Create system prompts based on the action
function createSystemPrompt(action: string): string {
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

// Function to add emojis
function addEmojis(text: string, action: string): string {
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
function getActionEmoji(action: string): string {
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

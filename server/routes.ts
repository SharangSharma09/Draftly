import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a route to handle text transformations
  app.post("/api/transform", async (req: Request, res: Response) => {
    try {
      console.log("Received transformation request:", {
        text: req.body.text?.substring(0, 50) + "...",
        action: req.body.action,
        model: req.body.model,
        emojiOption: req.body.emojiOption,
      });

      const { text, action, model, emojiOption } = req.body;

      // Validate input
      if (!text || !action || !model) {
        return res.status(400).json({
          error: "Missing required parameters",
          details: {
            text: !text ? "missing" : "ok",
            action: !action ? "missing" : "ok",
            model: !model ? "missing" : "ok",
          },
        });
      }

      // Handle emoji functionality through language models instead of client-side processing
      let actionToUse = action;

      // Only override action for direct emoji actions, not for transformation actions
      if (action === "add_emoji" && emojiOption === "on") {
        actionToUse = "add_emoji";
      } else if (action === "remove_emoji" && emojiOption === "off") {
        actionToUse = "remove_emoji";
      }
      
      // Don't override the requested action for regular transformations

      // For transformation actions, first apply the transformation and then apply emoji action if needed
      if (
        [
          "simplify",
          "expand",
          "formal",
          "casual",
          "persuasive",
          "witty",
        ].includes(action) &&
        emojiOption === "on"
      ) {
        let transformedText = "";

        // First do the primary transformation
        if (["llama-3", "llama-3-70b"].includes(model)) {
          transformedText = await callPerplexityApi(text, action, model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          transformedText = await callOpenAIApi(text, action, model);
        } else if (["claude-2", "palm"].includes(model)) {
          console.log(
            `Mock model ${model} requested, using Perplexity API instead`,
          );
          transformedText = await callPerplexityApi(text, action, "llama-3");
        } else {
          return res.status(400).json({ error: "Invalid model specified" });
        }

        // Then apply emoji processing to the result
        let result = "";
        if (["llama-3", "llama-3-70b"].includes(model)) {
          result = await callPerplexityApi(transformedText, "add_emoji", model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          result = await callOpenAIApi(transformedText, "add_emoji", model);
        } else {
          result = await callPerplexityApi(
            transformedText,
            "add_emoji",
            "llama-3",
          );
        }

        return res.json({ transformed: result });
      } else {
        // For direct emoji operations or normal transformations without emoji processing
        let result = "";

        if (["llama-3", "llama-3-70b"].includes(model)) {
          result = await callPerplexityApi(text, actionToUse, model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          result = await callOpenAIApi(text, actionToUse, model);
        } else if (["claude-2", "palm"].includes(model)) {
          console.log(
            `Mock model ${model} requested, using Perplexity API instead`,
          );
          result = await callPerplexityApi(text, actionToUse, "llama-3");
        } else {
          return res.status(400).json({ error: "Invalid model specified" });
        }

        return res.json({ transformed: result });
      }
    } catch (error: any) {
      console.error("Error in /api/transform:", error);

      // Determine the HTTP status code based on the error
      let statusCode = 500;
      if (error.message?.includes("API key")) {
        statusCode = 401; // Unauthorized
      }

      // Create a more user-friendly error message
      let clientMessage = error.message || "Unknown error";

      // Format API key errors to be more helpful
      if (error.message?.includes("OpenAI API key")) {
        clientMessage =
          "OpenAI API key is invalid or missing. Please check your OpenAI API key.";
      } else if (error.message?.includes("Perplexity API key")) {
        clientMessage =
          "Perplexity API key is invalid or missing. Please check your Perplexity API key.";
      }

      return res.status(statusCode).json({
        error: "Failed to transform text",
        message: clientMessage,
      });
    }
  });

  // Health check endpoint to ensure the server is running
  app.get("/api/health", (_req: Request, res: Response) => {
    // Check API keys without exposing them
    const perplexityKeyValid =
      process.env.PERPLEXITY_API_KEY?.startsWith("pplx-") || false;
    const openaiKeyExists = !!process.env.OPENAI_API_KEY;
    const openaiKeyValid =
      openaiKeyExists && (process.env.OPENAI_API_KEY?.length ?? 0) > 20;

    const apiKeys = {
      perplexity: {
        exists: !!process.env.PERPLEXITY_API_KEY,
        validFormat: perplexityKeyValid,
        prefix: process.env.PERPLEXITY_API_KEY?.substring(0, 5) || "N/A",
      },
      openai: {
        exists: openaiKeyExists,
        validFormat: openaiKeyValid,
        prefix: openaiKeyExists
          ? process.env.OPENAI_API_KEY?.substring(0, 3) + "..."
          : "N/A",
      },
    };

    // Overall status is good if at least one API key is valid
    const overallStatus = perplexityKeyValid || openaiKeyValid ? "ok" : "error";

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      apiKeys,
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Perplexity API function
async function callPerplexityApi(
  text: string,
  action: string,
  model: string,
): Promise<string> {
  const systemPrompt = createSystemPrompt(action);
  // Use larger model if llama-3-70b was requested
  const apiModel =
    model === "llama-3-70b"
      ? "llama-3.1-sonar-large-128k-online"
      : "llama-3.1-sonar-small-128k-online";

  console.log("Calling Perplexity API with:", {
    model: apiModel,
    action,
    systemPrompt,
  });

  // Debug environment variables (without revealing actual values)
  console.log("Checking environment variables:");
  console.log(
    "PERPLEXITY_API_KEY available:",
    !!process.env.PERPLEXITY_API_KEY,
  );
  console.log(
    "PERPLEXITY_API_KEY starts with:",
    process.env.PERPLEXITY_API_KEY?.substring(0, 5),
  );

  try {
    // Verify we have the correct API key format for Perplexity
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey || !apiKey.startsWith("pplx-")) {
      throw new Error(
        "Invalid Perplexity API key format. Perplexity keys should start with pplx-",
      );
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Perplexity API Error:", errorData);
      throw new Error(
        `Perplexity API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Perplexity API Response:", {
      model: data.model,
      contentLength: data.choices[0].message.content.length,
    });

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Perplexity API call failed:", error);
    throw new Error(error.message || "Perplexity API error");
  }
}

// Create system prompts based on the action
function createSystemPrompt(action: string): string {
  const baseInstruction =
    "IMPORTANT: DO NOT add any introductory phrases, disclaimers, or explanations like 'Here's a simplified version' or 'I've made this more formal'. Return ONLY the transformed text.";

  switch (action) {
    case "simplify":
      return `You are an expert text editor specializing in concision and clarity.
      
TASK: Simplify the text to make it shorter and easier to understand while preserving all key information.
- Remove unnecessary jargon, redundancies, and filler words
- Break down complex sentences into simpler ones
- Use clearer, more direct language
- Target a 40-50% reduction in length
- Maintain the original meaning and all essential facts
- Keep the same overall structure and flow of ideas

${baseInstruction}`;

    case "expand":
      return `You are an expert writing assistant.
Your task is to expand the given input text to approximately double its length while preserving the original meaning and ensuring a smooth, coherent flow.

Follow these guidelines:

Do not alter the core message, facts, or intent of the input.
Use clarifying details, examples, analogies, or elaboration to enrich the content.
Maintain the same tone and style as the original text.
Avoid repetition, filler words, or unnecessary complexity.
Ensure that the output reads naturally and fluently, as if it were originally written at that length.

${baseInstruction}`;

    case "formal":
      return `You are an expert in professional and academic writing.
      
TASK: Transform the text to make it more formal and professional.
- Use proper, sophisticated vocabulary appropriate for professional settings
- Employ complete, well-structured sentences and paragraphs
- Remove colloquialisms, contractions, and casual expressions
- Maintain a neutral, objective, and respectful tone
- Use passive voice where appropriate
- Ensure proper transitions between ideas
- Keep the original meaning intact
- Keep the character count same as the input text

${baseInstruction}`;

    case "casual":
      return `You are an expert in conversational writing and friendly communication.
      
TASK: Transform the text to make it more casual and conversational.
- Use everyday language and natural speech patterns
- Include contractions (don't, can't, we're, etc.)
- Add conversational connectors (well, actually, you know, etc. where appropriate)
- Simplify complex terminology
- Use more direct second-person address where appropriate
- Make sentences shorter and more digestible
- Maintain a warm, friendly tone
- Keep the character count same as the input text

${baseInstruction}`;

    case "persuasive":
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
- Keep the character count same as the input text

${baseInstruction}`;

    case "witty":
      return `You are an expert in clever, engaging writing with a gift for humor.
      
TASK: Transform the text to make it more witty and entertaining.
- Add clever wordplay, puns, or intelligent humor
- Introduce playful analogies or metaphors
- Incorporate lighthearted observations
- Use a conversational, engaging tone
- Balance humor with the original message
- Avoid sarcasm that might be misinterpreted
- Keep the original meaning while making it more entertaining
- Keep the character count same as the input text

${baseInstruction}`;

    case "add_emoji":
      return `You are an expert text editor which adds appropriate emojis to enhance the text.

TASK: Add suitable, contextual emojis to the provided text.
- Insert relevant emojis next to key nouns, verbs, and concepts
- Use emojis that match the tone and topic of the text
- Place emojis strategically to enhance readability and engagement
- Don't overuse emojis - aim for balance (approximately 1 emoji per sentence or idea)
- Do not add emojis if the text already contains them
- Do not change any of the original text content

${baseInstruction}`;

    case "remove_emoji":
      return `You are an expert text editor specialized in text cleanup.

TASK: Remove all emojis from the provided text.
- Delete any and all emoji characters present in the text
- Preserve all other characters, formatting, and content exactly as in the original
- If there are no emojis in the text, return the text unchanged
- Ensure proper spacing after emoji removal (no double spaces)

${baseInstruction}`;

    case "rephrase":
      return `You are an expert text editor specialized in rewording and rephrasing.

TASK: Rephrase the provided text while keeping the same meaning.
- Use different vocabulary and sentence structures
- Maintain the same tone and level of formality
- Preserve the original meaning completely
- Be creative with word choice but keep it natural
- Ensure the output stays approximately the same length as the input
- Don't add or remove any key information

${baseInstruction}`;

    default:
      return `You are a professional text transformation specialist.
      
TASK: Transform the provided text according to the requested style while preserving its core message and meaning.

${baseInstruction}`;
  }
}

// Function to add emojis
function addEmojis(text: string, action: string): string {
  // Get emoji that matches the action based on transformation type
  const actionEmoji = getActionEmoji(action);

  // Add an emoji at the beginning of the text
  let result = `${actionEmoji} ${text}`;

  // For bullet points or lists in the text, add emojis to each point
  // Match bullet points (lines starting with •, *, -, or numbers)
  const bulletRegex = /^([•\*\-]|\d+\.)\s+(.+)$/gm;
  result = result.replace(bulletRegex, (match, bullet, content) => {
    // Select a relevant emoji for the bullet point
    const randomEmoji = getBulletEmoji();
    return `${bullet} ${randomEmoji} ${content}`;
  });

  // Add contextual emojis at the end of sentences
  // Simple regex to match the end of sentences
  const sentenceEndRegex = /([.!?])\s+/g;
  result = result.replace(sentenceEndRegex, (match, punctuation) => {
    // Don't add emoji to every sentence - approximately 1 in 3 sentences
    if (Math.random() < 0.35) {
      const contextEmoji = getContextEmoji();
      return `${punctuation} ${contextEmoji} `;
    }
    return match;
  });

  return result;
}

// Get an emoji based on the transformation action
function getActionEmoji(action: string): string {
  switch (action) {
    case "simplify":
      return "✂️";
    case "expand":
      return "📚";
    case "rephrase":
      return "🔄";
    case "formal":
      return "👔";
    case "casual":
      return "😊";
    case "persuasive":
      return "🎯";
    case "witty":
      return "😄";
    default:
      return "✨";
  }
}

// Get a random emoji for bullet points from a list
function getBulletEmoji(): string {
  const bulletEmojis = ["✅", "👉", "📌", "💡", "🔑", "📊", "🎯", "📈"];
  const randomIndex = Math.floor(Math.random() * bulletEmojis.length);
  return bulletEmojis[randomIndex];
}

// Get a contextual emoji for sentences
function getContextEmoji(): string {
  // Variety of common emojis that would fit well at the end of sentences
  const contextEmojis = [
    "😊",
    "👍",
    "✨",
    "🙌",
    "💯",
    "🔥",
    "💫",
    "🌟",
    "💭",
    "💡",
    "🤔",
    "📝",
    "👀",
    "🚀",
    "🎯",
    "💪",
    "🌈",
    "🍀",
    "🌺",
    "🎵",
    "📚",
    "🎮",
    "💻",
    "📱",
    "🏆",
    "🏅",
    "🎓",
    "🧠",
    "💼",
    "👏",
    "🌞",
    "🌠",
  ];
  const randomIndex = Math.floor(Math.random() * contextEmojis.length);
  return contextEmojis[randomIndex];
}

// OpenAI API function
async function callOpenAIApi(
  text: string,
  action: string,
  model: string,
): Promise<string> {
  const systemPrompt = createSystemPrompt(action);
  // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
  const apiModel = model === "gpt-4o" ? "gpt-4o" : "gpt-3.5-turbo";

  console.log("Calling OpenAI API with:", {
    model: apiModel,
    action,
    systemPrompt,
  });

  // Debug environment variables (without revealing actual values)
  console.log("Checking environment variables:");
  console.log("OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY);
  const apiKeyLength = process.env.OPENAI_API_KEY
    ? process.env.OPENAI_API_KEY.length
    : 0;
  console.log("OPENAI_API_KEY length:", apiKeyLength);

  try {
    // Verify we have an OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
      throw new Error("Invalid OpenAI API key. Please check your API key.");
    }

    // Initialize the OpenAI client
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: apiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    console.log("OpenAI API Response:", {
      model: completion.model,
      contentLength: completion.choices[0].message.content?.length || 0,
    });

    return completion.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI API call failed:", error);
    throw new Error(error.message || "OpenAI API error");
  }
}

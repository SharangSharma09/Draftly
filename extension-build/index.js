// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import OpenAI from "openai";
async function registerRoutes(app2) {
  app2.post("/api/transform", async (req, res) => {
    try {
      console.log("Received transformation request:", {
        text: req.body.text?.substring(0, 50) + "...",
        action: req.body.action,
        model: req.body.model,
        emojiOption: req.body.emojiOption
      });
      const { text, action, model, emojiOption } = req.body;
      if (!text || !action || !model) {
        return res.status(400).json({
          error: "Missing required parameters",
          details: {
            text: !text ? "missing" : "ok",
            action: !action ? "missing" : "ok",
            model: !model ? "missing" : "ok"
          }
        });
      }
      let actionToUse = action;
      if (action === "add_emoji" && emojiOption === "on") {
        actionToUse = "add_emoji";
      } else if (action === "remove_emoji" && emojiOption === "off") {
        actionToUse = "remove_emoji";
      }
      if ([
        "simplify",
        "expand",
        "rephrase",
        "formal",
        "casual",
        "persuasive",
        "witty",
        "empathetic",
        "direct"
      ].includes(action) && emojiOption === "on") {
        let transformedText = "";
        if (["llama-3", "llama-3-70b"].includes(model)) {
          transformedText = await callPerplexityApi(text, action, model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          transformedText = await callOpenAIApi(text, action, model);
        } else if (["claude-2", "palm"].includes(model)) {
          console.log(
            `Mock model ${model} requested, using Perplexity API instead`
          );
          transformedText = await callPerplexityApi(text, action, "llama-3");
        } else {
          return res.status(400).json({ error: "Invalid model specified" });
        }
        let result = "";
        if (["llama-3", "llama-3-70b"].includes(model)) {
          result = await callPerplexityApi(transformedText, "add_emoji", model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          result = await callOpenAIApi(transformedText, "add_emoji", model);
        } else {
          result = await callPerplexityApi(
            transformedText,
            "add_emoji",
            "llama-3"
          );
        }
        return res.json({ transformed: result });
      } else {
        let result = "";
        if (["llama-3", "llama-3-70b"].includes(model)) {
          result = await callPerplexityApi(text, actionToUse, model);
        } else if (["gpt-3.5-turbo", "gpt-4o"].includes(model)) {
          result = await callOpenAIApi(text, actionToUse, model);
        } else if (["claude-2", "palm"].includes(model)) {
          console.log(
            `Mock model ${model} requested, using Perplexity API instead`
          );
          result = await callPerplexityApi(text, actionToUse, "llama-3");
        } else {
          return res.status(400).json({ error: "Invalid model specified" });
        }
        return res.json({ transformed: result });
      }
    } catch (error) {
      console.error("Error in /api/transform:", error);
      let statusCode = 500;
      if (error.message?.includes("API key")) {
        statusCode = 401;
      }
      let clientMessage = error.message || "Unknown error";
      if (error.message?.includes("OpenAI API key")) {
        clientMessage = "OpenAI API key is invalid or missing. Please check your OpenAI API key.";
      } else if (error.message?.includes("Perplexity API key")) {
        clientMessage = "Perplexity API key is invalid or missing. Please check your Perplexity API key.";
      }
      return res.status(statusCode).json({
        error: "Failed to transform text",
        message: clientMessage
      });
    }
  });
  app2.get("/api/health", (_req, res) => {
    const perplexityKeyValid = process.env.PERPLEXITY_API_KEY?.startsWith("pplx-") || false;
    const openaiKeyExists = !!process.env.OPENAI_API_KEY;
    const openaiKeyValid = openaiKeyExists && (process.env.OPENAI_API_KEY?.length ?? 0) > 20;
    const apiKeys = {
      perplexity: {
        exists: !!process.env.PERPLEXITY_API_KEY,
        validFormat: perplexityKeyValid,
        prefix: process.env.PERPLEXITY_API_KEY?.substring(0, 5) || "N/A"
      },
      openai: {
        exists: openaiKeyExists,
        validFormat: openaiKeyValid,
        prefix: openaiKeyExists ? process.env.OPENAI_API_KEY?.substring(0, 3) + "..." : "N/A"
      }
    };
    const overallStatus = perplexityKeyValid || openaiKeyValid ? "ok" : "error";
    res.json({
      status: overallStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      apiKeys
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function callPerplexityApi(text, action, model) {
  const systemPrompt = createSystemPrompt(action);
  const apiModel = model === "llama-3-70b" ? "llama-3.1-sonar-large-128k-online" : "llama-3.1-sonar-small-128k-online";
  console.log("Calling Perplexity API with:", {
    model: apiModel,
    action,
    systemPrompt
  });
  console.log("Checking environment variables:");
  console.log(
    "PERPLEXITY_API_KEY available:",
    !!process.env.PERPLEXITY_API_KEY
  );
  console.log(
    "PERPLEXITY_API_KEY starts with:",
    process.env.PERPLEXITY_API_KEY?.substring(0, 5)
  );
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey || !apiKey.startsWith("pplx-")) {
      throw new Error(
        "Invalid Perplexity API key format. Perplexity keys should start with pplx-"
      );
    }
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Perplexity API Error:", errorData);
      throw new Error(
        `Perplexity API error: ${errorData.error?.message || response.statusText}`
      );
    }
    const data = await response.json();
    console.log("Perplexity API Response:", {
      model: data.model,
      contentLength: data.choices[0].message.content.length
    });
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Perplexity API call failed:", error);
    throw new Error(error.message || "Perplexity API error");
  }
}
function createSystemPrompt(action) {
  const baseInstruction = "IMPORTANT: DO NOT add any introductory phrases, disclaimers, or explanations like 'Here's a simplified version' or 'I've made this more formal'. Return ONLY the transformed text.";
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
    case "empathetic":
      return `You are an expert writing assistant.

TASK: Rewrite the given input text in a more empathetic and emotionally sensitive tone.
- Do not change the core message, facts, or intent of the input
- Use compassionate, understanding, and inclusive language to show care for the reader's perspective
- Acknowledge the emotions, challenges, or needs of the audience when appropriate
- Soften direct statements to sound more considerate and supportive
- Maintain a warm, respectful tone without being overly sentimental
- Ensure the final output feels encouraging, respectful, and human
- Keep the character count same as the input text

${baseInstruction}`;
    case "direct":
      return `You are an expert writing assistant.

TASK: Rewrite the given input text in a direct and to-the-point style.
- Do not remove or distort any essential facts or intent
- Eliminate unnecessary filler words, qualifiers, or vague phrases
- Use clear, concise, and assertive language to get the point across quickly
- Favor shorter, active sentences and remove indirect expressions
- Avoid softening or hedging the message unless absolutely necessary
- Ensure the tone feels confident, focused, and unambiguous, while staying respectful
- Keep the character count same as the input text

${baseInstruction}`;
    case "fix_grammar":
      return `You are an expert writing assistant.
Your task is to correct the grammar in the given input text without changing its meaning, tone, or structure.

Follow these guidelines:
- Fix all grammatical errors, including verb tense, subject-verb agreement, punctuation, article usage, prepositions, and sentence structure.
- Do not rewrite or rephrase unnecessarily\u2014only make grammatical improvements.
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
async function callOpenAIApi(text, action, model) {
  const systemPrompt = createSystemPrompt(action);
  const apiModel = model === "gpt-4o" ? "gpt-4o" : "gpt-3.5-turbo";
  console.log("Calling OpenAI API with:", {
    model: apiModel,
    action,
    systemPrompt
  });
  console.log("Checking environment variables:");
  console.log("OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY);
  const apiKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0;
  console.log("OPENAI_API_KEY length:", apiKeyLength);
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
      throw new Error("Invalid OpenAI API key. Please check your API key.");
    }
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: apiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    console.log("OpenAI API Response:", {
      model: completion.model,
      contentLength: completion.choices[0].message.content?.length || 0
    });
    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw new Error(error.message || "OpenAI API error");
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

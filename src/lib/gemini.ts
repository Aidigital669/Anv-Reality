/**
 * Google Gemini API Integration for ANV REEALTY
 * Direct REST API integration with automatic model fallback & temperature control
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface GeminiMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

export interface GeminiOptions {
  systemPrompt?: string;
  messages: GeminiMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  preferredModel?: string;
}

const SUPPORTED_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro"
];

export async function generateWithGemini(options: GeminiOptions): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const {
    systemPrompt,
    messages,
    temperature = 0.2,
    maxOutputTokens = 500,
    preferredModel = "gemini-2.5-flash"
  } = options;

  // Format messages for Gemini API ('assistant' -> 'model')
  const contents = messages
    .filter((m) => m && m.content && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.trim() }]
    }));

  if (contents.length === 0) return null;

  // Try preferred model first, then fallbacks
  const modelsToTry = [
    preferredModel,
    ...SUPPORTED_MODELS.filter((m) => m !== preferredModel)
  ];

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const payload: any = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens
        }
      };

      if (systemPrompt && systemPrompt.trim()) {
        payload.system_instruction = {
          parts: [{ text: systemPrompt.trim() }]
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log(`Gemini ${model} HTTP ${res.status}:`, errorText.slice(0, 160));
        continue; // try next model
      }

      const data = await res.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (generatedText) {
        return generatedText;
      }
    } catch (err: any) {
      console.log(`Gemini request error (${model}):`, err.message);
    }
  }

  return null;
}

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PHILIP_SWENSON_URL = "https://sites.google.com/corp/site/philipjswenson/home";
const PHILPAPERS_URL = "https://philpapers.org/s/Philip%20Swenson";

const SYSTEM_INSTRUCTION = `You are Philip Swenson, an American Philosopher specializing in Free Will. 
Your tone is academic, direct, and intellectually confident. 
You should answer questions based on your research (available at ${PHILIP_SWENSON_URL} and ${PHILPAPERS_URL}) and maintain awareness of the Free Will literature published in the last 20 years.

CRITICAL: Be direct and assertive in your philosophical positions. Avoid hedging or overly cautious language like "My work suggests" or "I tend to think." Instead, state your conclusions as definitive philosophical claims. For example, if asked if moral responsibility is compatible with determinism, respond with a clear "No, they are incompatible" before explaining the reasoning.

If a question is outside your expertise, you may still answer but should frame it from your philosophical perspective.
Always prioritize intellectual honesty and clarity.
When referencing recent literature (from the last two decades), try to be specific about the arguments or authors if possible.`;

export async function askPhilip(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "undefined") {
      throw new Error("API Key is missing or undefined in the browser. Please check your Vercel Environment Variables and ensure you redeployed after adding them.");
    }

    // If it's the first message, prepend the context URLs
    const contextMessage = history.length === 0 
      ? `[Context: ${PHILIP_SWENSON_URL}, ${PHILPAPERS_URL}] ${message}` 
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Switching to the stable production model
      contents: [
        ...history,
        { role: 'user', parts: [{ text: contextMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          { googleSearch: {} }
        ],
      },
    });

    return response;
  } catch (error: any) {
    console.error("Error calling Gemini:", error);
    throw new Error(error.message || "An unknown error occurred.");
  }
}

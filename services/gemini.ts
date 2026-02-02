
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from "../types";

export const translateAndExtract = async (text: string): Promise<TranslationResult> => {
  // Initialize inside the function to be safer against environment initialization races
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Detect the language of the following text and perform these actions:
    1. If it's English, translate it to Chinese.
    2. If it's NOT English (especially Spanish or Italian), translate it to English.
    3. Extract 1-3 useful vocabulary words or phrases from the source text that are meaningful for language learners.
    
    CRITICAL FILTERING RULES:
    - DO NOT extract extremely common basic words (e.g., "he", "she", "is", "the", "a", "have", "go", "be", "this", "that").
    - DO NOT extract basic functional phrases (e.g., "has been", "would like").
    - ONLY extract words or idiomatic expressions that are academic, professional, or relatively complex (B2-C2 level).
    - If the text only contains basic words, return an empty vocabulary array.
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: { type: Type.STRING },
          detectedLanguage: { type: Type.STRING },
          sourceText: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                ipa: { type: Type.STRING },
                meaning: { type: Type.STRING },
                example: { type: Type.STRING }
              },
              required: ["word", "meaning", "example"]
            }
          }
        },
        required: ["translatedText", "detectedLanguage", "vocabulary"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    sourceText: text
  };
};

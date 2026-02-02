
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TranslationResult } from "../types";

// Helper to decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const translateAndExtract = async (text: string): Promise<TranslationResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("DEBUG: API_KEY is undefined. Check Vercel Environment Variables.");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Detect the language and translate. 
      English -> Chinese. 
      Other -> English. 
      Extract 1-3 useful B2+ level words.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
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

    let jsonStr = response.text || '{}';
    // Remove potential markdown wrappers
    jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    const data = JSON.parse(jsonStr);
    return {
      ...data,
      sourceText: text
    };
  } catch (err) {
    console.error("Gemini Translation Error:", err);
    throw err;
  }
};

export const speakText = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (err) {
    console.error("TTS failed:", err);
  }
};

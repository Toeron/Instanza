
import { GoogleGenAI } from "@google/genai";
import { CaptionStyle, Language } from "../types";

const STYLE_PROMPTS: Record<CaptionStyle, string> = {
  luchtig: "vrolijk, speels en luchtig",
  grappig: "grappig, gevat en met een knipoog",
  serieus: "serieus, ingetogen en betekenisvol",
  inspirerend: "diep inspirerend, hoopvol en bemoedigend",
  filosofisch: "filosofisch, peinzend en existentieel",
  literair: "literair, poëtisch en vol beeldspraak",
  "fortune cooky": "als een gelukskoekje: kort, mystiek, een tikkeltje cryptisch en met ongevraagd advies voor de toekomst",
  positief: "extreem positief, energiek, enthousiast en motiverend, als een korte peptalk"
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "ENGLISH",
  fr: "FRENCH",
  es: "SPANISH",
  it: "ITALIAN",
  de: "GERMAN",
  zh: "CHINESE (SIMPLIFIED)",
  nl: "DUTCH"
};

export async function generatePoeticCaption(
  base64Image: string,
  style: CaptionStyle = 'inspirerend',
  language: Language = 'en'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.length < 10) {
    throw new Error("API Key is missing or invalid. Please check your .env file.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const imageData = base64Image.split(',')[1];
  const styleInstruction = STYLE_PROMPTS[style];
  const targetLanguage = LANGUAGE_NAMES[language];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageData,
            },
          },
          {
            text: `You are a soulful artist and philosopher capturing a fleeting moment on film. Analyze this image and create a ${styleInstruction} text in ${targetLanguage}. 
            
            Rules:
            1. It must be a short observation or thought inspired by the subject and atmosphere of the photo.
            2. Keep it VERY concise (maximum 12 words) so it fits in the handwritten margin of a polaroid.
            3. Make it feel authentic to a real person writing a note on a photo.
            4. Do not use hashtags or emojis.
            5. ONLY output the text itself, no quotes or additional commentary.`
          }
        ]
      },
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "A moment captured in time.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Fading memories.";
  }
}

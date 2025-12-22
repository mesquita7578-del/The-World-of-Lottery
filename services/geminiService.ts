
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeLotteryTicket = async (imageBase64: string) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const prompt = `Analyze this lottery ticket image and extract details for a digital archive. 
  Try to identify the country, extraction number, draw date, monetary value, state (Specimen, Amostra, or Circulated), type of lottery, and the managing entity.
  Format the response as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.split(',')[1] || imageBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            country: { type: Type.STRING },
            extractionNo: { type: Type.STRING },
            drawDate: { type: Type.STRING, description: 'YYYY-MM-DD format if possible' },
            value: { type: Type.STRING },
            state: { type: Type.STRING, description: 'Specimen, Amostra, or cs' },
            type: { type: Type.STRING },
            entity: { type: Type.STRING },
            dimensions: { type: Type.STRING, description: 'Estimated dimensions e.g. 150x80mm' }
          },
          required: ['country', 'type', 'entity']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

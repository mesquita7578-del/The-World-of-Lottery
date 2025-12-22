
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeLotteryTicket = async (imageBase64: string) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const prompt = `Analise esta imagem de um bilhete de lotaria para um arquivo digital. 
  Extraia: país (em português), número da extração, data do sorteio (AAAA-MM-DD), valor monetário, estado (Amostra, Specimen ou cs), tipo de lotaria e a entidade gestora.
  Responda apenas em formato JSON.`;

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
            drawDate: { type: Type.STRING, description: 'Formato AAAA-MM-DD' },
            value: { type: Type.STRING },
            state: { type: Type.STRING, description: 'Amostra, Specimen ou cs' },
            type: { type: Type.STRING },
            entity: { type: Type.STRING },
            dimensions: { type: Type.STRING, description: 'Ex: 150x80mm' }
          },
          required: ['country', 'type', 'entity']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro na Análise da Geni:", error);
    throw error;
  }
};

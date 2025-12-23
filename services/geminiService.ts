
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Corrected initialization to strictly follow guidelines using process.env.API_KEY directly.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const researchTicketDetails = async (ticketInfo: string) => {
  const ai = getAI();
  // Usando Pro para pesquisa profunda e ferramentas de busca
  const model = 'gemini-3-pro-preview';

  const prompt = `Como uma assistente especialista em colecionismo e história (Geni), pesquise informações detalhadas, contexto histórico, raridade e curiosidades sobre este bilhete de lotaria específico: ${ticketInfo}. 
  Identifique o contexto cultural das imagens no bilhete e, se possível, o valor histórico aproximado. 
  Seja detalhista e use um tom profissional e amigável.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Erro na Pesquisa da Geni:", error);
    throw error;
  }
};

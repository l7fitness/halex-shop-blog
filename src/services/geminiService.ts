import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateHealthTips = async (goal: string, weight: number, height: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um plano simplificado de alimentação e treino para uma pessoa com o objetivo de ${goal}. 
      Dados: Peso ${weight}kg, Altura ${height}cm. 
      Retorne um JSON com:
      - dietTips: array de strings com 3 dicas de dieta
      - trainingTips: array de strings com 3 dicas de treino
      - recommendedSupplements: array de strings com 2 suplementos da loja Halex (Whey, Creatina, Pré-treino, BCAA)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dietTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            trainingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedSupplements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["dietTips", "trainingTips", "recommendedSupplements"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating tips:", error);
    return null;
  }
};

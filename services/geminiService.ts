import { GoogleGenAI } from "@google/genai";
import { GEMINI_SYSTEM_INSTRUCTION, TOURNAMENTS } from '../constants';

// Note: In a real production app, you'd proxy this through a backend to hide the key.
// For this demo, we pull the key from Vite's environment variables so that the
// code can still render even when the key is absent.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const chatWithArchiveBot = async (userMessage: string, chatHistory: string[]) => {
  if (!ai) {
    console.warn('Gemini API key is missing. Set VITE_GEMINI_API_KEY to enable chat responses.');
    return "죄송합니다. 아직 API Key가 없어 답변을 해줄 수 없구리...";
  }

  try {
    const tournamentContext = JSON.stringify(TOURNAMENTS, null, 2);

    const model = 'gemini-2.5-flash';

    // Construct the prompt with context
    const prompt = `
      ${GEMINI_SYSTEM_INSTRUCTION}

      [현재 대회 데이터베이스]
      ${tournamentContext}

      [이전 대화 내역]
      ${chatHistory.join('\n')}

      사용자 질문: ${userMessage}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "죄송합니다. 현재 서버 통신 상태가 좋지 않아 답변을 불러올 수 없습니다. (API Key를 확인해주세요)";
  }
};
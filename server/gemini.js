// Academic Hub - Gemini & ModelPolicy Fallback Service
import { GoogleGenAI } from '@google/genai';

// Fallback hierarchy as specified in specs
export const MODEL_HIERARCHY = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite'
];

export class GeminiService {
  constructor() {
    this.systemApiKey = process.env.GEMINI_API_KEY || '';
  }

  getClient(userApiKey = '') {
    const key = userApiKey || this.systemApiKey;
    if (!key) {
      return null;
    }
    return new GoogleGenAI({ apiKey: key });
  }

  async testKey(apiKey) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Réponds uniquement "OK" si tu es opérationnel pour Academic Hub.',
      });
      return { success: true, text: response.text?.trim() || 'OK' };
    } catch (err) {
      return { 
        success: false, 
        error: err.message || 'Impossible de valider la clé API auprès de Google AI Studio.' 
      };
    }
  }

  // Robust execute with automatic fallback through the model hierarchy
  async executeWithFallback({ prompt, systemInstruction = '', userApiKey = '', jsonMode = false, preferredModel = null }) {
    const client = this.getClient(userApiKey);
    if (!client) {
      return {
        success: false,
        simulated: true,
        error: 'Aucune clé API configurée. Mode secours actif.',
      };
    }

    const modelsToTry = preferredModel 
      ? [preferredModel, ...MODEL_HIERARCHY.filter(m => m !== preferredModel)]
      : [...MODEL_HIERARCHY];

    const attempts = [];

    for (const model of modelsToTry) {
      const startTime = Date.now();
      try {
        const config = {};
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }
        if (jsonMode) {
          config.responseMimeType = 'application/json';
        }

        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const duration = Date.now() - startTime;
        attempts.push({ model, success: true, duration });

        return {
          success: true,
          modelUsed: model,
          text: response.text || '',
          attempts,
          duration,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const isQuotaOrUnavailable = 
          error.status === 429 || 
          error.status === 503 || 
          error.message?.includes('429') || 
          error.message?.includes('503') ||
          error.message?.includes('quota') ||
          error.message?.includes('RESOURCE_EXHAUSTED');

        attempts.push({ 
          model, 
          success: false, 
          error: error.message, 
          status: error.status, 
          duration,
          quotaIssue: isQuotaOrUnavailable 
        });

        console.warn(`[Gemini Fallback] Échec avec le modèle ${model}: ${error.message}. Tentative du modèle suivant...`);

        // If it's a quota/unavailable issue or another model is available, continue down the chain
        continue;
      }
    }

    return {
      success: false,
      error: 'Tous les modèles de la chaîne de relais Gemini ont échoué ou les quotas sont atteints.',
      attempts,
    };
  }
}

export const geminiService = new GeminiService();

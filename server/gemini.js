// Academic Hub - Gemini & ModelPolicy Fallback Service
import { GoogleGenAI } from '@google/genai';

// Fallback hierarchy as specified in specs
export const MODEL_HIERARCHY = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

export class GeminiService {
  constructor() {
    this.systemApiKey = process.env.GEMINI_API_KEY || '';
  }

  getClient(userApiKey = '') {
    const key = (userApiKey || this.systemApiKey || '').trim();
    if (!key) {
      return null;
    }
    return new GoogleGenAI({ apiKey: key });
  }

  async testKey(apiKey) {
    const sanitizedKey = (apiKey || '').trim();
    if (!sanitizedKey) {
      return { success: false, error: 'Clé API vide.' };
    }

    const testModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError = 'Impossible de contacter Google AI Studio.';

    for (const model of testModels) {
      try {
        const client = new GoogleGenAI({ apiKey: sanitizedKey });
        const response = await client.models.generateContent({
          model,
          contents: 'Réponds uniquement "OK" si tu es opérationnel pour Academic Hub.',
        });
        return { success: true, text: response.text?.trim() || 'OK', modelUsed: model };
      } catch (err) {
        lastError = err.message || lastError;
        console.warn(`[testKey] Modèle ${model} en échec avec cette clé :`, err.message);
      }
    }

    return { 
      success: false, 
      error: lastError 
    };
  }

  // Robust execute with automatic fallback through the model hierarchy
  async executeWithFallback({ prompt, systemInstruction = '', userApiKey = '', jsonMode = false, preferredModel = null, image = null }) {
    const client = this.getClient(userApiKey);
    if (!client) {
      return {
        success: false,
        simulated: true,
        quotaExhausted: false,
        error: 'Aucune clé API configurée. Mode secours actif.',
      };
    }

    const modelsToTry = preferredModel 
      ? [preferredModel, ...MODEL_HIERARCHY.filter(m => m !== preferredModel)]
      : [...MODEL_HIERARCHY];

    const attempts = [];
    let hadQuotaExhaustion = false;

    // Format multimodal contents if image attachment is present
    let contents = prompt;
    if (image && image.base64) {
      const cleanBase64 = image.base64.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, '');
      contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: cleanBase64
          }
        }
      ];
    }

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
          contents,
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
        const msg = (error.message || '').toLowerCase();
        const isQuotaOrUnavailable = 
          error.status === 429 || 
          error.status === 503 || 
          msg.includes('429') || 
          msg.includes('503') ||
          msg.includes('quota') ||
          msg.includes('resource_exhausted') ||
          msg.includes('rate limit');

        if (isQuotaOrUnavailable) {
          hadQuotaExhaustion = true;
        }

        attempts.push({ 
          model, 
          success: false, 
          error: error.message, 
          status: error.status, 
          duration,
          quotaIssue: isQuotaOrUnavailable 
        });

        console.warn(`[Gemini Fallback] Échec avec le modèle ${model}: ${error.message}. Bascule vers l'alternative suivante...`);
        continue;
      }
    }

    return {
      success: false,
      quotaExhausted: hadQuotaExhaustion,
      error: hadQuotaExhaustion 
        ? 'Quota Gemini atteint pour le serveur. Activez votre clé personnelle gratuite dans les paramètres pour continuer sans restriction.'
        : 'Tous les modèles de la chaîne de relais Gemini ont échoué.',
      attempts,
    };
  }
}

export const geminiService = new GeminiService();

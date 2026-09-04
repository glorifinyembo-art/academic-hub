// Academic Hub - RAG, Semantic Intent Parser & Hybrid Search Engine
import { db } from './db.js';

export class RagEngine {
  constructor() {
    this.chunksCache = null;
    this.lastIndexedAt = 0;
  }

  // Segment resources into structured academic chunks
  buildChunks() {
    const resources = db.getResources();
    const chunks = [];

    for (const res of resources) {
      if (!res.content) continue;

      // Academic segmenting: split by EXERCICE, SECTION, Chapitre, or double line breaks
      const sections = res.content.split(/(?=(?:EXERCICE|Chapitre|\d+\.|\/\/|UNIVERSITÉ))/i);

      sections.forEach((sectionText, idx) => {
        const trimmed = sectionText.trim();
        if (trimmed.length < 20) return;

        // Try detecting section/exercise title
        const firstLine = trimmed.split('\n')[0].replace(/^[#\s*-]+/, '').trim();

        chunks.push({
          id: `chunk-${res.id}-${idx}`,
          resourceId: res.id,
          resourceTitle: res.title,
          resourceType: res.type,
          courseId: res.courseId,
          promotionId: res.promotionId,
          professor: res.professor,
          chapter: res.chapter,
          sectionTitle: firstLine.substring(0, 80),
          content: trimmed,
          hasCorrection: res.hasCorrection,
          correctionId: res.correctionId,
          publishedAt: res.publishedAt
        });
      });
    }

    this.chunksCache = chunks;
    this.lastIndexedAt = Date.now();
    return chunks;
  }

  getChunks() {
    if (!this.chunksCache || Date.now() - this.lastIndexedAt > 60000) {
      this.buildChunks();
    }
    return this.chunksCache;
  }

  // Parse natural language queries into structured intent (Page 13)
  parseIntent(query = '') {
    const q = query.toLowerCase();
    const intent = {
      rawQuery: query,
      type: null,
      courseKeyword: null,
      hasCorrection: null,
      academicYear: null,
      conceptKeyword: null
    };

    if (q.includes('examen') || q.includes('partiel') || q.includes('épreuve')) {
      intent.type = 'Examen';
    } else if (q.includes('interro') || q.includes('test') || q.includes('contrôle continu')) {
      intent.type = 'Interrogation';
    } else if (q.includes('tp') || q.includes('travaux pratiques') || q.includes('labo')) {
      intent.type = 'TP';
    } else if (q.includes('exercice') || q.includes('td') || q.includes('fiche')) {
      intent.type = 'Exercices';
    } else if (q.includes('cours') || q.includes('syllabus') || q.includes('diapo') || q.includes('poly')) {
      intent.type = 'Supports de Cours';
    } else if (q.includes('corrigé') || q.includes('solution')) {
      intent.type = 'Corrigé';
    }

    if (q.includes('corrigé') || q.includes('avec correction') || q.includes('avec corrigé')) {
      intent.hasCorrection = true;
    }

    if (q.includes('2025')) intent.academicYear = '2024-2025';
    if (q.includes('2024')) intent.academicYear = '2024-2025';

    // Course keywords
    if (q.includes('math') || q.includes('analyse') || q.includes('intégral') || q.includes('différentiel')) {
      intent.courseKeyword = 'math';
    } else if (q.includes('algo') || q.includes('arbre') || q.includes('graphe') || q.includes('dijkstra') || q.includes('avl')) {
      intent.courseKeyword = 'algo';
    } else if (q.includes('meca') || q.includes('mécanique') || q.includes('newton') || q.includes('oscillateur') || q.includes('physique')) {
      intent.courseKeyword = 'meca';
    } else if (q.includes('bd') || q.includes('base de données') || q.includes('sql') || q.includes('normalisation') || q.includes('bcnf')) {
      intent.courseKeyword = 'bd';
    }

    return intent;
  }

  // Hybrid search combining exact tokens, semantic intent and reranking
  search({ query = '', courseId = '', promotionId = '', type = '', mode = 'standard', topK = 6 } = {}) {
    const chunks = this.getChunks();
    const intent = this.parseIntent(query);
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = chunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.resourceTitle.toLowerCase();
      const sectionLower = chunk.sectionTitle.toLowerCase();

      // 1. Direct filters
      if (courseId && chunk.courseId !== courseId) return { chunk, score: -1 };
      if (promotionId && chunk.promotionId !== promotionId) return { chunk, score: -1 };
      if (type && chunk.resourceType.toLowerCase() !== type.toLowerCase()) return { chunk, score: -1 };

      // 2. Intent matching bonus
      if (intent.type && chunk.resourceType === intent.type) score += 35;
      if (intent.hasCorrection && chunk.hasCorrection) score += 25;
      if (intent.academicYear && chunk.content.includes(intent.academicYear)) score += 15;

      // 3. Keyword & exact token matching
      tokens.forEach(token => {
        if (titleLower.includes(token)) score += 20;
        if (sectionLower.includes(token)) score += 15;
        if (contentLower.includes(token)) {
          const occurrences = (contentLower.match(new RegExp(token, 'g')) || []).length;
          score += Math.min(occurrences * 3, 25);
        }
      });

      // 4. Pedagogical Mode Priority (Page 25 - Révision Mode Priority)
      if (mode === 'revision') {
        if (chunk.resourceType === 'Supports de Cours') score += 30;
        if (chunk.resourceType === 'Exercices') score += 25;
        if (chunk.resourceType === 'Examen' || chunk.resourceType === 'Interrogation') score += 20;
        if (chunk.resourceType === 'Corrigé') score += 35;
      }

      return { chunk, score };
    });

    const valid = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
    return valid.slice(0, topK).map(s => ({
      ...s.chunk,
      relevanceScore: s.score
    }));
  }

  // Build grounded prompt context with explicit citations
  assembleContextForQuery({ query, courseId, mode = 'standard', topK = 4 }) {
    const hits = this.search({ query, courseId, mode, topK });
    
    if (hits.length === 0) {
      return {
        contextString: "Aucun extrait direct trouvé dans le corpus pour cette requête exacte. Se baser sur les connaissances académiques générales en le précisant explicitement.",
        sources: []
      };
    }

    const sources = hits.map((h, i) => ({
      sourceIndex: i + 1,
      documentId: h.resourceId,
      documentTitle: h.resourceTitle,
      resourceType: h.resourceType,
      section: h.sectionTitle,
      professor: h.professor,
      snippet: h.content.substring(0, 300) + '...'
    }));

    const contextParts = hits.map((h, i) => 
      `[SOURCE ${i + 1}] Document: "${h.resourceTitle}" (Type: ${h.resourceType}, Professeur: ${h.professor})\nSection: ${h.sectionTitle}\nExtrait:\n${h.content}\n`
    );

    return {
      contextString: contextParts.join('\n---\n'),
      sources
    };
  }
}

export const ragEngine = new RagEngine();

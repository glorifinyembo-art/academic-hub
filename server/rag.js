// Academic Hub - RAG, Semantic Intent Parser & Hybrid Search Engine
import { db } from './db.js';

export class RagEngine {
  constructor() {
    this.chunksCache = null;
    this.lastIndexedAt = 0;
  }

  // Segment resources into structured academic chunks with page numbers
  buildChunks() {
    const resources = db.getResources();
    const chunks = [];

    for (const res of resources) {
      if (!res.content) continue;

      // Academic segmenting: split by EXERCICE, SECTION, Chapitre, Partie, or double line breaks
      const sections = res.content.split(/(?=(?:EXERCICE|Chapitre|Partie|\d+\.|\/\/|UNIVERSITÉ))/i);

      sections.forEach((sectionText, idx) => {
        const trimmed = sectionText.trim();
        if (trimmed.length < 20) return;

        // Try detecting section/exercise title
        const firstLine = trimmed.split('\n')[0].replace(/^[#\s*-]+/, '').trim();
        const pageNumber = Math.floor(idx / 2) + 1;

        chunks.push({
          id: `chunk-${res.id}-${idx}`,
          resourceId: res.id,
          resourceTitle: res.title,
          resourceType: res.type,
          courseId: res.courseId,
          promotionId: res.promotionId,
          professor: res.professor,
          chapter: res.chapter,
          pageNumber,
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
      courseId: null,
      hasCorrection: null,
      academicYear: null,
      professor: null,
      conceptKeyword: null,
      summaryInterpretation: ''
    };

    // 1. Document Type Detection
    if (q.includes('examen') || q.includes('partiel') || q.includes('épreuve') || q.includes('annale')) {
      intent.type = 'Examen';
    } else if (q.includes('interro') || q.includes('test') || q.includes('contrôle')) {
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

    // 2. Correction Flag
    if (q.includes('corrigé') || q.includes('corriges') || q.includes('correction') || q.includes('avec correction') || q.includes('avec corrigé')) {
      intent.hasCorrection = true;
    }

    // 3. Academic Year
    if (q.includes('2025') || q.includes('2024')) {
      intent.academicYear = '2024-2025';
    }

    // 4. Professor Detection
    if (q.includes('vasseur')) intent.professor = 'Prof. Éléonore Vasseur';
    else if (q.includes('mercier')) intent.professor = 'Prof. Laurent Mercier';
    else if (q.includes('beauchamp')) intent.professor = 'Dr. Marc Beauchamp';
    else if (q.includes('benali')) intent.professor = 'Prof. Amine Benali';

    // 5. Course & Subject Keywords
    if (q.includes('math') || q.includes('analyse') || q.includes('intégral') || q.includes('différentiel') || q.includes('riemann') || q.includes('ipp')) {
      intent.courseKeyword = 'math';
      intent.courseId = 'course-analyse2';
      intent.conceptKeyword = 'Calcul Intégral';
    } else if (q.includes('algo') || q.includes('arbre') || q.includes('graphe') || q.includes('dijkstra') || q.includes('avl') || q.includes('tri')) {
      intent.courseKeyword = 'algo';
      intent.courseId = 'course-algo2';
      intent.conceptKeyword = 'Algorithmes & Graphes';
    } else if (q.includes('meca') || q.includes('mécanique') || q.includes('newton') || q.includes('oscillateur') || q.includes('physique') || q.includes('cinématique')) {
      intent.courseKeyword = 'meca';
      intent.courseId = 'course-meca';
      intent.conceptKeyword = 'Mécanique & Énergie';
    } else if (q.includes('bd') || q.includes('base de données') || q.includes('sql') || q.includes('normalisation') || q.includes('bcnf') || q.includes('relationnel')) {
      intent.courseKeyword = 'bd';
      intent.courseId = 'course-bd';
      intent.conceptKeyword = 'Bases de Données & BCNF';
    }

    // Build human readable interpretation
    const parts = [];
    if (intent.type) parts.push(`Type: ${intent.type}`);
    if (intent.courseId) {
      const c = db.data.courses.find(course => course.id === intent.courseId);
      if (c) parts.push(`Matière: ${c.name}`);
    }
    if (intent.hasCorrection) parts.push('Avec corrigé vérifié');
    if (intent.academicYear) parts.push(`Année: ${intent.academicYear}`);
    if (intent.professor) parts.push(`Enseignant: ${intent.professor}`);

    intent.summaryInterpretation = parts.length > 0 ? parts.join(' · ') : 'Recherche par mots-clés';

    return intent;
  }

  // Hybrid search combining exact tokens, semantic intent and reranking
  search({ query = '', courseId = '', promotionId = '', type = '', mode = 'standard', topK = 10 } = {}) {
    const chunks = this.getChunks();
    const intent = this.parseIntent(query);
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = chunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.resourceTitle.toLowerCase();
      const sectionLower = chunk.sectionTitle.toLowerCase();
      const profLower = (chunk.professor || '').toLowerCase();

      // 1. Direct filters
      if (courseId && chunk.courseId !== courseId) return { chunk, score: -1 };
      if (promotionId && chunk.promotionId !== promotionId) return { chunk, score: -1 };
      if (type && chunk.resourceType.toLowerCase() !== type.toLowerCase()) return { chunk, score: -1 };

      // 2. Intent matching bonus
      if (intent.type && chunk.resourceType === intent.type) score += 40;
      if (intent.courseId && chunk.courseId === intent.courseId) score += 35;
      if (intent.hasCorrection && chunk.hasCorrection) score += 25;
      if (intent.academicYear && chunk.content.includes(intent.academicYear)) score += 15;
      if (intent.professor && profLower.includes(intent.professor.toLowerCase())) score += 30;

      // 3. Keyword & exact token matching
      tokens.forEach(token => {
        if (titleLower.includes(token)) score += 25;
        if (sectionLower.includes(token)) score += 20;
        if (profLower.includes(token)) score += 20;
        if (contentLower.includes(token)) {
          const occurrences = (contentLower.match(new RegExp(token, 'g')) || []).length;
          score += Math.min(occurrences * 4, 30);
        }
      });

      // 4. Pedagogical Mode Priority (Page 25 - Révision Mode Priority)
      if (mode === 'revision') {
        if (chunk.resourceType === 'Supports de Cours') score += 35;
        if (chunk.resourceType === 'Exercices') score += 30;
        if (chunk.resourceType === 'Examen' || chunk.resourceType === 'Interrogation') score += 25;
        if (chunk.resourceType === 'Corrigé') score += 40;
      }

      return { chunk, score };
    });

    const valid = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
    const topResults = valid.slice(0, topK).map(s => {
      let relevanceLabel = 'Pertinent';
      if (s.score >= 80) relevanceLabel = 'Correspondance très élevée';
      else if (s.score >= 50) relevanceLabel = 'Correspondance élevée';
      else relevanceLabel = 'Pertinent pour votre recherche';

      return {
        ...s.chunk,
        relevanceScore: s.score,
        relevanceLabel
      };
    });

    // Best suggestion
    const likelySearch = topResults.length > 0 ? topResults[0].resourceTitle : null;

    return {
      intent,
      likelySearch,
      results: topResults
    };
  }

  // Build grounded prompt context with explicit citations and exact page numbers
  assembleContextForQuery({ query, courseId, mode = 'standard', topK = 4 }) {
    const searchData = this.search({ query, courseId, mode, topK });
    const hits = searchData.results;
    
    if (hits.length === 0) {
      return {
        contextString: "Aucun extrait direct trouvé dans le corpus pour cette requête exacte. Se baser sur les connaissances académiques générales en le précisant explicitement.",
        sources: [],
        intent: searchData.intent
      };
    }

    const sources = hits.map((h, i) => ({
      sourceIndex: i + 1,
      documentId: h.resourceId,
      documentTitle: h.resourceTitle,
      resourceType: h.resourceType,
      section: h.sectionTitle,
      pageNumber: h.pageNumber || 1,
      professor: h.professor,
      relevanceLabel: h.relevanceLabel,
      snippet: h.content.substring(0, 300) + '...'
    }));

    const contextParts = hits.map((h, i) => 
      `[SOURCE ${i + 1}] Document: "${h.resourceTitle}" (Type: ${h.resourceType}, Page: ${h.pageNumber || 1}, Enseignant: ${h.professor})\nSection: ${h.sectionTitle}\nExtrait:\n${h.content}\n`
    );

    return {
      contextString: contextParts.join('\n---\n'),
      sources,
      intent: searchData.intent
    };
  }
}

export const ragEngine = new RagEngine();

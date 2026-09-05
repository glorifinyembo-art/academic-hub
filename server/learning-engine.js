// Academic Hub - Learning Engine, Mastery Engine, State Tree & AI Tutor
import { db } from './db.js';
import { ragEngine } from './rag.js';
import { geminiService } from './gemini.js';

export class LearningEngine {
  constructor() {}

  // Get current student state
  getState(studentId = 'default-student') {
    return db.getStudentProfile(studentId);
  }

  // Update declared mastery level (1 to 10)
  setDeclaredLevel(studentId, level) {
    const validLevel = Math.max(1, Math.min(10, parseInt(level, 10) || 5));
    return db.updateStudentProfile(studentId, { levelDeclared: validLevel });
  }

  // Open a branch in the Learning State Tree for a prerequisite concept (Page 21)
  openBranch(studentId, { parentNodeId, conceptId, title, reason }) {
    const profile = db.getStudentProfile(studentId);
    const tree = profile.learningStateTree || { activeGoal: '', activeNodeId: null, nodes: [] };

    const newBranch = {
      id: `branch-${Date.now()}`,
      conceptId,
      title,
      status: 'active',
      reasonForBranch: reason,
      parentNodeId: parentNodeId || tree.activeNodeId,
      openedAt: new Date().toISOString(),
      closedAt: null,
      masteryBefore: profile.masteryScores[conceptId] || 0.3,
      masteryAfter: null
    };

    // Attach to active node or top level
    const parentNode = tree.nodes.find(n => n.id === (parentNodeId || tree.activeNodeId));
    if (parentNode) {
      if (!parentNode.branches) parentNode.branches = [];
      parentNode.branches.push(newBranch);
    } else {
      tree.nodes.push(newBranch);
    }

    tree.activeNodeId = newBranch.id;
    db.updateStudentProfile(studentId, { learningStateTree: tree });
    return newBranch;
  }

  // Close branch and return to parent topic upon mastery verification
  closeBranch(studentId, branchId, masteryScore = 0.8) {
    const profile = db.getStudentProfile(studentId);
    const tree = profile.learningStateTree;
    let found = false;

    const traverse = (node) => {
      if (node.id === branchId) {
        node.status = 'completed';
        node.closedAt = new Date().toISOString();
        node.masteryAfter = masteryScore;
        found = true;
      }
      if (node.branches) node.branches.forEach(traverse);
    };

    tree.nodes.forEach(traverse);

    // Revert activeNodeId to root or previous parent
    if (tree.nodes.length > 0) {
      tree.activeNodeId = tree.nodes[0].id;
    }

    db.updateStudentProfile(studentId, { learningStateTree: tree });
    return tree;
  }

  // Record mastery observation
  recordMastery(studentId, conceptId, scoreChange, evidence) {
    const profile = db.getStudentProfile(studentId);
    const currentScore = profile.masteryScores[conceptId] || 0.5;
    const newScore = Math.max(0.1, Math.min(1.0, currentScore + scoreChange));

    profile.masteryScores[conceptId] = Math.round(newScore * 100) / 100;

    // Update weak and strong concepts
    const weak = Object.entries(profile.masteryScores)
      .filter(([_, val]) => val < 0.55)
      .map(([k]) => k);
    const strong = Object.entries(profile.masteryScores)
      .filter(([_, val]) => val >= 0.75)
      .map(([k]) => k);

    profile.weakConcepts = weak;
    profile.strongConcepts = strong;

    db.updateStudentProfile(studentId, {
      masteryScores: profile.masteryScores,
      weakConcepts: weak,
      strongConcepts: strong
    });

    return profile;
  }

  // Find suitable internal video for concept
  findInternalVideo(conceptId, courseId) {
    const videos = db.data.videos;
    if (conceptId) {
      const match = videos.find(v => v.conceptId === conceptId);
      if (match) return match;
    }
    if (courseId) {
      const match = videos.find(v => v.courseId === courseId);
      if (match) return match;
    }
    return videos[0] || null;
  }

  // Core Orchestrator Method: Processes student message, applies pedagogical mode, calls Gemini
  async processInteraction({ studentId = 'default-student', message, mode = 'chat', courseId = '', attachedDocId = '', userApiKey = '', image = null }) {
    const profile = db.getStudentProfile(studentId);
    const modeNormalized = ['chat', 'apprendre', 'revision', 'exercer'].includes(mode) ? mode : 'chat';

    // Check if a specific document was attached by the student
    let attachedDocContext = '';
    let attachedDocSource = null;
    if (attachedDocId) {
      const doc = db.getResourceById(attachedDocId);
      if (doc) {
        attachedDocContext = `\n[DOCUMENT INJECTÉ DEPUIS LA BIBLIOTHÈQUE] :\nTitre : ${doc.title} (${doc.type})\nCours : ${doc.courseName || doc.courseCode}\nContenu : ${doc.contentSnippet || doc.description}\n`;
        attachedDocSource = {
          documentId: doc.id,
          documentTitle: doc.title,
          type: doc.type,
          courseName: doc.courseName || doc.courseCode
        };
      }
    }

    // RAG retrieval
    const ragResult = ragEngine.assembleContextForQuery({
      query: message,
      courseId,
      mode: modeNormalized,
      topK: 3
    });

    if (attachedDocSource) {
      // Prioritize attached document as primary source
      ragResult.sources.unshift(attachedDocSource);
    }

    // Check if message indicates incomprehension (Page 20)
    const lower = message.toLowerCase();
    const indicatesConfusion = 
      lower.includes('pas compris') || 
      lower.includes('comprends pas') || 
      lower.includes('bloque') || 
      lower.includes('pourquoi') || 
      lower.includes('difficile') ||
      lower.includes('perdu') ||
      lower.includes('aide');

    // System instruction tailored to the exact pedagogical mode
    let pedagogicalPolicy = '';
    let learningAction = 'explain';

    if (modeNormalized === 'apprendre') {
      learningAction = indicatesConfusion ? 'branch_prerequisite' : 'guided_step';
      pedagogicalPolicy = `MODE APPRENDRE ACTIF :
- Ton rôle est de construire une compréhension solide et progressive.
- Niveau déclaré de l'étudiant : ${profile.levelDeclared}/10.
- Si l'étudiant dit un chiffre ou s'auto-évalue, adapte ton niveau d'explication.
- Si l'étudiant exprime une confusion ("je ne comprends pas", etc.), NE RÉPÈTE PAS la même explication. Change de stratégie : utilise une ANALOGIE du monde réel ou un EXEMPLE NUMÉRIQUE concret.
- Si le blocage porte sur un prérequis (ex: primitive avant intégrale, dérivation avant primitive), suggère d'ouvrir une courte branche de révision.
- Termine par une courte question de vérification ciblée (1 question seulement) pour valider l'assimilation.`;
    } else if (modeNormalized === 'revision') {
      learningAction = 'faculty_priority_review';
      pedagogicalPolicy = `MODE RÉVISION FACULTÉ PRIORITAIRE :
- Tu prépares l'étudiant à réussir les examens de SA faculté.
- Donne la PRIORITÉ ABSOLUE aux supports de cours, examens précédents et corrigés officiels fournis dans le contexte RAG ci-dessous.
- Cite toujours précisément les sources locales du cours (ex: "Selon l'Examen 2025 du Prof. Vasseur...").
- Adopte le style de formulation rigoureux des épreuves officielles de l'université.`;
    } else if (modeNormalized === 'exercer') {
      learningAction = 'practice_with_hints';
      pedagogicalPolicy = `MODE S'EXERCER ACTIF :
- Ne donne JAMAIS la solution complète immédiatement !
- Fournis un exercice calibré ou accompagne l'exercice demandé.
- Si l'étudiant hésite ou demande de l'aide, propose des INDICES GRADUÉS :
  * Indice 1 : Rappel de la formule ou de la règle théorique.
  * Indice 2 : Stratégie de découpage du calcul ou méthode.
  * Indice 3 : La première étape du calcul.
- Évalue son raisonnement étape par étape avec bienveillance et rigueur.`;
    } else {
      learningAction = 'academic_chat';
      pedagogicalPolicy = `MODE CHAT ACADÉMIQUE :
- Réponds avec clarté, concision et rigueur universitaire.
- Utilise les extraits du corpus académique pour fonder tes réponses et cite les documents pertinents.`;
    }

    if (image) {
      pedagogicalPolicy += `\n- ANALYSE MULTIMODALE : L'étudiant a téléversé ou photographié une image (énoncé d'exercice, calcul manuscrit, schéma ou tableau). Analyse attentivement l'image jointe pour identifier les données, équations ou questions posées.`;
    }

    const systemInstruction = `Tu es le Tuteur Pédagogique Intelligent d'Academic Hub, le centre d'information académique universitaire.
Tu as accès aux supports de cours, examens, travaux pratiques et fiches de révision de la faculté.

${pedagogicalPolicy}

FORMAT ET SOURCES :
- Base tes explications sur le corpus fourni.
- Les extraits de sources sont numérotés [SOURCE 1], [SOURCE 2], etc.
- Quand tu utilises un extrait, cite-le naturellement (ex: "Selon le cours d'Analyse II...", "D'après le corrigé de l'examen 2025...").
- Ne simule pas d'informations absentes ; si une formule ou un cours n'est pas dans le corpus, mentionne que tu te bases sur les principes mathématiques ou scientifiques généraux.`;

    const prompt = `CONTEXTE DU CORPUS ACADÉMIQUE :
${attachedDocContext}
${ragResult.contextString}

MESSAGE DE L'ÉTUDIANT :
"${message}"
${image ? "\n[IMAGE/PHOTO JOINTE PAR L'ÉTUDIANT : voir document visuel attaché ci-joint]" : ''}

RÉPONSE DU TUTEUR ACADÉMIQUE :`;

    const result = await geminiService.executeWithFallback({
      prompt,
      systemInstruction,
      userApiKey,
      jsonMode: false,
      image
    });

    let answerText = '';
    let confidence = 0.95;
    let modelUsed = 'simulated';

    if (result.success) {
      answerText = result.text;
      modelUsed = result.modelUsed;
    } else {
      // High-quality deterministic pedagogical fallback response (Page 11 & Page 18)
      confidence = 0.85;
      modelUsed = result.quotaExhausted ? 'Secours Pédagogique (Quota Cloud Atteint)' : 'Secours Pédagogique (Local)';
      
      const primaryDoc = attachedDocSource || (ragResult.sources && ragResult.sources[0]) || null;
      const docName = primaryDoc ? (primaryDoc.title || primaryDoc.documentTitle || primaryDoc.courseName) : 'Analyse II / Mécanique';

      if (modeNormalized === 'apprendre') {
        answerText = `Voici une explication structurée pour progresser sur ce concept (Ressource : ${docName}) :\n\n` +
          `1. **Définition essentielle** : En calcul intégral, une primitive F(x) vérifie F'(x) = f(x). L'intégration par parties découle de la règle du produit : ∫ u v' = [uv] - ∫ u' v.\n` +
          `2. **Exemple type issu du cours** : Pour calculer ∫ x·e^(2x) dx, on pose u(x) = x (pour que sa dérivée u'(x) = 1 simplifie l'intégrale) et v'(x) = e^(2x) (d'où v(x) = 1/2 e^(2x)).\n` +
          `3. **Micro-question de diagnostic** : Peux-tu me dire quelle fonction u(x) tu choisirais pour intégrer ∫ x·ln(x) dx ?`;
      } else if (modeNormalized === 'revision') {
        answerText = `RÉVISION EXAMEN (Basée sur les annales de la faculté — ${docName}) :\n\n` +
          `• **Référence officielle** : Examen Final Analyse II (Prof. Vasseur, Session 2025).\n` +
          `• **Question clé fréquente** : Calcul d'intégrales par changement de variable et résolution d'équations différentielles linéaires d'ordre 2.\n` +
          `• **Corrigé type** : N'oublie pas de vérifier systématiquement la solution homogène r² - 3r + 2 = 0 avant de chercher la solution particulière !`;
      } else if (modeNormalized === 'exercer') {
        answerText = `EXERCICE D'ENTRAÎNEMENT GUIDÉ (${docName}) :\n\n` +
          `Calculer l'intégrale : **I = ∫ (de 0 à 1) x · e^(2x) dx**\n\n` +
          `💡 **Indice 1 (Méthode)** : Applique la formule d'intégration par parties en posant u(x) = x et v'(x) = e^(2x).\n` +
          `Dis-moi ce que tu obtiens pour le crochet [u·v] et l'intégrale restante !`;
      } else {
        answerText = `Je suis à ton écoute pour t'aider dans tes études à partir des supports de ta faculté (${docName}). Tu peux me poser des questions sur les cours d'Algorithmique, d'Analyse Mathématique, de Mécanique ou de Bases de Données, consulter les examens corrigés, ou basculer sur les modes **Apprendre (1-10)**, **Révision faculté** ou **S'exercer** !`;
      }
    }

    // Check if we should recommend a YouTube video (Page 16 & 72)
    let recommendedVideo = null;
    if (indicatesConfusion || lower.includes('vidéo') || lower.includes('graphique') || lower.includes('visualiser')) {
      recommendedVideo = this.findInternalVideo(null, courseId);
    }

    return {
      answer: answerText,
      mode: modeNormalized,
      learningAction,
      confidence,
      modelUsed,
      quotaExhausted: !!result.quotaExhausted,
      sources: ragResult.sources,
      recommendedVideo,
      studentStateUpdate: {
        weakConcepts: profile.weakConcepts,
        strongConcepts: profile.strongConcepts,
        declaredLevel: profile.levelDeclared
      }
    };
  }
}

export const learningEngine = new LearningEngine();

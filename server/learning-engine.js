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
        attachedDocContext = `\n[DOCUMENT ACADÉMIQUE ATTACHÉ EN SESSION] :\nTitre : ${doc.title} (${doc.type})\nCours : ${doc.courseName || doc.courseCode || 'Campus'}\nEnseignant : ${doc.professor}\nChapitre : ${doc.chapter}\nExtrait : ${doc.content ? doc.content.substring(0, 1500) : doc.description}\n`;
        attachedDocSource = {
          sourceIndex: 1,
          documentId: doc.id,
          documentTitle: doc.title,
          resourceType: doc.type,
          pageNumber: 1,
          professor: doc.professor,
          courseName: doc.courseName || doc.courseCode
        };
      }
    }

    // RAG retrieval
    const ragResult = ragEngine.assembleContextForQuery({
      query: message,
      courseId,
      mode: modeNormalized,
      topK: 4
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
      lower.includes('aide-moi') ||
      lower.includes('aide');

    const isGreetingsOrIntro = 
      lower === 'bonjour' || 
      lower === 'salut' || 
      lower === 'hello' || 
      lower.startsWith('bonjour ') || 
      lower.includes('besoin d\'aide') || 
      lower.includes('que peux-tu faire') || 
      lower.includes('aide pour mes révisions');

    // System instruction tailored to the exact pedagogical mode
    let pedagogicalPolicy = '';
    let learningAction = 'explain';

    if (modeNormalized === 'apprendre') {
      learningAction = indicatesConfusion ? 'branch_prerequisite' : 'guided_step';
      pedagogicalPolicy = `MODE APPRENDRE (NIVEAU 1 À 10) :
- Ton objectif est de construire une compréhension solide et progressive.
- Niveau déclaré actuel : ${profile.levelDeclared}/10.
- Si l'étudiant commence ou demande à apprendre un nouveau sujet sans avoir précisé son niveau, demande-lui : "Sur une échelle de 1 à 10, à quel point maîtrises-tu déjà ce sujet ?"
- Si l'étudiant donne son niveau (ex: "7/10" ou "3/10"), accuse réception et pose IMMÉDIATEMENT une courte question diagnostique (1 seule question) pour vérifier son niveau réel vs déclaré.
- Si l'étudiant bloque ou dit ne pas comprendre, NE RÉPÈTE PAS la même explication : utilise une ANALOGIE ou un EXEMPLE NUMÉRIQUE concret.
- Si le blocage vient d'un prérequis (ex: dérivées avant primitives, primitives avant intégrales), propose d'ouvrir une courte branche de révision.`;
    } else if (modeNormalized === 'revision') {
      learningAction = 'faculty_priority_review';
      pedagogicalPolicy = `MODE RÉVISION FACULTÉ :
- Tu prépares l'étudiant aux examens réels de sa faculté.
- PRIORITÉ ABSOLUE : 1. Supports de cours des professeurs 2. Exercices officiels 3. Annales d'examens et interrogations 4. Corrigés officiels 5. Connaissances générales.
- Cite toujours précisément les sources locales (ex: "D'après l'Examen Final d'Analyse II 2025 du Prof. Vasseur [1]...").
- Adopte la rigueur et le format des énoncés officiels de l'université.`;
    } else if (modeNormalized === 'exercer') {
      learningAction = 'practice_with_hints';
      pedagogicalPolicy = `MODE S'EXERCER (ENTRAÎNEMENT & INDICES) :
- RÈGLE D'OR : Ne résous JAMAIS l'exercice à la place de l'étudiant dès le départ !
- Propose un exercice calibré ou accompagne l'étudiant sur son exercice.
- Guide-le avec des INDICES PROGRESSIFS si besoin :
  * 💡 Indice 1 : Rappel de la formule ou du théorème clé.
  * 🔎 Indice 2 : Méthode de résolution ou découpage de l'étape.
  * ✏️ Indice 3 : La première ligne de calcul.
  * ✅ Correction complète détaillée avec explication de chaque étape.
- Encourage l'effort et valide le raisonnement pas à pas.`;
    } else {
      learningAction = 'academic_chat';
      pedagogicalPolicy = `MODE CHAT ACADÉMIQUE :
- Tu es un tuteur universitaire bienveillant, précis et rigoureux.
- Tu connais tout l'écosystème de la faculté : cours d'Analyse II (Prof. Vasseur), Algorithmique & Graphes (Prof. Mercier), Mécanique du Point (Dr. Beauchamp), Bases de Données (Prof. Benali), ainsi que les annales d'examens 2024-2025 et les corrigés.
- Si l'étudiant te salue ou te demande de l'aide générale sur une matière, présente-lui concrètement les chapitres disponibles dans Academic Hub et propose-lui de travailler dessus ou de basculer vers les modes spécialisés (Apprendre, Révision faculté, S'exercer).`;
    }

    if (image) {
      pedagogicalPolicy += `\n- ANALYSE MULTIMODALE : Une image ou photo d'un exercice/cours est fournie. Extrais les équations ou l'énoncé et réponds selon l'intention pédagogique.`;
    }

    const systemInstruction = `Tu es le Tuteur Pédagogique Intelligent d'Academic Hub, le centre d'information académique de la faculté.
Tu disposes des cours réels, examens, travaux pratiques et corrigés universitaires.

${pedagogicalPolicy}

CITATIONS ET SOURCES :
- Dès que tu t'appuies sur un document du corpus, fais référence à la source avec son numéro sous la forme [1], [2], etc.
- Sois honnête : si une information demandée n'est pas présente dans les documents de la faculté, dis-le clairement ("Cette notion n'est pas couverte dans les documents actuels d'Academic Hub, mais selon les principes généraux...").`;

    const prompt = `CONTEXTE DOCUMENTAIRE DU CORPUS ACADÉMIQUE :
${attachedDocContext}
${ragResult.contextString}

MESSAGE DE L'ÉTUDIANT :
"${message}"
${image ? "\n[PHOTO/SCAN TRANSMIS PAR L'ÉTUDIANT : Image d'exercice universitaire fournie]" : ''}

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
      // High-quality deterministic pedagogical fallback response
      confidence = 0.88;
      modelUsed = result.quotaExhausted ? 'Secours Pédagogique (Quota Cloud Atteint)' : 'Secours Pédagogique (Local)';
      
      const primaryDoc = attachedDocSource || (ragResult.sources && ragResult.sources[0]) || null;
      const docName = primaryDoc ? (primaryDoc.title || primaryDoc.documentTitle || primaryDoc.courseName) : 'Analyse II & Algorithmique';

      if (isGreetingsOrIntro) {
        answerText = `Bonjour ! Je suis ton Tuteur IA connecté à la mémoire académique d'Academic Hub.\n\n` +
          `J'ai accès à tous les supports de ta faculté :\n` +
          `• **Analyse II (MATH102)** — Calcul Intégral, IPP, Équations Différentielles (Prof. Vasseur)\n` +
          `• **Algorithmique (INFO201)** — Arbres AVL, Graphes, Dijkstra (Prof. Mercier)\n` +
          `• **Mécanique du Point (PHYS101)** — Dynamique, Énergie, Oscillateurs (Dr. Beauchamp)\n` +
          `• **Bases de Données (INFO202)** — Formes Normales, BCNF, SQL (Prof. Benali)\n\n` +
          `Tu peux me poser une question libre, me demander d'**Apprendre** une notion de 1 à 10, lancer une **Révision faculté** sur les annales d'examens, ou **S'exercer** avec des indices progressifs ! Que souhaites-tu travailler aujourd'hui ?`;
      } else if (modeNormalized === 'apprendre') {
        answerText = `Pour maîtriser ce concept pas à pas (Ressource : ${docName} [1]) :\n\n` +
          `1. **Définition clé** : En calcul intégral, l'intégration par parties découle de la dérivation d'un produit (u·v)' = u'v + uv', ce qui donne : **∫ u·v' dx = [u·v] - ∫ u'·v dx**.\n` +
          `2. **Règle pratique (ALPES)** : Choisis u(x) selon la priorité : **A**rcsin, **L**ogarithme, **P**olynôme, **E**xponentielle, **S**inus/Cosinus.\n` +
          `3. **Micro-diagnostic d'assimilation** : Dans l'intégrale ∫ x · ln(x) dx, quelle fonction choisis-tu pour u(x) et quelle fonction pour v'(x) ? Réponds-moi et nous vérifions ensemble !`;
      } else if (modeNormalized === 'revision') {
        answerText = `RÉVISION EXAMEN FACULTÉ (Source prioritaire : ${docName} [1]) :\n\n` +
          `• **Structure fréquente de l'épreuve** : L'examen comporte généralement 3 exercices : calculs d'intégrales par IPP et changement de variable (Exercice 1), équation différentielle d'ordre 2 avec second membre (Exercice 2), et sommes de Riemann (Exercice 3).\n` +
          `• **Point de vigilance du Prof. Vasseur** : Pense à expliciter systématiquement la solution de l'équation homogène r² - 3r + 2 = 0 avant de proposer la solution particulière !\n` +
          `• **Prochaine étape** : Souhaites-tu t'entraîner sur la question des sommes de Riemann de la session 2025 ?`;
      } else if (modeNormalized === 'exercer') {
        answerText = `EXERCICE D'ENTRAÎNEMENT GUIDÉ (${docName} [1]) :\n\n` +
          `**Énoncé** : Calculer l'intégrale **I = ∫ (de 0 à 1) x · e^(2x) dx**.\n\n` +
          `💡 **Indice 1 (Rappel)** : Applique la formule d'intégration par parties en posant u(x) = x et v'(x) = e^(2x).\n` +
          `👉 *Donne-moi ton calcul de la primitive v(x) et ce que donne le terme entre crochets [u·v] !*`;
      } else {
        answerText = `D'après les documents d'Academic Hub (${docName} [1]), cette notion fait partie des objectifs fondamentaux du semestre. Tu peux approfondir en consultant les annales d'examen associées ou me demander des explications pas à pas en mode **Apprendre** ou **S'exercer**.`;
      }
    }

    // Check if we should recommend a YouTube video (Page 16 & 72)
    let recommendedVideo = null;
    if (indicatesConfusion || lower.includes('vidéo') || lower.includes('graphique') || lower.includes('visualiser') || lower.includes('animation')) {
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

  // Generate Exam Preparation Plan & Syllabus Diagnostic (Page 49)
  async analyzeExamPreparation(resourceId, userApiKey = '') {
    const resource = db.getResourceById(resourceId);
    if (!resource) return null;

    const course = db.data.courses.find(c => c.id === resource.courseId);
    const relatedData = db.getRelatedResources(resourceId);

    const prompt = `Tu es un conseiller pédagogique universitaire pour Academic Hub.
Analyse cet examen universitaire et génère un programme de préparation structuré :
Examen : "${resource.title}"
Matière : "${course ? course.name : 'Générale'}" (Enseignant : ${resource.professor})
Contenu de l'épreuve :
${resource.content || resource.description}

Retourne UNIQUEMENT un objet JSON :
{
  "examTitle": "${resource.title}",
  "difficulty": "Exigeant (3 étoiles sur 3)",
  "durationEstimated": "2h00",
  "testedTopics": [
    { "name": "Calcul Intégral & IPP", "weightPercent": 30, "importance": "Indispensable" },
    { "name": "Équations Différentielles d'ordre 2", "weightPercent": 35, "importance": "Critique" },
    { "name": "Sommes de Riemann", "weightPercent": 35, "importance": "Haut" }
  ],
  "keyRecommendations": [
    "Maîtriser le choix de u et v' par la méthode ALPES.",
    "Calculer systématiquement le discriminant de l'équation caractéristique.",
    "Revoir la définition de continuité sur [0, 1] pour les sommes de Riemann."
  ],
  "suggestedStudySteps": [
    "Étape 1 : Revoir le Chapitre 1 du cours magistral",
    "Étape 2 : Résoudre l'exercice 1 sans calculatrice en 30 min",
    "Étape 3 : Vérifier sur le corrigé officiel"
  ]
}`;

    const res = await geminiService.executeWithFallback({
      prompt,
      userApiKey,
      jsonMode: true
    });

    if (res.success) {
      try {
        return JSON.parse(res.text);
      } catch (e) {
        console.error('Failed to parse exam prep JSON:', e);
      }
    }

    // High quality deterministic fallback
    return {
      examTitle: resource.title,
      difficulty: 'Niveau Universitaire Exigeant',
      durationEstimated: '2h00',
      hasCorrection: resource.hasCorrection,
      correctionTitle: relatedData.correction ? relatedData.correction.title : null,
      testedTopics: [
        { name: "Techniques d'Intégration & Changement de variable", weightPercent: 30, importance: "Fondamental" },
        { name: "Équations Différentielles Linéaires du Second Ordre", weightPercent: 35, importance: "Critique" },
        { name: "Sommes de Riemann & Limites de Suites", weightPercent: 35, importance: "Élevé" }
      ],
      keyRecommendations: [
        "Soigner la rédaction du crochet d'intégration par parties [u·v].",
        "Vérifier la forme de la solution particulière selon que le second membre est racine de l'équation caractéristique ou non.",
        "Justifier la continuité avant de passer à l'intégrale de Riemann."
      ],
      suggestedStudySteps: [
        "1. Revoir les fiches de cours du Professeur sur les primitives et équations différentielles.",
        "2. S'entraîner sur l'exercice 1 en temps limité (25 min).",
        "3. Consulter le Corrigé Officiel pour valider la rigueur des étapes."
      ]
    };
  }

  // In-document page explanation
  async explainDocumentPage(resourceId, pageNumber = 1, userApiKey = '') {
    const resource = db.getResourceById(resourceId);
    if (!resource) return null;

    return {
      resourceId,
      title: resource.title,
      pageNumber,
      summary: `Explication de la page ${pageNumber} de ${resource.title} :\n\n` +
        `• **Notion centrale** : Cette section détaille les démarches de calcul et les formules de référence présentées par ${resource.professor}.\n` +
        `• **Points d'attention** : Veiller à respecter les hypothèses de continuité et de régularité avant d'appliquer les théorèmes.\n` +
        `• **Action conseillée** : Tu peux demander au Tuteur IA de te faire un exemple similaire ou de lancer un exercice d'entraînement.`
    };
  }
}

export const learningEngine = new LearningEngine();

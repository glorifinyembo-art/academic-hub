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

  // =========================================================================
  // DEDICATED CHAPTER LEARNING MODE (SPECIFICATION DÉTAILLÉE DU MODE APPRENDRE)
  // =========================================================================

  // 1. Start or resume a Chapter-Bounded Learning Session
  async startChapterSession({ studentId = 'default-student', courseId, chapterId, userApiKey = '' }) {
    if (!courseId) {
      throw new Error('courseId is required to start a learning session');
    }

    const course = db.data.courses.find(c => c.id === courseId);
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Default to first chapter if not specified
    let chapter = null;
    if (chapterId) {
      chapter = course.chapters.find(ch => ch.id === chapterId);
    }
    if (!chapter && course.chapters && course.chapters.length > 0) {
      chapter = course.chapters[0];
    }
    const chapterTitle = chapter ? chapter.title : 'Fondamentaux & Concepts Clés';
    const resolvedChapterId = chapter ? chapter.id : (chapterId || 'chap-default');

    // Check if an existing active session exists for this student & chapter
    const existing = db.getStudentActiveChapterSession(studentId, courseId, resolvedChapterId);
    if (existing && existing.status !== 'completed') {
      return existing;
    }

    // Identify related concepts and RAG materials strictly bounded to this chapter
    const chapterConcepts = db.data.concepts.filter(c => 
      c.courseId === courseId && (c.chapterId === resolvedChapterId || !c.chapterId)
    );
    const chapterResources = db.getResources({ courseId }).filter(r => 
      !r.chapter || r.chapter.toLowerCase().includes(chapterTitle.toLowerCase()) || r.title.toLowerCase().includes(chapterTitle.toLowerCase())
    );

    const activeSources = chapterResources.slice(0, 3).map(r => ({
      documentId: r.id,
      documentTitle: r.title,
      resourceType: r.type,
      professor: r.professor,
      chapter: r.chapter || chapterTitle,
      snippet: r.content ? r.content.substring(0, 350) + '...' : r.description
    }));

    // Demystification generation for this specific chapter
    const demystificationPrompt = `Tu es le tuteur pédagogique universitaire d'Academic Hub.
Génère la phase de démystification pour ce chapitre spécifique :
COURS : "${course.name}" (${course.code}, Enseignant: ${course.professor})
CHAPITRE : "${chapterTitle}"

Retourne UNIQUEMENT un JSON structuré :
{
  "whatIsIt": "Explication intuitive en 2 phrases simples, sans jargon inutile ni notation intimidante.",
  "whyLearnIt": "Pourquoi la faculté enseigne ce chapitre et quel problème fondamental il permet de résoudre.",
  "realWorldUse": "Un exemple concret dans le monde réel (ex: IA, physique, ingénierie, jeux vidéo, finances).",
  "whatWillWeLearn": [
    "Notion clé 1",
    "Méthode ou formule centrale",
    "Application pratique & piège à éviter"
  ]
}`;

    let demystification = null;
    const aiDemyst = await geminiService.executeWithFallback({
      prompt: demystificationPrompt,
      userApiKey,
      jsonMode: true
    });

    if (aiDemyst.success) {
      try {
        demystification = JSON.parse(aiDemyst.text);
      } catch (e) {
        console.warn('Failed to parse demystification JSON:', e);
      }
    }

    if (!demystification) {
      demystification = {
        whatIsIt: `Ce chapitre sur "${chapterTitle}" formalise les outils essentiels pour comprendre et manipuler les structures mathématiques et algorithmiques associées.`,
        whyLearnIt: `Indispensable pour maîtriser les examens de ${course.name} et aborder sereinement les chapitres suivants du cursus.`,
        realWorldUse: `Utilisé dans les moteurs de calcul scientifique, la modélisation physique et les algorithmes d'optimisation industrielle.`,
        whatWillWeLearn: [
          'Comprendre l\'intuition derrière chaque concept',
          'Maîtriser la méthode de calcul et les critères de choix',
          'Résoudre les cas typiques d\'examen sans tomber dans les pièges'
        ]
      };
    }

    // Chapter Roadmap (Plan A→Z du chapitre uniquement)
    const roadmap = [
      { id: 1, title: '1. Intuition & Mise en situation', concept: 'Intuition', status: 'active' },
      { id: 2, title: '2. Définition formelle & Formule clé', concept: 'Formule & Propriétés', status: 'pending' },
      { id: 3, title: '3. Critères de choix & Méthode pas-à-pas', concept: 'Méthodologie', status: 'pending' },
      { id: 4, title: '4. Cas typiques & Pièges classiques d\'examen', concept: 'Applications & Pièges', status: 'pending' },
      { id: 5, title: '5. Entraînement guidé & Exercice pratique', concept: 'Pratique guidée', status: 'pending' },
      { id: 6, title: '6. Défi final d\'évaluation du Chapitre', concept: 'Évaluation formative', status: 'pending' }
    ];

    // Initial Pedagogical Message for Step 1
    const initialTeachingPrompt = `Tu es le tuteur d'Academic Hub pour le Mode « APPRENDRE ».
Tu accueilles l'étudiant dans la Salle d'Apprentissage dédiée au chapitre "${chapterTitle}" de ${course.name}.
OBJECTIF ACTUEL : Étape 1 : "${roadmap[0].title}".

Règles pédagogiques strictes :
1. Fais une explication vivante, claire, bienveillante et pédagogique de l'idée intuitive.
2. Donne un exemple concret et accessible.
3. Termine impérativement par une MICRO-QUESTION de vérification interactive (très simple, pour engager l'étudiant immédiatement).
4. Propose 2 à 3 suggestions de réponses rapides (choix courts) sous forme de puces.

Garde un ton encourageant et précis. Rédige en Markdown soigné avec formules LaTeX $...$ si pertinent.`;

    let initialMessage = '';
    const aiInitial = await geminiService.executeWithFallback({
      prompt: initialTeachingPrompt,
      userApiKey
    });

    if (aiInitial.success) {
      initialMessage = aiInitial.text;
    } else {
      initialMessage = `Bonjour ! Bienvenue dans la session d'apprentissage dédiée au chapitre **${chapterTitle}** (${course.name}).\n\n` +
        `💡 **L'idée intuitive en un clin d'œil** :\n` +
        `${demystification.whatIsIt}\n\n` +
        `🎯 **Exemple d'illustration** :\n` +
        `Imaginons que nous cherchons à calculer une grandeur complexe en la décomposant en sous-éléments faciles à mesurer. C'est exactement le principe que nous allons formaliser ici.\n\n` +
        `👉 **Question d'échauffement** :\n` +
        `Avant de manipuler les formules, as-tu déjà rencontré cette notion en cours magistral ou en TD ?\n` +
        `• 🟢 *Oui, j'ai vu le cours mais je veux être sûr de tout maîtriser*\n` +
        `• 🟡 *J'ai des bases vagues et besoin d'exemples clairs*\n` +
        `• 🔴 *C'est complètement nouveau pour moi, partons de zéro*`;
    }

    const sessionId = `learn-${courseId}-${resolvedChapterId}-${Date.now()}`;
    const newSession = {
      sessionId,
      studentId,
      courseId,
      courseName: course.name,
      courseCode: course.code,
      professor: course.professor,
      chapterId: resolvedChapterId,
      chapterTitle,
      demystification,
      roadmap,
      currentStepIndex: 0,
      activeBranch: null,
      completedBranches: [],
      learningTree: {
        activeNodeId: 'node-step-1',
        nodes: [
          {
            id: 'node-step-1',
            title: roadmap[0].title,
            status: 'active',
            stepIndex: 0,
            branches: []
          }
        ]
      },
      messages: [
        {
          id: `msg-0`,
          sender: 'assistant',
          content: initialMessage,
          timestamp: new Date().toISOString(),
          stepIndex: 0,
          stepTitle: roadmap[0].title,
          isBranch: false,
          suggestedActions: [
            'J\'ai vu le cours, avançons !',
            'Besoin d\'un exemple visuel',
            'Partons de zéro pas à pas'
          ]
        }
      ],
      sessionSummary: `Démarrage du chapitre "${chapterTitle}". Étape 1 en cours : Intuition & concepts fondamentaux.`,
      activeSources,
      masteryScore: 0.35,
      acquiredConcepts: [],
      weakConcepts: [],
      assessment: null,
      status: 'active', // active, evaluating, completed
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };

    db.saveChapterSession(newSession);
    return newSession;
  }

  // 2. Interact with Chapter-Bounded Learning Session
  async interactChapterSession({ sessionId, studentId = 'default-student', message, userApiKey = '', image = null }) {
    const session = db.getChapterSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add student message to dialog
    session.messages.push({
      id: `msg-student-${Date.now()}`,
      sender: 'student',
      content: message,
      timestamp: new Date().toISOString(),
      stepIndex: session.currentStepIndex,
      isBranch: !!session.activeBranch
    });

    const currentStep = session.roadmap[session.currentStepIndex] || session.roadmap[0];
    const isLastStep = session.currentStepIndex >= session.roadmap.length - 2; // Before assessment

    // STRICT BOUNDED CONTEXT FOR GEMINI
    // Only send the minimal necessary context (not the entire course!)
    const compactHistory = session.messages.slice(-4).map(m => `${m.sender === 'student' ? 'Étudiant' : 'Tuteur IA'}: ${m.content}`).join('\n\n');
    const sourcesContext = session.activeSources.map(s => `[Source: ${s.documentTitle} (${s.resourceType}, p. 1)]: ${s.snippet}`).join('\n');

    const prompt = `Tu es le Tuteur d'Academic Hub dans le Mode « APPRENDRE ».
Tu guides l'étudiant dans l'apprentissage d'UN SEUL CHAPITRE : "${session.chapterTitle}" du cours "${session.courseName}".

CONTEXTE PÉDAGOGIQUE LOCALISÉ :
- Objectif du chapitre : Maîtriser "${session.chapterTitle}"
- Étape actuelle de la feuille de route : "${currentStep.title}" (Étape ${session.currentStepIndex + 1}/${session.roadmap.length})
- Statut Branche Prérequis : ${session.activeBranch ? `BRANCHE ACTIVE : "${session.activeBranch.title}" (Raison : ${session.activeBranch.reason})` : 'Aucune branche (parcours principal du chapitre)'}
- Résumé pédagogique compact : ${session.sessionSummary}
- Sources du cours :
${sourcesContext}

DERNIERS ÉCHANGES :
${compactHistory}

DERNIÈRE RÉPONSE DE L'ÉTUDIANT :
"${message}"

MISSION & ANALYSE PÉDAGOGIQUE :
1. Évalue la réponse de l'étudiant. A-t-il compris l'étape actuelle ?
2. DÉTECTION D'INCOMPRÉHENSION / PRÉREQUIS :
   - Si l'étudiant bloque à cause d'une lacune sur un prérequis fondamental (ex: dérivation pour une intégration, opérations matricielles de base) : déclare "gap_detected" avec "prerequisiteConcept" et "branchTitle". Annonce avec bienveillance l'ouverture d'une courte parenthèse pédagogique ("🌿 Petite parenthèse sur...").
   - Si l'étudiant a une incompréhension ordinaire sur l'étape : déclare "incomprehension" et change de stratégie d'explication (analogie concrète, schéma textuel, ou calcul guidé pas à pas).
   - Si l'étudiant était dans une branche prérequis et a bien répondu : déclare "branch_completed", félicite-le et ramène-le explicitement au fil principal du chapitre ("✅ Préquivalent maîtrisé ! Revenons à notre étape principale...").
   - Si l'étudiant a bien assimilé l'étape actuelle : déclare "understood", valide avec enthousiasme, et présente l'étape suivante (${isLastStep ? 'le Défi d\'évaluation finale' : 'l\'étape ' + (session.currentStepIndex + 2)}) avec une explication claire et une micro-question de vérification.

Retourne UNIQUEMENT un JSON structuré :
{
  "status": "understood" | "incomprehension" | "gap_detected" | "branch_completed",
  "pedagogicalDecision": "Explication brève de ta décision pédagogique",
  "replyText": "Ton message d'enseignement complet en Markdown avec formules LaTeX $...$, félicitations ou analogies, et la prochaine question/étape.",
  "prerequisiteBranch": {
    "needed": boolean,
    "conceptName": "Nom du prérequis manquant",
    "reason": "Pourquoi on ouvre cette branche temporaire"
  },
  "advanceToNextStep": boolean,
  "nextStepIndex": number,
  "suggestedActions": ["Choix 1", "Choix 2", "Choix 3"],
  "sourcesCited": [
    { "title": "${session.activeSources[0]?.documentTitle || 'Support de cours'}", "page": 1, "isFromProfessor": true }
  ],
  "sessionSummaryUpdate": "Mise à jour d'une phrase du résumé compact de la progression de l'étudiant."
}`;

    let aiResult = null;
    const aiResponse = await geminiService.executeWithFallback({
      prompt,
      userApiKey,
      jsonMode: true,
      image
    });

    if (aiResponse.success) {
      try {
        aiResult = JSON.parse(aiResponse.text);
      } catch (e) {
        console.warn('Failed to parse tutor interaction JSON:', e);
      }
    }

    // Robust deterministic fallback if AI is unavailable
    if (!aiResult) {
      aiResult = this.buildDeterministicTutorResponse(session, message);
    }

    // Process State & Transitions based on AI decision
    let branchEvent = null;
    if (aiResult.status === 'gap_detected' && aiResult.prerequisiteBranch && aiResult.prerequisiteBranch.needed && !session.activeBranch) {
      // Open prerequisite branch
      const branchId = `branch-${Date.now()}`;
      session.activeBranch = {
        id: branchId,
        title: aiResult.prerequisiteBranch.conceptName || 'Notion Prérequise',
        reason: aiResult.prerequisiteBranch.reason || 'Consolidation d\'un prérequis nécessaire',
        openedAt: new Date().toISOString(),
        parentStepIndex: session.currentStepIndex
      };
      branchEvent = { type: 'branch_opened', branch: session.activeBranch };
      session.sessionSummary = `Branche prérequis ouverte : ${session.activeBranch.title} pour débloquer l'étape ${session.currentStepIndex + 1}.`;
    } else if ((aiResult.status === 'branch_completed' || aiResult.status === 'understood') && session.activeBranch) {
      // Close active branch and return to parent
      const closedBranch = {
        ...session.activeBranch,
        closedAt: new Date().toISOString(),
        masteryAfter: 0.85
      };
      session.completedBranches.push(closedBranch);
      branchEvent = { type: 'branch_closed', branch: closedBranch };
      session.activeBranch = null;
      session.sessionSummary = `Branche prérequis terminée avec succès. Retour à l'étape principale ${session.currentStepIndex + 1}.`;
    }

    // Advance step if understood
    if (aiResult.advanceToNextStep && !session.activeBranch) {
      session.roadmap[session.currentStepIndex].status = 'completed';
      if (session.currentStepIndex < session.roadmap.length - 1) {
        session.currentStepIndex += 1;
        session.roadmap[session.currentStepIndex].status = 'active';
        session.masteryScore = Math.min(1.0, session.masteryScore + 0.12);
      }
      if (aiResult.sessionSummaryUpdate) {
        session.sessionSummary = aiResult.sessionSummaryUpdate;
      }
    }

    // Check if we reached the final assessment step (Step 6)
    if (session.currentStepIndex === session.roadmap.length - 1 && session.status !== 'completed') {
      session.status = 'evaluating';
    }

    // Add assistant response to messages
    const assistantMsg = {
      id: `msg-assistant-${Date.now()}`,
      sender: 'assistant',
      content: aiResult.replyText,
      timestamp: new Date().toISOString(),
      stepIndex: session.currentStepIndex,
      stepTitle: session.roadmap[session.currentStepIndex]?.title || 'Étape en cours',
      isBranch: !!session.activeBranch,
      branchInfo: session.activeBranch,
      branchEvent,
      sourcesCited: aiResult.sourcesCited || session.activeSources.slice(0, 2),
      suggestedActions: aiResult.suggestedActions || ['Je comprends, continuons !', 'Peux-tu donner un autre exemple ?', 'Voir la formule']
    };

    session.messages.push(assistantMsg);
    db.saveChapterSession(session);

    return {
      session,
      assistantMessage: assistantMsg,
      branchEvent
    };
  }

  // Deterministic fallback generator for tutor
  buildDeterministicTutorResponse(session, message) {
    const stepIdx = session.currentStepIndex;
    const isAffirmative = /oui|d'accord|compris|ok|continuer|suivant|go|parfait|avance/i.test(message);

    if (isAffirmative) {
      const nextStepIdx = Math.min(session.roadmap.length - 1, stepIdx + 1);
      return {
        status: 'understood',
        pedagogicalDecision: 'Étudiant confirme la bonne compréhension, passage à l\'étape suivante.',
        advanceToNextStep: true,
        nextStepIndex: nextStepIdx,
        replyText: `Très bien ! C'est parfaitement assimilé. Passons maintenant à l'étape suivante : **${session.roadmap[nextStepIdx].title}**.\n\n` +
          `📌 **Point central à retenir** :\n` +
          `Dans cette partie du cours de **${session.courseName}**, l'objectif est d'appliquer la règle systématiquement en vérifiant les conditions de validité.\n\n` +
          `👉 **Vérification pratique** :\n` +
          `Que remarques-tu si on applique cette démarche sur un premier cas simple ?`,
        suggestedActions: ['La règle s\'applique directement', 'Il y a une condition à vérifier', 'Explique-moi le calcul'],
        sessionSummaryUpdate: `Étape ${stepIdx + 1} validée. Passage à l'étape ${nextStepIdx + 1}.`
      };
    } else {
      return {
        status: 'incomprehension',
        pedagogicalDecision: 'Clarification demandée, utilisation d\'une analogie concrète.',
        advanceToNextStep: false,
        nextStepIndex: stepIdx,
        replyText: `Prenons le temps de bien poser les choses avec une image simple :\n\n` +
          `💡 **Analogie** :\n` +
          `Pense à cette méthode comme à un levier d'ingénierie : au lieu de soulever un bloc lourd en une seule fois, nous le découpons en petites cales que l'on empile.\n\n` +
          `Est-ce que cette représentation t'aide à mieux visualiser le principe ?`,
        suggestedActions: ['Oui, c\'est beaucoup plus clair', 'Montre-moi un calcul chiffré', 'Reprenons la formule'],
        sessionSummaryUpdate: `Consolidation de l'étape ${stepIdx + 1} par une analogie.`
      };
    }
  }

  // 3. Generate Final Chapter Assessment Challenge (Gamified Flashcards 🟢 Facile, 🟡 Intermédiaire, 🔴 Difficile)
  async generateChapterAssessment({ sessionId, userApiKey = '', isRetry = false }) {
    const session = db.getChapterSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const prompt = `Tu es le concepteur d'évaluations formatives pour Academic Hub.
Génère le Défi Final d'Évaluation pour le chapitre "${session.chapterTitle}" du cours "${session.courseName}" (${session.professor}).
${isRetry ? 'IMPORTANT: Génère une NOUVELLE VARIANTE de questions avec des énoncés et valeurs renouvelés, testant les mêmes compétences.' : ''}

CRITÈRES STRICTS DU DÉFI :
- 5 Questions au total bien calibrées :
  • 2 questions 🟢 Faciles (Reconnaissance, définition, concept fondamental)
  • 2 questions 🟡 Intermédiaires (Application de méthode, choix de stratégie, calcul guidé)
  • 1 question 🔴 Difficile (Piège classique d'examen, cas limite, analyse d'erreur)
- Variété de formats : QCM avec explications détaillées pour chaque option.

Retourne UNIQUEMENT un JSON structuré :
{
  "chapterTitle": "${session.chapterTitle}",
  "courseName": "${session.courseName}",
  "isRetry": ${isRetry},
  "questions": [
    {
      "id": "q1",
      "tier": "facile",
      "tierLabel": "🟢 Facile (Concept Fondamental)",
      "type": "qcm",
      "prompt": "Énoncé précis et clair de la question 1",
      "options": [
        { "id": "A", "text": "Option A...", "isCorrect": false, "explanation": "Pourquoi A est inexact." },
        { "id": "B", "text": "Option B...", "isCorrect": true, "explanation": "Explication pédagogique complète pourquoi B est la réponse exacte." },
        { "id": "C", "text": "Option C...", "isCorrect": false, "explanation": "Pourquoi C est inexact." },
        { "id": "D", "text": "Option D...", "isCorrect": false, "explanation": "Pourquoi D est inexact." }
      ],
      "conceptTested": "Définition & Notion de base"
    },
    {
      "id": "q2",
      "tier": "facile",
      "tierLabel": "🟢 Facile (Reconnaissance)",
      "type": "qcm",
      "prompt": "Énoncé de la question 2",
      "options": [
        { "id": "A", "text": "Option A...", "isCorrect": true, "explanation": "Explication exacte." },
        { "id": "B", "text": "Option B...", "isCorrect": false, "explanation": "Pourquoi c'est faux." },
        { "id": "C", "text": "Option C...", "isCorrect": false, "explanation": "Pourquoi c'est faux." }
      ],
      "conceptTested": "Propriétés fondamentales"
    },
    {
      "id": "q3",
      "tier": "intermediaire",
      "tierLabel": "🟡 Intermédiaire (Choix de Méthode)",
      "type": "qcm",
      "prompt": "Énoncé de la question 3 avec situation pratique",
      "options": [
        { "id": "A", "text": "Option A...", "isCorrect": false, "explanation": "Explication." },
        { "id": "B", "text": "Option B...", "isCorrect": true, "explanation": "Explication exacte." },
        { "id": "C", "text": "Option C...", "isCorrect": false, "explanation": "Explication." }
      ],
      "conceptTested": "Stratégie de résolution"
    },
    {
      "id": "q4",
      "tier": "intermediaire",
      "tierLabel": "🟡 Intermédiaire (Calcul appliqué)",
      "type": "qcm",
      "prompt": "Énoncé de calcul pour la question 4",
      "options": [
        { "id": "A", "text": "Option A...", "isCorrect": false, "explanation": "Explication." },
        { "id": "B", "text": "Option B...", "isCorrect": false, "explanation": "Explication." },
        { "id": "C", "text": "Option C...", "isCorrect": true, "explanation": "Explication exacte." }
      ],
      "conceptTested": "Calcul et décomposition"
    },
    {
      "id": "q5",
      "tier": "difficile",
      "tierLabel": "🔴 Difficile (Piège classique d'examen)",
      "type": "qcm",
      "prompt": "Énoncé de la question piège ou cas limite",
      "options": [
        { "id": "A", "text": "Option A...", "isCorrect": true, "explanation": "Explication détaillée de la subtilité." },
        { "id": "B", "text": "Option B (Piège habituel)...", "isCorrect": false, "explanation": "Attention au piège classique !" },
        { "id": "C", "text": "Option C...", "isCorrect": false, "explanation": "Explication." }
      ],
      "conceptTested": "Vigilance & Cas limites"
    }
  ]
}`;

    let assessmentData = null;
    const res = await geminiService.executeWithFallback({
      prompt,
      userApiKey,
      jsonMode: true
    });

    if (res.success) {
      try {
        assessmentData = JSON.parse(res.text);
      } catch (e) {
        console.warn('Failed to parse assessment JSON:', e);
      }
    }

    if (!assessmentData || !assessmentData.questions) {
      // Deterministic high quality assessment fallback
      assessmentData = this.buildDeterministicAssessment(session, isRetry);
    }

    session.assessment = {
      ...assessmentData,
      generatedAt: new Date().toISOString(),
      status: 'pending',
      retriesCount: isRetry ? (session.assessment?.retriesCount || 0) + 1 : 0
    };

    db.saveChapterSession(session);
    return session.assessment;
  }

  buildDeterministicAssessment(session, isRetry = false) {
    const isMath = session.courseId.includes('math') || session.courseId.includes('analyse');
    const isAlgo = session.courseId.includes('algo');

    if (isMath) {
      return {
        chapterTitle: session.chapterTitle,
        courseName: session.courseName,
        isRetry,
        questions: [
          {
            id: 'q1',
            tier: 'facile',
            tierLabel: '🟢 Facile (Concept Fondamental)',
            type: 'qcm',
            prompt: `Dans la formule d'Intégration par Parties $\\int u \\cdot v' = [u \\cdot v] - \\int u' \\cdot v$, que représente le terme entre crochets $[u \\cdot v]$ ?`,
            options: [
              { id: 'A', text: 'La valeur de la primitive prise entre les bornes : $(u(b)v(b) - u(a)v(a))$', isCorrect: true, explanation: 'Exact ! C\'est la partie intégrée déjà évaluée aux bornes de l\'intégrale.' },
              { id: 'B', text: 'Une intégrale indéfinie restante', isCorrect: false, explanation: 'Non, le crochet correspond aux termes déjà primitivés.' },
              { id: 'C', text: 'La dérivée du produit $(u \\cdot v)\'$', isCorrect: false, explanation: 'Non, la dérivation s\'applique sous la seconde intégrale.' }
            ],
            conceptTested: 'Formule d\'Intégration par Parties'
          },
          {
            id: 'q2',
            tier: 'facile',
            tierLabel: '🟢 Facile (Règle de Choix)',
            type: 'qcm',
            prompt: `Pour calculer $\\int x \\cdot e^{2x} dx$, quel est le meilleur choix pour $u(x)$ afin de simplifier l'intégrale ?`,
            options: [
              { id: 'A', text: 'Poser $u(x) = x$, car sa dérivée $u\'(x) = 1$ élimine la variable polynomiale.', isCorrect: true, explanation: 'Parfait ! En dérivant $x$, on obtient $1$, ce qui laisse une intégrale simple $\\int e^{2x} dx$.' },
              { id: 'B', text: 'Poser $u(x) = e^{2x}$ et $v\'(x) = x$', isCorrect: false, explanation: 'Cela compliquerait le calcul en augmentant le degré du polynôme ($x^2/2$).' },
              { id: 'C', text: 'Poser $u(x) = 1$ et $v(x) = x \\cdot e^{2x}$', isCorrect: false, explanation: 'Cela ne réduit pas la complexité de l\'expression.' }
            ],
            conceptTested: 'Règle de priorité u / dv (Méthode ALPES)'
          },
          {
            id: 'q3',
            tier: 'intermediaire',
            tierLabel: '🟡 Intermédiaire (Calcul de Primitive)',
            type: 'qcm',
            prompt: `Quelle est la primitive de $v\'(x) = e^{3x}$ sans constante d\'intégration ?`,
            options: [
              { id: 'A', text: '$v(x) = 3 e^{3x}$', isCorrect: false, explanation: 'Attention, 3 est le facteur obtenu par dérivation, pas par intégration.' },
              { id: 'B', text: '$v(x) = \\frac{1}{3} e^{3x}$', isCorrect: true, explanation: 'Exact ! $\\int e^{kx} dx = \\frac{1}{k} e^{kx}$.' },
              { id: 'C', text: '$v(x) = e^{3x}$', isCorrect: false, explanation: 'Il manque la division par le coefficient interne 3.' }
            ],
            conceptTested: 'Primitives d\'exponentielles composées'
          },
          {
            id: 'q4',
            tier: 'intermediaire',
            tierLabel: '🟡 Intermédiaire (Résultat d\'intégration)',
            type: 'qcm',
            prompt: `En appliquant l'IPP à $\\int_0^1 x \\cdot e^x dx$, quel est le résultat numérique exact ?`,
            options: [
              { id: 'A', text: '$e - 1$', isCorrect: false, explanation: '$[x e^x]_0^1 = e$, et $-\\int_0^1 e^x dx = -(e - 1)$. Donc $e - (e - 1) = 1$.' },
              { id: 'B', text: '$1$', isCorrect: true, explanation: 'Bravo ! $[x e^x]_0^1 - [e^x]_0^1 = (1\\cdot e - 0) - (e - 1) = 1$.' },
              { id: 'C', text: '$2e - 1$', isCorrect: false, explanation: 'Erreur de signe lors de la soustraction de l\'intégrale secondaire.' }
            ],
            conceptTested: 'Calcul numérique aux bornes'
          },
          {
            id: 'q5',
            tier: 'difficile',
            tierLabel: '🔴 Difficile (Piège classique : IPP circulaire)',
            type: 'qcm',
            prompt: `Pour calculer $I = \\int e^x \\cos(x) dx$, on effectue une première IPP, puis une seconde. Quel phénomène se produit ?`,
            options: [
              { id: 'A', text: 'On retrouve l\'intégrale de départ $I$ avec un signe négatif, ce qui permet de poser une équation algébrique $2I = \\dots$', isCorrect: true, explanation: 'Excellente maîtrise ! C\'est le cas classique de l\'IPP circulaire : on isole $I = \\frac{e^x(\\cos x + \\sin x)}{2} + C$.' },
              { id: 'B', text: 'L\'intégrale devient indéterminée et diverge', isCorrect: false, explanation: 'Non, les fonctions exponentielle et cosinus sont régulières et intégrables sur $\\mathbb{R}$.' },
              { id: 'C', text: 'Le crochet s\'annule et donne systématiquement 0', isCorrect: false, explanation: 'Faux, la fonction dépend du point d\'évaluation.' }
            ],
            conceptTested: 'Intégration circulaire & Rigueur d\'examen'
          }
        ]
      };
    }

    // Default Algorithmics / General
    return {
      chapterTitle: session.chapterTitle,
      courseName: session.courseName,
      isRetry,
      questions: [
        {
          id: 'q1',
          tier: 'facile',
          tierLabel: '🟢 Facile (Concept Fondamental)',
          type: 'qcm',
          prompt: `Quelle est la propriété fondamentale définissant un Arbre Binaire de Recherche (ABR) pour chaque nœud $N$ ?`,
          options: [
            { id: 'A', text: 'Tous les nœuds du sous-arbre gauche sont $\\le N$ et ceux du sous-arbre droit sont $\\ge N$.', isCorrect: true, explanation: 'C\'est la définition canonique de l\'ABR qui garantit une recherche efficace.' },
            { id: 'B', text: 'Tous les niveaux de l\'arbre doivent avoir exactement deux enfants.', isCorrect: false, explanation: 'Ceci est la définition d\'un arbre binaire parfait, pas d\'un ABR quelconque.' },
            { id: 'C', text: 'La racine est toujours le maximum de l\'arbre.', isCorrect: false, explanation: 'Ceci correspond à un Tas-Max (Max-Heap), non un ABR.' }
          ],
          conceptTested: 'Propriété d\'ordre ABR'
        },
        {
          id: 'q2',
          tier: 'facile',
          tierLabel: '🟢 Facile (Complexité Moyenne)',
          type: 'qcm',
          prompt: `Quelle est la complexité temporelle moyenne d'une recherche dans un ABR équilibré de $n$ nœuds ?`,
          options: [
            { id: 'A', text: '$O(\\log n)$', isCorrect: true, explanation: 'Exact ! La hauteur étant bornée par $\\log_2 n$, chaque comparaison divise l\'espace de recherche par 2.' },
            { id: 'B', text: '$O(n)$', isCorrect: false, explanation: '$O(n)$ est le pire cas pour un arbre dégénéré (peigne), pas le cas moyen équilibré.' },
            { id: 'C', text: '$O(1)$', isCorrect: false, explanation: '$O(1)$ est la complexité d\'une table de hachage, pas d\'un arbre.' }
          ],
          conceptTested: 'Analyse de complexité asymptotique'
        },
        {
          id: 'q3',
          tier: 'intermediaire',
          tierLabel: '🟡 Intermédiaire (Parcours & Tri)',
          type: 'qcm',
          prompt: `Quel parcours d'arbre permet de visiter les clés d'un ABR dans l'ordre croissant strict ?`,
          options: [
            { id: 'A', text: 'Parcours Infixe (Gauche, Racine, Droite)', isCorrect: true, explanation: 'Bravo ! Le parcours infixe sur un ABR génère la suite triée des éléments.' },
            { id: 'B', text: 'Parcours Préfixe (Racine, Gauche, Droite)', isCorrect: false, explanation: 'Le préfixe traite la racine avant les feuilles gauches.' },
            { id: 'C', text: 'Parcours Postfixe (Gauche, Droite, Racine)', isCorrect: false, explanation: 'Le postfixe traite la racine en dernier.' }
          ],
          conceptTested: 'Algorithmes de parcours d\'arbres'
        },
        {
          id: 'q4',
          tier: 'intermediaire',
          tierLabel: '🟡 Intermédiaire (Suppression de Nœud)',
          type: 'qcm',
          prompt: `Lors de la suppression d'un nœud ayant deux enfants dans un ABR, par quelle valeur le remplace-t-on le plus fréquemment ?`,
          options: [
            { id: 'A', text: 'Par le plus petit élément de son sous-arbre droit (son successeur in-order)', isCorrect: true, explanation: 'Exact ! Son successeur in-order préserve strictement la relation d\'ordre de l\'ABR.' },
            { id: 'B', text: 'Par la moyenne de ses deux enfants directs', isCorrect: false, explanation: 'Une valeur moyenne arbitraire n\'appartient pas nécessairement à l\'arbre.' },
            { id: 'C', text: 'Par la racine globale de l\'arbre', isCorrect: false, explanation: 'Cela détruirait la structure de l\'arbre entier.' }
          ],
          conceptTested: 'Maintien de la structure après suppression'
        },
        {
          id: 'q5',
          tier: 'difficile',
          tierLabel: '🔴 Difficile (Piège classique : Dégénérescence)',
          type: 'qcm',
          prompt: `Si l'on insère dans un ABR initialement vide la suite de clés déjà triée $[1, 2, 3, 4, 5]$, quelle sera la forme de l'arbre et la complexité d'une recherche ?`,
          options: [
            { id: 'A', text: 'L\'arbre dégénère en liste chaînée (peigne droit) et la recherche passe en $O(n)$.', isCorrect: true, explanation: 'Parfait ! C\'est le piège fondamental qui motive l\'utilisation d\'arbres auto-équilibrants comme les AVL ou Rouge-Noir.' },
            { id: 'B', text: 'L\'arbre s\'auto-équilibre automatiquement en $O(\\log n)$.', isCorrect: false, explanation: 'Un ABR classique ne dispose d\'aucun mécanisme d\'auto-équilibrage.' },
            { id: 'C', text: 'L\'arbre génère une erreur d\'insertion car les clés sont séquentielles.', isCorrect: false, explanation: 'L\'algorithme insère chaque clé normalement en tant qu\'enfant droit.' }
          ],
          conceptTested: 'Cas dégénéré & Justification des AVL'
        }
      ]
    };
  }

  // 4. Evaluate Chapter Assessment Submission & Generate Diagnostic / Mastery Update
  async evaluateChapterAssessment({ sessionId, answers = {}, userApiKey = '' }) {
    const session = db.getChapterSession(sessionId);
    if (!session || !session.assessment) {
      throw new Error(`Session or assessment not found for ID: ${sessionId}`);
    }

    const questions = session.assessment.questions;
    let correctCount = 0;
    let easyCorrect = 0, easyTotal = 0;
    let medCorrect = 0, medTotal = 0;
    let hardCorrect = 0, hardTotal = 0;

    const detailedResults = [];
    const weakConceptsDetected = [];
    const acquiredConcepts = [];

    questions.forEach(q => {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options.find(opt => opt.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (q.tier === 'facile') {
        easyTotal++;
        if (isCorrect) easyCorrect++;
      } else if (q.tier === 'intermediaire') {
        medTotal++;
        if (isCorrect) medCorrect++;
      } else if (q.tier === 'difficile') {
        hardTotal++;
        if (isCorrect) hardCorrect++;
      }

      if (isCorrect) {
        correctCount++;
        acquiredConcepts.push(q.conceptTested);
      } else {
        weakConceptsDetected.push({
          questionId: q.id,
          conceptTested: q.conceptTested,
          tier: q.tier,
          selected: selectedOptionId,
          expected: correctOption?.id,
          explanation: correctOption?.explanation || 'Revoir cette notion clé du cours.'
        });
      }

      detailedResults.push({
        questionId: q.id,
        tier: q.tier,
        prompt: q.prompt,
        conceptTested: q.conceptTested,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect,
        explanation: correctOption?.explanation
      });
    });

    const totalQuestions = questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= 50;

    // AI generated encouraging pedagogical feedback
    const feedbackPrompt = `Tu es le tuteur d'Academic Hub.
Rédige un bilan pédagogique constructif et bienveillant pour l'étudiant qui vient de passer le Défi Final du chapitre "${session.chapterTitle}".
Résultats :
- Score global : ${scorePercent}% (${correctCount}/${totalQuestions} correctes)
- 🟢 Facile : ${easyCorrect}/${easyTotal}
- 🟡 Intermédiaire : ${medCorrect}/${medTotal}
- 🔴 Difficile : ${hardCorrect}/${hardTotal}
- Notions faibles identifiées : ${weakConceptsDetected.map(w => w.conceptTested).join(', ') || 'Aucune'}
- Notions maîtrisées : ${acquiredConcepts.join(', ') || 'Bases en cours'}

Directives :
1. Reste encourageant, qu'il ait réussi ou qu'il doive consolider.
2. Si score < 50% : explique avec douceur où se situe le point de blocage et propose un plan de reprise ciblé sans culpabilité.
3. Si score >= 50% : valorise sa progression, récapitule ce qu'il maîtrise et confirme la validation du chapitre.
4. Rédige en Markdown clair en 2 courts paragraphes.`;

    let feedbackText = '';
    const aiFeedback = await geminiService.executeWithFallback({
      prompt: feedbackPrompt,
      userApiKey
    });

    if (aiFeedback.success) {
      feedbackText = aiFeedback.text;
    } else {
      if (passed) {
        feedbackText = `🎉 **Félicitations ! Tu as validé le chapitre "${session.chapterTitle}" avec ${scorePercent}% de réussite.**\n\n` +
          `Tu as démontré une solide compréhension des concepts fondamentaux et de leur mise en pratique. Tes compétences sur **${acquiredConcepts.slice(0, 3).join(', ')}** sont maintenant consolidées.`;
      } else {
        feedbackText = `💪 **Bonne tentative ! Tu as atteint ${scorePercent}%. C'est une étape normale d'apprentissage.**\n\n` +
          `L'analyse montre que l'idée intuitive est présente, mais que la notion de **${weakConceptsDetected[0]?.conceptTested || 'calcul approfondi'}** mérite une courte révision ciblée avant de valider définitivement le chapitre.`;
      }
    }

    const evaluationSummary = {
      scorePercent,
      passed,
      correctCount,
      totalQuestions,
      tiersBreakdown: {
        easy: { correct: easyCorrect, total: easyTotal, percent: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 100 },
        intermediate: { correct: medCorrect, total: medTotal, percent: medTotal > 0 ? Math.round((medCorrect / medTotal) * 100) : 100 },
        hard: { correct: hardCorrect, total: hardTotal, percent: hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 100 }
      },
      detailedResults,
      weakConceptsDetected,
      acquiredConcepts,
      feedbackText,
      evaluatedAt: new Date().toISOString()
    };

    // Update Session State
    session.assessment.result = evaluationSummary;
    session.assessment.status = 'completed';
    session.masteryScore = Math.max(session.masteryScore, scorePercent / 100);

    if (passed) {
      session.status = 'completed';
      session.roadmap.forEach(step => { step.status = 'completed'; });
      session.sessionSummary = `Chapitre "${session.chapterTitle}" validé avec succès (${scorePercent}% au Défi Final).`;
    } else {
      session.status = 'active'; // Allow remediation
      session.weakConcepts = weakConceptsDetected.map(w => w.conceptTested);
      session.sessionSummary = `Défi complété (${scorePercent}%). Reprise ciblée conseillée sur ${session.weakConcepts.join(', ')}.`;
    }

    db.saveChapterSession(session);

    // Also update student overall mastery in student profile
    const studentProfile = db.getStudentProfile(session.studentId);
    if (studentProfile) {
      if (!studentProfile.masteryScores) studentProfile.masteryScores = {};
      const conceptKey = `concept-${session.chapterId}`;
      studentProfile.masteryScores[conceptKey] = session.masteryScore;
      db.updateStudentProfile(session.studentId, { masteryScores: studentProfile.masteryScores });
    }

    return evaluationSummary;
  }

  // 5. Remediation for Weak Concept Identified in Assessment
  async remediateChapterWeakness({ sessionId, weakConceptName, userApiKey = '' }) {
    const session = db.getChapterSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const targetConcept = weakConceptName || session.weakConcepts?.[0] || 'Points clés du cours';

    const prompt = `Tu es le tuteur d'Academic Hub.
L'étudiant a eu une hésitation sur la notion "${targetConcept}" lors du Défi Final du chapitre "${session.chapterTitle}".
Fournis une micro-séance de remédiation ciblée (1 minute de lecture) :
1. Rappel ultra-clair du principe clé et de l'astuce pour ne plus hésiter.
2. Un exemple résolu pas-à-pas.
3. Une question d'entraînement immédiate avec 3 options pour vérifier que le déclic est fait.

Rédige en Markdown direct et positif.`;

    let remediationText = '';
    const res = await geminiService.executeWithFallback({
      prompt,
      userApiKey
    });

    if (res.success) {
      remediationText = res.text;
    } else {
      remediationText = `🎯 **Reprise ciblée : ${targetConcept}**\n\n` +
        `💡 **L'astuce fondamentale** :\n` +
        `Pour ne plus hésiter sur ce point d'examen, applique systématiquement la règle de vérification pas-à-pas avant d'écrire le résultat final.\n\n` +
        `📝 **Exemple d'application** :\n` +
        `Identifie toujours les termes à dériver et ceux à primitiver en amont pour éviter toute confusion de signe.\n\n` +
        `👉 **Mini-exercice de validation** :\n` +
        `Te sens-tu prêt à retenter une variante du Défi Final pour décrocher ta validation ?`;
    }

    const assistantMsg = {
      id: `msg-remed-${Date.now()}`,
      sender: 'assistant',
      content: remediationText,
      timestamp: new Date().toISOString(),
      stepIndex: session.currentStepIndex,
      stepTitle: `Remédiation : ${targetConcept}`,
      isBranch: true,
      suggestedActions: [
        'Refaire le test (Nouvelle variante)',
        'Poser une question sur cette notion',
        'Consulter la fiche du cours'
      ]
    };

    session.messages.push(assistantMsg);
    db.saveChapterSession(session);

    return {
      session,
      remediationMessage: assistantMsg
    };
  }

  // 6. "Où en sommes-nous ?" Detailed Status Summary
  getChapterSessionWhereAreWe({ sessionId }) {
    const session = db.getChapterSession(sessionId);
    if (!session) {
      return null;
    }

    const currentStep = session.roadmap[session.currentStepIndex] || session.roadmap[0];
    const progressPercent = Math.round(((session.currentStepIndex + (session.status === 'completed' ? 1 : 0)) / session.roadmap.length) * 100);

    return {
      sessionId: session.sessionId,
      courseName: session.courseName,
      courseCode: session.courseCode,
      chapterTitle: session.chapterTitle,
      professor: session.professor,
      status: session.status,
      currentStepIndex: session.currentStepIndex,
      totalSteps: session.roadmap.length,
      currentStepTitle: currentStep.title,
      progressPercent: Math.min(100, progressPercent),
      activeBranch: session.activeBranch,
      completedBranchesCount: session.completedBranches.length,
      completedBranches: session.completedBranches,
      roadmap: session.roadmap,
      masteryScorePercent: Math.round(session.masteryScore * 100),
      sessionSummary: session.sessionSummary,
      activeSources: session.activeSources,
      acquiredConcepts: session.acquiredConcepts || [],
      weakConcepts: session.weakConcepts || []
    };
  }
}

export const learningEngine = new LearningEngine();

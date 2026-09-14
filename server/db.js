// Academic Hub - Persistent Academic Database & Knowledge Repository
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'academic_data.json');

// Curated authentic university YouTube videos for core academic concepts
const SEED_VIDEOS = [
  {
    id: 'vid-ipp-exo7',
    courseId: 'course-analyse',
    conceptId: 'concept-ipp',
    chapter: 'Intégration & Primitives',
    title: 'Intégration par parties - Cours complet et astuces d\'examen',
    url: 'https://www.youtube.com/watch?v=kY3B9E_VqCg',
    youtubeId: 'kY3B9E_VqCg',
    channel: 'Exo7 Mathématiques',
    duration: '12:45',
    whyImportant: 'Démonstration géométrique et application systématique de la règle ALPES pour ne jamais hésiter sur le choix de u et v\'.'
  },
  {
    id: 'vid-avl-visual',
    courseId: 'course-algo',
    conceptId: 'concept-avl',
    chapter: 'Arbres AVL & B-Trees',
    title: 'Arbres AVL : Comprendre les 4 rotations (Gauche, Droite, Doubles)',
    url: 'https://www.youtube.com/watch?v=FNeL18KsWPc',
    youtubeId: 'FNeL18KsWPc',
    channel: 'Algorithmique Interactive',
    duration: '08:30',
    whyImportant: 'Animation graphique montrant exactement le réarrangement des pointeurs lors d\'un déséquilibre en zig-zag.'
  },
  {
    id: 'vid-pfd-newton',
    courseId: 'course-physique',
    conceptId: 'concept-newton',
    chapter: 'Lois de Newton & PFD',
    title: 'Deuxième Loi de Newton & PFD : Méthode de projection sans erreur',
    url: 'https://www.youtube.com/watch?v=vVj4Zqj7b0c',
    youtubeId: 'vVj4Zqj7b0c',
    channel: 'Physique Universitaire',
    duration: '10:15',
    whyImportant: 'Schéma vectoriel étape par étape pour projeter les forces sur le repère cartésien et maîtriser les signes.'
  },
  {
    id: 'vid-diag-algebre',
    courseId: 'course-algebre',
    conceptId: 'concept-diagonalisation',
    chapter: 'Matrices & Diagonalisation',
    title: 'Diagonalisation et valeurs propres : L\'essence géométrique',
    url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g',
    youtubeId: 'PFDu9oVAE-g',
    channel: '3Blue1Brown FR',
    duration: '14:20',
    whyImportant: 'Visualisation intuitive pour comprendre ce que signifie réellement un changement de base dans l\'espace.'
  },
  {
    id: 'vid-rlc-elec',
    courseId: 'course-elec',
    conceptId: 'concept-rlc',
    chapter: 'Circuits RLC & Régime Transitoire',
    title: 'Circuit RLC série : Régimes apériodique, critique et pseudo-périodique',
    url: 'https://www.youtube.com/watch?v=x_6Xb4V2a9o',
    youtubeId: 'x_6Xb4V2a9o',
    channel: 'Génie Électrique & Physique',
    duration: '11:00',
    whyImportant: 'Courbes réelles de décharge du condensateur pour comprendre physiquement l\'amortissement.'
  }
];
const SEED_PROMOTIONS = [];
const SEED_COURSES = [];
const SEED_CONCEPTS = [];
const SEED_RESOURCES = [];

// 3 Admin Agents configuration as described in specifications
const INITIAL_ADMIN_AGENTS = [
  {
    id: 'agent-1',
    name: 'Agent Alpha (Cours & Ingestion)',
    specialty: 'Supports de cours, syllabus & TPs',
    status: 'idle',
    apiKeyStatus: 'active (System Fallback Relay)',
    preferredModel: 'gemini-3.6-flash',
    jobsProcessed: 0,
    currentJobId: null,
    lastHeartbeat: new Date().toISOString(),
    lastError: null
  },
  {
    id: 'agent-2',
    name: 'Agent Bêta (Examens & Mathématiques)',
    specialty: 'Examens, Interrogations & Corrigés',
    status: 'idle',
    apiKeyStatus: 'active (System Fallback Relay)',
    preferredModel: 'gemini-3.6-flash',
    jobsProcessed: 0,
    currentJobId: null,
    lastHeartbeat: new Date().toISOString(),
    lastError: null
  },
  {
    id: 'agent-3',
    name: 'Agent Gamma (Contrôle & Qualité)',
    specialty: 'Classification, Déduplication & Tâches Ad-Hoc',
    status: 'idle',
    apiKeyStatus: 'active (System Fallback Relay)',
    preferredModel: 'gemini-3.6-flash',
    jobsProcessed: 0,
    currentJobId: null,
    lastHeartbeat: new Date().toISOString(),
    lastError: null
  }
];

class AcademicDatabase {
  constructor() {
    this.data = {
      promotions: SEED_PROMOTIONS,
      courses: SEED_COURSES,
      concepts: SEED_CONCEPTS,
      videos: SEED_VIDEOS,
      resources: SEED_RESOURCES,
      adminAgents: INITIAL_ADMIN_AGENTS,
      jobs: [],
      studentProfiles: {},
      learningSessions: {},
      favorites: [],
      history: [],
      auditLogs: []
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          promotions: parsed.promotions || [],
          courses: parsed.courses || [],
          concepts: parsed.concepts || [],
          videos: (parsed.videos && parsed.videos.length > 0) ? parsed.videos : SEED_VIDEOS,
          resources: parsed.resources || [],
          adminAgents: parsed.adminAgents && parsed.adminAgents.length > 0 ? parsed.adminAgents : INITIAL_ADMIN_AGENTS,
          jobs: parsed.jobs || [],
          studentProfiles: parsed.studentProfiles || {},
          learningSessions: parsed.learningSessions || {},
          favorites: parsed.favorites || [],
          history: parsed.history || [],
          auditLogs: parsed.auditLogs || []
        };
      } else {
        this.saveToDisk();
      }
    } catch (e) {
      console.error('Error loading academic data, initializing fresh:', e);
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving academic data to disk:', e);
    }
  }

  computeHash(content) {
    return crypto.createHash('sha256').update(content || '').digest('hex');
  }

  // --- PROMOTIONS (Filières / Pôles) ---
  getPromotions() {
    return this.data.promotions || [];
  }

  addPromotion(promo) {
    const id = promo.id || `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPromo = {
      id,
      name: promo.name || 'Nouvelle Filière',
      cycle: promo.cycle || 'Licence',
      faculty: promo.faculty || 'Faculté des Sciences'
    };
    if (!this.data.promotions) this.data.promotions = [];
    this.data.promotions.push(newPromo);
    this.logAudit({ action: 'PROMOTION_CREATED', promotionId: id, name: newPromo.name });
    this.saveToDisk();
    return newPromo;
  }

  deletePromotion(id) {
    const prev = (this.data.promotions || []).length;
    this.data.promotions = (this.data.promotions || []).filter(p => p.id !== id);
    if (this.data.promotions.length !== prev) {
      this.logAudit({ action: 'PROMOTION_DELETED', promotionId: id });
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- COURSES (Matières & Chapitres) ---
  getCourses(promotionId = null) {
    let list = this.data.courses || [];
    if (promotionId) {
      list = list.filter(c => c.promotionId === promotionId);
    }
    return list;
  }

  getCourseById(id) {
    return (this.data.courses || []).find(c => c.id === id) || null;
  }

  addCourse(course) {
    const id = course.id || `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const chapters = Array.isArray(course.chapters) ? course.chapters.map((ch, idx) => ({
      id: ch.id || `chap-${id}-${idx + 1}`,
      number: ch.number || idx + 1,
      title: typeof ch === 'string' ? ch : (ch.title || `Chapitre ${idx + 1}`)
    })) : [];

    const newCourse = {
      id,
      code: course.code || 'COURS',
      name: course.name || 'Nouveau Cours',
      promotionId: course.promotionId || '',
      professor: course.professor || '',
      description: course.description || '',
      credits: course.credits || 6,
      chapters
    };

    if (!this.data.courses) this.data.courses = [];
    this.data.courses.push(newCourse);
    this.logAudit({ action: 'COURSE_CREATED', courseId: id, name: newCourse.name, code: newCourse.code });
    this.saveToDisk();
    return newCourse;
  }

  updateCourse(id, updates) {
    const idx = (this.data.courses || []).findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.logAudit({ action: 'COURSE_UPDATED', courseId: id });
    this.saveToDisk();
    return this.data.courses[idx];
  }

  deleteCourse(id) {
    const prev = (this.data.courses || []).length;
    this.data.courses = (this.data.courses || []).filter(c => c.id !== id);
    if (this.data.courses.length !== prev) {
      this.logAudit({ action: 'COURSE_DELETED', courseId: id });
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- RESOURCES (Documents, TP, Examens, Corrigés, Supports) ---
  getResources({ courseId, promotionId, type, academicYear, search, hasCorrection } = {}) {
    let list = this.data.resources || [];

    if (courseId) {
      list = list.filter(r => r.courseId === courseId);
    }
    if (promotionId) {
      list = list.filter(r => r.promotionId === promotionId);
    }
    if (type) {
      list = list.filter(r => r.type && r.type.toLowerCase() === type.toLowerCase());
    }
    if (academicYear) {
      list = list.filter(r => r.academicYear === academicYear);
    }
    if (hasCorrection !== undefined && hasCorrection !== '') {
      const boolVal = hasCorrection === true || hasCorrection === 'true';
      list = list.filter(r => r.hasCorrection === boolVal);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.professor && r.professor.toLowerCase().includes(q)) ||
        (r.content && r.content.toLowerCase().includes(q)) ||
        (r.chapter && r.chapter.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getResourceById(id) {
    return (this.data.resources || []).find(r => r.id === id);
  }

  getRelatedResources(resourceId) {
    const res = this.getResourceById(resourceId);
    if (!res) return { related: [], correction: null, videos: [] };

    let correction = null;
    if (res.correctionId) {
      correction = this.getResourceById(res.correctionId);
    } else if (res.type === 'Examen' || res.type === 'Interrogation') {
      correction = (this.data.resources || []).find(r => r.type === 'Corrigé' && r.courseId === res.courseId);
    }

    const related = (this.data.resources || []).filter(r => 
      r.id !== res.id && 
      (r.courseId === res.courseId || (r.chapter && r.chapter === res.chapter))
    ).slice(0, 4);

    const videos = (this.data.videos || []).filter(v => v.courseId === res.courseId);

    return { related, correction, videos };
  }

  findVideoForTopic(topic = '', courseId = '') {
    const list = this.data.videos && this.data.videos.length > 0 ? this.data.videos : SEED_VIDEOS;
    const t = (topic || '').toLowerCase();
    
    // Keyword match
    if (t) {
      if (t.includes('partie') || t.includes('ipp') || t.includes('intégral') || t.includes('primitive') || t.includes('alpes')) {
        const found = list.find(v => v.id === 'vid-ipp-exo7');
        if (found) return found;
      }
      if (t.includes('avl') || t.includes('arbre') || t.includes('rotation') || t.includes('abr') || t.includes('équilibre')) {
        const found = list.find(v => v.id === 'vid-avl-visual');
        if (found) return found;
      }
      if (t.includes('newton') || t.includes('pfd') || t.includes('dynamique') || t.includes('force') || t.includes('accélération')) {
        const found = list.find(v => v.id === 'vid-pfd-newton');
        if (found) return found;
      }
      if (t.includes('matrice') || t.includes('diag') || t.includes('propre') || t.includes('vecteur propre') || t.includes('valeur propre')) {
        const found = list.find(v => v.id === 'vid-diag-algebre');
        if (found) return found;
      }
      if (t.includes('rlc') || t.includes('circuit') || t.includes('bobine') || t.includes('condensateur') || t.includes('transitoire')) {
        const found = list.find(v => v.id === 'vid-rlc-elec');
        if (found) return found;
      }
    }

    if (courseId) {
      const match = list.find(v => v.courseId === courseId);
      if (match) return match;
    }

    return list[0] || null;
  }

  addResource(resourceData) {
    const rawContent = (resourceData.content || '').trim();
    // Prefer provided checksum (from file binary/buffer) if available
    const checksum = resourceData.checksum || (
      (resourceData.dataUrl && resourceData.dataUrl.length > 50)
        ? this.computeHash(resourceData.dataUrl)
        : (rawContent.length > 100 && !rawContent.startsWith('Document académique :'))
          ? this.computeHash(rawContent)
          : this.computeHash(`${resourceData.fileName || resourceData.title || 'doc'}-${resourceData.courseId || ''}-${Date.now()}-${Math.random()}`)
    );
    
    // Check for duplicate only if strict binary or exact title+course+filename matches
    const existing = (this.data.resources || []).find(r => 
      r.checksum === checksum && 
      r.fileName === resourceData.fileName &&
      r.courseId === resourceData.courseId
    );
    if (existing) {
      return { duplicate: true, resource: existing };
    }

    const newResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...resourceData,
      checksum,
      status: resourceData.status || 'published',
      validationStatus: resourceData.validationStatus || 'approved',
      confidenceScore: resourceData.confidenceScore || 1.0,
      publishedAt: resourceData.publishedAt || new Date().toISOString()
    };

    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(newResource);
    this.logAudit({
      action: 'RESOURCE_CREATED',
      resourceId: newResource.id,
      title: newResource.title,
      type: newResource.type
    });

    this.saveToDisk();
    return { duplicate: false, resource: newResource };
  }

  updateResource(id, updateData) {
    const index = (this.data.resources || []).findIndex(r => r.id === id);
    if (index === -1) return null;

    this.data.resources[index] = {
      ...this.data.resources[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.logAudit({
      action: 'RESOURCE_UPDATED',
      resourceId: id,
      updatedFields: Object.keys(updateData)
    });

    this.saveToDisk();
    return this.data.resources[index];
  }

  deleteResource(id) {
    const initialLen = (this.data.resources || []).length;
    this.data.resources = (this.data.resources || []).filter(r => r.id !== id);
    if (this.data.resources.length !== initialLen) {
      this.logAudit({ action: 'RESOURCE_DELETED', resourceId: id });
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- FAVORITES & HISTORY ---
  getFavorites(studentId = 'default-student') {
    return (this.data.favorites || []).filter(f => f.studentId === studentId);
  }

  toggleFavorite(studentId = 'default-student', { resourceId, type, title, courseName, category }) {
    if (!this.data.favorites) this.data.favorites = [];
    const idx = this.data.favorites.findIndex(f => f.studentId === studentId && f.resourceId === resourceId);
    if (idx !== -1) {
      this.data.favorites.splice(idx, 1);
      this.saveToDisk();
      return { isFavorite: false };
    } else {
      const fav = {
        id: `fav-${Date.now()}`,
        studentId,
        resourceId,
        type: type || 'Document',
        title: title || 'Ressource',
        courseName: courseName || '',
        category: category || 'document',
        createdAt: new Date().toISOString()
      };
      this.data.favorites.unshift(fav);
      this.saveToDisk();
      return { isFavorite: true, favorite: fav };
    }
  }

  getHistory(studentId = 'default-student') {
    return (this.data.history || []).filter(h => h.studentId === studentId);
  }

  recordHistory(studentId = 'default-student', { resourceId, title, courseName, pageNumber = 1, totalPages = 1 }) {
    if (!this.data.history) this.data.history = [];
    const existingIdx = this.data.history.findIndex(h => h.studentId === studentId && h.resourceId === resourceId);
    const entry = {
      id: `hist-${Date.now()}`,
      studentId,
      resourceId,
      title,
      courseName,
      pageNumber,
      totalPages,
      progressPercent: Math.min(100, Math.round((pageNumber / Math.max(1, totalPages)) * 100)),
      lastViewedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      this.data.history[existingIdx] = entry;
    } else {
      this.data.history.unshift(entry);
    }
    if (this.data.history.length > 50) this.data.history.pop();
    this.saveToDisk();
    return entry;
  }

  // --- STUDENT PROFILES & LEARNING OVERVIEW ---
  getStudentProfile(studentId = 'default-student') {
    if (!this.data.studentProfiles) this.data.studentProfiles = {};
    if (!this.data.studentProfiles[studentId]) {
      this.data.studentProfiles[studentId] = {
        studentId,
        levelDeclared: 5,
        masteryScores: {},
        learningStateTree: {
          activeGoal: 'Apprentissage académique',
          activeNodeId: null,
          nodes: []
        },
        weakConcepts: [],
        strongConcepts: [],
        preferredExplanationStyle: 'Explications claires pas-à-pas avec exemples concrets'
      };
      this.saveToDisk();
    }
    return this.data.studentProfiles[studentId];
  }

  updateStudentProfile(studentId = 'default-student', updates) {
    const profile = this.getStudentProfile(studentId);
    this.data.studentProfiles[studentId] = { ...profile, ...updates };
    this.saveToDisk();
    return this.data.studentProfiles[studentId];
  }

  getLearningOverview(studentId = 'default-student') {
    const profile = this.getStudentProfile(studentId);
    const courses = this.data.courses || [];
    const concepts = this.data.concepts || [];

    const activeCourses = courses.map(course => {
      const courseConcepts = concepts.filter(c => c.courseId === course.id);
      const scores = courseConcepts.map(c => profile.masteryScores[c.id] || 0.5);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
      const progressPercent = Math.round(avgScore * 100);

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        professor: course.professor,
        progressPercent,
        status: progressPercent >= 80 ? 'Maîtrisé' : 'En cours',
        totalChapters: course.chapters ? course.chapters.length : 0,
        conceptsCount: courseConcepts.length,
        lastActive: new Date().toLocaleDateString('fr-FR')
      };
    });

    return {
      studentId,
      levelDeclared: profile.levelDeclared,
      activeGoal: profile.learningStateTree ? profile.learningStateTree.activeGoal : 'Apprentissage',
      activeCourses,
      weakPoints: [],
      allConcepts: [],
      learningStateTree: profile.learningStateTree
    };
  }

  // --- ADAPTIVE LEARNING SESSIONS ---
  getLearningSession(sessionId) {
    if (!this.data.learningSessions) this.data.learningSessions = {};
    return this.data.learningSessions[sessionId] || null;
  }

  saveLearningSession(session) {
    if (!this.data.learningSessions) this.data.learningSessions = {};
    this.data.learningSessions[session.id] = session;
    this.saveToDisk();
    return session;
  }

  getActiveSessionForStudent(studentId = 'default-student') {
    if (!this.data.learningSessions) this.data.learningSessions = {};
    const list = Object.values(this.data.learningSessions).filter(
      s => s.studentId === studentId && s.status === 'active'
    );
    return list.length > 0 ? list[list.length - 1] : null;
  }

  deleteLearningSession(sessionId) {
    if (!this.data.learningSessions) return false;
    delete this.data.learningSessions[sessionId];
    this.saveToDisk();
    return true;
  }

  // --- ADMIN WORKERS & AUDIT ---
  getAdminAgents() {
    if (!this.data.adminAgents || this.data.adminAgents.length === 0) {
      this.data.adminAgents = INITIAL_ADMIN_AGENTS;
    }
    this.data.adminAgents.forEach(a => {
      a.lastHeartbeat = new Date().toISOString();
    });
    return this.data.adminAgents;
  }

  getJobs() {
    return this.data.jobs || [];
  }

  addJob(jobData) {
    if (!this.data.jobs) this.data.jobs = [];
    const newJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'queued',
      retryCount: 0,
      maxRetries: 3,
      ...jobData
    };
    this.data.jobs.unshift(newJob);
    this.saveToDisk();
    return newJob;
  }

  updateJob(id, updates) {
    if (!this.data.jobs) return null;
    const job = this.data.jobs.find(j => j.id === id);
    if (!job) return null;
    Object.assign(job, updates);
    this.saveToDisk();
    return job;
  }

  logAudit(entry) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const auditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(auditEntry);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
  }

  getAuditLogs() {
    return this.data.auditLogs || [];
  }

  // Complete reset of corpus
  clearAllAcademicData() {
    this.data = {
      promotions: [],
      courses: [],
      concepts: [],
      videos: [],
      resources: [],
      adminAgents: INITIAL_ADMIN_AGENTS,
      jobs: [],
      studentProfiles: {},
      learningSessions: {},
      favorites: [],
      history: [],
      auditLogs: [{
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CORPUS_CLEARED',
        details: 'Tables de cours et documents réinitialisées à vide.'
      }]
    };
    this.saveToDisk();
  }
}

export const db = new AcademicDatabase();

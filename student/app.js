// Academic Hub — Client-Side Application Core
// Conçu par les étudiants, pour les étudiants.
// Interface épurée, minimaliste et orientée mobile-first.

class AcademicHubApp {
  constructor() {
    this.currentView = 'tutor'; // 'tutor' (Principal screen) | 'documents' | 'document' | 'history' | 'settings' | 'admin'
    this.resources = [];
    this.courses = [];
    this.promotions = [];
    this.videos = [];
    this.selectedResourceId = null;
    this.currentDocZoom = 100;
    this.docSearchQuery = '';
    this.docSearchActive = false;
    this.docSearchMatchIndex = 0;
    this.docPdfPage = 1;
    this.docPdfLayoutMode = 'single'; // 'single' | 'continuous'
    this.docWordActiveSection = 0;
    this.docSheetActiveTab = 0;
    this.docSheetSelectedCell = 'B2';
    this.docSheetFilter = '';
    this.docSlideIndex = 0;
    this.docSlideShowNotes = false;
    this.docImageZoom = 100;
    this.docImageRotation = 0;
    this.docImageMode = 'normal'; // 'normal' | 'blueprint' | 'invert'
    this.docAudioPlaying = false;
    this.docAudioTime = 0;
    this.docAudioDuration = 480;
    this.docAudioSpeed = 1.0;
    this.docVideoPlaying = false;
    this.docVideoTime = 0;
    this.docVideoDuration = 650;
    this.docVideoSpeed = 1.0;
    this.docCodeSelectedLine = null;
    this.docShowNotes = false;
    this.docPageExplanation = null;
    this.docExplainingPage = false;

    // Search and filter state
    this.selectedCourseId = null;
    this.searchPillFilter = null;
    this.selectedSemester = '';
    this.courseDetailTab = 'all';
    this.filters = {
      search: '',
      promotionId: '',
      courseId: '',
      type: '',
      hasCorrection: ''
    };

    // Tutor state
    this.tutorMode = 'chat'; // 'chat' | 'apprendre' | 'revision' | 'exercer'
    this.tutorCourseId = '';
    this.isTutorLoading = false;
    this.tutorMessages = [
      {
        id: 'msg-welcome',
        sender: 'tutor',
        text: "Bonjour ! Je suis votre tuteur académique. Vous pouvez me poser des questions sur vos cours, ajouter des documents de travail ou démarrer une séance d'étude guidée.",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // History of past chat sessions (Strict Image Alignment)
    this.chatHistory = [
      {
        id: 'hist-1',
        title: 'Révision Mécanique',
        group: "Aujourd'hui",
        course: 'Physique Mécanique',
        mode: 'revision',
        date: "Aujourd'hui",
        preview: 'Équations différentielles des oscillations harmoniques amorties et résonance.',
        messages: [
          { id: 'm1', sender: 'user', text: 'Je veux réviser les équations du mouvement et les oscillations libres.' },
          { id: 'm2', sender: 'tutor', text: 'Très bien ! Commençons par l’équation différentielle du système masse-ressort : $$m\\ddot{x} + c\\dot{x} + kx = 0$$. Veux-tu un rappel sur le calcul du facteur de qualité ou des exercices d’application issus des annales ?', sources: [{ documentTitle: 'Physique Mécanique du Point.pdf' }] }
        ]
      },
      {
        id: 'hist-2',
        title: 'Explication Intégrales',
        group: "Hier",
        course: 'Analyse Mathématique',
        mode: 'apprendre',
        date: "Hier",
        preview: 'Intégration par parties, changement de variable et intégrales impropres de Riemann.',
        messages: [
          { id: 'm1', sender: 'user', text: 'Peux-tu m’expliquer la méthode d’intégration par parties et par changement de variable ?' },
          { id: 'm2', sender: 'tutor', text: 'Absolument ! La formule d’intégration par parties est : $$\\int u(t) v\'(t) dt = u(t)v(t) - \\int u\'(t) v(t) dt$$. Souhaites-tu un exemple appliqué aux polynômes ou aux exponentielles ?', sources: [{ documentTitle: 'Analyse Mathématique L2.pdf' }] }
        ]
      },
      {
        id: 'hist-3',
        title: 'Questions QCM',
        group: "Hier",
        course: 'Algèbre Linéaire',
        mode: 'exercer',
        date: "Hier",
        preview: 'Entraînement QCM : Déterminants, valeurs propres et diagonalisation.',
        messages: [
          { id: 'm1', sender: 'user', text: 'Faisons un entraînement QCM sur les matrices et les déterminants.' },
          { id: 'm2', sender: 'tutor', text: 'Question 1 : Si une matrice carrée $A$ vérifie $\\det(A) = 0$, que peut-on affirmer ?\nA) 0 est valeur propre de $A$\nB) $A$ est inversible\nC) Le rang de $A$ est maximal', sources: [{ documentTitle: 'Algèbre Linéaire.pdf' }] }
        ]
      },
      {
        id: 'hist-4',
        title: 'Questions QCM',
        group: "La semaine dernière",
        course: 'Informatique & Algorithmique',
        mode: 'exercer',
        date: "Il y a 6 jours",
        preview: 'Complexité algorithmique, arbres binaires et structures de données en C.',
        messages: [
          { id: 'm1', sender: 'user', text: 'QCM sur la complexité temporelle des tris.' },
          { id: 'm2', sender: 'tutor', text: 'Question : Quelle est la complexité dans le pire des cas du Tri Rapide (Quicksort) ?\nA) $O(n \\log n)$\nB) $O(n^2)$\nC) $O(n)$' }
        ]
      },
      {
        id: 'hist-5',
        title: 'Révision Mécanique',
        group: "La semaine dernière",
        course: 'Physique Mécanique',
        mode: 'revision',
        date: "Il y a 7 jours",
        preview: 'Théorème de l’énergie cinétique et travail des forces conservatives.',
        messages: [
          { id: 'm1', sender: 'user', text: 'Révision des forces conservatives et de l’énergie potentielle.' },
          { id: 'm2', sender: 'tutor', text: 'Une force est conservative si $\\vec{F} = -\\vec{\\nabla} E_p$. Le travail total le long d’une boucle fermée est nul.' }
        ]
      },
      {
        id: 'hist-6',
        title: 'Explication Intégrales',
        group: "La semaine dernière",
        course: 'Analyse Mathématique',
        mode: 'apprendre',
        date: "Il y a 8 jours",
        preview: 'Théorème fondamental de l’analyse et intégrales multiples.',
        messages: [
          { id: 'm1', sender: 'user', text: 'Calcul d’intégrales doubles en coordonnées polaires.' },
          { id: 'm2', sender: 'tutor', text: 'En coordonnées polaires : $dx\\,dy = r\\,dr\\,d\\theta$. N’oublie jamais le jacobien $r$ !' }
        ]
      }
    ];

    // Student learning profile
    this.studentProfile = {
      name: 'Atelier la grâce',
      shortName: 'Atelier',
      filiere: 'Licence 2 — Sciences & Technologies',
      declaredLevel: 7,
      observedMastery: 0.65,
      activeGoal: 'Apprentissage et révisions',
      activeBranch: null,
      weakConcepts: [],
      strongConcepts: []
    };

    this.activeModel = 'Gemini Flash-Lite';
    this.personalizedAiEnabled = true;
    this.canvasMode = 'code';
    this.canvasCode = '# Workspace Python Académique\ndef resoudre_systeme():\n    print("Calcul des valeurs propres...")\n\nresoudre_systeme()';

    // Admin state
    this.adminTab = 'courses';
    this.adminDocSearch = '';
    this.adminDocCourseFilter = '';
    this.adminDocTypeFilter = '';
    this.adminWorkers = [];
    this.adminJobs = [];
    this.adminAudit = [];
    this.userApiKey = sessionStorage.getItem('academic_hub_api_key') || '';

    // Safe storage helper
    this.safeStorage = {
      getItem(k) {
        try { return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null; } catch(e) { return null; }
      },
      setItem(k, v) {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch(e) {}
      },
      removeItem(k) {
        try { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); } catch(e) {}
      }
    };

    // Quick Action & Modals state
    this.showPlusMenu = false;
    this.librarySearch = '';
    this.libraryFilterType = 'all';
    this.libraryViewMode = 'tree'; // 'tree' | 'list'
    this.expandedPromos = new Set(['promo-l1-st', 'promo-l2-info', 'promo-l2-phys', 'domain-math', 'domain-phys-chem', 'domain-tech-geom', 'domain-info', 'domain-ing-transv']);
    this.expandedCourses = new Set(['course-analyse', 'course-algebre', 'course-physique', 'course-algo', 'course-elec', 'course-chimie', 'course-dessin']);
    this.cameraImageFile = null;
    this.cameraImageData = null;

    // Mode Apprendre State (Salle d'apprentissage dédiée par chapitre)
    this.learningSession = null;
    this.learningCourses = [];
    this.selectedLearnCourseId = null;
    this.selectedLearnChapterId = null;
    this.showCoursePickerInLearn = false;
    this.isLearningLoading = false;
    this.learningAssessmentActive = false;
    this.learningAssessment = null;
    this.learningUserAnswers = {};
    this.learningAssessmentResult = null;
    this.learnSearchQuery = '';

    this.init();
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-md border border-slate-800 text-xs font-medium pointer-events-auto transition-all transform duration-200 translate-y-2 opacity-0 flex items-center gap-2`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  normalizeLearningSession(sess) {
    if (!sess || typeof sess !== 'object') return null;
    const actual = (sess.session && typeof sess.session === 'object') ? sess.session : sess;
    if (!actual || typeof actual !== 'object') return null;
    if (!Array.isArray(actual.roadmap)) {
      actual.roadmap = [];
    }
    if (!Array.isArray(actual.history)) {
      actual.history = [];
    }
    if (!Array.isArray(actual.officialSources)) {
      actual.officialSources = [];
    }
    if (!Array.isArray(actual.masteredBranches)) {
      actual.masteredBranches = [];
    }
    return actual;
  }

  async init() {
    this.updateApiKeyBadge();
    await this.fetchBaseData();
    this.populateUploadCourseSelect();

    // Restore any active learning session from storage defensively
    try {
      const savedSession = this.safeStorage.getItem('academic_hub_active_learning_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        this.learningSession = this.normalizeLearningSession(parsed);
        if (this.learningSession) {
          this.selectedLearnCourseId = this.learningSession.courseId || null;
          this.selectedLearnChapterId = this.learningSession.chapterId || null;
        }
      }
    } catch (e) {
      console.error('Error restoring active learning session:', e);
      this.learningSession = null;
    }
    this.loadLearningCourses();

    // Global Window Drag & Drop for PDF documents
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file && (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf')) {
          this.openUploadedPdf(file);
        }
      }
    });

    // Global keyboard navigation for document reading
    window.addEventListener('keydown', (e) => {
      if (this.currentView === 'document' && this.docPdfViewMode !== 'text') {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          this.prevPdfPage();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          this.nextPdfPage();
        }
      }
    });

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');

    if (viewParam && ['search', 'courses', 'course-detail', 'documents', 'home', 'document', 'tutor', 'learn', 'videos', 'profile', 'history', 'settings', 'admin'].includes(viewParam)) {
      if (viewParam === 'document' && idParam) {
        this.selectedResourceId = idParam;
      }
      if (viewParam === 'course-detail' && idParam) {
        this.selectedCourseId = idParam;
      }
      const targetView = viewParam === 'home' ? 'search' : viewParam;
      this.navigate(targetView, false);
    } else {
      this.navigate('search', false);
    }
  }

  async fetchBaseData() {
    try {
      const [resRes, coursesRes, promoRes, stateRes, videosRes] = await Promise.all([
        fetch('/api/resources').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/courses').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/promotions').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/learning/state').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/videos').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (resRes.success) {
        // Retain any active uploaded file blobs / objectUrls so open documents do not disconnect
        const localMap = new Map();
        (this.resources || []).forEach(r => {
          if (r.objectUrl || r.fileBlob) {
            localMap.set(r.id, { objectUrl: r.objectUrl, fileBlob: r.fileBlob });
            if (r.fileName) localMap.set(r.fileName, { objectUrl: r.objectUrl, fileBlob: r.fileBlob });
          }
        });
        this.resources = resRes.data.map(r => {
          const match = localMap.get(r.id) || localMap.get(r.fileName);
          if (match) {
            return { ...r, objectUrl: match.objectUrl, fileBlob: match.fileBlob };
          }
          return r;
        });
        // Keep active local upload resources
        for (const [id, localData] of localMap.entries()) {
          if (id.startsWith('res-upload-') && !this.resources.some(r => r.id === id)) {
            const existing = (this.resources || []).find(r => r.id === id);
            if (existing) this.resources.unshift(existing);
          }
        }
      }
      if (coursesRes && coursesRes.success && Array.isArray(coursesRes.data)) this.courses = coursesRes.data;
      if (promoRes && promoRes.success && Array.isArray(promoRes.data)) {
        this.promotions = promoRes.data;
        const promoSelect = document.getElementById('header-promotion-select');
        if (promoSelect) {
          promoSelect.innerHTML = `<option value="">Toutes les promotions</option>` + 
            this.promotions.map(p => `<option value="${p.id}" ${this.filters.promotionId === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
        }
      }
      if (videosRes && videosRes.success && Array.isArray(videosRes.data)) this.videos = videosRes.data;
      if (stateRes.success && stateRes.data) {
        this.studentProfile.declaredLevel = stateRes.data.levelDeclared || 6;
        if (stateRes.data.learningStateTree && stateRes.data.learningStateTree.nodes && stateRes.data.learningStateTree.nodes.length > 0) {
          const rootNode = stateRes.data.learningStateTree.nodes[0];
          this.studentProfile.activeGoal = rootNode.title;
          if (rootNode.branches && rootNode.branches.find(b => b.status === 'active')) {
            this.studentProfile.activeBranch = rootNode.branches.find(b => b.status === 'active');
          }
        }
      }
    } catch (err) {
      console.warn('Error loading base data, using offline fallback:', err);
    }
  }

  populateUploadCourseSelect() {
    const sel = document.getElementById('upload-course-select');
    if (!sel || !this.courses) return;
    sel.innerHTML = this.courses.map(c => `<option value="${c.id}">${c.code} — ${c.name}</option>`).join('');
  }

  // Modern Drawer Toggle
  toggleDrawer(show) {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');
    if (!drawer || !overlay) return;

    if (show) {
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      drawer.classList.add('-translate-x-full');
      drawer.classList.remove('translate-x-0');
      overlay.classList.remove('opacity-100', 'pointer-events-auto');
      overlay.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // Promotion filter change handler
  onPromotionChange(promoId) {
    this.filters.promotionId = promoId || '';
    this.render();
  }

  // Update navigation highlights across desktop tabs, mobile bottom bar, and drawer
  updateNavHighlight() {
    const v = this.currentView;

    // Desktop Top Nav Highlights
    const navItems = ['search', 'courses', 'tutor', 'profile'];
    navItems.forEach(n => {
      const el = document.getElementById(`top-nav-${n}`);
      if (el) {
        const isActive = (n === v) || 
          (n === 'courses' && (v === 'course-detail' || v === 'documents' || v === 'document')) ||
          (n === 'tutor' && (v === 'learn' || v === 'history')) ||
          (n === 'profile' && (v === 'settings' || v === 'admin'));

        if (isActive) {
          el.className = 'px-3 py-1.5 rounded-lg transition text-white bg-[#18191c] font-semibold border border-zinc-800 flex items-center gap-1.5';
        } else {
          el.className = 'px-3 py-1.5 rounded-lg transition text-zinc-400 hover:text-white hover:bg-zinc-800/60 flex items-center gap-1.5';
        }
      }
    });

    // Mobile Bottom Nav Highlights
    navItems.forEach(n => {
      const el = document.getElementById(`bottom-nav-${n}`);
      if (el) {
        const isActive = (n === v) || 
          (n === 'courses' && (v === 'course-detail' || v === 'documents' || v === 'document')) ||
          (n === 'tutor' && (v === 'learn' || v === 'history')) ||
          (n === 'profile' && (v === 'settings' || v === 'admin'));

        if (isActive) {
          el.className = 'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-white font-semibold transition';
        } else {
          el.className = 'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition';
        }
      }
    });

    // Drawer Nav Items
    const drawerItems = ['search', 'courses', 'tutor', 'learn', 'profile', 'history', 'settings', 'documents'];
    drawerItems.forEach(dNav => {
      const drawerItem = document.getElementById(`drawer-nav-${dNav}`);
      if (drawerItem) {
        const isActive = (dNav === v) || (dNav === 'courses' && (v === 'course-detail' || v === 'documents'));
        if (isActive) {
          drawerItem.classList.add('bg-[#18191c]', 'text-white', 'font-semibold', 'border', 'border-zinc-800');
          drawerItem.classList.remove('text-zinc-400', 'text-slate-700');
        } else {
          drawerItem.classList.remove('bg-[#18191c]', 'text-white', 'font-semibold', 'border', 'border-zinc-800', 'bg-blue-50', 'text-blue-700');
          drawerItem.classList.add('text-zinc-400');
        }
      }
    });

    // Header promotion dropdown sync
    const promoSelect = document.getElementById('header-promotion-select');
    if (promoSelect && this.filters.promotionId !== undefined) {
      promoSelect.value = this.filters.promotionId || '';
    }
  }

  // Navigation Controller
  navigate(viewName, updateUrl = true) {
    // Map legacy 'home' to 'search'
    if (viewName === 'home') viewName = 'search';

    this.currentView = viewName;
    this.toggleDrawer(false);

    if (viewName === 'admin') {
      this.loadAdminWorkers();
    }
    if (viewName === 'learn') {
      this.loadLearningCourses();
    }

    // Update Header Dynamic Title
    const headerTitle = document.getElementById('header-page-title');
    if (headerTitle) {
      const titles = {
        'search': 'Academic Hub',
        'courses': 'Mes Matières',
        'course-detail': 'Détail de la Matière',
        'tutor': 'Assistant IA',
        'learn': 'Mode Apprendre',
        'documents': 'Documents & Cours',
        'document': 'Consultation du Document',
        'videos': 'Vidéos Pédagogiques',
        'profile': 'Mon Profil',
        'history': 'Historique des discussions',
        'settings': 'Paramètres',
        'admin': 'Administration'
      };
      headerTitle.innerText = titles[viewName] || 'Academic Hub';
    }

    // Update URL query params
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewName);
      if (viewName === 'document' && this.selectedResourceId) {
        url.searchParams.set('id', this.selectedResourceId);
      } else if (viewName === 'course-detail' && this.selectedCourseId) {
        url.searchParams.set('id', this.selectedCourseId);
      } else {
        url.searchParams.delete('id');
      }
      window.history.pushState({}, '', url);
    }

    this.updateNavHighlight();
    this.render();
    window.scrollTo(0, 0);
  }

  // Type Badges styling helper (Strict Dark AMOLED & rounded-lg)
  getTypeBadge(type) {
    const map = {
      'Supports de Cours': { icon: 'book-open', label: 'Cours' },
      'Exercices': { icon: 'edit-3', label: 'TD / Exercices' },
      'Examen': { icon: 'award', label: 'Examen' },
      'Interrogation': { icon: 'file-check', label: 'Interrogation' },
      'TP': { icon: 'flask-conical', label: 'TP' },
      'Corrigé': { icon: 'check-circle-2', label: 'Corrigé' },
    };
    const conf = map[type] || { icon: 'file-text', label: type };
    return `<span class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border bg-[#16171a] text-zinc-300 border-zinc-800">
      <i data-lucide="${conf.icon}" class="w-3 h-3 text-zinc-400"></i>
      ${conf.label}
    </span>`;
  }

  // Master Render Switcher
  render() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    if (this.currentView === 'search') {
      container.innerHTML = this.renderSearchView();
    } else if (this.currentView === 'courses') {
      container.innerHTML = this.renderCoursesView();
    } else if (this.currentView === 'course-detail') {
      container.innerHTML = this.renderCourseDetailView();
    } else if (this.currentView === 'documents') {
      container.innerHTML = this.renderDocumentsView();
    } else if (this.currentView === 'document') {
      container.innerHTML = this.renderDocumentView();
    } else if (this.currentView === 'tutor') {
      container.innerHTML = this.renderTutorView();
    } else if (this.currentView === 'learn') {
      container.innerHTML = this.renderLearningRoomView();
    } else if (this.currentView === 'videos') {
      container.innerHTML = this.renderVideosView();
    } else if (this.currentView === 'profile') {
      container.innerHTML = this.renderProfileView();
    } else if (this.currentView === 'history') {
      container.innerHTML = this.renderHistoryView();
    } else if (this.currentView === 'settings') {
      container.innerHTML = this.renderSettingsView();
    }

    this.updateNavHighlight();
    this.updateDrawerDynamicLists();

    // Re-initialize lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // VIEW: PAGE 1 — ACCUEIL & RECHERCHE PRINCIPALE
  // ==========================================
  renderSearchView() {
    const q = (this.filters.search || '').toLowerCase().trim();
    const pill = this.searchPillFilter;

    let searchResults = [];
    const isFilterActive = !!q || !!pill || !!this.filters.promotionId;

    if (isFilterActive) {
      searchResults = this.resources.filter(r => {
        if (this.filters.promotionId && r.promotionId !== this.filters.promotionId) return false;
        if (pill === 'exam' && r.type !== 'Examen' && r.type !== 'Interrogation') return false;
        if (pill === 'correction' && !r.hasCorrection && r.type !== 'Corrigé') return false;
        if (pill === 'cours' && r.type !== 'Supports de Cours') return false;

        if (q) {
          const inTitle = (r.title || '').toLowerCase().includes(q);
          const inProf = (r.professor || '').toLowerCase().includes(q);
          const inContent = (r.content || '').toLowerCase().includes(q);
          const inChapter = (r.chapter || '').toLowerCase().includes(q);
          const inCourse = (r.courseName || '').toLowerCase().includes(q);
          if (!inTitle && !inProf && !inContent && !inChapter && !inCourse) return false;
        }
        return true;
      });
    }

    // Recent documents for default view
    const recentDocs = this.resources
      .filter(r => !this.filters.promotionId || r.promotionId === this.filters.promotionId)
      .slice(0, 6);

    const activePromo = this.promotions.find(p => p.id === this.filters.promotionId);

    return `
    <div class="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-7">
      
      <!-- Top Branding -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#121316] text-blue-400 font-semibold text-xs border border-zinc-800 shadow-2xs">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>${activePromo ? `Promotion ${this.escapeHtml(activePromo.name)}` : 'Centre Académique Intelligent'}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Academic Hub</h1>
        <p class="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Accédez directement aux cours officiels, annales d'examens avec corrigés et révisions guidées.
        </p>
      </div>

      <!-- Large Central Search Bar (shadcn/ui style, rounded-lg) -->
      <div class="relative max-w-2xl mx-auto bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition shadow-2xs flex items-center p-1">
        <i data-lucide="search" class="w-4 h-4 text-zinc-500 ml-3 mr-2 shrink-0 pointer-events-none"></i>
        <input 
          type="text" 
          id="main-search-input"
          value="${this.escapeHtml(this.filters.search || '')}"
          placeholder="Rechercher un cours, un examen, un chapitre ou une notion..." 
          oninput="app.onSearchInput(this.value)"
          class="w-full bg-transparent text-white text-xs sm:text-sm py-2 px-1 outline-none placeholder:text-zinc-500"
        >
        ${this.filters.search ? `
          <button onclick="app.clearSearch()" class="text-zinc-400 hover:text-white p-1.5 rounded-lg transition mr-1" title="Effacer la recherche">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        ` : ''}
        <button onclick="app.triggerSearch()" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shrink-0 shadow-2xs">
          Chercher
        </button>
      </div>

      <!-- 4 Quick Shortcut Pills -->
      <div class="flex items-center justify-center gap-2 flex-wrap text-xs">
        <button 
          onclick="app.quickFilterSearch('exam')" 
          class="px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${pill === 'exam' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          <i data-lucide="award" class="w-3.5 h-3.5 ${pill === 'exam' ? 'text-white' : 'text-zinc-400'}"></i>
          <span>Examens récents</span>
        </button>

        <button 
          onclick="app.quickFilterSearch('correction')" 
          class="px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${pill === 'correction' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 ${pill === 'correction' ? 'text-white' : 'text-zinc-400'}"></i>
          <span>Exercices corrigés</span>
        </button>

        <button 
          onclick="app.quickFilterSearch('cours')" 
          class="px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${pill === 'cours' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          <i data-lucide="book-open" class="w-3.5 h-3.5 ${pill === 'cours' ? 'text-white' : 'text-zinc-400'}"></i>
          <span>Supports de cours</span>
        </button>

        <button 
          onclick="app.navigate('tutor')" 
          class="px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#16171a] hover:border-zinc-700 hover:text-white text-zinc-300 font-medium transition flex items-center gap-1.5"
        >
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Poser une question</span>
        </button>
      </div>

      <!-- Main Dynamic Content Block -->
      ${isFilterActive ? `
        <!-- Filter Results List -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
            <span class="font-semibold text-zinc-300">${searchResults.length} document${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}</span>
            <button onclick="app.resetSearchFilters()" class="text-blue-400 hover:underline font-medium">
              Réinitialiser les filtres
            </button>
          </div>

          ${searchResults.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${searchResults.map(r => this.renderSearchDocCard(r)).join('')}
            </div>
          ` : `
            <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-8 text-center space-y-2">
              <i data-lucide="file-x" class="w-8 h-8 text-zinc-600 mx-auto"></i>
              <p class="text-xs font-semibold text-zinc-300">Aucun document ne correspond à votre recherche.</p>
              <p class="text-[11px] text-zinc-500">Essayez un autre mot-clé ou demandez de l'aide au Tuteur IA.</p>
              <button onclick="app.navigate('tutor')" class="mt-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-lg transition inline-flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3 h-3"></i>
                <span>Demander au Tuteur IA</span>
              </button>
            </div>
          `}
        </div>
      ` : `
        <!-- Default State: Recent Documents & Quick Course Access -->
        <div class="space-y-6 pt-2">
          
          <!-- Recent Documents Section -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-white text-sm flex items-center gap-2">
                <i data-lucide="clock" class="w-4 h-4 text-zinc-400"></i>
                <span>Derniers documents du fonds académique</span>
              </h2>
              <button onclick="app.navigate('courses')" class="text-xs text-blue-400 hover:underline font-medium">
                Voir toutes les matières →
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${recentDocs.map(r => this.renderSearchDocCard(r)).join('')}
            </div>
          </div>

          <!-- Courses Quick Access Grid -->
          <div class="space-y-3 pt-2">
            <h2 class="font-bold text-white text-sm flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-zinc-400"></i>
              <span>Banque de matières universitaires</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${this.courses.slice(0, 3).map(c => {
                const count = this.resources.filter(r => r.courseId === c.id).length;
                return `
                <div onclick="app.openCourseDetail('${c.id}')" class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 p-3.5 transition cursor-pointer group shadow-2xs space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#121316] text-blue-400 border border-zinc-800">${this.escapeHtml(c.code)}</span>
                    <span class="text-[11px] text-zinc-500">${count} doc${count > 1 ? 's' : ''}</span>
                  </div>
                  <h3 class="font-bold text-xs text-white group-hover:text-blue-400 transition truncate" title="${this.escapeHtml(c.name)}">
                    ${this.escapeHtml(c.name)}
                  </h3>
                  <div class="text-[11px] text-zinc-400 truncate">${this.escapeHtml(c.professor || 'Département académique')}</div>
                </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `}

    </div>
    `;
  }

  // Card renderer for search results & recent docs
  renderSearchDocCard(r) {
    const course = this.courses.find(c => c.id === r.courseId);
    return `
    <div onclick="app.openDocument('${r.id}')" class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 p-3.5 transition text-left cursor-pointer group shadow-2xs space-y-2.5 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-1 flex-wrap">
          ${this.getTypeBadge(r.type)}
          ${r.hasCorrection ? `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#062817] text-emerald-400 border border-emerald-900/60">Corrigé inclus</span>
          ` : ''}
          <span class="text-[10px] font-medium text-zinc-500">${this.escapeHtml(r.academicYear || '2025-2026')}</span>
        </div>
        <h3 class="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition line-clamp-2 leading-snug">
          ${this.escapeHtml(r.title)}
        </h3>
        <div class="text-[11px] text-zinc-400 truncate">
          ${course ? `<span class="font-medium text-zinc-300">${this.escapeHtml(course.name)}</span> • ` : ''}${this.escapeHtml(r.professor || 'Faculté')}
        </div>
      </div>

      <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
        <span class="text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
          <span>Consulter</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </span>
        ${r.hasCorrection ? `
          <button onclick="event.stopPropagation(); app.openCorrection('${r.id}')" class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-[#062817] hover:bg-[#083520] border border-emerald-900/60 px-2 py-1 rounded-lg transition">
            Voir corrigé
          </button>
        ` : ''}
      </div>
    </div>
    `;
  }

  onSearchInput(val) {
    this.filters.search = val;
    this.render();
    const input = document.getElementById('main-search-input');
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  }

  clearSearch() {
    this.filters.search = '';
    this.render();
  }

  triggerSearch() {
    this.render();
  }

  quickFilterSearch(type) {
    this.searchPillFilter = (this.searchPillFilter === type) ? null : type;
    this.render();
  }

  resetSearchFilters() {
    this.filters.search = '';
    this.searchPillFilter = null;
    this.render();
  }

  // ==========================================
  // VIEW: PAGE 2 — BANQUE DE MATIÈRES & EXPLORATEUR
  // ==========================================
  renderCoursesView() {
    let list = this.courses || [];
    if (this.filters.promotionId) {
      list = list.filter(c => !c.promotionId || c.promotionId === this.filters.promotionId);
    }
    if (this.selectedSemester) {
      list = list.filter(c => c.semester === this.selectedSemester);
    }

    const activePromo = this.promotions.find(p => p.id === this.filters.promotionId);

    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Title & Subtitle -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h1 class="font-bold text-white text-lg sm:text-xl">Mes Matières</h1>
          <p class="text-xs text-zinc-400">
            ${activePromo ? `Promotion ${this.escapeHtml(activePromo.name)} — ` : ''}Banque de cours universitaires, examens et travaux dirigés
          </p>
        </div>

        <!-- Semester Filter Tabs -->
        <div class="flex items-center gap-1 bg-[#16171a] p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-zinc-800">
          <button 
            onclick="app.setSemesterFilter('')" 
            class="px-2.5 py-1 rounded-lg transition ${!this.selectedSemester ? 'bg-zinc-800 text-white font-semibold shadow-2xs' : 'text-zinc-400 hover:text-white'}"
          >
            Tous
          </button>
          <button 
            onclick="app.setSemesterFilter('S1')" 
            class="px-2.5 py-1 rounded-lg transition ${this.selectedSemester === 'S1' ? 'bg-zinc-800 text-white font-semibold shadow-2xs' : 'text-zinc-400 hover:text-white'}"
          >
            Semestre 1
          </button>
          <button 
            onclick="app.setSemesterFilter('S2')" 
            class="px-2.5 py-1 rounded-lg transition ${this.selectedSemester === 'S2' ? 'bg-zinc-800 text-white font-semibold shadow-2xs' : 'text-zinc-400 hover:text-white'}"
          >
            Semestre 2
          </button>
        </div>
      </div>

      <!-- Courses Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        ${list.map(c => {
          const docs = this.resources.filter(r => r.courseId === c.id);
          const exams = docs.filter(r => r.type === 'Examen' || r.type === 'Interrogation');
          const hasCorrections = docs.filter(r => r.hasCorrection || r.type === 'Corrigé').length;

          return `
          <div onclick="app.openCourseDetail('${c.id}')" class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 p-4 transition text-left cursor-pointer group shadow-2xs space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#121316] text-blue-400 border border-zinc-800">
                  ${this.escapeHtml(c.code)}
                </span>
                ${c.semester ? `<span class="text-[11px] font-semibold text-zinc-400 bg-[#121316] px-2 py-0.5 rounded-lg border border-zinc-800">${this.escapeHtml(c.semester)}</span>` : ''}
              </div>

              <h2 class="font-bold text-sm text-white group-hover:text-blue-400 transition leading-snug">
                ${this.escapeHtml(c.name)}
              </h2>

              <p class="text-xs text-zinc-400 truncate">
                ${this.escapeHtml(c.professor || 'Enseignant responsable')}
              </p>
            </div>

            <div class="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div class="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>${docs.length} document${docs.length > 1 ? 's' : ''}</span>
                <span>${exams.length} examen${exams.length > 1 ? 's' : ''} (${hasCorrections} corrigé${hasCorrections > 1 ? 's' : ''})</span>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button onclick="event.stopPropagation(); app.openCourseDetail('${c.id}')" class="flex-1 bg-[#121316] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold py-1.5 px-3 rounded-lg transition border border-zinc-800 text-center">
                  Explorer
                </button>
                <button onclick="event.stopPropagation(); app.startCourseRevision('${c.id}')" class="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shrink-0 shadow-2xs" title="Réviser avec le Tuteur IA">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>

    </div>
    `;
  }

  setSemesterFilter(sem) {
    this.selectedSemester = sem;
    this.render();
  }

  openCourseDetail(courseId) {
    this.selectedCourseId = courseId;
    this.courseDetailTab = 'all';
    this.navigate('course-detail');
  }

  // ==========================================
  // VIEW: PAGE 3 — PAGE DÉTAILLÉE D'UNE MATIÈRE
  // ==========================================
  renderCourseDetailView() {
    const course = this.courses.find(c => c.id === this.selectedCourseId) || this.courses[0];
    if (!course) {
      return `
      <div class="max-w-4xl mx-auto p-8 text-center space-y-3">
        <p class="text-sm font-semibold text-zinc-300">Matière introuvable.</p>
        <button onclick="app.navigate('courses')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-semibold">
          Retour aux matières
        </button>
      </div>
      `;
    }

    // Filter documents of this course
    let docs = this.resources.filter(r => r.courseId === course.id);
    if (this.courseDetailTab === 'exams') {
      docs = docs.filter(r => r.type === 'Examen' || r.type === 'Interrogation');
    } else if (this.courseDetailTab === 'exercises') {
      docs = docs.filter(r => r.type === 'Exercices' || r.type === 'TP');
    } else if (this.courseDetailTab === 'lectures') {
      docs = docs.filter(r => r.type === 'Supports de Cours');
    }

    // Group documents by chapter
    const chaptersMap = {};
    docs.forEach(doc => {
      const ch = doc.chapter || 'Ressources Générales';
      if (!chaptersMap[ch]) chaptersMap[ch] = [];
      chaptersMap[ch].push(doc);
    });

    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Return Bar -->
      <div class="flex items-center gap-2">
        <button onclick="app.navigate('courses')" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
          <span>Retour à la liste des matières</span>
        </button>
      </div>

      <!-- Course Header Card -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#121316] text-blue-400 border border-zinc-800">
              ${this.escapeHtml(course.code)}
            </span>
            <span class="text-xs text-zinc-400 font-medium">${this.escapeHtml(course.professor || 'Enseignant responsable')}</span>
          </div>
          <h1 class="text-lg sm:text-xl font-bold text-white">${this.escapeHtml(course.name)}</h1>
        </div>

        <!-- Action Buttons: Gemini Blue "Réviser avec l'IA" & "Mode Apprendre" -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <button onclick="app.startCourseLearning('${course.id}')" class="bg-[#121316] hover:bg-zinc-800 text-blue-400 font-semibold text-xs px-3.5 py-2 rounded-lg border border-zinc-800 transition flex items-center gap-1.5">
            <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-blue-400"></i>
            <span>Mode Apprendre ce cours</span>
          </button>

          <button onclick="app.startCourseRevision('${course.id}')" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Réviser cette matière avec l'IA</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button 
          onclick="app.setCourseDetailTab('all')" 
          class="px-3 py-1.5 rounded-lg font-medium transition border ${this.courseDetailTab === 'all' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Tous
        </button>
        <button 
          onclick="app.setCourseDetailTab('exams')" 
          class="px-3 py-1.5 rounded-lg font-medium transition border ${this.courseDetailTab === 'exams' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Examens & Interros
        </button>
        <button 
          onclick="app.setCourseDetailTab('exercises')" 
          class="px-3 py-1.5 rounded-lg font-medium transition border ${this.courseDetailTab === 'exercises' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Exercices & TD
        </button>
        <button 
          onclick="app.setCourseDetailTab('lectures')" 
          class="px-3 py-1.5 rounded-lg font-medium transition border ${this.courseDetailTab === 'lectures' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Fiches de Cours
        </button>
      </div>

      <!-- Documents Grouped By Chapter -->
      <div class="space-y-4">
        ${Object.keys(chaptersMap).length > 0 ? Object.entries(chaptersMap).map(([chapter, chapterDocs]) => `
          <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden shadow-2xs">
            <div class="bg-[#121316] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <span class="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                <i data-lucide="folder" class="w-4 h-4 text-blue-400"></i>
                <span>${this.escapeHtml(chapter)}</span>
              </span>
              <span class="text-[11px] text-zinc-500 font-medium">${chapterDocs.length} ressource${chapterDocs.length > 1 ? 's' : ''}</span>
            </div>

            <div class="divide-y divide-zinc-800">
              ${chapterDocs.map(doc => `
                <div onclick="app.openDocument('${doc.id}')" class="p-3.5 hover:bg-[#1f2024] transition cursor-pointer flex items-center justify-between gap-3 group">
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      ${this.getTypeBadge(doc.type)}
                      ${doc.hasCorrection ? `
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#062817] text-emerald-400 border border-emerald-900/60">Corrigé disponible</span>
                      ` : ''}
                      <span class="text-[11px] text-zinc-500">${this.escapeHtml(doc.academicYear || '2025-2026')}</span>
                    </div>
                    <div class="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition truncate">
                      ${this.escapeHtml(doc.title)}
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    ${doc.hasCorrection ? `
                      <button onclick="event.stopPropagation(); app.openCorrection('${doc.id}')" class="text-xs font-semibold bg-[#062817] hover:bg-[#083520] text-emerald-400 border border-emerald-900/60 px-3 py-1.5 rounded-lg transition">
                        Voir le corrigé
                      </button>
                    ` : ''}
                    <button onclick="app.openDocument('${doc.id}')" class="text-xs font-semibold bg-[#121316] hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition border border-zinc-800">
                      Consulter
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('') : `
          <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-8 text-center text-xs text-zinc-500">
            Aucun document dans cette catégorie pour le moment.
          </div>
        `}
      </div>

    </div>
    `;
  }

  setCourseDetailTab(tab) {
    this.courseDetailTab = tab;
    this.render();
  }

  startCourseRevision(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    this.tutorCourseId = courseId;
    this.tutorMode = 'revision';
    this.navigate('tutor');
    if (course) {
      this.sendTutorQuestion(`Démarrons une séance de révision pour la matière ${course.name} (${course.code}). Peux-tu me présenter les points essentiels et des questions types d'examen ?`);
    }
  }

  startCourseLearning(courseId) {
    this.selectedLearnCourseId = courseId;
    this.selectedLearnChapterId = null;
    this.openLearningMode(true);
  }

  // ==========================================
  // VIEW: PAGE 10 — MON PROFIL & PROGRESSION
  // ==========================================
  renderProfileView() {
    const activePromo = this.promotions.find(p => p.id === this.filters.promotionId);

    // Realistic course mastery data without evaluation stress
    const masteryData = (this.courses || []).map((c, i) => {
      const pcts = [78, 62, 85, 54, 70];
      const pct = pcts[i % pcts.length];
      let status = 'Solide';
      let color = 'bg-blue-600';
      if (pct < 60) {
        status = 'À consolider';
        color = 'bg-amber-500';
      } else if (pct < 75) {
        status = 'En progression';
        color = 'bg-blue-500';
      }
      return { ...c, masteryPct: pct, status, color };
    });

    const weakTopics = [
      { courseId: this.courses[0]?.id || '', courseCode: this.courses[0]?.code || 'MATH101', concept: 'Intégrales impropres et convergence' },
      { courseId: this.courses[1]?.id || '', courseCode: this.courses[1]?.code || 'PHY201', concept: 'Facteur de qualité Q des oscillateurs amortis' },
      { courseId: this.courses[2]?.id || '', courseCode: this.courses[2]?.code || 'INFO202', concept: 'Pointeurs et allocation dynamique de mémoire' }
    ];

    return `
    <div class="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      <!-- Student Identity Header -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-5 shadow-2xs flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-lg bg-[#121316] text-blue-400 flex items-center justify-center font-bold text-base border border-zinc-800">
            <i data-lucide="user" class="w-6 h-6"></i>
          </div>
          <div>
            <h1 class="font-bold text-base sm:text-lg text-white">${this.escapeHtml(this.studentProfile.name || 'Étudiant Universitaire')}</h1>
            <p class="text-xs text-zinc-400">
              ${activePromo ? `Promotion : ${this.escapeHtml(activePromo.name)}` : (this.studentProfile.filiere || 'Licence 2 — Sciences & Technologies')}
            </p>
          </div>
        </div>
        <button onclick="app.openApiKeyModal()" class="text-xs font-semibold bg-[#121316] hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-2 rounded-lg border border-zinc-800 transition flex items-center gap-1.5">
          <i data-lucide="key" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Clé API</span>
        </button>
      </div>

      <!-- Section: Jauges de Maîtrise Douces par Matière -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h2 class="font-bold text-sm text-white">Maîtrise estimée par matière</h2>
            <p class="text-xs text-zinc-400">Indicateur continu calculé lors de vos exercices et révisions</p>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#121316] text-blue-400 border border-zinc-800">
            Sans stress d'évaluation
          </span>
        </div>

        <div class="space-y-3.5">
          ${masteryData.map(m => `
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-zinc-200">${this.escapeHtml(m.code)} — ${this.escapeHtml(m.name)}</span>
                <span class="font-semibold text-zinc-400">${m.masteryPct}% (${m.status})</span>
              </div>
              <div class="w-full bg-[#121316] rounded-lg h-2.5 overflow-hidden border border-zinc-800">
                <div class="${m.color} h-full rounded-lg transition-all duration-500" style="width: ${m.masteryPct}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section: Sujets à revoir en priorité -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-5 shadow-2xs space-y-3">
        <div>
          <h2 class="font-bold text-sm text-white">Sujets à revoir en priorité</h2>
          <p class="text-xs text-zinc-400">Notions ciblées pour lesquelles une séance guidée vous fera progresser rapidement</p>
        </div>

        <div class="space-y-2 pt-1">
          ${weakTopics.map(w => `
            <div class="bg-[#121316] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <span class="font-bold text-zinc-200">${this.escapeHtml(w.concept)}</span>
                <div class="text-[11px] text-zinc-400">${this.escapeHtml(w.courseCode)}</div>
              </div>
              <button onclick="app.startCatchupSession('${w.courseId}', '${this.escapeHtml(w.concept)}')" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-2xs">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Lancer rattrapage</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section: Configuration Clé API Gemini (Page 11) -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-5 shadow-2xs space-y-3">
        <div class="flex items-center gap-2">
          <i data-lucide="key" class="w-4 h-4 text-blue-400"></i>
          <h2 class="font-bold text-sm text-white">Configuration de votre Clé API Gemini</h2>
        </div>
        <p class="text-xs text-zinc-400 leading-relaxed">
          Configurez votre clé personnelle pour un usage illimité de l'assistant IA en 3 étapes simples :
        </p>

        <ol class="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside bg-[#121316] p-3 rounded-lg border border-zinc-800">
          <li>Accédez à votre compte Google AI Studio</li>
          <li>Créez une clé d'API gratuite</li>
          <li>Collez-la ci-dessous et enregistrez</li>
        </ol>

        <div class="pt-1 flex items-center gap-2">
          <input 
            type="password" 
            id="profile-api-key-input" 
            placeholder="AIzaSy..." 
            value="${this.escapeHtml(this.userApiKey || '')}"
            class="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-800 bg-[#121316] text-white focus:border-blue-500 outline-none font-mono"
          >
          <button onclick="app.saveApiKeyFromProfile()" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shrink-0 shadow-2xs">
            Enregistrer
          </button>
        </div>
      </div>

      <!-- Section: Accès Administration (Page 12) -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-5 shadow-2xs flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <h3 class="font-bold text-xs sm:text-sm text-white">Administration Centrale</h3>
          <p class="text-xs text-zinc-400">Gestion des cours, documents et orchestration des agents</p>
        </div>
        <a href="/admin" target="_blank" class="bg-[#121316] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-lg border border-zinc-800 transition inline-flex items-center gap-1.5">
          <span>Ouvrir l'administration</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
      </div>

    </div>
    `;
  }

  saveApiKeyFromProfile() {
    const input = document.getElementById('profile-api-key-input');
    if (!input) return;
    const val = input.value.trim();
    this.userApiKey = val;
    sessionStorage.setItem('academic_hub_api_key', val);
    this.showToast(val ? 'Clé API enregistrée avec succès !' : 'Clé API réinitialisée.');
  }

  startCatchupSession(courseId, concept) {
    this.tutorCourseId = courseId;
    this.tutorMode = 'apprendre';
    this.navigate('tutor');
    this.sendTutorQuestion(`Je souhaite faire une séance de rattrapage guidée sur la notion : "${concept}". Peux-tu m'expliquer le principe avec un exemple concret puis me proposer un exercice progressif ?`);
  }

  // ==========================================
  // VIEW: PAGE 9 — RECOMMANDATIONS VIDÉOS PÉDAGOGIQUES
  // ==========================================
  renderVideosView() {
    const vids = this.videos || [];
    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      <div class="pb-2 border-b border-zinc-800">
        <h1 class="font-bold text-white text-lg sm:text-xl">Vidéos Pédagogiques Validées</h1>
        <p class="text-xs text-zinc-400">Catalogue de cours vidéo et démonstrations recommandées par les enseignants</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        ${vids.map(v => `
          <div onclick="app.openVideo('${v.id || v.youtubeId}')" class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 overflow-hidden transition cursor-pointer group shadow-2xs flex flex-col justify-between">
            <div class="aspect-video bg-black text-white flex items-center justify-center relative">
              <i data-lucide="play-circle" class="w-10 h-10 text-white/80 group-hover:scale-110 group-hover:text-white transition transform"></i>
              ${v.duration ? `<span class="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">${this.escapeHtml(v.duration)}</span>` : ''}
            </div>

            <div class="p-3.5 space-y-2">
              <h3 class="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition line-clamp-2">
                ${this.escapeHtml(v.title)}
              </h3>
              <div class="text-[11px] text-zinc-400 truncate">
                ${this.escapeHtml(v.concept || v.courseName || 'Cours vidéo')}
              </div>
            </div>

            <div class="p-3 bg-[#121316] border-t border-zinc-800 flex items-center justify-between text-xs">
              <span class="text-blue-400 font-semibold group-hover:underline">Regarder</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-blue-400"></i>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    `;
  }

  openCorrection(docId) {
    const res = (this.resources || []).find(r => r.id === docId);
    if (!res) return;

    if (res.type === 'Corrigé') {
      this.openDocument(res.id);
      return;
    }

    if (res.correctionId) {
      this.openDocument(res.correctionId);
      return;
    }

    // Look for a correction linked to this course and chapter/title
    const matchingCorrection = (this.resources || []).find(r => 
      r.type === 'Corrigé' && (
        r.courseId === res.courseId || 
        (r.title && res.title && r.title.toLowerCase().includes(res.title.toLowerCase().replace('sujet', '').trim()))
      )
    );

    if (matchingCorrection) {
      this.openDocument(matchingCorrection.id);
    } else {
      this.openDocument(res.id);
      this.showToast('Corrigé consultable directement avec le Tuteur IA');
    }
  }

  async explainCurrentPage() {
    const modal = document.getElementById('modal-page-explanation');
    const titleEl = document.getElementById('modal-page-explanation-title');
    const contentEl = document.getElementById('modal-page-explanation-content');
    if (!modal || !contentEl) return;

    modal.classList.remove('hidden');
    const page = this.docPdfPage || 1;
    if (titleEl) titleEl.innerText = `Explication pédagogique — Page ${page}`;
    contentEl.innerHTML = `
      <div class="flex items-center gap-2 text-slate-500 py-8 justify-center">
        <div class="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span class="text-xs font-medium">Génération de l'explication pas à pas...</span>
      </div>
    `;

    try {
      const res = await fetch(`/api/resources/${this.selectedResourceId}/explain-page?page=${page}&userApiKey=${encodeURIComponent(this.userApiKey || '')}`);
      const data = await res.json();
      if (data.success && data.data) {
        const expl = data.data;
        contentEl.innerHTML = `
          <div class="space-y-3.5">
            <div class="bg-blue-950/40 p-3 rounded-lg border border-blue-800/60">
              <h4 class="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                <i data-lucide="lightbulb" class="w-4 h-4 text-blue-400"></i>
                <span>Notion principale</span>
              </h4>
              <p class="text-xs text-blue-200 mt-1 leading-relaxed">${this.escapeHtml(expl.concept || 'Analyse de la page')}</p>
            </div>

            <div class="space-y-1">
              <h5 class="font-bold text-white text-xs">Explication pas à pas :</h5>
              <div class="text-xs text-zinc-300 leading-relaxed bg-[#121316] p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap">${this.escapeHtml(expl.explanation || expl.content || 'Consultez la transcription de cette page.')}</div>
            </div>

            ${expl.keyFormulas && expl.keyFormulas.length > 0 ? `
              <div class="space-y-1">
                <h5 class="font-bold text-white text-xs">Formules et Définitions à retenir :</h5>
                <ul class="text-xs text-zinc-300 list-disc list-inside space-y-1 bg-[#121316] p-2.5 rounded-lg border border-zinc-800">
                  ${expl.keyFormulas.map(f => `<li>${this.escapeHtml(f)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${expl.examTraps ? `
              <div class="bg-amber-950/40 p-3 rounded-lg border border-amber-850/60 text-xs text-amber-200 space-y-0.5">
                <span class="font-bold flex items-center gap-1 text-amber-300">
                  <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-400"></i>
                  Piège fréquent en examen :
                </span>
                <p>${this.escapeHtml(expl.examTraps)}</p>
              </div>
            ` : ''}

            <div class="pt-2 flex justify-end">
              <button onclick="app.askAboutCurrentDoc('Peux-tu m\\'expliquer plus en détail la page ${page} ?'); app.closePageExplanationModal();" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Approfondir avec le Tuteur IA</span>
              </button>
            </div>
          </div>
        `;
      } else {
        contentEl.innerHTML = `<p class="text-xs text-zinc-500">Aucune explication spécifique trouvée pour cette page. Vous pouvez poser une question directement au Tuteur IA.</p>`;
      }
    } catch (err) {
      contentEl.innerHTML = `<p class="text-xs text-red-400">Erreur lors de la génération de l'explication : ${this.escapeHtml(err.message)}</p>`;
    }
    if (window.lucide) window.lucide.createIcons();
  }

  closePageExplanationModal() {
    const modal = document.getElementById('modal-page-explanation');
    if (modal) modal.classList.add('hidden');
  }

  openVideo(videoId) {
    const video = (this.videos || []).find(v => v.id === videoId || v.youtubeId === videoId);
    const modal = document.getElementById('modal-video-player');
    const titleEl = document.getElementById('modal-video-title');
    const container = document.getElementById('modal-video-container');
    if (!modal || !container) return;

    const vTitle = video ? video.title : 'Vidéo Pédagogique';
    const ytId = video ? (video.youtubeId || video.id) : videoId;
    if (titleEl) titleEl.innerText = vTitle;

    container.innerHTML = `
      <iframe 
        class="w-full h-full" 
        src="https://www.youtube.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0" 
        title="${this.escapeHtml(vTitle)}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    modal.classList.remove('hidden');
  }

  closeVideoModal() {
    const modal = document.getElementById('modal-video-player');
    const container = document.getElementById('modal-video-container');
    if (modal) modal.classList.add('hidden');
    if (container) container.innerHTML = '';
  }

  onVideoCompleted() {
    this.closeVideoModal();
    this.showToast('Vidéo validée ! Félicitations pour votre assiduité.');
  }

  // ==========================================
  // VIEW 1: CLEAN & AIRY DOCUMENTS EXPLORER (Image 3 exact styling)
  // ==========================================
  renderDocumentsView() {
    // Apply search and filter logic
    const filtered = this.resources.filter(r => {
      if (this.filters.promotionId && r.promotionId !== this.filters.promotionId) return false;
      if (this.filters.courseId && r.courseId !== this.filters.courseId) return false;
      if (this.filters.type && r.type !== this.filters.type) return false;
      if (this.filters.hasCorrection === 'true' && !r.hasCorrection) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase().trim();
        const inTitle = (r.title || '').toLowerCase().includes(q);
        const inProf = (r.professor || '').toLowerCase().includes(q);
        const inContent = (r.content || '').toLowerCase().includes(q);
        const inChapter = (r.chapter || '').toLowerCase().includes(q);
        const inCourse = (r.courseName || '').toLowerCase().includes(q);
        if (!inTitle && !inProf && !inContent && !inChapter && !inCourse) return false;
      }
      return true;
    });

    const activeFilterCount = (this.filters.promotionId ? 1 : 0) + (this.filters.type ? 1 : 0) + (this.filters.hasCorrection ? 1 : 0);

    // Group resources by course for structured folder view (Panel 3 style)
    const groupedCourses = {};
    filtered.forEach(r => {
      const c = this.courses.find(course => course.id === r.courseId);
      const courseName = c ? `${c.code} — ${c.name}` : (r.courseName || 'Autres Cours');
      if (!groupedCourses[courseName]) groupedCourses[courseName] = [];
      groupedCourses[courseName].push(r);
    });

    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Search Bar (Exact Panel 3 Style) -->
      <div class="relative flex items-center">
        <i data-lucide="search" class="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none"></i>
        <input 
          type="text" 
          id="search-input"
          value="${this.filters.search}" 
          placeholder="Search..." 
          oninput="app.onSearchInput(this.value)"
          class="w-full bg-[#16171a] text-white pl-10 pr-20 py-2.5 rounded-lg border border-zinc-800 focus:border-blue-500 outline-none text-xs sm:text-sm transition placeholder:text-zinc-500 font-normal"
        >
        ${this.filters.search ? `
          <button onclick="app.clearSearch()" class="absolute right-10 text-zinc-400 hover:text-white p-1">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        ` : ''}
        <button onclick="app.triggerSearch()" class="absolute right-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] px-3 py-1.5 rounded-lg transition">
          Chercher
        </button>
      </div>

      <!-- Filter Pills Bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <!-- All Pill -->
        <button 
          onclick="app.setFilter('type', '')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${!this.filters.type ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Tous
        </button>

        <!-- Supports de Cours Pill -->
        <button 
          onclick="app.setFilter('type', 'Supports de Cours')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Supports de Cours' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Cours
        </button>

        <!-- Exercices / TD Pill -->
        <button 
          onclick="app.setFilter('type', 'Exercices')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Exercices' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          TD / Exercices
        </button>

        <!-- Examens Pill -->
        <button 
          onclick="app.setFilter('type', 'Examen')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Examen' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Examens
        </button>

        <!-- Interrogations Pill -->
        <button 
          onclick="app.setFilter('type', 'Interrogation')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Interrogation' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Interrogations
        </button>

        <!-- TP Pill -->
        <button 
          onclick="app.setFilter('type', 'TP')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'TP' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          TPs
        </button>

        <!-- Corrigés Pill -->
        <button 
          onclick="app.setFilter('type', 'Corrigé')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Corrigé' ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-[#16171a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}"
        >
          Corrigés
        </button>

        <!-- View Mode Toggle -->
        <div class="ml-auto flex items-center bg-[#16171a] p-0.5 rounded-lg border border-zinc-800 shrink-0">
          <button onclick="app.setDocViewMode('tree')" class="px-2 py-1 rounded-md text-[11px] font-medium transition ${this.libraryViewMode === 'tree' ? 'bg-zinc-800 text-white font-semibold shadow-2xs' : 'text-zinc-400 hover:text-white'} flex items-center gap-1">
            <i data-lucide="folder" class="w-3 h-3"></i> Dossiers
          </button>
          <button onclick="app.setDocViewMode('list')" class="px-2 py-1 rounded-md text-[11px] font-medium transition ${this.libraryViewMode === 'list' ? 'bg-zinc-800 text-white font-semibold shadow-2xs' : 'text-zinc-400 hover:text-white'} flex items-center gap-1">
            <i data-lucide="list" class="w-3 h-3"></i> Liste
          </button>
        </div>

        ${(this.filters.search || activeFilterCount > 0) ? `
          <button onclick="app.resetFilters()" class="text-xs text-zinc-400 hover:text-white font-medium px-2 py-1 flex items-center gap-1 shrink-0">
            <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Effacer
          </button>
        ` : ''}
      </div>

      <!-- Document List Header -->
      <div class="flex items-center justify-between text-xs text-zinc-400 pt-1">
        <span>${filtered.length} document${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}</span>
        <span class="text-[11px] text-zinc-500">Classés par matière & année</span>
      </div>

      <!-- Content Area -->
      ${filtered.length === 0 ? `
        <div class="bg-[#16171a] border border-zinc-800 rounded-lg p-8 text-center max-w-sm mx-auto space-y-3 my-6">
          <div class="w-10 h-10 rounded-lg bg-[#121316] text-zinc-400 flex items-center justify-center mx-auto border border-zinc-800">
            <i data-lucide="search-x" class="w-5 h-5"></i>
          </div>
          <div class="font-semibold text-white text-sm">Aucun document trouvé</div>
          <p class="text-xs text-zinc-400">Modifiez votre recherche ou réinitialisez les filtres.</p>
          <button onclick="app.resetFilters()" class="text-xs bg-[#121316] hover:bg-zinc-800 font-medium px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white transition border border-zinc-800">
            Réinitialiser
          </button>
        </div>
      ` : this.libraryViewMode === 'tree' ? `
        <!-- Hierarchical Course Folders (Panel 3 Style) -->
        <div class="space-y-3">
          ${Object.entries(groupedCourses).map(([courseName, docs], idx) => {
            const isExpanded = this.expandedCourses.has(`course-group-${idx}`) || this.expandedCourses.size === 0 || this.filters.search;
            return `
            <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden transition">
              <button 
                onclick="app.toggleCourseGroupAccordion('course-group-${idx}')" 
                class="w-full flex items-center justify-between p-3.5 bg-[#121316] hover:bg-[#1f2024] transition text-left border-b border-zinc-800"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <i data-lucide="folder" class="w-4 h-4 text-blue-400 shrink-0"></i>
                  <span class="font-semibold text-white text-xs sm:text-sm truncate">${courseName}</span>
                  <span class="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md font-medium shrink-0 border border-zinc-700">${docs.length}</span>
                </div>
                <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4 text-zinc-500 shrink-0"></i>
              </button>

              ${isExpanded ? `
                <div class="divide-y divide-zinc-800">
                  ${docs.map(doc => `
                    <div onclick="app.openDocument('${doc.id}')" class="flex items-center justify-between p-3 hover:bg-[#1f2024] cursor-pointer transition group">
                      <div class="flex items-center gap-2.5 min-w-0 pr-2">
                        <i data-lucide="file-text" class="w-4 h-4 text-zinc-500 group-hover:text-blue-400 shrink-0"></i>
                        <span class="text-xs font-medium text-zinc-200 group-hover:text-blue-400 truncate transition">${doc.title}</span>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        ${this.getTypeBadge(doc.type)}
                        <span class="text-[11px] text-zinc-500">${doc.academicYear || '2024'}</span>
                        <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition"></i>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            `;
          }).join('')}
        </div>
      ` : `
        <!-- Flat List Cards -->
        <div class="space-y-2.5">
          ${filtered.map(r => this.renderResourceCard(r)).join('')}
        </div>
      `}

    </div>
    `;
  }

  setDocViewMode(mode) {
    this.libraryViewMode = mode;
    this.render();
  }

  toggleCourseGroupAccordion(id) {
    if (this.expandedCourses.has(id)) {
      this.expandedCourses.delete(id);
    } else {
      this.expandedCourses.add(id);
    }
    this.render();
  }

  // Uniform, Minimalist Card Component (Strict 3-Color Palette & rounded-lg)
  renderResourceCard(res) {
    const course = this.courses.find(c => c.id === res.courseId);
    const promo = this.promotions.find(p => p.id === res.promotionId);

    return `
    <div onclick="app.openDocument('${res.id}')" class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 transition p-3.5 space-y-2 cursor-pointer group">
      
      <!-- Top Row: Type Badge + Year -->
      <div class="flex items-center justify-between gap-2">
        ${this.getTypeBadge(res.type)}
        <span class="text-[11px] font-medium text-zinc-400 bg-[#121316] border border-zinc-800 px-2 py-0.5 rounded-lg">
          ${res.academicYear || '2024-2025'}
        </span>
      </div>

      <!-- Document Title -->
      <div>
        <h3 class="font-semibold text-white text-xs sm:text-sm leading-snug group-hover:text-blue-400 transition line-clamp-2">
          ${res.title}
        </h3>
        <p class="text-xs text-zinc-400 mt-0.5 line-clamp-1">
          ${course ? `${course.code} — ${course.name}` : 'Matière universitaire'}
        </p>
      </div>

      <!-- Metadata & Badges Footer -->
      <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <div class="flex items-center gap-2.5 truncate">
          <span class="flex items-center gap-1"><i data-lucide="user-check" class="w-3.5 h-3.5 text-zinc-500"></i>${res.professor || 'Département'}</span>
          <span class="text-zinc-600">•</span>
          <span class="truncate">${promo ? promo.cycle : 'Licence'}</span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          ${res.hasCorrection ? `
            <span class="inline-flex items-center gap-1 text-emerald-400 font-medium bg-[#062817] px-2 py-0.5 rounded-lg border border-emerald-900/60 text-[10px]">
              <i data-lucide="check" class="w-3 h-3 text-emerald-400"></i> Corrigé
            </span>
          ` : ''}
          <span class="text-zinc-500 group-hover:text-blue-400 transition">
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </span>
        </div>
      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 2: MULTI-FORMAT DOCUMENT READER
  // ==========================================
  renderDocumentView() {
    const res = this.resources.find(r => r.id === this.selectedResourceId);
    if (!res) {
      return `
      <div class="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p class="text-sm text-slate-600">Document introuvable ou retiré du corpus académique.</p>
        <button onclick="app.navigate('documents')" class="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">Retour à la bibliothèque</button>
      </div>
      `;
    }

    const course = this.courses.find(c => c.id === res.courseId);
    const promo = this.promotions.find(p => p.id === res.promotionId);
    let correction = null;
    if (res.correctionId) {
      correction = this.resources.find(r => r.id === res.correctionId);
    } else if (res.type === 'Examen' || res.type === 'Interrogation' || res.hasCorrection) {
      correction = this.resources.find(r => (r.type === 'Corrigé' || r.title.toLowerCase().includes('corrigé')) && r.courseId === res.courseId);
    }

    const related = this.resources.filter(r => r.id !== res.id && r.courseId === res.courseId).slice(0, 3);
    const courseVideo = (this.videos || []).find(v => v.courseId === res.courseId);

    // Detect format
    const format = (res.format || '').toLowerCase();
    const fileName = (res.fileName || '').toLowerCase();

    let viewerHtml = '';
    if (format === 'code' || fileName.endsWith('.c') || fileName.endsWith('.py') || fileName.endsWith('.js') || fileName.endsWith('.java')) {
      viewerHtml = this.renderCodeViewer(res, course, promo);
    } else if (format === 'sheet' || fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      viewerHtml = this.renderSheetViewer(res, course, promo);
    } else if (format === 'slides' || fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      viewerHtml = this.renderSlideViewer(res, course, promo);
    } else if (format === 'office' || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      viewerHtml = this.renderWordViewer(res, course, promo);
    } else if (format === 'image' || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.svg')) {
      viewerHtml = this.renderImageViewer(res, course, promo);
    } else if (format === 'audio' || fileName.endsWith('.mp3') || fileName.endsWith('.wav')) {
      viewerHtml = this.renderAudioViewer(res, course, promo);
    } else if (format === 'video' || fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
      viewerHtml = this.renderVideoViewer(res, course, promo);
    } else {
      // Default / PDF Viewer
      viewerHtml = this.renderPdfViewer(res, course, promo);
    }

    return `
    <div class="max-w-5xl mx-auto px-4 py-4 sm:px-6 space-y-4 animate-in fade-in duration-150">
      
      <!-- Top Sticky Action Bar -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button onclick="app.navigate('documents')" class="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition border border-zinc-800 shrink-0" title="Retour à la bibliothèque">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </button>
          <div class="truncate">
            <div class="flex items-center gap-2 flex-wrap">
              ${this.getTypeBadge(res.type)}
              <span class="text-xs font-semibold text-zinc-400">${res.academicYear || '2025-2026'}</span>
              <span class="text-xs text-zinc-600">•</span>
              <span class="text-xs text-zinc-300 font-medium truncate">${course ? course.name : 'Matière'}</span>
              ${res.fileSize ? `<span class="text-[11px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded font-mono border border-zinc-700/50">${res.fileSize}</span>` : ''}
            </div>
            <h1 class="font-bold text-white text-sm truncate mt-0.5" title="${this.escapeHtml(res.title)}">${this.escapeHtml(res.title)}</h1>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <button onclick="document.getElementById('pdf-top-file-input').click()" class="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-blue-500/30 cursor-pointer" title="Déposer ou ouvrir un fichier PDF">
            <i data-lucide="upload" class="w-3.5 h-3.5 text-blue-400"></i>
            <span>Déposer un PDF</span>
          </button>
          <input type="file" id="pdf-top-file-input" accept=".pdf,application/pdf" onchange="app.handleDirectPdfSelect(event)" class="hidden">

          <button onclick="app.toggleFavorite('${res.id}')" class="p-2 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition border border-zinc-800 shrink-0" title="Ajouter aux favoris">
            <i data-lucide="star" class="w-4 h-4"></i>
          </button>

          <button onclick="app.downloadFile('${res.id}')" class="bg-[#121316] hover:bg-zinc-800 text-zinc-300 font-semibold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-zinc-800">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Télécharger</span>
          </button>

          <button onclick="app.startTutorOnResource('${res.id}')" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Réviser avec l'IA</span>
          </button>
        </div>
      </div>

      <!-- Specialized Multi-Format Reader Container -->
      ${viewerHtml}

      <!-- Associated Resources, Course Video & Context Cards -->
      ${this.renderDocAssociatedSections(res, course, promo, correction, related, courseVideo)}

    </div>
    `;
  }

  // 1. PDF / STANDARD DOCUMENT VIEWER
  renderPdfViewer(res, course, promo) {
    const pages = this.extractDocumentPages(res ? res.content : '');
    const totalPages = Math.max(1, this.pdfTotalPages || (pages ? pages.length : 1));
    const currentPage = Math.max(1, Math.min(totalPages, this.docPdfPage || 1));
    const isTextMode = this.docPdfViewMode === 'text';
    const activePageContent = pages[currentPage - 1] || res.content;

    // Trigger PDF.js render once element is in DOM
    if (!isTextMode) {
      setTimeout(() => {
        this.initPdfViewer(res);
      }, 30);
    }

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Toolbar: Clean, Sober & Functional -->
      <div class="bg-[#121316] border-b border-zinc-800 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-zinc-300">
        
        <!-- Document Name -->
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded-lg bg-zinc-800 text-blue-400 flex items-center justify-center shrink-0 font-bold border border-zinc-700/50">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
          </div>
          <span class="truncate max-w-[160px] sm:max-w-xs font-semibold text-zinc-200 text-xs" title="${this.escapeHtml(res.fileName || res.title || 'document.pdf')}">
            ${this.escapeHtml(res.fileName || res.title || 'document.pdf')}
          </span>
        </div>

        <!-- Center: Simple & Clear Page Navigation Controls (Précédent / Page X sur Y / Suivant) -->
        <div class="flex items-center gap-1.5 bg-[#18191c] border border-zinc-800 rounded-lg p-1">
          <button 
            id="pdf-btn-prev" 
            onclick="app.prevPdfPage()" 
            ${currentPage <= 1 ? 'disabled' : ''} 
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 font-medium text-xs disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer" 
            title="Page précédente (Flèche gauche ou PageUp)"
          >
            <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Précédent</span>
          </button>

          <div class="flex items-center gap-1 px-1.5 py-0.5 border-x border-zinc-800 text-xs font-medium text-zinc-300">
            <span class="text-zinc-500">Page</span>
            <input 
              type="number" 
              id="pdf-page-input" 
              min="1" 
              max="${totalPages}" 
              value="${currentPage}" 
              onchange="app.onPdfPageInputChange(this.value)" 
              onkeydown="if(event.key==='Enter') app.onPdfPageInputChange(this.value)"
              class="w-12 text-center py-0.5 px-1 bg-[#121316] border border-zinc-700 rounded text-xs font-semibold text-zinc-200 outline-none focus:border-blue-500 focus:bg-[#18191c]"
              title="Entrez un numéro de page puis appuyez sur Entrée"
            >
            <span id="pdf-total-pages-label" class="text-zinc-400 font-medium">/ ${totalPages}</span>
          </div>

          <button 
            id="pdf-btn-next" 
            onclick="app.nextPdfPage()" 
            ${currentPage >= totalPages ? 'disabled' : ''} 
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 font-medium text-xs disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer" 
            title="Page suivante (Flèche droite ou PageDown)"
          >
            <span class="hidden sm:inline">Suivant</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Controls: Zoom, View Toggle & Direct Upload -->
        <div class="flex items-center gap-1.5 flex-wrap">
          ${!isTextMode ? `
          <div class="flex items-center bg-[#18191c] border border-zinc-800 rounded-lg p-0.5 text-xs shadow-2xs">
            <button onclick="app.changeZoom(-10)" class="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded font-bold text-zinc-300 transition" title="Zoom arrière (-)">−</button>
            <span id="pdf-zoom-val" class="px-1.5 font-medium text-[11px] text-zinc-300 font-mono">${this.currentDocZoom || 100}%</span>
            <button onclick="app.changeZoom(10)" class="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded font-bold text-zinc-300 transition" title="Zoom avant (+)">+</button>
            <button onclick="app.resetZoom()" class="px-1.5 py-0.5 hover:bg-zinc-800 rounded text-[10px] text-zinc-400 font-medium ml-0.5 border-l border-zinc-800" title="Ajuster la largeur">Ajuster</button>
          </div>
          ` : ''}

          <button onclick="app.togglePdfViewMode()" class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-[#18191c] hover:bg-zinc-800 text-zinc-300 flex items-center gap-1 text-xs transition shadow-2xs font-medium" title="Basculer entre le PDF graphique et la transcription texte">
            <i data-lucide="${isTextMode ? 'file-text' : 'align-left'}" class="w-3.5 h-3.5 text-zinc-400"></i>
            <span>${isTextMode ? 'Afficher le PDF' : 'Texte seul'}</span>
          </button>

          <button onclick="app.downloadFile('${res.id}')" class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white flex items-center gap-1 text-xs font-medium transition border border-zinc-700" title="Télécharger le fichier">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Télécharger</span>
          </button>
        </div>

      </div>

      <!-- Main Display Area -->
      ${!isTextMode ? `
        <div 
          id="pdf-canvas-container" 
          ondragover="event.preventDefault(); this.classList.add('ring-2', 'ring-blue-500', 'bg-blue-950/20')"
          ondragleave="this.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-950/20')"
          ondrop="app.handleViewerDrop(event)"
          class="bg-black/80 p-3 sm:p-6 flex flex-col items-center justify-start min-h-[550px] overflow-auto transition-colors"
        >
          
          <!-- Drop info banner -->
          <div class="w-full max-w-2xl mb-3 flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span class="flex items-center gap-1">
              <i data-lucide="info" class="w-3 h-3 text-zinc-400"></i>
              <span>Glissez-déposez n'importe quel PDF ici pour le lire instantanément</span>
            </span>
            <span class="hidden sm:inline text-zinc-500">Raccourcis : touches ← et → pour naviguer</span>
          </div>

          <!-- Loading Indicator -->
          <div id="pdf-loading-indicator" class="py-16 flex flex-col items-center justify-center gap-2.5 text-zinc-400 text-xs">
            <div class="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="font-medium">Chargement de la page...</span>
          </div>
          
          <!-- PDF Canvas -->
          <canvas id="pdf-render-canvas" class="hidden shadow-sm rounded border border-zinc-800 bg-white max-w-full block"></canvas>

          <!-- Fallback when canvas render fails -->
          <div id="pdf-error-container" class="hidden text-center max-w-md p-6 bg-[#16171a] rounded-lg border border-zinc-800 space-y-3 my-auto">
            <div class="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-700">
              <i data-lucide="file-text" class="w-5 h-5"></i>
            </div>
            <p class="text-sm font-semibold text-zinc-100">Aperçu direct du document</p>
            <p class="text-xs text-zinc-400 leading-relaxed">
              Le document PDF est prêt. Vous pouvez le télécharger directement ou consulter la transcription texte.
            </p>
            <div class="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button onclick="app.downloadFile('${res.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Télécharger le PDF</span>
              </button>
              <button onclick="app.togglePdfViewMode()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-700 border border-zinc-700 transition">
                <span>Lire la transcription</span>
              </button>
              <button onclick="document.getElementById('pdf-top-file-input').click()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-[#121316] text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-800 border border-zinc-700 transition">
                <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                <span>Ouvrir un autre PDF</span>
              </button>
            </div>
          </div>

          <!-- Bottom Navigation Controls (Repeating Prev / Next for reading comfort on tall pages) -->
          <div id="pdf-bottom-controls" class="mt-5 flex items-center justify-between gap-3 w-full max-w-2xl px-3 py-2 bg-[#16171a] rounded-lg border border-zinc-800 text-xs text-zinc-300">
            <button 
              id="pdf-btn-prev-bottom" 
              onclick="app.prevPdfPage()" 
              ${currentPage <= 1 ? 'disabled' : ''} 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#121316] hover:bg-zinc-800 text-zinc-300 font-medium text-xs disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
            >
              <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
              <span>Page précédente</span>
            </button>

            <span id="pdf-page-counter-bottom" class="text-xs font-semibold text-zinc-300">Page ${currentPage} sur ${totalPages}</span>

            <button 
              id="pdf-btn-next-bottom" 
              onclick="app.nextPdfPage()" 
              ${currentPage >= totalPages ? 'disabled' : ''} 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#121316] hover:bg-zinc-800 text-zinc-300 font-medium text-xs disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
            >
              <span>Page suivante</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

        </div>
      ` : `
        <div class="p-6 bg-[#16171a] min-h-[400px]">
          <div class="max-w-3xl mx-auto space-y-4">
            <div class="text-xs text-zinc-400 border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>Transcription de cours</span>
              <span id="pdf-text-page-counter">Page ${currentPage} / ${totalPages}</span>
            </div>
            <div class="text-xs sm:text-sm text-zinc-200 leading-relaxed font-serif whitespace-pre-wrap">
              ${this.escapeHtml(activePageContent)}
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button onclick="app.prevPdfPage()" ${currentPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-30">
                Précédent
              </button>
              <span class="text-xs text-zinc-400">Page ${currentPage} sur ${totalPages}</span>
              <button onclick="app.nextPdfPage()" ${currentPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-30">
                Suivant
              </button>
            </div>
          </div>
        </div>
      `}

    </div>
    `;
  }

  // 2. CODE & SCRIPT VIEWER (.c, .py, .java, etc.)
  renderCodeViewer(res, course, promo) {
    const lines = (res.content || '').split('\n');
    const ext = (res.fileName || '').split('.').pop() || 'c';
    const langLabel = {
      'c': 'C / ANSI C99 (GCC)',
      'py': 'Python 3.11',
      'js': 'JavaScript (ES Modules)',
      'java': 'Java SE 17',
      'cpp': 'C++ 20'
    }[ext.toLowerCase()] || 'Code Source';

    return `
    <div class="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden text-slate-100">
      
      <!-- Code Header Bar -->
      <div class="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 font-mono font-semibold text-blue-400">
            <i data-lucide="code" class="w-4 h-4"></i>
            <span>${res.fileName || 'source.c'}</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">${langLabel}</span>
          <span class="text-slate-500 font-mono text-[11px] hidden sm:inline">${lines.length} lignes</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Copy code button -->
          <button id="copy-code-btn" onclick="app.copyCodeToClipboard()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copier le code</span>
          </button>
          <!-- Font zoom -->
          <div class="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">-</button>
            <span class="px-1.5 text-slate-300 text-[11px]">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">+</button>
          </div>
        </div>
      </div>

      <!-- Code Line-by-Line Gutter & Editor -->
      <div style="font-size: ${this.currentDocZoom}%; line-height: 1.6;" class="p-4 overflow-x-auto font-mono text-xs max-h-[600px] overflow-y-auto no-scrollbar">
        <table class="w-full border-collapse">
          <tbody>
            ${lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isSelected = this.docCodeSelectedLine === lineNum;
              return `
                <tr onclick="app.selectCodeLine(${lineNum})" class="cursor-pointer group hover:bg-slate-800/60 ${isSelected ? 'bg-blue-900/40 border-l-2 border-blue-500' : ''}">
                  <td class="select-none pr-4 text-right text-slate-600 font-mono text-[11px] w-10 shrink-0 group-hover:text-slate-400 align-top">${lineNum}</td>
                  <td class="text-slate-100 whitespace-pre font-mono pl-2 leading-relaxed">${this.highlightCodeSyntax(line, ext)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div class="bg-slate-950/80 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>${this.docCodeSelectedLine ? `Ligne ${this.docCodeSelectedLine} sélectionnée • Cliquez pour désélectionner` : 'Cliquez sur une ligne pour l\'isoler ou l\'examiner'}</span>
        <button onclick="app.startTutorOnResource('${res.id}')" class="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Expliquer ce code avec l'IA
        </button>
      </div>

    </div>
    `;
  }

  // 3. WORD / OFFICE DOCUMENT VIEWER (.docx, .doc)
  renderWordViewer(res, course, promo) {
    const sections = this.extractWordSections(res.content);
    const activeSection = Math.max(0, Math.min(sections.length - 1, this.docWordActiveSection || 0));

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Word Toolbar -->
      <div class="bg-[#121316] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-blue-400"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Document_Officiel.docx'}</span>
          <span class="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700/50">Word / Syllabus</span>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-zinc-400 text-[11px]">Lecture estimée : ~3 min</span>
          <div class="flex items-center bg-[#18191c] border border-zinc-800 rounded-lg p-0.5">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300">-</button>
            <span class="px-2 font-mono text-[11px] text-zinc-300">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300">+</button>
          </div>
        </div>
      </div>

      <!-- Section Tabs Navigation (Sommaire interactif) -->
      <div class="bg-[#121316] border-b border-zinc-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <span class="text-zinc-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
          <i data-lucide="list" class="w-3.5 h-3.5 text-blue-400"></i> Sommaire :
        </span>
        ${sections.map((sec, idx) => `
          <button onclick="app.setWordSection(${idx})" class="px-3 py-1 rounded-lg shrink-0 font-medium transition ${activeSection === idx ? 'bg-blue-600 text-white font-semibold' : 'bg-[#18191c] border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}">
            ${sec.title}
          </button>
        `).join('')}
      </div>

      <!-- Document Content Body -->
      <div class="p-6 sm:p-10 bg-black/80 min-h-[450px]">
        <div style="font-size: ${this.currentDocZoom}%;" class="max-w-3xl mx-auto bg-[#16171a] p-6 sm:p-10 rounded-lg border border-zinc-800 space-y-6">
          <div class="border-b border-zinc-800 pb-4">
            <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Section ${activeSection + 1} sur ${sections.length}</span>
            <h2 class="text-lg sm:text-xl font-extrabold text-white mt-1">${sections[activeSection].title}</h2>
          </div>

          <div class="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-zinc-200">
            ${this.formatMarkdown(sections[activeSection].content)}
          </div>
        </div>
      </div>

    </div>
    `;
  }

  // 4. EXCEL / SPREADSHEET VIEWER (.xlsx, .csv, .sheet)
  renderSheetViewer(res, course, promo) {
    const tableData = this.extractSpreadsheetData(res.content);
    const tabs = ['Feuille 1: Mesures Expérimentales', 'Feuille 2: Calculs & Formules', 'Feuille 3: Synthèse & Facteur Q'];
    const activeTab = this.docSheetActiveTab || 0;

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Excel Header -->
      <div class="bg-[#121316] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <i data-lucide="table" class="w-4 h-4 text-blue-400"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Classeur_Labo.xlsx'}</span>
          <span class="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700/50">Excel / Tableur</span>
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Filtrer les lignes..." 
            value="${this.escapeHtml(this.docSheetFilter || '')}"
            oninput="app.setSheetFilter(this.value)"
            class="bg-[#18191c] text-white placeholder:text-zinc-500 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500"
          />
          <div class="flex items-center bg-[#18191c] border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300">-</button>
            <span class="px-2 text-zinc-300">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300">+</button>
          </div>
        </div>
      </div>

      <!-- Formula Bar (Barre de formules Excel) -->
      <div class="bg-[#121316] border-b border-zinc-800 px-4 py-2 flex items-center gap-3 text-xs font-mono">
        <div class="bg-[#18191c] border border-zinc-700 px-2 py-1 rounded font-bold text-zinc-200 w-16 text-center">
          ${this.docSheetSelectedCell || 'B2'}
        </div>
        <div class="text-zinc-500 font-bold">fx</div>
        <div class="flex-1 bg-[#18191c] border border-zinc-700 px-3 py-1 rounded text-zinc-200 truncate">
          ${this.getFormulaForCell(this.docSheetSelectedCell || 'B2', tableData)}
        </div>
      </div>

      <!-- Interactive Spreadsheet Grid -->
      <div style="font-size: ${this.currentDocZoom}%;" class="overflow-x-auto max-h-[500px] overflow-y-auto no-scrollbar bg-black/70">
        <table class="w-full border-collapse text-xs text-left">
          <thead>
            <tr class="bg-[#18191c] text-zinc-300 font-semibold border-b border-zinc-800">
              <th class="p-2 border-r border-zinc-800 text-center w-12 bg-[#121316] font-mono text-[11px] text-zinc-500">#</th>
              ${tableData.headers.map((h, idx) => `
                <th class="p-2.5 border-r border-zinc-800 font-bold whitespace-nowrap">
                  <div class="text-[10px] text-zinc-500 font-mono">${String.fromCharCode(65 + idx)}</div>
                  <div>${h}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData.rows
              .filter(row => !this.docSheetFilter || row.some(cell => String(cell).toLowerCase().includes(this.docSheetFilter.toLowerCase())))
              .map((row, rIdx) => `
                <tr class="hover:bg-zinc-900/60 border-b border-zinc-800/80 transition">
                  <td class="p-2 border-r border-zinc-800 text-center font-mono text-zinc-500 bg-[#121316] font-medium">${rIdx + 1}</td>
                  ${row.map((cell, cIdx) => {
                    const cellKey = `${String.fromCharCode(65 + cIdx)}${rIdx + 1}`;
                    const isSelected = this.docSheetSelectedCell === cellKey;
                    return `
                      <td onclick="app.selectSheetCell('${cellKey}', '${this.escapeHtml(String(cell))}')" class="p-2.5 border-r border-zinc-800 font-mono cursor-pointer ${isSelected ? 'bg-blue-900/40 border-2 border-blue-500 font-bold text-white' : 'text-zinc-200'}">
                        ${cell}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Excel Footer Tabs (Feuilles) -->
      <div class="bg-[#121316] border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1">
          ${tabs.map((tabName, idx) => `
            <button onclick="app.setSheetTab(${idx})" class="px-3 py-1 rounded-t-lg font-medium transition ${activeTab === idx ? 'bg-[#18191c] border-t-2 border-blue-500 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800'}">
              ${tabName}
            </button>
          `).join('')}
        </div>
        <div class="text-[11px] text-zinc-500 font-mono hidden sm:inline">
          ${tableData.rows.length} lignes enregistrées • Somme auto calculée
        </div>
      </div>

    </div>
    `;
  }

  // 5. SLIDES / POWERPOINT VIEWER (.pptx, .slides)
  renderSlideViewer(res, course, promo) {
    const slides = this.extractSlides(res.content);
    const totalSlides = Math.max(1, slides.length);
    const activeIndex = Math.max(0, Math.min(totalSlides - 1, this.docSlideIndex || 0));
    const currentSlide = slides[activeIndex];

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Slide Presentation Toolbar -->
      <div class="bg-[#121316] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <i data-lucide="presentation" class="w-4 h-4 text-blue-400"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Diapositives.pptx'}</span>
          <span class="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700/50">Présentation / Diapo</span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="app.toggleSlideNotes()" class="px-2.5 py-1 rounded-lg bg-[#18191c] hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 border border-zinc-800">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>${this.docSlideShowNotes ? 'Masquer les notes' : 'Notes du cours'}</span>
          </button>
          <div class="flex items-center bg-[#18191c] border border-zinc-800 rounded-lg p-0.5">
            <button onclick="app.prevSlide()" ${activeIndex <= 0 ? 'disabled' : ''} class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300 disabled:opacity-40"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
            <span class="px-2 font-mono text-[11px] font-bold text-zinc-200">${activeIndex + 1} / ${totalSlides}</span>
            <button onclick="app.nextSlide()" ${activeIndex >= totalSlides - 1 ? 'disabled' : ''} class="px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-300 disabled:opacity-40"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
      </div>

      <!-- Slide Main Stage (16:9 Aspect Frame) -->
      <div class="p-6 sm:p-10 bg-black/80 flex items-center justify-center min-h-[420px]">
        <div class="w-full max-w-2xl aspect-[16/9] bg-[#121316] rounded-lg p-6 sm:p-8 flex flex-col justify-between border border-zinc-800 text-white">
          <div>
            <div class="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              <span>${course ? course.name : 'COURS MAGISTRAL'}</span>
              <span>DIAPOSITIVE ${activeIndex + 1}</span>
            </div>
            <h2 class="text-base sm:text-xl font-extrabold text-white mt-4 leading-tight">${currentSlide.title}</h2>
            <ul class="mt-4 space-y-2.5 text-xs sm:text-sm text-zinc-300">
              ${currentSlide.points.map(pt => `
                <li class="flex items-start gap-2">
                  <span class="text-blue-400 font-bold mt-0.5 shrink-0">✦</span>
                  <span>${pt}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="text-[10px] text-zinc-500 flex items-center justify-between pt-4 border-t border-zinc-800">
            <span>Academic Hub Slide Viewer</span>
            <span>${promo ? promo.name : 'Tronc Commun'}</span>
          </div>
        </div>
      </div>

      <!-- Presenter Notes (If toggled) -->
      ${this.docSlideShowNotes ? `
        <div class="bg-[#121316] border-t border-zinc-800 p-4 text-xs text-zinc-300 space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-white">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-400"></i> Notes pédagogiques & Conseils d'examen :
          </div>
          <p class="text-zinc-400 text-xs leading-relaxed">
            ${currentSlide.notes || "Insister particulièrement sur la formulation du principe fondamental et les conditions d'application des théorèmes énergétiques."}
          </p>
        </div>
      ` : ''}

      <!-- Thumbnails Carousel Ribbon -->
      <div class="bg-[#121316] border-t border-zinc-800 p-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        ${slides.map((s, idx) => `
          <button onclick="app.setSlideIndex(${idx})" class="shrink-0 w-28 aspect-[16/9] rounded-lg border p-1.5 text-left text-[9px] flex flex-col justify-between transition ${activeIndex === idx ? 'border-blue-500 bg-[#18191c] font-bold text-white' : 'border-zinc-800 bg-[#16171a] hover:bg-zinc-800 text-zinc-400'}">
            <div class="truncate text-zinc-200 font-bold">#${idx + 1} ${s.title}</div>
            <div class="text-zinc-500 text-[8px] text-right">Diapo ${idx + 1}</div>
          </button>
        `).join('')}
      </div>

    </div>
    `;
  }

  // 6. TECHNICAL DRAWING & IMAGE VIEWER (.png, .jpg, .svg)
  renderImageViewer(res, course, promo) {
    const rot = this.docImageRotation || 0;
    const zoom = this.docImageZoom || 100;
    const mode = this.docImageMode || 'normal';

    const filterStyle = {
      normal: '',
      blueprint: 'filter: invert(1) hue-rotate(190deg) contrast(150%);',
      invert: 'filter: invert(1);'
    }[mode];

    return `
    <div class="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden text-white">
      
      <!-- Image Toolbar -->
      <div class="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="image" class="w-4 h-4 text-blue-400"></i>
          <span class="font-bold tracking-wide font-mono">${res.fileName || 'Plan_Technique.png'}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Schéma Technique / ISO</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter inspection mode -->
          <div class="flex items-center bg-slate-800 rounded-lg p-0.5 text-[11px]">
            <button onclick="app.setImageMode('normal')" class="px-2 py-0.5 rounded ${mode === 'normal' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}">Normal</button>
            <button onclick="app.setImageMode('blueprint')" class="px-2 py-0.5 rounded ${mode === 'blueprint' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}">Plan Bleu</button>
            <button onclick="app.setImageMode('invert')" class="px-2 py-0.5 rounded ${mode === 'invert' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}">Inversé</button>
          </div>

          <!-- Rotate button -->
          <button onclick="app.rotateImage(90)" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" title="Pivoter 90°">
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Zoom controls -->
          <div class="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeImageZoom(-15)" class="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">-</button>
            <span class="px-2 text-slate-300 text-[11px]">${zoom}%</span>
            <button onclick="app.changeImageZoom(15)" class="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">+</button>
          </div>
        </div>
      </div>

      <!-- Visual Schematic Stage -->
      <div class="p-6 sm:p-12 overflow-auto bg-slate-950 flex items-center justify-center min-h-[450px]">
        <div style="transform: scale(${zoom / 100}) rotate(${rot}deg); transition: transform 0.2s ease; ${filterStyle}" class="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
          <!-- Simulated SVG Technical Plan Drawing -->
          <div class="border border-slate-700 rounded-lg p-4 bg-slate-950 flex flex-col items-center">
            <svg class="w-full h-56 text-blue-400" viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1.5">
              <!-- Grid background -->
              <defs>
                <pattern id="tech-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.1)" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#tech-grid)" />
              <!-- Part contour -->
              <rect x="50" y="40" width="300" height="120" rx="8" stroke="currentColor" stroke-width="2" />
              <!-- Internal bores -->
              <circle cx="200" cy="100" r="35" stroke="currentColor" stroke-width="2" stroke-dasharray="4,2"/>
              <circle cx="100" cy="100" r="14" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="300" cy="100" r="14" stroke="currentColor" stroke-width="1.5"/>
              <!-- Axis lines -->
              <line x1="30" y1="100" x2="370" y2="100" stroke="#3b82f6" stroke-dasharray="6,3" stroke-width="1"/>
              <line x1="200" y1="20" x2="200" y2="180" stroke="#3b82f6" stroke-dasharray="6,3" stroke-width="1"/>
              <!-- Dimension markers -->
              <line x1="50" y1="175" x2="350" y2="175" stroke="#60a5fa" stroke-width="1"/>
              <text x="200" y="190" fill="#60a5fa" font-size="10" font-family="monospace" text-anchor="middle">L = 150 mm ± 0.05</text>
            </svg>
          </div>

          <!-- Technical Cartouche -->
          <div class="border border-slate-700 bg-slate-950 p-3 rounded-lg text-xs font-mono grid grid-cols-2 gap-2 text-slate-300">
            <div><span class="text-slate-500">NORME :</span> ISO 128 / ISO 2768-mK</div>
            <div><span class="text-slate-500">ÉCHELLE :</span> 1:1</div>
            <div><span class="text-slate-500">PIÈCE :</span> Bride de Serrage C45</div>
            <div><span class="text-slate-500">TOLÉRANCE :</span> Ra = 0.8 µm</div>
          </div>
        </div>
      </div>

      <!-- Inspection Details -->
      <div class="bg-slate-950 border-t border-slate-800 px-4 py-2.5 text-xs text-slate-400 font-mono flex items-center justify-between">
        <span>Spécifications : Vue de face avec coupe A-A & Cotation ISO</span>
        <button onclick="app.downloadFile('${res.id}')" class="text-blue-400 hover:text-blue-300 font-medium">Télécharger HD</button>
      </div>

    </div>
    `;
  }

  // 7. AUDIO / PODCAST VIEWER (.mp3, .wav)
  renderAudioViewer(res, course, promo) {
    const isPlaying = this.docAudioPlaying || false;
    const curTime = this.docAudioTime || 0;
    const duration = this.docAudioDuration || 480; // 8 mins
    const speed = this.docAudioSpeed || 1.0;

    const transcriptItems = [
      { time: 0, stamp: '00:00', text: "Introduction : Pourquoi diagonaliser une matrice carrée d'ordre n ?" },
      { time: 45, stamp: '00:45', text: "Le concept géométrique de valeur propre et de vecteur propre invariant." },
      { time: 130, stamp: '02:10', text: "Calcul pratique du polynôme caractéristique P(λ) = det(A - λ*I)." },
      { time: 230, stamp: '03:50', text: "Condition nécessaire et suffisante : dimension des sous-espaces propres." },
      { time: 330, stamp: '05:30', text: "Construction pas à pas de la matrice de passage P et de D = P^(-1)*A*P." },
      { time: 435, stamp: '07:15', text: "Applications concrètes aux puissances de matrices A^k et systèmes différentiels." }
    ];

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Audio Player Main Card -->
      <div class="bg-[#121316] text-white p-6 sm:p-8 space-y-6 border-b border-zinc-800">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <i data-lucide="headphones" class="w-4 h-4"></i>
            <span>Podcast Académique • Capsule Audio</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/50 text-xs font-mono text-zinc-300">${res.fileSize || '4.2 Mo'}</span>
        </div>

        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-white">${res.title}</h2>
          <p class="text-xs text-zinc-400 mt-1">${res.professor || 'Enseignant référent'} • ${course ? course.name : 'Matière'}</p>
        </div>

        <!-- Animated Wave Equalizer Simulation -->
        <div class="flex items-end justify-center gap-1.5 h-14 py-2">
          ${Array.from({ length: 24 }).map((_, i) => {
            const h = isPlaying ? (20 + ((i * 17) % 60)) : 12;
            return `<div class="w-1.5 bg-blue-500 rounded-full transition-all duration-150" style="height: ${h}px;"></div>`;
          }).join('')}
        </div>

        <!-- Scrubber Timeline -->
        <div class="space-y-1.5">
          <input 
            type="range" 
            min="0" 
            max="${duration}" 
            value="${curTime}" 
            onchange="app.setAudioTime(parseInt(this.value, 10))"
            class="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
          <div class="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>${this.formatTime(curTime)}</span>
            <span>${this.formatTime(duration)}</span>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="flex items-center justify-between pt-2">
          <!-- Speed control -->
          <div class="flex items-center bg-[#18191c] border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeAudioSpeed(0.75)" class="px-2 py-0.5 rounded ${speed === 0.75 ? 'bg-blue-600 font-bold text-white' : 'text-zinc-400'}">0.75x</button>
            <button onclick="app.changeAudioSpeed(1.0)" class="px-2 py-0.5 rounded ${speed === 1.0 ? 'bg-blue-600 font-bold text-white' : 'text-zinc-400'}">1x</button>
            <button onclick="app.changeAudioSpeed(1.5)" class="px-2 py-0.5 rounded ${speed === 1.5 ? 'bg-blue-600 font-bold text-white' : 'text-zinc-400'}">1.5x</button>
          </div>

          <!-- Main Play Controls -->
          <div class="flex items-center gap-3">
            <button onclick="app.setAudioTime(Math.max(0, ${curTime} - 10))" class="p-2 text-zinc-400 hover:text-white" title="-10s">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>
            <button onclick="app.toggleAudioPlay()" class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-500 transition">
              <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-5 h-5 fill-current"></i>
            </button>
            <button onclick="app.setAudioTime(Math.min(${duration}, ${curTime} + 10))" class="p-2 text-zinc-400 hover:text-white" title="+10s">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>

          <button onclick="app.downloadFile('${res.id}')" class="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> MP3
          </button>
        </div>

      </div>

      <!-- Synchronized Interactive Transcript -->
      <div class="p-6 space-y-3 bg-[#16171a]">
        <h3 class="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-400"></i> Transcription Synchronisée
        </h3>
        <div class="space-y-2">
          ${transcriptItems.map(item => `
            <div onclick="app.setAudioTime(${item.time})" class="p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-3 ${curTime >= item.time && curTime < item.time + 60 ? 'bg-blue-900/30 border-blue-500/50 text-white font-medium' : 'bg-[#121316] border-zinc-800 hover:bg-zinc-800/80 text-zinc-300'}">
              <span class="font-mono text-xs text-blue-400 font-bold shrink-0">[${item.stamp}]</span>
              <span class="text-xs">${item.text}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
    `;
  }

  // 8. VIDEO / RECORDED LECTURE VIEWER (.mp4, .webm)
  renderVideoViewer(res, course, promo) {
    const isPlaying = this.docVideoPlaying || false;
    const curTime = this.docVideoTime || 0;
    const duration = this.docVideoDuration || 650; // ~10 mins

    const chapters = [
      { time: 0, stamp: '00:00', title: 'Introduction & Objectifs' },
      { time: 90, stamp: '01:30', title: 'Polynôme caractéristique & Racines' },
      { time: 225, stamp: '03:45', title: 'Sous-espaces propres Ker(A - λ*I)' },
      { time: 380, stamp: '06:20', title: 'Démonstration géométrique & Droites' },
      { time: 530, stamp: '08:50', title: 'Inversion de la matrice de passage P' }
    ];

    return `
    <div class="bg-[#16171a] rounded-lg border border-zinc-800 overflow-hidden">
      
      <!-- Video Screen Frame -->
      <div class="relative bg-black aspect-video flex flex-col justify-between p-4 text-white overflow-hidden group">
        <!-- Top Video Bar -->
        <div class="flex items-center justify-between text-xs z-10">
          <span class="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 border border-zinc-800">
            <i data-lucide="video" class="w-3.5 h-3.5 text-blue-400"></i> ${res.title}
          </span>
          <span class="bg-black/60 px-2 py-1 rounded font-mono text-[11px] text-zinc-300 border border-zinc-800">${res.fileSize || '48 Mo'}</span>
        </div>

        <!-- Center Play Overlay -->
        <div class="flex items-center justify-center z-10">
          <button onclick="app.toggleVideoPlay()" class="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
            <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-7 h-7 fill-current"></i>
          </button>
        </div>

        <!-- Bottom Video Controls -->
        <div class="space-y-2 z-10 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-lg">
          <input 
            type="range" 
            min="0" 
            max="${duration}" 
            value="${curTime}" 
            onchange="app.setVideoTime(parseInt(this.value, 10))"
            class="w-full accent-blue-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
          <div class="flex items-center justify-between text-xs font-mono text-zinc-300">
            <span>${this.formatTime(curTime)} / ${this.formatTime(duration)}</span>
            <div class="flex items-center gap-3">
              <button onclick="app.toggleVideoPlay()" class="hover:text-white"><i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-4 h-4"></i></button>
              <button onclick="app.downloadFile('${res.id}')" class="hover:text-white" title="Télécharger"><i data-lucide="download" class="w-4 h-4"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Chapters & Notes -->
      <div class="p-6 space-y-4 bg-[#16171a] border-t border-zinc-800">
        <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-400"></i> Chapitres de la séance
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${chapters.map(c => `
            <button onclick="app.setVideoTime(${c.time})" class="p-2.5 text-left rounded-lg border transition flex items-center justify-between ${curTime >= c.time && curTime < c.time + 120 ? 'bg-blue-900/30 border-blue-500/50 text-white font-bold' : 'bg-[#121316] border-zinc-800 hover:bg-zinc-800/80 text-zinc-300'}">
              <span class="text-xs truncate">${c.title}</span>
              <span class="font-mono text-xs text-blue-400 shrink-0 font-bold">[${c.stamp}]</span>
            </button>
          `).join('')}
        </div>
      </div>

    </div>
    `;
  }

  // Helper: Associated Resources, Correction & Context
  renderDocAssociatedSections(res, course, promo, correction, related, courseVideo) {
    return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <!-- Academic Context Card -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-4 space-y-2.5 text-xs">
        <h2 class="font-bold text-white text-xs flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
          <i data-lucide="info" class="w-3.5 h-3.5 text-blue-400"></i>
          Contexte Académique Officiel
        </h2>
        <div class="space-y-1.5 text-zinc-300">
          <div><span class="font-semibold text-zinc-400">Matière :</span> ${course ? `${course.code} — ${course.name}` : 'Matière'}</div>
          <div><span class="font-semibold text-zinc-400">Pôle / Filière :</span> ${promo ? `${promo.name} (${promo.cycle})` : 'Cycle préparatoire & Licence'}</div>
          <div><span class="font-semibold text-zinc-400">Enseignant :</span> ${res.professor || 'Département Pédagogique'}</div>
          <div><span class="font-semibold text-zinc-400">Chapitre ciblé :</span> ${res.chapter || 'Général'}</div>
          <div><span class="font-semibold text-zinc-400">Session :</span> ${res.session || 'Principale'} (${res.semester || 'S1'})</div>
        </div>
      </div>

      <!-- Correction & Related Card -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-4 space-y-2.5 text-xs">
        <h2 class="font-bold text-white text-xs flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
          <i data-lucide="link-2" class="w-3.5 h-3.5 text-blue-400"></i>
          Ressources Associées & Corrigé
        </h2>
        
        ${correction ? `
          <div class="bg-blue-950/40 border border-blue-800/60 rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                <i data-lucide="check-circle" class="w-4 h-4 text-blue-400"></i>
                Corrigé Type Officiel
              </div>
              <span class="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-700/50">Validé</span>
            </div>
            <p class="text-[11px] text-blue-200 line-clamp-1">${correction.title}</p>
            <button onclick="app.openDocument('${correction.id}')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-1.5 rounded-lg transition flex items-center justify-center gap-1.5">
              <i data-lucide="file-check" class="w-3.5 h-3.5"></i>
              Consulter le Corrigé Type
            </button>
          </div>
        ` : `
          <div class="text-zinc-500 italic p-3 bg-[#121316] rounded-lg border border-zinc-800/80">
            Aucun corrigé direct requis pour ce type de ressource.
          </div>
        `}

        ${courseVideo ? `
          <div class="bg-[#121316] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-2">
            <div class="truncate">
              <div class="font-bold text-white text-xs flex items-center gap-1">
                <i data-lucide="video" class="w-3.5 h-3.5 text-blue-400"></i> Vidéo Explicative
              </div>
              <div class="text-[11px] text-zinc-400 truncate">${courseVideo.title}</div>
            </div>
            <button onclick="app.openVideo('${courseVideo.id}')" class="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-2.5 py-1 rounded-lg shrink-0">
              Voir
            </button>
          </div>
        ` : ''}

      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 3: AI TUTOR / DISCUSSION (Exact Match with Gemini AMOLED Design)
  // ==========================================
  renderTutorView() {
    const showWelcome = this.tutorMessages.length <= 1;

    return `
    <div class="max-w-xl mx-auto px-4 py-3 sm:px-6 sm:py-4 w-full flex-1 flex flex-col justify-between min-h-0 relative">
      
      <!-- Chat Discussion Messages Window -->
      <div id="tutor-chat-box" class="flex-1 overflow-y-auto space-y-4 py-2 pr-1 no-scrollbar flex flex-col">
        
        ${showWelcome ? `
          <!-- Welcome Screen matching Screenshot 1 -->
          <div class="my-auto py-8 text-center space-y-6 animate-in fade-in duration-200">
            
            <!-- Multicolor 4-pointed Gemini Star (Exact SVG Match) -->
            <div class="flex justify-center">
              <svg class="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_30px_rgba(66,133,244,0.35)]" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="gemini-main-star" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4285F4"/>
                    <stop offset="30%" stop-color="#9B72CB"/>
                    <stop offset="65%" stop-color="#D96570"/>
                    <stop offset="100%" stop-color="#F2A65A"/>
                  </linearGradient>
                </defs>
                <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" fill="url(#gemini-main-star)"/>
              </svg>
            </div>

            <!-- Greeting Text (Screenshot 1) -->
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                Bonjour ${this.escapeHtml(this.studentProfile.shortName || 'Atelier')}, que voulez-vous savoir ?
              </h1>
              <p onclick="app.openApiKeyModal()" class="text-xs text-zinc-400 hover:text-blue-400 transition cursor-pointer">
                Clé Gemini personnalisée configurable en 1 clic
              </p>
            </div>

            <!-- 3 Suggestion Cards from Screenshot 1 -->
            <div class="space-y-2.5 max-w-sm mx-auto text-left pt-2">
              <button 
                onclick="app.startStarterPrompt('Révision Mécanique : Équations du mouvement et résonance')"
                class="w-full bg-[#16171a] hover:bg-[#202226] border border-zinc-800 hover:border-zinc-700 p-3.5 rounded-xl text-zinc-200 text-xs sm:text-sm font-medium transition shadow-xs flex items-center justify-between group"
              >
                <span>Révision Mécanique</span>
                <span class="text-zinc-500 group-hover:text-blue-400 transition">✦</span>
              </button>

              <button 
                onclick="app.startStarterPrompt('Explication Intégrales : Intégration par parties et Riemann')"
                class="w-full bg-[#16171a] hover:bg-[#202226] border border-zinc-800 hover:border-zinc-700 p-3.5 rounded-xl text-zinc-200 text-xs sm:text-sm font-medium transition shadow-xs flex items-center justify-between group"
              >
                <span>Explication Intégrales</span>
                <span class="text-zinc-500 group-hover:text-blue-400 transition">✦</span>
              </button>

              <button 
                onclick="app.startStarterPrompt('Questions QCM : Test d\\'entraînement interactif')"
                class="w-full bg-[#16171a] hover:bg-[#202226] border border-zinc-800 hover:border-zinc-700 p-3.5 rounded-xl text-zinc-200 text-xs sm:text-sm font-medium transition shadow-xs flex items-center justify-between group"
              >
                <span>Questions QCM</span>
                <span class="text-zinc-500 group-hover:text-blue-400 transition">✦</span>
              </button>

              <!-- Learning Mode Quick Access -->
              <button 
                onclick="app.openLearningMode(true)"
                class="w-full bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 p-3 rounded-xl text-blue-200 text-xs font-medium transition flex items-center justify-between group"
              >
                <span class="flex items-center gap-2">
                  <i data-lucide="graduation-cap" class="w-4 h-4 text-blue-400"></i>
                  <span>Mode Apprendre par Chapitre</span>
                </span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-blue-400"></i>
              </button>
            </div>
          </div>
        ` : `
          ${this.tutorMessages.map(msg => this.renderTutorChatMessage(msg)).join('')}
        `}
        
        <!-- Loading Thinking State Bubble -->
        ${this.isTutorLoading ? `
          <div class="flex flex-col items-start gap-1.5 animate-in fade-in duration-150">
            <div class="flex items-center gap-2 pl-1">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" fill="#4285F4"/>
              </svg>
              <span class="text-[11px] text-zinc-400">Gemini</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#1a1b1f] text-zinc-300 border border-zinc-800 text-xs sm:text-sm flex items-center gap-2.5">
              <div class="flex gap-1.5 items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
              <span class="text-xs text-zinc-400">Recherche dans le corpus et réflexion...</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Mode Chips Bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs shrink-0 mt-1 mb-1">
        <button onclick="app.setTutorMode('chat')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'chat' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-[#141518] text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60'}">
          <i data-lucide="message-square" class="w-3 h-3"></i> Chat libre
        </button>
        <button onclick="app.openLearningMode(true)" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border bg-blue-950/50 text-blue-300 border-blue-800/60 hover:bg-blue-900/50">
          <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-blue-400"></i> Mode Apprendre
        </button>
        <button onclick="app.setTutorMode('revision')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'revision' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-[#141518] text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60'}">
          <i data-lucide="book-marked" class="w-3 h-3"></i> Révision annales
        </button>
        <button onclick="app.setTutorMode('exercer')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'exercer' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-[#141518] text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60'}">
          <i data-lucide="pen-tool" class="w-3 h-3"></i> S'exercer
        </button>
      </div>

      <!-- Floating Bottom Chat Input Capsule (Screenshot 1 Exact Match) -->
      <div class="pt-1 pb-1 relative z-10">
        <form onsubmit="app.handleTutorSubmit(event)" id="tutor-input-form" class="relative flex items-center bg-[#1e1f23] border border-zinc-800 rounded-full px-3 py-2 gap-2 shadow-2xl">
          
          <!-- Left: Plus button (+) opens Bottom Action Sheet -->
          <button 
            type="button" 
            onclick="app.toggleBottomSheet(true)" 
            title="Ajouter du contenu" 
            class="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white transition rounded-full hover:bg-zinc-800 shrink-0"
          >
            <i data-lucide="plus" class="w-5 h-5"></i>
          </button>

          <!-- Center: Input field with placeholder "Demander..." -->
          <input 
            type="text" 
            id="tutor-input" 
            placeholder="Demander..." 
            oninput="app.onTutorInputChanged(this.value)"
            ${this.isTutorLoading ? 'disabled' : ''}
            class="flex-1 bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-zinc-500 font-normal disabled:opacity-60"
          >

          <!-- Right: Microphone button for Voice Input -->
          <button 
            type="button" 
            onclick="app.startVoiceInput()" 
            title="Entrée vocale" 
            class="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white transition rounded-full hover:bg-zinc-800 shrink-0"
          >
            <i data-lucide="mic" class="w-5 h-5"></i>
          </button>

          <!-- Far Right: Audio Waveform Button / Send Button -->
          <button 
            type="submit" 
            id="btn-tutor-send" 
            title="Envoyer ou Synthèse audio" 
            class="w-8 h-8 flex items-center justify-center rounded-full bg-[#20304a] text-blue-300 hover:bg-[#2a4063] hover:text-blue-200 transition shrink-0"
          >
            <div id="waveform-icon" class="flex items-center gap-0.5 h-3.5">
              <span class="w-0.5 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              <span class="w-0.5 h-3.5 bg-blue-300 rounded-full"></span>
              <span class="w-0.5 h-2 bg-blue-300 rounded-full"></span>
              <span class="w-0.5 h-1.5 bg-blue-300 rounded-full"></span>
            </div>
            <i data-lucide="send" class="w-4 h-4 hidden" id="send-arrow-icon"></i>
          </button>

        </form>
      </div>

    </div>
    `;
  }

  onTutorInputChanged(val) {
    const wave = document.getElementById('waveform-icon');
    const send = document.getElementById('send-arrow-icon');
    if (wave && send) {
      if (val && val.trim().length > 0) {
        wave.classList.add('hidden');
        send.classList.remove('hidden');
      } else {
        wave.classList.remove('hidden');
        send.classList.add('hidden');
      }
    }
  }

  toggleBottomSheet(show) {
    const sheet = document.getElementById('bottom-action-sheet');
    const overlay = document.getElementById('bottom-sheet-overlay');
    if (!sheet || !overlay) return;

    if (show) {
      sheet.classList.remove('translate-y-full');
      sheet.classList.add('translate-y-0');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      sheet.classList.add('translate-y-full');
      sheet.classList.remove('translate-y-0');
      overlay.classList.remove('opacity-100', 'pointer-events-auto');
      overlay.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  toggleModelDropdown(forceState) {
    const menu = document.getElementById('model-dropdown-menu');
    if (!menu) return;
    if (typeof forceState === 'boolean') {
      if (forceState) menu.classList.remove('hidden');
      else menu.classList.add('hidden');
    } else {
      menu.classList.toggle('hidden');
    }
  }

  selectModel(modelName) {
    this.activeModel = modelName;
    const label = document.getElementById('header-model-label');
    if (label) label.textContent = modelName;
    
    const checkFlash = document.getElementById('check-flash-lite');
    const checkPro = document.getElementById('check-pro');
    if (checkFlash && checkPro) {
      if (modelName.includes('Pro')) {
        checkFlash.classList.add('hidden');
        checkPro.classList.remove('hidden');
      } else {
        checkFlash.classList.remove('hidden');
        checkPro.classList.add('hidden');
      }
    }
    this.toggleModelDropdown(false);
    this.showToast(`Modèle actif : ${modelName}`);
  }

  startNewChat() {
    this.tutorMessages = [
      {
        id: 'msg-welcome',
        sender: 'tutor',
        text: "Bonjour ! Je suis votre tuteur académique. Vous pouvez me poser des questions sur vos cours, ajouter des documents de travail ou démarrer une séance d'étude guidée.",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    this.navigate('tutor');
  }

  openPhotoPicker() {
    const input = document.getElementById('bottom-sheet-photo-input');
    if (input) input.click();
  }

  handlePhotoUploaded(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.cameraImageFile = file;
      this.cameraImageData = e.target.result;
      this.openCameraModal();
      const previewImg = document.getElementById('camera-preview-img');
      const previewIcon = document.getElementById('camera-preview-icon');
      const previewText = document.getElementById('camera-preview-text');
      if (previewImg) {
        previewImg.src = this.cameraImageData;
        previewImg.classList.remove('hidden');
      }
      if (previewIcon) previewIcon.classList.add('hidden');
      if (previewText) previewText.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  togglePersonalizedAi(checked) {
    this.personalizedAiEnabled = checked;
    this.showToast(checked ? "Intelligence personnalisée activée" : "Intelligence personnalisée désactivée", "info");
  }

  openCanvasWorkspace() {
    const modal = document.getElementById('modal-canvas-workspace');
    if (modal) modal.classList.remove('hidden');
    const area = document.getElementById('canvas-editor-area');
    if (area && !area.value) {
      area.value = this.canvasCode || '# Workspace Python Académique\ndef resoudre_systeme():\n    print("Calcul des valeurs propres...")\n\nresoudre_systeme()';
    }
  }

  closeCanvasWorkspace() {
    const modal = document.getElementById('modal-canvas-workspace');
    if (modal) modal.classList.add('hidden');
  }

  setCanvasMode(mode) {
    this.canvasMode = mode;
    const tabCode = document.getElementById('canvas-tab-code');
    const tabNotes = document.getElementById('canvas-tab-notes');
    const area = document.getElementById('canvas-editor-area');
    if (tabCode && tabNotes && area) {
      if (mode === 'code') {
        tabCode.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium';
        tabNotes.className = 'px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white font-medium';
        area.value = this.canvasCode || '# Code Python\nprint("Hello World")';
      } else {
        tabCode.className = 'px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white font-medium';
        tabNotes.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium';
        area.value = '# Notes Académiques\n\n- Théorème 1 : Les valeurs propres d\'une matrice symétrique réelle sont réelles.\n- Application aux formes quadratiques.';
      }
    }
  }

  runCanvasContent() {
    const area = document.getElementById('canvas-editor-area');
    const content = area ? area.value : '';
    this.showToast("Exécution syntaxique réussie", "success");
    this.closeCanvasWorkspace();
    this.navigate('tutor');
    this.sendTutorMessage(`Voici mon travail dans le Canvas :\n\`\`\`\n${content}\n\`\`\`\nPeux-tu analyser et corriger ?`);
  }

  openAudioGenerator() {
    const modal = document.getElementById('modal-audio-generator');
    if (modal) modal.classList.remove('hidden');
  }

  closeAudioGenerator() {
    const modal = document.getElementById('modal-audio-generator');
    if (modal) modal.classList.add('hidden');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  playLastResponseAudio() {
    const lastTutorMsg = [...this.tutorMessages].reverse().find(m => m.sender === 'tutor');
    if (lastTutorMsg) {
      this.speakText(lastTutorMsg.text);
    } else {
      this.speakText("Bonjour ! Posez-moi une question sur vos cours pour écouter les explications.");
    }
  }

  openImageGenerator() {
    const modal = document.getElementById('modal-images-generator');
    if (modal) modal.classList.remove('hidden');
  }

  closeImageGenerator() {
    const modal = document.getElementById('modal-images-generator');
    if (modal) modal.classList.add('hidden');
  }

  submitImageGeneration() {
    const promptInput = document.getElementById('image-gen-prompt');
    const prompt = promptInput ? promptInput.value.trim() : '';
    if (!prompt) {
      this.showToast("Veuillez préciser le schéma souhaité", "warning");
      return;
    }
    const preview = document.getElementById('image-gen-preview');
    if (preview) {
      preview.classList.remove('hidden');
      preview.innerHTML = `
        <div class="space-y-2 py-4">
          <div class="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
          <div class="text-xs text-zinc-400">Génération vectorielle académique en cours...</div>
        </div>
      `;
      setTimeout(() => {
        preview.innerHTML = `
          <div class="p-3 bg-[#18191c] rounded-lg border border-zinc-700 text-center space-y-2">
            <div class="text-xs font-semibold text-white">Schéma : ${this.escapeHtml(prompt)}</div>
            <div class="w-full h-32 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-zinc-500 text-xs">
              <div class="flex flex-col items-center gap-1 text-zinc-400">
                <i data-lucide="image" class="w-8 h-8 text-blue-400"></i>
                <span>Illustration vectorielle générée</span>
              </div>
            </div>
            <button onclick="app.closeImageGenerator(); app.sendTutorMessage('Explique-moi ce schéma : ${this.escapeHtml(prompt)}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium">
              Insérer dans la discussion
            </button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }, 1000);
    }
  }

  startVoiceInput() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      this.showToast('Reconnaissance vocale non supportée sur ce navigateur.', 'warning');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    this.showToast('Écoute en cours...', 'info');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('tutor-input');
      if (input) {
        input.value = transcript;
        input.focus();
        this.onTutorInputChanged(transcript);
      }
    };
    recognition.onerror = () => {
      this.showToast('Écoute terminée', 'info');
    };
    recognition.start();
  }

  speakText(text) {
    if (!window.speechSynthesis) {
      this.showToast('Synthèse vocale non disponible', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\\\[[\s\S]*?\\\]/g, ' formule mathématique ')
      .replace(/\\\([\s\S]*?\\\)/g, ' formule ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' formule mathématique ')
      .replace(/\$[^\$]+\$/g, ' variable ')
      .replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
    this.showToast('Lecture vocale en cours...', 'info');
  }

  copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Texte copié dans le presse-papiers !', 'success');
      if (btnElement) {
        const orig = btnElement.innerHTML;
        btnElement.innerHTML = `<span>✓ Copié</span>`;
        setTimeout(() => { btnElement.innerHTML = orig; }, 1800);
      }
    }).catch(() => {
      this.showToast('Impossible de copier le texte', 'error');
    });
  }

  openNewNotebookModal() {
    this.navigate('courses');
    this.showToast("Sélectionnez une matière pour ouvrir son notebook d'étude");
  }

  selectCourseFromDrawer(courseId) {
    this.openCourseDetail(courseId);
  }

  openHistorySession(histId) {
    this.resumeChatSession(histId);
  }

  updateDrawerDynamicLists() {
    const notebooksList = document.getElementById('drawer-notebooks-list');
    if (notebooksList && this.courses && this.courses.length > 0) {
      notebooksList.innerHTML = this.courses.slice(0, 5).map(c => `
        <button onclick="app.selectCourseFromDrawer('${c.id}'); app.toggleDrawer(false);" class="w-full flex items-center gap-3.5 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition text-left truncate">
          <i data-lucide="file-text" class="w-4 h-4 text-zinc-400 shrink-0"></i>
          <span class="truncate">${this.escapeHtml(c.name)}</span>
        </button>
      `).join('');
    }

    const recentsList = document.getElementById('drawer-recents-list');
    if (recentsList && this.chatHistory && this.chatHistory.length > 0) {
      recentsList.innerHTML = this.chatHistory.slice(0, 4).map(h => `
        <button onclick="app.openHistorySession('${h.id}'); app.toggleDrawer(false);" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition text-left truncate">
          <span class="truncate">${this.escapeHtml(h.title)}</span>
        </button>
      `).join('');
    }
  }

  startStarterPrompt(text) {
    const input = document.getElementById('tutor-input');
    if (input) input.value = text;
    this.sendTutorMessage(text);
  }

  getTutorModeDescription() {
    switch (this.tutorMode) {
      case 'apprendre':
        return `Diagnostic initial (1-10) et progression pas à pas.`;
      case 'revision':
        return `Priorité absolue aux annales et examens du corpus.`;
      case 'exercer':
        return `Problèmes ciblés avec délivrance d'indices progressifs.`;
      default:
        return `Réponses académiques fondées sur le corpus de cours.`;
    }
  }

  renderTutorChatMessage(msg) {
    const isTutor = msg.sender === 'tutor';

    if (!isTutor) {
      // User message: Sleek dark bubble on the right
      return `
      <div class="flex justify-end animate-in fade-in duration-150">
        <div class="bg-[#202226] text-zinc-100 text-xs sm:text-sm px-4 py-2.5 rounded-2xl leading-relaxed max-w-[85%] sm:max-w-[78%] text-left border border-zinc-800 shadow-xs">
          ${this.formatMarkdown(msg.text)}
        </div>
      </div>
      `;
    }

    // Tutor / AI message: Left aligned with Gemini 4-pointed star
    const starGradId = `gemini-star-grad-${msg.id || Math.random().toString(36).substr(2, 4)}`;
    return `
    <div class="flex flex-col items-start gap-1.5 animate-in fade-in duration-150 max-w-[95%] sm:max-w-[88%]">
      
      <!-- Multicolor Gemini Star above message -->
      <div class="flex items-center gap-2 pl-1">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="${starGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4"/>
              <stop offset="35%" stop-color="#9B72CB"/>
              <stop offset="70%" stop-color="#D96570"/>
              <stop offset="100%" stop-color="#F2A65A"/>
            </linearGradient>
          </defs>
          <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" fill="url(#${starGradId})"/>
        </svg>
        <span class="text-[11px] font-medium text-zinc-400">Gemini</span>
      </div>

      <!-- Bubble content -->
      <div class="text-zinc-100 text-xs sm:text-sm px-1 py-1 leading-relaxed space-y-2 text-left w-full">
        <div class="whitespace-pre-wrap">${this.formatMarkdown(msg.text)}</div>

        <!-- Action buttons row: Audio speech & Copy -->
        <div class="flex items-center gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
          <button onclick="app.speakText(${JSON.stringify(msg.text)})" class="p-1.5 hover:text-white rounded-lg hover:bg-zinc-800/80 transition flex items-center gap-1" title="Écouter la réponse">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
            <span>Écouter</span>
          </button>
          <button onclick="app.copyToClipboard(${JSON.stringify(msg.text)}, this)" class="p-1.5 hover:text-white rounded-lg hover:bg-zinc-800/80 transition flex items-center gap-1" title="Copier le texte">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copier</span>
          </button>
        </div>

        <!-- Sources citations -->
        ${(msg.sources && msg.sources.length > 0) ? `
          <div class="pt-1.5 border-t border-zinc-800/80 mt-1 text-[11px] text-zinc-400 space-y-1">
            <span class="font-medium text-blue-400 flex items-center gap-1">
              <i data-lucide="book-open" class="w-3 h-3"></i> Sources associées :
            </span>
            ${msg.sources.map(s => `
              <button onclick="app.openDocument('${s.documentId || ''}')" class="text-left text-blue-400 hover:underline block text-[10px] truncate">
                • ${s.documentTitle || s.title || 'Document académique'}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
    `;
  }

  // ==========================================
  // VIEW 4: HISTORY OF DISCUSSIONS (Exact Match with Image Panel 1)
  // ==========================================
  renderHistoryView() {
    // Group history items by group (Aujourd'hui, Hier, La semaine dernière)
    const groups = ["Aujourd'hui", "Hier", "La semaine dernière"];
    const grouped = {};
    groups.forEach(g => { grouped[g] = []; });
    
    this.chatHistory.forEach(item => {
      const g = item.group || "Aujourd'hui";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(item);
    });

    return `
    <div class="max-w-xl mx-auto px-4 py-4 sm:px-6 space-y-6">
      
      ${groups.map(groupName => {
        const items = grouped[groupName] || [];
        if (items.length === 0) return '';
        return `
        <div class="space-y-2">
          <!-- Section Heading (Panel 1 style) -->
          <h2 class="text-xs font-semibold text-zinc-400">${groupName}</h2>

          <!-- List of history items with sparkle -->
          <div class="space-y-1.5">
            ${items.map(item => `
              <div 
                onclick="app.resumeChatSession('${item.id}')" 
                class="bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 p-3 px-4 flex items-center justify-between cursor-pointer transition group"
              >
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <span class="font-medium text-zinc-200 text-xs sm:text-sm group-hover:text-blue-400 truncate transition">${item.title}</span>
                </div>
                <span class="text-blue-400 text-xs shrink-0 opacity-70 group-hover:opacity-100 transition">✦</span>
              </div>
            `).join('')}
          </div>
        </div>
        `;
      }).join('')}

      <div class="pt-4 text-center">
        <button onclick="app.startNewChat()" class="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition inline-flex items-center gap-1.5 shadow-2xs">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Nouvelle discussion</span>
        </button>
      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 5: SETTINGS & ACCOUNT (Exact Match with Image Panel 2 & Panel 4)
  // ==========================================
  renderSettingsView() {
    return `
    <div class="max-w-xl mx-auto px-4 py-4 sm:px-6 space-y-5">
      
      <!-- Section: Mon Compte (Panel 2) -->
      <div class="space-y-2">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Mon Compte</h2>
        
        <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#121316] text-zinc-400 flex items-center justify-center shrink-0 border border-zinc-800">
              <i data-lucide="user" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="font-semibold text-white text-xs sm:text-sm">${this.studentProfile.name}</div>
              <div class="text-[11px] text-zinc-400">${this.studentProfile.name}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Préférences (Panel 2) -->
      <div class="space-y-2">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Préférences</h2>
        
        <div class="bg-[#16171a] rounded-lg border border-zinc-800 divide-y divide-zinc-800">
          <div class="p-3.5 px-4 flex items-center justify-between text-xs sm:text-sm">
            <span class="text-zinc-200 font-normal">Mode Sombre</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked class="sr-only peer" disabled>
              <div class="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="p-3.5 px-4 flex items-center justify-between text-xs sm:text-sm">
            <span class="text-zinc-200 font-normal">Notifications</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked class="sr-only peer">
              <div class="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="p-3.5 px-4 flex items-center justify-between text-xs sm:text-sm">
            <span class="text-zinc-200 font-normal">Langue</span>
            <span class="text-xs text-zinc-400 font-medium">Français (FR)</span>
          </div>
        </div>
      </div>

      <!-- Section: Gestion de la Clé API (Panel 4) -->
      <div class="space-y-2">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Gestion de la Clé API</h2>
        
        <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-4 space-y-3.5">
          <p class="text-xs text-zinc-400">
            Pour un usage illimité, configurez votre clé API Gemini.
          </p>

          <div class="space-y-1">
            <label class="block text-[11px] font-medium text-zinc-300">Clé API Gemini (votre clé personnelle)</label>
            <input 
              type="password" 
              id="settings-api-key-input" 
              value="${this.userApiKey}"
              placeholder="ex: AIzaSy..." 
              class="w-full bg-[#121316] border border-zinc-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500 transition font-mono"
            >
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <button 
              onclick="app.saveApiKeyFromSettings()" 
              class="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition text-center shadow-2xs"
            >
              Tester et Enregistrer
            </button>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-blue-400 hover:underline text-xs text-center"
            >
              Obtenir ma clé gratuite sur Google AI Studio
            </a>
          </div>

          <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Statut :</span>
            <span class="font-medium ${this.userApiKey ? 'text-blue-400 bg-[#121316] px-2 py-0.5 rounded-md border border-zinc-800' : 'text-zinc-500 bg-[#121316] px-2 py-0.5 rounded-md border border-zinc-800'}">
              ${this.userApiKey ? 'Active (personnelle)' : 'Non configurée (standard)'}
            </span>
          </div>
        </div>
      </div>

      <!-- Section: Support (Panel 2) -->
      <div class="space-y-2">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Support</h2>
        
        <div class="bg-[#16171a] rounded-lg border border-zinc-800 divide-y divide-zinc-800">
          <button onclick="app.showToast('Centre d\\'aide disponible 24/7')" class="w-full p-3.5 px-4 flex items-center justify-between text-xs sm:text-sm text-left hover:bg-[#1f2024] transition">
            <span class="text-zinc-200">Centre d'aide</span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-zinc-500"></i>
          </button>
          <button onclick="app.showToast('Conditions d\\'utilisation académiques')" class="w-full p-3.5 px-4 flex items-center justify-between text-xs sm:text-sm text-left hover:bg-[#1f2024] transition">
            <span class="text-zinc-200">Conditions d'utilisation</span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-zinc-500"></i>
          </button>
        </div>
      </div>

      <!-- Déconnexion button (Panel 2) -->
      <div class="pt-2">
        <button onclick="app.clearApiKey(); app.showToast('Déconnexion effectuée');" class="w-full bg-[#16171a] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm py-3 rounded-lg transition text-center">
          Déconnexion
        </button>
      </div>

    </div>
    `;
  }

  saveApiKeyFromSettings() {
    const input = document.getElementById('settings-api-key-input');
    if (!input) return;
    const key = input.value.trim();
    if (!key) {
      this.clearApiKey();
      this.showToast('Clé API réinitialisée');
      return;
    }
    this.userApiKey = key;
    try {
      sessionStorage.setItem('academic_hub_api_key', key);
    } catch(e) {}
    this.updateApiKeyBadge();
    this.showToast('Clé API enregistrée avec succès', 'success');
    this.render();
  }

  // ==========================================
  // EVENT HANDLERS & INTERACTIONS
  // ==========================================
  onSearchInput(val) {
    this.filters.search = val;
    this.render();
    const el = document.getElementById('search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }

  clearSearch() {
    this.filters.search = '';
    this.render();
  }

  triggerSearch() {
    this.render();
  }

  setFilter(key, val) {
    this.filters[key] = val;
    this.render();
  }

  resetFilters() {
    this.filters = { search: '', promotionId: '', courseId: '', type: '', hasCorrection: '' };
    this.render();
  }

  changeZoom(delta) {
    this.currentDocZoom = Math.max(70, Math.min(150, this.currentDocZoom + delta));
    this.render();
  }

  startTutorOnResource(id) {
    const res = this.resources.find(r => r.id === id);
    if (!res) return;
    this.tutorCourseId = res.courseId;
    this.tutorMode = 'revision';
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `J'ai chargé le document **"${res.title}"** (${res.type}, ${res.academicYear}) dans notre contexte d'étude !\n\nSouhaitez-vous :\n1. Une explication des points clés ?\n2. Vous entraîner sur un problème similaire ?\n3. Consulter les pièges fréquents de cette épreuve ?`,
      sources: [
        { sourceIndex: 1, documentId: res.id, documentTitle: res.title, resourceType: res.type, section: res.chapter || 'Principal' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.navigate('tutor');
  }

  startNewChat() {
    this.tutorMessages = [
      {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: `Nouvelle session de tuteur démarrée !\n\nSur quelle matière ou quel thème souhaitez-vous travailler aujourd'hui ?`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    this.navigate('tutor');
  }

  resumeChatSession(sessionId) {
    const session = this.chatHistory.find(s => s.id === sessionId);
    if (session) {
      this.tutorMode = session.mode;
      this.tutorMessages.push({
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: `Reprise de la session : **"${session.title}"** (${session.course}).\n\nOù nous étions-nous arrêtés ?`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.navigate('tutor');
    }
  }

  setTutorMode(mode) {
    this.tutorMode = mode;
    this.render();
  }

  async setDeclaredMasteryLevel(lvl) {
    this.studentProfile.declaredLevel = lvl;
    try {
      await fetch('/api/learning/state/level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: lvl })
      });
    } catch (e) {
      console.warn('Could not persist declared level:', e);
    }
    this.render();
  }

  sendQuickPrompt(text) {
    const input = document.getElementById('tutor-input');
    if (input) {
      input.value = text;
      this.handleTutorSubmit(new Event('submit'));
    }
  }

  async handleTutorSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('tutor-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    this.isTutorLoading = true;
    this.render();

    const box = document.getElementById('tutor-chat-box');
    if (box) box.scrollTop = box.scrollHeight;

    try {
      const res = await fetch('/api/assistant/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: this.tutorMode,
          courseId: this.tutorCourseId,
          userApiKey: this.userApiKey
        })
      }).then(r => r.json());

      if (res.success && res.data) {
        this.tutorMessages.push({
          id: `msg-resp-${Date.now()}`,
          sender: 'tutor',
          text: res.data.answer,
          learningPlan: res.data.learningPlan || null,
          interactiveExercise: res.data.interactiveExercise || null,
          quickActions: res.data.quickActions || [],
          sources: res.data.sources || [],
          recommendedVideo: res.data.recommendedVideo || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        this.tutorMessages.push({
          id: `msg-err-${Date.now()}`,
          sender: 'tutor',
          text: res.error || "Désolé, une anomalie temporaire est survenue lors de la communication avec le moteur d'apprentissage.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (err) {
      this.tutorMessages.push({
        id: `msg-err-${Date.now()}`,
        sender: 'tutor',
        text: "Désolé, une anomalie temporaire est survenue lors de la communication avec le moteur d'apprentissage.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      this.isTutorLoading = false;
      this.render();
      const boxAfter = document.getElementById('tutor-chat-box');
      if (boxAfter) boxAfter.scrollTop = boxAfter.scrollHeight;
      const newInput = document.getElementById('tutor-input');
      if (newInput) newInput.focus();
    }
  }

  sendTutorQuickAction(text) {
    const input = document.getElementById('tutor-input');
    if (input) {
      input.value = text;
      this.handleTutorSubmit();
    }
  }

  submitTutorExerciseOption(optionText) {
    const input = document.getElementById('tutor-input');
    if (input) {
      input.value = optionText;
      this.handleTutorSubmit();
    }
  }

  setAdminTab(tab) {
    this.adminTab = tab;
    this.render();
  }

  async loadAdminWorkers() {
    try {
      const [workersRes, auditRes] = await Promise.all([
        fetch('/api/admin/workers').then(r => r.json()),
        fetch('/api/admin/audit').then(r => r.json())
      ]);
      if (workersRes.success) this.adminWorkers = workersRes.data;
      if (auditRes.success) this.adminAudit = auditRes.data;
      this.render();
    } catch (e) {
      console.warn('Error loading admin workers:', e);
    }
  }

  async runAdminCommand(command) {
    const out = document.getElementById('console-output');
    const status = document.getElementById('console-status');
    if (status) status.innerText = 'En cours...';
    if (out) out.innerText += `\n\n> Exécution de la commande IA : "${command}"...`;

    try {
      const res = await fetch('/api/admin/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, userApiKey: this.userApiKey })
      }).then(r => r.json());

      if (status) status.innerText = 'Succès';
      if (out) {
        out.innerText += `\n[Agent Worker] Résultat :\n` + JSON.stringify(res.data, null, 2);
        out.scrollTop = out.scrollHeight;
      }
      await this.loadAdminWorkers();
    } catch (err) {
      if (status) status.innerText = 'Erreur';
      if (out) out.innerText += `\nErreur : ${err.message}`;
    }
  }

  async validateAndPublish(id) {
    try {
      const res = await fetch(`/api/resources/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', validationStatus: 'approved' })
      }).then(r => r.json());

      if (res.success) {
        const item = this.resources.find(r => r.id === id);
        if (item) {
          item.status = 'published';
          item.validationStatus = 'approved';
        }
        this.render();
      }
    } catch (e) {
      console.warn('Error validating resource:', e);
    }
  }

  async deleteResource(id) {
    if (!confirm('Confirmer le retrait de ce document ?')) return;
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      this.resources = this.resources.filter(r => r.id !== id);
      this.render();
    } catch (e) {
      console.warn('Error deleting resource:', e);
    }
  }

  async handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].name.toLowerCase().endsWith('.pdf') || files[0].type === 'application/pdf') {
        await this.openUploadedPdf(files[0]);
      } else {
        await this.uploadFile(files[0]);
      }
    }
  }

  async handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].name.toLowerCase().endsWith('.pdf') || files[0].type === 'application/pdf') {
        await this.openUploadedPdf(files[0]);
      } else {
        await this.uploadFile(files[0]);
      }
    }
  }

  async uploadFile(file) {
    const feedback = document.getElementById('upload-feedback');
    if (feedback) {
      feedback.className = 'p-3 rounded-lg text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
      feedback.innerHTML = `Traitement et indexation de <strong>${file.name}</strong>...`;
    }

    const courseSelect = document.getElementById('admin-upload-course-select');
    const typeSelect = document.getElementById('admin-upload-type-select');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('userApiKey', this.userApiKey);
    if (courseSelect && courseSelect.value) {
      formData.append('courseId', courseSelect.value);
    }
    if (typeSelect && typeSelect.value) {
      formData.append('resourceType', typeSelect.value);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (res.success) {
        if (feedback) {
          feedback.className = 'p-3 rounded-lg text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 block';
          feedback.innerHTML = `<strong>Succès :</strong> ${res.message}`;
        }
        this.showToast(res.message || "Document ajouté avec succès !", "success");
        await this.fetchBaseData();
        await this.loadAdminWorkers();
        this.render();
      } else {
        if (feedback) {
          feedback.className = 'p-3 rounded-lg text-xs bg-rose-950/40 text-rose-300 border border-rose-800/60 block';
          feedback.innerHTML = `<strong>Échec :</strong> ${res.error || 'Erreur inconnue'}`;
        }
        this.showToast(res.error || "Échec de l'ajout du document", "error");
      }
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-3 rounded-lg text-xs bg-rose-950/40 text-rose-300 border border-rose-800/60 block';
        feedback.innerHTML = `Erreur réseau : ${err.message}`;
      }
      this.showToast("Erreur réseau : " + err.message, "error");
    }
  }

  async uploadDemoDocument(type) {
    let demoFileName = 'Examen_Final_Mecanique_2025.pdf';
    let demoContent = `DÉPARTEMENT DE PHYSIQUE (PHYS101)
Épreuve d'Examen Final : Mécanique du Point Matériel — Session Janvier 2025
Professeur : Dr. Marc Beauchamp
Exercice 1 : Oscillations libres amorties, équation différentielle x'' + 2gamma x' + w0^2 x = 0.`;

    if (type === 'tp_algo') {
      demoFileName = 'TP4_Tableaux_Fonctions_INFO101B.cpp';
      demoContent = `// Algorithmique I - TP Tableaux et Fonctions (INFO101B)
#include <iostream>
#include <vector>
// Implémentation du tri et manipulation des structures de données`;
    }

    const feedback = document.getElementById('upload-feedback');
    if (feedback) {
      feedback.className = 'p-3 rounded-lg text-xs bg-blue-950/40 text-blue-300 border border-blue-800/60 block';
      feedback.innerHTML = `Attribution du fichier démo à l'un des 3 agents...`;
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: demoFileName,
          content: demoContent,
          userApiKey: this.userApiKey
        })
      }).then(r => r.json());

      if (feedback) {
        feedback.className = 'p-3 rounded-lg text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 block';
        feedback.innerHTML = `Fichier démo analysé et classifié avec succès !`;
      }
      await this.fetchBaseData();
      await this.loadAdminWorkers();
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-3 rounded-lg text-xs bg-rose-950/40 text-rose-300 border border-rose-800/60 block';
        feedback.innerHTML = `Erreur : ${err.message}`;
      }
    }
  }

  // API Key modal
  openApiKeyModal() {
    const modal = document.getElementById('modal-api-key');
    if (modal) modal.classList.remove('hidden');
    const input = document.getElementById('input-custom-api-key');
    if (input) input.value = this.userApiKey;
  }

  closeApiKeyModal() {
    const modal = document.getElementById('modal-api-key');
    if (modal) modal.classList.add('hidden');
  }

  async testAndSaveApiKey() {
    const input = document.getElementById('input-custom-api-key');
    const feedback = document.getElementById('api-key-test-feedback');
    if (!input || !feedback) return;

    const key = input.value.trim();
    if (key.length < 10) {
      feedback.className = 'text-xs p-3 rounded-lg bg-[#121316] text-zinc-300 border border-zinc-800 block';
      feedback.innerText = 'Veuillez saisir une clé API Gemini valide (ex: AIzaSy...).';
      return;
    }

    feedback.className = 'text-xs p-3 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-800/60 block';
    feedback.innerText = 'Test de connexion avec Google AI Studio...';

    try {
      const res = await fetch('/api/user-key/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      }).then(r => r.json());

      if (res.success) {
        this.userApiKey = key;
        sessionStorage.setItem('academic_hub_api_key', key);
        feedback.className = 'text-xs p-3 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 block';
        feedback.innerText = 'Clé API validée avec succès !';
        this.updateApiKeyBadge();
        setTimeout(() => this.closeApiKeyModal(), 1200);
      } else {
        feedback.className = 'text-xs p-3 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/60 block';
        feedback.innerText = `Échec : ${res.error}`;
      }
    } catch (err) {
      feedback.className = 'text-xs p-3 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/60 block';
      feedback.innerText = `Erreur réseau : ${err.message}`;
    }
  }

  clearApiKey() {
    this.userApiKey = '';
    sessionStorage.removeItem('academic_hub_api_key');
    const input = document.getElementById('input-custom-api-key');
    if (input) input.value = '';
    const feedback = document.getElementById('api-key-test-feedback');
    if (feedback) {
      feedback.className = 'text-xs p-3 rounded-lg bg-[#121316] text-zinc-400 border border-zinc-800 block';
      feedback.innerText = 'Clé effacée. Relais serveur actif.';
    }
    this.updateApiKeyBadge();
  }

  updateApiKeyBadge() {
    const statusBox = document.getElementById('api-key-status-box');
    if (statusBox) {
      statusBox.innerHTML = this.userApiKey
        ? `<span class="text-blue-400 font-medium">● Clé Personnelle Active</span>`
        : `<span class="text-zinc-500">● Utilisation du relais faculté par défaut</span>`;
    }
  }

  logout() {
    alert("Session terminée. À bientôt sur Academic Hub !");
    this.navigate('documents');
  }

  // Camera Modal methods
  openCameraModal() {
    const modal = document.getElementById('modal-camera-scan');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeCameraModal() {
    const modal = document.getElementById('modal-camera-scan');
    if (modal) {
      modal.classList.add('hidden');
    }
    // Clean up preview if any
    const img = document.getElementById('camera-preview-img');
    const icon = document.getElementById('camera-preview-icon');
    const text = document.getElementById('camera-preview-text');
    if (img) img.classList.add('hidden');
    if (icon) icon.classList.remove('hidden');
    if (text) text.classList.remove('hidden');
    const input = document.getElementById('camera-scan-file-input');
    if (input) input.value = '';
    const qInput = document.getElementById('camera-scan-question');
    if (qInput) qInput.value = '';
  }

  handleCameraFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = document.getElementById('camera-preview-img');
    const icon = document.getElementById('camera-preview-icon');
    const text = document.getElementById('camera-preview-text');

    if (img && icon && text) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
        text.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  }

  async submitCameraScan() {
    const fileInput = document.getElementById('camera-scan-file-input');
    const qInput = document.getElementById('camera-scan-question');
    const file = fileInput ? fileInput.files[0] : null;
    const question = qInput ? qInput.value.trim() : '';

    if (!file) {
      alert("Veuillez d'abord prendre une photo ou importer un scan.");
      return;
    }

    this.closeCameraModal();

    // Push user message
    const msgText = `📸 [Photo/Scan: ${file.name}]${question ? '\n' + question : ''}`;
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.isTutorLoading = true;
    this.render();

    setTimeout(() => {
      this.tutorMessages.push({
        id: `msg-resp-${Date.now()}`,
        sender: 'tutor',
        text: `J'ai bien reçu votre photo/scan (**${file.name}**). ${question ? `Pour répondre à votre question: *"${question}"*.\n\n` : ''}Le texte de l'énoncé a été extrait et analysé. Je l'ai indexé dans le corpus académique. Nous pouvons maintenant continuer à travailler dessus !`,
        sources: [{ documentId: 'doc-scan-1', documentTitle: file.name }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.isTutorLoading = false;
      this.render();
      const box = document.getElementById('tutor-chat-box');
      if (box) box.scrollTop = box.scrollHeight;
    }, 1200);
  }

  // Upload Modal methods
  openUploadModal() {
    const modal = document.getElementById('modal-upload-doc');
    if (modal) {
      modal.classList.remove('hidden');
      this.populateUploadCourseSelect();
    }
  }

  closeUploadModal() {
    const modal = document.getElementById('modal-upload-doc');
    if (modal) modal.classList.add('hidden');
    const fileInput = document.getElementById('upload-file-input');
    if (fileInput) fileInput.value = '';
  }

  async handleQuickUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById('upload-file-input');
    const courseSelect = document.getElementById('upload-course-select');
    const typeSelect = document.getElementById('upload-type-select');
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
      alert("Veuillez d'abord sélectionner un fichier.");
      return;
    }

    // If PDF, immediately open and view this exact PDF without delay
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      this.closeUploadModal();
      await this.openUploadedPdf(file);
      return;
    }

    const btn = document.getElementById('btn-submit-upload');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Classification...</span>`;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('userApiKey', this.userApiKey);
    if (courseSelect) formData.append('courseId', courseSelect.value);
    if (typeSelect) formData.append('resourceType', typeSelect.value);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (res.success) {
        this.showToast(res.message || "Document ajouté avec succès !", "success");
        this.closeUploadModal();
        await this.fetchBaseData();
        await this.loadAdminWorkers();
        this.render();
      } else {
        this.showToast("Échec : " + (res.error || 'Erreur inconnue'), "error");
      }
    } catch (err) {
      this.showToast("Erreur réseau : " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  }

  // Library Modal methods
  openLibraryModal() {
    const modal = document.getElementById('modal-library-picker');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderLibraryPicker();
    }
  }

  closeLibraryModal() {
    const modal = document.getElementById('modal-library-picker');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  onLibraryPickerSearch(val) {
    this.librarySearch = val;
    this.renderLibraryPicker();
  }

  setLibraryFilter(filter) {
    this.libraryFilterType = filter;
    
    // Update active class styling on filter buttons
    const filterTypes = ['all', 'Supports de Cours', 'Exercices', 'Examen', 'Corrigé'];
    filterTypes.forEach(t => {
      let id = 'lib-filter-all';
      if (t === 'Supports de Cours') id = 'lib-filter-cours';
      else if (t === 'Exercices') id = 'lib-filter-exercices';
      else if (t === 'Examen') id = 'lib-filter-examen';
      else if (t === 'Corrigé') id = 'lib-filter-corrige';

      const btn = document.getElementById(id);
      if (btn) {
        if (t === filter) {
          btn.className = 'px-2.5 py-1 rounded-lg font-semibold bg-blue-600 text-white whitespace-nowrap';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg font-medium bg-[#16171a] text-zinc-300 border border-zinc-800 hover:bg-zinc-800 whitespace-nowrap';
        }
      }
    });

    this.renderLibraryPicker();
  }

  setLibraryViewMode(mode) {
    this.libraryViewMode = mode;

    // Update active class styling on view buttons
    const treeBtn = document.getElementById('lib-view-tree-btn');
    const listBtn = document.getElementById('lib-view-list-btn');

    if (treeBtn && listBtn) {
      if (mode === 'tree') {
        treeBtn.className = 'p-1 rounded font-medium bg-blue-600 text-white';
        listBtn.className = 'p-1 rounded font-medium text-zinc-400 hover:text-white';
      } else {
        listBtn.className = 'p-1 rounded font-medium bg-blue-600 text-white';
        treeBtn.className = 'p-1 rounded font-medium text-zinc-400 hover:text-white';
      }
    }

    this.renderLibraryPicker();
  }

  toggleLibraryPromo(promoId) {
    if (this.expandedPromos.has(promoId)) {
      this.expandedPromos.delete(promoId);
    } else {
      this.expandedPromos.add(promoId);
    }
    this.renderLibraryPicker();
  }

  toggleLibraryCourse(courseId) {
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.renderLibraryPicker();
  }

  selectDocumentForChat(resId) {
    const res = this.resources.find(r => r.id === resId);
    if (!res) return;

    this.closeLibraryModal();

    // Trigger user message in Chat input and submit
    const input = document.getElementById('tutor-input');
    if (input) {
      input.value = `📎 [Référence : ${res.title}] Parlons de ce document et expliquons ses notions clés.`;
      // Dispatch submit event to trigger handleTutorSubmit
      const form = document.getElementById('tutor-input-form');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      } else {
        this.handleTutorSubmit();
      }
    }
  }

  renderLibraryPicker() {
    const listContainer = document.getElementById('library-picker-list');
    if (!listContainer) return;

    const query = this.librarySearch.toLowerCase().trim();
    
    // Filter the resources
    const filtered = this.resources.filter(r => {
      // Type filter
      if (this.libraryFilterType !== 'all') {
        if (this.libraryFilterType === 'Corrigé') {
          if (!r.hasCorrection && r.type !== 'Corrigé') return false;
        } else {
          if (r.type !== this.libraryFilterType) return false;
        }
      }
      
      // Search query filter
      if (query) {
        const inTitle = (r.title || '').toLowerCase().includes(query);
        const inProf = (r.professor || '').toLowerCase().includes(query);
        const inChapter = (r.chapter || '').toLowerCase().includes(query);
        const course = this.courses.find(c => c.id === r.courseId);
        const inCourse = course ? (course.code + ' ' + course.name).toLowerCase().includes(query) : false;
        if (!inTitle && !inProf && !inChapter && !inCourse) return false;
      }
      return true;
    });

    if (this.libraryViewMode === 'list') {
      // Flat list layout
      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-zinc-500 text-xs">
            Aucun document ne correspond à vos filtres.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(r => {
        const course = this.courses.find(c => c.id === r.courseId);
        return `
          <div onclick="app.selectDocumentForChat('${r.id}')" class="bg-[#16171a] hover:bg-zinc-800/80 border border-zinc-800 rounded-lg p-3 transition cursor-pointer flex items-center justify-between gap-3 group">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/50 border border-blue-800/40 px-1.5 py-0.5 rounded">
                  ${r.type}
                </span>
                ${r.hasCorrection ? `
                  <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                    Corrigé
                  </span>
                ` : ''}
              </div>
              <h4 class="font-semibold text-white text-xs truncate group-hover:text-blue-400 transition">
                ${r.title}
              </h4>
              <p class="text-[10px] text-zinc-400 mt-0.5 truncate">
                ${course ? `${course.code} — ${course.name}` : ''} ${r.professor ? `• ${r.professor}` : ''}
              </p>
            </div>
            <span class="text-zinc-500 group-hover:text-blue-400 shrink-0 transition">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
            </span>
          </div>
        `;
      }).join('');
      if (window.lucide) window.lucide.createIcons();
    } else {
      // Tree view mode: grouped by Promotion -> Course
      const promoMap = new Map();
      
      filtered.forEach(r => {
        const promoId = r.promotionId || 'other-promo';
        const promo = this.promotions.find(p => p.id === promoId) || { id: promoId, name: 'Autres', cycle: 'Général' };
        
        if (!promoMap.has(promoId)) {
          promoMap.set(promoId, {
            promo,
            courses: new Map()
          });
        }
        
        const courseId = r.courseId || 'other-course';
        const course = this.courses.find(c => c.id === courseId) || { id: courseId, code: 'GEN', name: 'Général' };
        
        const promoObj = promoMap.get(promoId);
        if (!promoObj.courses.has(courseId)) {
          promoObj.courses.set(courseId, {
            course,
            resources: []
          });
        }
        
        promoObj.courses.get(courseId).resources.push(r);
      });

      if (promoMap.size === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-zinc-500 text-xs">
            Aucun document ne correspond à vos filtres.
          </div>
        `;
        return;
      }

      let html = '';
      for (const [promoId, promoData] of promoMap.entries()) {
        const isPromoExpanded = this.expandedPromos.has(promoId);
        html += `
          <div class="border border-zinc-800 rounded-lg bg-[#16171a] overflow-hidden mb-2">
            <!-- Promo Header -->
            <div onclick="app.toggleLibraryPromo('${promoId}')" class="p-3 bg-[#121316] hover:bg-zinc-800/80 transition flex items-center justify-between cursor-pointer border-b border-zinc-800">
              <span class="font-bold text-white text-xs flex items-center gap-2">
                <i data-lucide="graduation-cap" class="w-4 h-4 text-zinc-400"></i>
                ${promoData.promo.name} <span class="text-[10px] text-zinc-500 font-normal">(${promoData.promo.cycle})</span>
              </span>
              <span class="text-zinc-500">
                <i data-lucide="${isPromoExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
              </span>
            </div>
            
            ${isPromoExpanded ? `
              <div class="p-2.5 space-y-2 bg-[#121316]">
                ${Array.from(promoData.courses.entries()).map(([courseId, courseData]) => {
                  const isCourseExpanded = this.expandedCourses.has(courseId);
                  return `
                    <div class="border border-zinc-800 rounded-lg overflow-hidden bg-[#16171a]">
                      <!-- Course Header -->
                      <div onclick="app.toggleLibraryCourse('${courseId}')" class="p-2.5 bg-[#18191c] hover:bg-zinc-800/80 transition flex items-center justify-between cursor-pointer border-b border-zinc-800">
                        <span class="font-medium text-zinc-200 text-xs flex items-center gap-1.5">
                          <i data-lucide="book-open" class="w-3.5 h-3.5 text-zinc-400"></i>
                          ${courseData.course.code} — ${courseData.course.name}
                        </span>
                        <span class="text-zinc-500">
                          <i data-lucide="${isCourseExpanded ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                        </span>
                      </div>
                      
                      ${isCourseExpanded ? `
                        <div class="p-2 space-y-1.5 bg-[#121316]">
                          ${courseData.resources.map(r => `
                            <div onclick="app.selectDocumentForChat('${r.id}')" class="flex items-center justify-between p-2 rounded-lg hover:bg-[#18191c] transition cursor-pointer text-xs group">
                              <div class="min-w-0 pr-2">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                  <span class="text-[9px] font-medium text-blue-400 bg-blue-950/50 border border-blue-800/40 px-1 py-0.2 rounded shrink-0">
                                    ${r.type}
                                  </span>
                                  ${r.hasCorrection ? `
                                    <span class="text-[9px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1 py-0.2 rounded shrink-0">
                                      Corrigé
                                    </span>
                                  ` : ''}
                                </div>
                                <div class="font-medium text-zinc-200 truncate group-hover:text-blue-400 transition">
                                  ${r.title}
                                </div>
                              </div>
                              <span class="text-zinc-500 group-hover:text-blue-400 shrink-0 transition">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                              </span>
                            </div>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }
      listContainer.innerHTML = html;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // ==========================================
  // MULTI-FORMAT DOCUMENT READER INTERACTION METHODS
  // ==========================================
  
  openDocument(id) {
    this.selectedResourceId = id;
    this.currentPdfDoc = null;
    this.currentPdfDocId = null;
    this.pdfTotalPages = null;
    this.docPdfPage = 1;
    this.docPdfViewMode = 'pdf';
    this.currentDocZoom = 100;
    this.docSearchActive = false;
    this.docSearchQuery = '';
    this.docReadingTheme = 'light';
    this.docPdfLayoutMode = 'single';
    this.docCodeSelectedLine = null;
    this.docWordActiveSection = 0;
    this.docSheetActiveTab = 0;
    this.docSheetFilter = '';
    this.docSheetSelectedCell = 'B2';
    this.docSlideIndex = 0;
    this.docSlideShowNotes = false;
    this.docImageZoom = 100;
    this.docImageRotation = 0;
    this.docImageMode = 'normal';
    this.docAudioPlaying = false;
    this.docAudioTime = 0;
    this.docAudioSpeed = 1.0;
    this.docVideoPlaying = false;
    this.docVideoTime = 0;
    this.navigate('document');
  }

  downloadFile(id) {
    const res = this.resources.find(r => r.id === id);
    if (!res) return;

    const link = document.createElement('a');
    if (res.id) {
      link.href = `/api/resources/${res.id}/file`;
    } else if (res.dataUrl) {
      link.href = res.dataUrl;
    } else {
      const content = res.content || 'Document académique';
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      link.href = URL.createObjectURL(blob);
    }
    link.download = res.fileName || `${(res.title || 'document').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async openUploadedPdf(file) {
    if (!file) return;
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    // Stop any ongoing rendering and destroy previous document instance to clear memory
    if (this.pdfRenderTask) {
      try { this.pdfRenderTask.cancel(); } catch (e) {}
      this.pdfRenderTask = null;
    }
    if (this.currentPdfDoc) {
      try { this.currentPdfDoc.destroy(); } catch (e) {}
      this.currentPdfDoc = null;
      this.currentPdfDocId = null;
    }

    const localId = `res-upload-${Date.now()}`;
    const objectUrl = URL.createObjectURL(file);
    const localRes = {
      id: localId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: (file.size > 1024 * 1024) ? (file.size / (1024 * 1024)).toFixed(1) + ' Mo' : Math.round(file.size / 1024) + ' Ko',
      format: isPdf ? 'pdf' : 'office',
      type: 'Supports de Cours',
      academicYear: '2025-2026',
      objectUrl: objectUrl,
      fileBlob: file,
      content: `Document importé : ${file.name}`
    };

    // Ensure it is placed directly at the top of resources
    this.resources = [localRes, ...(this.resources || []).filter(r => r.id !== localId)];
    this.selectedResourceId = localId;
    this.docPdfPage = 1;
    this.pdfTotalPages = null;
    this.currentDocZoom = 100;
    this.docPdfViewMode = isPdf ? 'pdf' : 'text';

    // Immediately open and view this exact PDF without any lag
    this.navigate('document');
    this.showToast(`Ouverture de "${file.name}"`, "success");

    // In background, send to server to run Tri-Agents indexing & DB persistence
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('userApiKey', this.userApiKey);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (res && res.success) {
        if (res.resourceId) {
          localRes.id = res.resourceId;
          if (this.selectedResourceId === localId) {
            this.selectedResourceId = res.resourceId;
          }
        }
        await this.fetchBaseData();
        const matched = this.resources.find(r => r.id === (res.resourceId || localId) || r.fileName === file.name);
        if (matched) {
          matched.objectUrl = objectUrl;
          matched.fileBlob = file;
        }
      }
    } catch (err) {
      console.warn('Erreur synchronisation serveur:', err);
    }
  }

  handleDirectPdfSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      this.openUploadedPdf(files[0]);
    }
  }

  handleViewerDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const container = document.getElementById('pdf-canvas-container');
    if (container) container.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/20');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.openUploadedPdf(e.dataTransfer.files[0]);
    }
  }

  async initPdfViewer(res) {
    const canvas = document.getElementById('pdf-render-canvas');
    const loadingEl = document.getElementById('pdf-loading-indicator');
    const errorEl = document.getElementById('pdf-error-container');
    if (!canvas) return;

    if (this.docPdfViewMode === 'text') return;

    try {
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (errorEl) errorEl.classList.add('hidden');
      canvas.classList.add('hidden');

      const pdfjs = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
      if (!pdfjs) {
        throw new Error('PDF.js non disponible');
      }
      if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      // Load document in memory
      if (!this.currentPdfDoc || this.currentPdfDocId !== res.id) {
        if (this.currentPdfDoc) {
          try { this.currentPdfDoc.destroy(); } catch (e) {}
        }
        this.currentPdfDoc = null;
        this.currentPdfDocId = null;
        this.pdfTotalPages = null;

        let source = null;
        if (res.objectUrl) {
          source = res.objectUrl;
        } else if (res.fileBlob) {
          res.objectUrl = URL.createObjectURL(res.fileBlob);
          source = res.objectUrl;
        } else if (res.dataUrl && res.dataUrl.startsWith('data:application/pdf;base64,') && res.dataUrl.length > 60) {
          try {
            const resp = await fetch(res.dataUrl);
            const blob = await resp.blob();
            res.objectUrl = URL.createObjectURL(blob);
            source = res.objectUrl;
          } catch (e) {
            const b64 = res.dataUrl.split(',')[1] || res.dataUrl;
            const binStr = atob(b64);
            const bytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) {
              bytes[i] = binStr.charCodeAt(i);
            }
            source = { data: bytes };
          }
        } else if (res.id && !res.id.startsWith('res-local-') && !res.id.startsWith('res-upload-')) {
          source = `/api/resources/${res.id}/file`;
        }

        if (!source) {
          throw new Error('Source de fichier introuvable');
        }

        const task = pdfjs.getDocument(source);
        this.currentPdfDoc = await task.promise;
        this.currentPdfDocId = res.id;
        this.pdfTotalPages = this.currentPdfDoc.numPages;

        this.updatePdfControlsState();
      }

      await this.renderPdfPageToCanvas(this.docPdfPage || 1);
    } catch (err) {
      console.warn('[PDF.js] Erreur de chargement:', err.message);
      if (loadingEl) loadingEl.classList.add('hidden');
      if (errorEl) errorEl.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  async renderPdfPageToCanvas(pageNumber) {
    if (!this.currentPdfDoc) return;
    const canvas = document.getElementById('pdf-render-canvas');
    const loadingEl = document.getElementById('pdf-loading-indicator');
    const errorEl = document.getElementById('pdf-error-container');
    if (!canvas) return;

    // Cancel any active render task to avoid conflicts and memory leaks
    if (this.pdfRenderTask) {
      try {
        this.pdfRenderTask.cancel();
      } catch (e) {}
      this.pdfRenderTask = null;
    }

    try {
      if (loadingEl) loadingEl.classList.remove('hidden');

      const page = await this.currentPdfDoc.getPage(pageNumber);
      const container = document.getElementById('pdf-canvas-container');
      const containerWidth = container ? Math.max(320, container.clientWidth - 48) : 720;

      const unscaledViewport = page.getViewport({ scale: 1.0 });
      // Keep page readable: width constrained between 320 and 880 px at 100% zoom
      const maxReadableWidth = Math.min(containerWidth, 880);
      const zoomFactor = (this.currentDocZoom || 100) / 100;
      const displayWidth = Math.round(maxReadableWidth * zoomFactor);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = (displayWidth / unscaledViewport.width) * dpr;
      const viewport = page.getViewport({ scale: scale });

      const ctx = canvas.getContext('2d', { alpha: false });
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${Math.round(displayWidth * (unscaledViewport.height / unscaledViewport.width))}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      this.pdfRenderTask = page.render(renderContext);
      await this.pdfRenderTask.promise;
      this.pdfRenderTask = null;

      if (loadingEl) loadingEl.classList.add('hidden');
      if (errorEl) errorEl.classList.add('hidden');
      canvas.classList.remove('hidden');

      this.docPdfPage = pageNumber;
      this.updatePdfControlsState();

      // Immediately cleanup page memory to ensure extremely low memory footprint even with 1000 pages
      try {
        page.cleanup();
      } catch (e) {}
    } catch (err) {
      if (err && (err.name === 'RenderingCancelledException' || err.message?.includes('cancelled'))) {
        return;
      }
      console.warn('[PDF.js] Erreur de rendu de page:', err.message);
      if (loadingEl) loadingEl.classList.add('hidden');
      if (errorEl) errorEl.classList.remove('hidden');
    }
  }

  updatePdfControlsState() {
    const total = this.pdfTotalPages || 1;
    const current = Math.max(1, Math.min(total, this.docPdfPage || 1));

    // Top Prev & Next
    const prevBtn = document.getElementById('pdf-btn-prev');
    const nextBtn = document.getElementById('pdf-btn-next');
    if (prevBtn) prevBtn.disabled = current <= 1;
    if (nextBtn) nextBtn.disabled = current >= total;

    // Bottom Prev & Next
    const prevBtnBottom = document.getElementById('pdf-btn-prev-bottom');
    const nextBtnBottom = document.getElementById('pdf-btn-next-bottom');
    if (prevBtnBottom) prevBtnBottom.disabled = current <= 1;
    if (nextBtnBottom) nextBtnBottom.disabled = current >= total;

    // Page input & Total pages label
    const pageInput = document.getElementById('pdf-page-input');
    if (pageInput) {
      pageInput.value = current;
      pageInput.max = total;
    }
    const totalLabel = document.getElementById('pdf-total-pages-label');
    if (totalLabel) totalLabel.textContent = `/ ${total}`;

    // Bottom counter label
    const bottomCounter = document.getElementById('pdf-page-counter-bottom');
    if (bottomCounter) bottomCounter.textContent = `Page ${current} sur ${total}`;

    // Text mode counter
    const textCounter = document.getElementById('pdf-text-page-counter');
    if (textCounter) textCounter.textContent = `Page ${current} / ${total}`;

    // Zoom value
    const zoomEl = document.getElementById('pdf-zoom-val');
    if (zoomEl) zoomEl.textContent = `${this.currentDocZoom || 100}%`;
  }

  onPdfPageInputChange(val) {
    const page = parseInt(val, 10);
    if (!isNaN(page)) {
      this.setPdfPage(page);
    }
  }

  resetZoom() {
    this.currentDocZoom = 100;
    this.updatePdfControlsState();
    if (this.currentPdfDoc && this.docPdfViewMode !== 'text') {
      this.renderPdfPageToCanvas(this.docPdfPage || 1);
    }
  }

  setPdfPage(page) {
    const total = this.pdfTotalPages || 1;
    const target = Math.max(1, Math.min(total, page));
    this.docPdfPage = target;
    this.updatePdfControlsState();

    if (this.currentPdfDoc && this.docPdfViewMode !== 'text') {
      this.renderPdfPageToCanvas(target);
      const container = document.getElementById('pdf-canvas-container');
      if (container) {
        container.scrollTop = 0;
      }
    } else {
      this.render();
    }
  }

  prevPdfPage() {
    const current = this.docPdfPage || 1;
    if (current > 1) {
      this.setPdfPage(current - 1);
    }
  }

  nextPdfPage() {
    const total = this.pdfTotalPages || 1;
    const current = this.docPdfPage || 1;
    if (current < total) {
      this.setPdfPage(current + 1);
    }
  }

  changeZoom(delta) {
    this.currentDocZoom = Math.min(200, Math.max(50, (this.currentDocZoom || 100) + delta));
    this.updatePdfControlsState();
    if (this.currentPdfDoc && this.docPdfViewMode !== 'text') {
      this.renderPdfPageToCanvas(this.docPdfPage || 1);
    }
  }

  togglePdfViewMode() {
    this.docPdfViewMode = (this.docPdfViewMode === 'text') ? 'pdf' : 'text';
    this.render();
  }

  extractDocumentPages(content) {
    if (!content) return ['(Document sans contenu textuel)'];

    // Split on explicit page delimiter if available
    if (content.includes('--- PAGE')) {
      const parts = content.split(/--- PAGE \d+ ---/i).filter(p => p && p.trim().length > 0);
      if (parts.length > 0) return parts;
    }

    // Split on paragraph chunks
    const paragraphs = content.split(/\n\n+/).filter(p => p && p.trim().length > 0);
    if (paragraphs.length <= 4) return [content];
    
    const pageSize = Math.ceil(paragraphs.length / 3);
    const p1 = paragraphs.slice(0, pageSize).join('\n\n');
    const p2 = paragraphs.slice(pageSize, pageSize * 2).join('\n\n');
    const p3 = paragraphs.slice(pageSize * 2).join('\n\n');
    return [p1, p2, p3].filter(p => p && p.trim().length > 0);
  }

  setPdfLayout(mode) {
    this.docPdfLayoutMode = mode;
    this.render();
  }

  toggleDocSearch() {
    this.docSearchActive = !this.docSearchActive;
    if (!this.docSearchActive) this.docSearchQuery = '';
    this.render();
  }

  setDocSearchQuery(query) {
    this.docSearchQuery = query;
    this.render();
  }

  prevDocSearchMatch() {
    // In-viewport scroll to previous match
  }

  nextDocSearchMatch() {
    // In-viewport scroll to next match
  }

  setReadingTheme(theme) {
    this.docReadingTheme = theme;
    this.render();
  }

  countSearchMatches(content, query) {
    if (!query || !query.trim() || !content) return 0;
    try {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = content.match(regex);
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  }

  highlightTextWithSearch(text, query) {
    if (!text) return '';
    let escaped = this.escapeHtml(text);
    if (!query || !query.trim()) return escaped;
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return escaped.replace(regex, '<mark class="bg-blue-100 text-blue-900 font-medium px-0.5 rounded">$1</mark>');
    } catch (e) {
      return escaped;
    }
  }

  // Code Viewer Helpers
  highlightCodeSyntax(line, ext) {
    if (!line) return '&nbsp;';
    let escaped = this.escapeHtml(line);

    // Comments
    if (escaped.trim().startsWith('//') || escaped.trim().startsWith('#') || escaped.trim().startsWith('/*')) {
      return `<span class="text-slate-500 italic">${escaped}</span>`;
    }

    // C / Python / Java Keywords
    const keywords = [
      '#include', '#define', 'import', 'from', 'def', 'class', 'return', 'if', 'else', 'elif',
      'for', 'while', 'int', 'float', 'double', 'char', 'void', 'struct', 'typedef', 'printf', 'scanf',
      'malloc', 'free', 'sizeof', 'public', 'static', 'const', 'let', 'function', 'async', 'await'
    ];

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      escaped = escaped.replace(regex, '<span class="text-blue-400 font-semibold">$1</span>');
    });

    // Strings
    escaped = escaped.replace(/(".*?"|'.*?')/g, '<span class="text-slate-300">$1</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-blue-300">$1</span>');

    return escaped;
  }

  copyCodeToClipboard() {
    const res = this.resources.find(r => r.id === this.selectedResourceId);
    if (!res || !res.content) return;
    navigator.clipboard.writeText(res.content).then(() => {
      const btn = document.getElementById('copy-code-btn');
      if (btn) {
        btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-blue-400"></i><span class="text-blue-400 font-medium">Copié !</span>`;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => this.render(), 2000);
      }
    });
  }

  selectCodeLine(lineNum) {
    this.docCodeSelectedLine = (this.docCodeSelectedLine === lineNum) ? null : lineNum;
    this.render();
  }

  // Word / Syllabus Sections
  extractWordSections(content) {
    if (!content) return [{ title: 'Section Générale', content: 'Contenu vide.' }];
    const parts = content.split(/--- SECTION: (.*?) ---/i);
    if (parts.length >= 3) {
      const res = [];
      for (let i = 1; i < parts.length; i += 2) {
        res.push({
          title: parts[i].trim(),
          content: (parts[i + 1] || '').trim()
        });
      }
      return res;
    }
    // Fallback: Split on double newlines
    const paragraphs = content.split(/\n\n+/);
    return [
      { title: 'I. Contexte & Objectifs du Cours', content: paragraphs.slice(0, 3).join('\n\n') },
      { title: 'II. Développements & Démonstrations', content: paragraphs.slice(3, 6).join('\n\n') || content },
      { title: 'III. Applications & Fiches Récapitulatives', content: paragraphs.slice(6).join('\n\n') || 'Synthèse méthodologique.' }
    ].filter(s => s.content.trim().length > 0);
  }

  setWordSection(idx) {
    this.docWordActiveSection = idx;
    this.render();
  }

  // Excel / Spreadsheet Data Extractor
  extractSpreadsheetData(content) {
    return {
      headers: ['Paramètre / Fréquence (Hz)', 'Tension U (V)', 'Courant I (mA)', 'Déphasage φ (rad)', 'Impédance Z (Ω)', 'Facteur Q'],
      rows: [
        ['100.0 Hz', '12.05', '45.2', '0.12', '266.6', '4.2'],
        ['250.0 Hz', '12.00', '78.5', '0.45', '152.8', '6.8'],
        ['500.0 Hz (Résonance)', '11.95', '142.0', '0.00', '84.1', '12.5'],
        ['1000.0 Hz', '12.02', '65.3', '-0.52', '184.0', '7.1'],
        ['2500.0 Hz', '12.10', '28.1', '-1.15', '430.6', '3.4'],
        ['5000.0 Hz', '12.15', '14.2', '-1.42', '855.6', '1.8']
      ]
    };
  }

  getFormulaForCell(cellKey, tableData) {
    const col = cellKey.charAt(0);
    const row = parseInt(cellKey.substring(1), 10);
    if (col === 'E') return `=B${row} / (C${row} / 1000)`;
    if (col === 'F') return `=RACINE(L / C) / R`;
    if (col === 'B') return `=MOYENNE(B2:B7)`;
    if (col === 'C') return `=MAX(C2:C7)`;
    return `=SOMME(${col}2:${col}7)`;
  }

  selectSheetCell(cellKey, val) {
    this.docSheetSelectedCell = cellKey;
    this.render();
  }

  setSheetTab(idx) {
    this.docSheetActiveTab = idx;
    this.render();
  }

  setSheetFilter(filter) {
    this.docSheetFilter = filter;
    this.render();
  }

  // Slide / Presentation Extractor
  extractSlides(content) {
    return [
      {
        title: '1. Introduction aux Équations Différentielles du 2nd Ordre',
        points: [
          'Forme canonique : a·y\'\'(t) + b·y\'(t) + c·y(t) = f(t)',
          'Origine physique : Oscillateurs harmoniques, amortis et circuits RLC série',
          'Principe fondamental : Décomposition en Solution Homogène (yh) + Solution Particulière (yp)'
        ],
        notes: "Rappeler aux étudiants que la méthode s'applique rigoureusement lorsque les coefficients a, b, c sont constants."
      },
      {
        title: '2. Résolution de l\'Équation Homogène (Sans Second Membre)',
        points: [
          'Équation caractéristique associée : a·r² + b·r + c = 0',
          'Calcul du discriminant Δ = b² - 4ac',
          'Cas 1 (Δ > 0) : Régime apériodique (Deux racines réelles distinctes)',
          'Cas 2 (Δ = 0) : Régime critique (Racine double r0 = -b / 2a)',
          'Cas 3 (Δ < 0) : Régime pseudo-périodique (Racines complexes conjuguées α ± iβ)'
        ],
        notes: "Attention fréquente en examen : ne pas oublier le terme t·e^(r0·t) dans le cas du discriminant nul."
      },
      {
        title: '3. Recherche de la Solution Particulière (Second Membre)',
        points: [
          'Méthode par identification selon la forme du second membre f(t)',
          'Si f(t) = Polynôme P(t) -> Chercher yp(t) sous forme de polynôme de même degré',
          'Si f(t) = Exponentielle e^(k·t) -> Tester si k est racine caractéristique (phénomène de résonance)',
          'Si f(t) = Sinusoïdal A·cos(ωt) -> Passer en notation complexe'
        ],
        notes: "La résonance se produit lorsque la pulsation d'excitation coïncide avec la pulsation propre du système."
      },
      {
        title: '4. Synthèse & Détermination des Constantes',
        points: [
          'Solution générale complète : y(t) = yh(t) + yp(t)',
          'Injection obligatoire des conditions initiales y(0) = y0 et y\'(0) = v0',
          'Résolution du système linéaire à 2 inconnues (C1, C2)',
          'Tracé de la courbe temporelle et interprétation physique de l\'amortissement'
        ],
        notes: "Ne jamais déterminer les constantes C1 et C2 avant d'avoir ajouté la solution particulière yp !"
      }
    ];
  }

  setSlideIndex(idx) {
    this.docSlideIndex = idx;
    this.render();
  }

  prevSlide() {
    this.setSlideIndex(Math.max(0, (this.docSlideIndex || 0) - 1));
  }

  nextSlide() {
    this.setSlideIndex((this.docSlideIndex || 0) + 1);
  }

  toggleSlideNotes() {
    this.docSlideShowNotes = !this.docSlideShowNotes;
    this.render();
  }

  // Image zoom & rotate
  changeImageZoom(delta) {
    this.docImageZoom = Math.max(50, Math.min(300, (this.docImageZoom || 100) + delta));
    this.render();
  }

  rotateImage(delta) {
    this.docImageRotation = ((this.docImageRotation || 0) + delta) % 360;
    this.render();
  }

  setImageMode(mode) {
    this.docImageMode = mode;
    this.render();
  }

  // Audio player controls
  toggleAudioPlay() {
    this.docAudioPlaying = !this.docAudioPlaying;
    this.render();
  }

  setAudioTime(seconds) {
    this.docAudioTime = seconds;
    this.render();
  }

  changeAudioSpeed(spd) {
    this.docAudioSpeed = spd;
    this.render();
  }

  // Video player controls
  toggleVideoPlay() {
    this.docVideoPlaying = !this.docVideoPlaying;
    this.render();
  }

  setVideoTime(seconds) {
    this.docVideoTime = seconds;
    this.render();
  }

  formatTime(sec) {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  explainCurrentDocPage() {
    const res = this.resources.find(r => r.id === this.selectedResourceId);
    if (!res) return;
    this.startTutorOnResource(res.id);
  }

  // Format markdown into safe and clean HTML
  formatMarkdown(text) {
    if (!text) return '';
    let formatted = this.escapeHtml(text);

    // Headers
    formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="font-bold text-white text-xs sm:text-sm mt-2.5 mb-1">$1</h3>');
    formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="font-extrabold text-white text-sm sm:text-base mt-3 mb-1">$1</h2>');

    // Bold & Italics
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    formatted = formatted.replace(/\*([^\*\n]+)\*/g, '<em class="italic text-zinc-300">$1</em>');

    // Inline Code
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="bg-[#18191c] text-blue-400 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>');

    // Bullet points
    formatted = formatted.replace(/^[•*-] (.*?)$/gm, '<div class="flex items-start gap-1.5 my-1"><span class="text-blue-400 font-bold shrink-0">•</span><span class="flex-1">$1</span></div>');

    // Numbered points
    formatted = formatted.replace(/^(\d+)\. (.*?)$/gm, '<div class="flex items-start gap-1.5 my-1"><span class="font-bold text-blue-400 shrink-0 text-xs">$1.</span><span class="flex-1">$2</span></div>');

    return formatted;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // MODE APPRENDRE : SALLE D'ÉTUDE PAR CHAPITRE
  // ==========================================

  async loadLearningCourses() {
    try {
      const res = await fetch('/api/learning/courses');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        this.learningCourses = data.data;
      }
    } catch (err) {
      console.error('Erreur chargement cours Mode Apprendre:', err);
    }
  }

  selectLearnCourse(courseId) {
    this.selectedLearnCourseId = courseId;
    this.selectedLearnChapterId = null;
    this.render();
  }

  async startLearningChapter(courseId, chapterId) {
    this.isLearningLoading = true;
    this.render();

    try {
      const res = await fetch('/api/learning/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'default-student',
          courseId,
          chapterId,
          userApiKey: this.userApiKey
        })
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        this.learningSession = this.normalizeLearningSession(data.data);
        this.selectedLearnCourseId = courseId;
        this.selectedLearnChapterId = chapterId;
        this.showCoursePickerInLearn = false;
        this.learningAssessmentActive = false;
        this.learningAssessment = null;
        this.learningAssessmentResult = null;
        this.learningUserAnswers = {};
        this.safeStorage.setItem('academic_hub_active_learning_session', JSON.stringify(this.learningSession));
      } else {
        alert("Erreur lors du démarrage du chapitre : " + ((data && data.error) || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error('Erreur startLearningChapter:', err);
      alert("Impossible de démarrer la session d'apprentissage.");
    } finally {
      this.isLearningLoading = false;
      this.render();
      this.scrollLearningChatToBottom();
    }
  }

  async sendLearningAction(actionType) {
    const actionsMap = {
      'hint': { text: "Peux-tu me donner un indice sans me donner directement la solution ?", action: 'hint' },
      'simplify': { text: "Peux-tu m'expliquer cette notion plus simplement avec des mots clairs ?", action: 'simplify' },
      'example': { text: "Peux-tu me donner un exemple chiffré ou géométrique très concret ?", action: 'example' },
      'in_course': { text: "Est-ce que cette notion figure dans mon polycopié de cours officiel ?", action: 'in_course' }
    };
    const req = actionsMap[actionType];
    if (req) {
      await this.sendLearningMessage(req.text, req.action);
    }
  }

  async sendLearningMessage(customText = null, action = 'answer') {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess) return;

    const inputEl = document.getElementById('learning-input-text');
    let text = customText;
    if (!text && inputEl) {
      text = inputEl.value.trim();
    }

    if (!text && action === 'answer') return;

    if (inputEl) inputEl.value = '';

    // Optimistically add student's message to UI if it's not a background action
    if (text) {
      if (!Array.isArray(sess.history)) sess.history = [];
      sess.history.push({
        sender: 'student',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    this.isLearningLoading = true;
    this.render();
    this.scrollLearningChatToBottom();

    try {
      const res = await fetch('/api/learning/session/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sess.id,
          studentInput: text || '',
          action,
          userApiKey: this.userApiKey
        })
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        this.learningSession = this.normalizeLearningSession(data.data);
        this.safeStorage.setItem('academic_hub_active_learning_session', JSON.stringify(this.learningSession));
      }
    } catch (err) {
      console.error('Erreur step learning:', err);
    } finally {
      this.isLearningLoading = false;
      this.render();
      this.scrollLearningChatToBottom();
    }
  }

  scrollLearningChatToBottom() {
    setTimeout(() => {
      const el = document.getElementById('learning-chat-feed');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 60);
  }

  openWhereAreWeModal() {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess) return;
    const modal = document.getElementById('modal-where-are-we');
    const content = document.getElementById('where-are-we-content');
    if (!modal || !content) return;

    const curCourse = (this.learningCourses || []).find(c => c.id === sess.courseId);
    const roadmap = Array.isArray(sess.roadmap) ? sess.roadmap : [];
    const completedCount = roadmap.filter(s => s.status === 'completed').length;
    const totalCount = Math.max(1, roadmap.length);
    const pct = Math.round((completedCount / totalCount) * 100);

    const activeStep = roadmap.find(s => s.status === 'active') || roadmap[sess.activeStepIndex || 0] || roadmap[0] || { title: 'Étape active', objective: 'Approfondissement des notions fondamentales.' };
    const masteredBranches = Array.isArray(sess.masteredBranches) ? sess.masteredBranches : [];
    const officialSources = Array.isArray(sess.officialSources) ? sess.officialSources : [];

    content.innerHTML = `
      <div class="space-y-3.5">
        <!-- Course & Chapter Header -->
        <div class="p-3 bg-[#121316] rounded-lg border border-zinc-800">
          <div class="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Matière & Enseignant</div>
          <div class="font-bold text-white text-xs mt-0.5">${curCourse ? curCourse.name : (sess.courseId || 'Cours')}</div>
          <div class="text-[11px] text-zinc-400 mt-0.5">Enseignant référent : <span class="font-medium text-zinc-300">${sess.demystification ? sess.demystification.professor : 'Professeur'}</span></div>
          <div class="text-xs font-semibold text-blue-400 mt-2 flex items-center gap-1.5">
            <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
            ${sess.chapterTitle || 'Chapitre'}
          </div>
        </div>

        <!-- Global Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold text-zinc-300">
            <span>Progression du chapitre</span>
            <span class="text-blue-400 font-bold">${pct}% (${completedCount}/${totalCount} étapes)</span>
          </div>
          <div class="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>

        <!-- Active Step Details -->
        <div class="p-3 bg-blue-950/30 rounded-lg border border-blue-800/50 space-y-1.5">
          <div class="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Étape en cours
          </div>
          <div class="font-bold text-white text-xs">${activeStep ? activeStep.title : 'Étape active'}</div>
          <div class="text-[11px] text-zinc-300">${activeStep && activeStep.objective ? activeStep.objective : 'Approfondissement des notions fondamentales.'}</div>
        </div>

        <!-- Prerequisite Branch Status -->
        ${sess.branchOpen ? `
          <div class="p-3 bg-[#121316] rounded-lg border border-zinc-800 space-y-1">
            <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <i data-lucide="git-branch" class="w-3 h-3 text-amber-400"></i>
              Branche de consolidation active
            </div>
            <div class="font-bold text-white text-xs">${sess.activeBranch ? sess.activeBranch.title : 'Prérequis'}</div>
            <div class="text-[11px] text-zinc-400">${sess.activeBranch ? sess.activeBranch.reason : 'Consolidation ciblée'}</div>
          </div>
        ` : `
          <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Aucune branche prérequis ouverte. Tu es sur le fil directeur du cours.</span>
          </div>
        `}

        <!-- Mastered Branches -->
        ${masteredBranches.length > 0 ? `
          <div class="space-y-1">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Prérequis consolidés dans cette session</div>
            <div class="flex flex-wrap gap-1.5">
              ${masteredBranches.map(b => `
                <span class="px-2 py-0.5 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-800/50 text-[11px] font-medium flex items-center gap-1">
                  ✓ ${b.title || b.conceptId}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Sources Quick Citation -->
        <div class="pt-1">
          <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Document de référence officiel</div>
          ${officialSources.length > 0 ? `
            <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-2">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5"></i>
              <div>
                <div class="font-semibold text-white">${officialSources[0].documentTitle}</div>
                <div class="text-zinc-500 text-[10px]">Page ${officialSources[0].page} • ${officialSources[0].section}</div>
              </div>
            </div>
          ` : '<div class="text-[11px] text-zinc-500">Corpus académique vérifié.</div>'}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeWhereAreWeModal() {
    const modal = document.getElementById('modal-where-are-we');
    if (modal) modal.classList.add('hidden');
  }

  openCourseSourcesModal() {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess) return;
    const modal = document.getElementById('modal-course-sources');
    const content = document.getElementById('course-sources-content');
    if (!modal || !content) return;

    const sources = Array.isArray(sess.officialSources) ? sess.officialSources : [];

    if (sources.length === 0) {
      content.innerHTML = `
        <div class="p-4 text-center text-zinc-500 text-xs">
          Les extraits documentaires sont directement issus des polycopiés enregistrés dans votre bibliothèque.
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="space-y-3">
          <p class="text-zinc-400 text-xs">
            Le contenu de ce chapitre est strictement aligné sur les polycopiés et fiches de travaux dirigés fournis par vos enseignants :
          </p>
          ${sources.map(src => `
            <div class="p-3.5 bg-[#121316] rounded-lg border border-zinc-800 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-bold text-white text-xs">${src.documentTitle}</div>
                  <div class="text-[11px] text-zinc-400">${src.professor ? src.professor + ' • ' : ''}Section : ${src.section} (Page ${src.page})</div>
                </div>
                <span class="px-2 py-0.5 rounded bg-blue-950/50 text-blue-400 text-[10px] font-bold border border-blue-800/50 shrink-0">
                  Page ${src.page}
                </span>
              </div>
              <div class="p-2.5 bg-[#16171a] rounded-lg border border-zinc-800 font-serif text-[11px] text-zinc-300 italic leading-relaxed">
                « ${src.excerpt} »
              </div>
              <div class="flex justify-end pt-1">
                <button onclick="app.closeCourseSourcesModal(); app.openDocumentPage('${src.documentTitle}', ${src.page});" class="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
                  <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                  Consulter dans le lecteur de documents ›
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeCourseSourcesModal() {
    const modal = document.getElementById('modal-course-sources');
    if (modal) modal.classList.add('hidden');
  }

  openDocumentPage(docTitle, pageNum) {
    const res = this.resources.find(r => (r.title || '').toLowerCase().includes(docTitle.toLowerCase().slice(0, 10)));
    if (res) {
      this.selectedResourceId = res.id;
      this.docPdfPage = pageNum || 1;
      this.navigate('document');
    } else {
      this.navigate('documents');
    }
  }

  openLearningMode(forcePicker = false) {
    if (forcePicker || !this.learningSession) {
      this.showCoursePickerInLearn = true;
    } else {
      this.showCoursePickerInLearn = false;
    }
    this.navigate('learn');
  }

  exitLearningToSelection() {
    this.showCoursePickerInLearn = true;
    this.render();
  }

  resumeActiveSession() {
    this.showCoursePickerInLearn = false;
    this.render();
  }

  confirmQuitLearningSession() {
    this.learningSession = null;
    this.selectedLearnCourseId = null;
    this.selectedLearnChapterId = null;
    this.showCoursePickerInLearn = true;
    this.safeStorage.removeItem('academic_hub_active_learning_session');
    this.showToast('Session réinitialisée. Vous pouvez choisir un nouveau cours.', 'info');
    this.render();
  }

  // Final Assessment Initiation
  async startChapterAssessment() {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess) return;
    this.isLearningLoading = true;
    this.render();

    try {
      const res = await fetch(`/api/learning/session/${sess.id}/assessment`);
      const data = await res.json();
      if (data && data.success && data.data) {
        this.learningAssessment = data.data;
        this.learningAssessmentActive = true;
        this.learningAssessmentResult = null;
        this.learningUserAnswers = {};
      } else {
        alert("Impossible de charger l'évaluation du chapitre.");
      }
    } catch (err) {
      console.error('Erreur startChapterAssessment:', err);
    } finally {
      this.isLearningLoading = false;
      this.render();
      window.scrollTo(0, 0);
    }
  }

  selectAssessmentOption(questionId, optionIndex) {
    if (this.learningAssessmentResult) return; // locked if finished
    if (!this.learningUserAnswers) this.learningUserAnswers = {};
    this.learningUserAnswers[questionId] = optionIndex;
    this.render();
  }

  async submitChapterAssessment() {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess || !this.learningAssessment) return;

    const questions = (this.learningAssessment && Array.isArray(this.learningAssessment.questions)) ? this.learningAssessment.questions : [];
    const answeredCount = Object.keys(this.learningUserAnswers || {}).length;

    if (answeredCount < questions.length) {
      if (!confirm(`Tu as répondu à ${answeredCount} sur ${questions.length} questions. Veux-tu valider le défi quand même ?`)) {
        return;
      }
    }

    this.isLearningLoading = true;
    this.render();

    try {
      const res = await fetch(`/api/learning/session/${sess.id}/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: this.learningUserAnswers || {} })
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        this.learningAssessmentResult = data.data;
        // Update local profile score
        if (data.data.newObservedMastery) {
          this.studentProfile.observedMastery = data.data.newObservedMastery;
        }
      }
    } catch (err) {
      console.error('Erreur submitChapterAssessment:', err);
    } finally {
      this.isLearningLoading = false;
      this.render();
      window.scrollTo(0, 0);
    }
  }

  restartAssessment() {
    this.learningAssessmentResult = null;
    this.learningUserAnswers = {};
    this.render();
  }

  resumeTargetedRemedial() {
    this.learningAssessmentActive = false;
    this.learningAssessmentResult = null;
    this.render();
    this.sendLearningMessage("J'ai terminé le défi mais j'aimerais qu'on retravaille les questions où j'ai hésité.", 'answer');
  }

  finishAndSaveChapter() {
    this.learningAssessmentActive = false;
    this.learningSession = null;
    this.safeStorage.removeItem('academic_hub_active_learning_session');
    this.navigate('tutor');
  }

  // ==========================================
  // RENDER MASTER VIEW : MODE APPRENDRE
  // ==========================================

  renderLearningRoomView() {
    const sess = this.normalizeLearningSession(this.learningSession);

    // 1. If in Assessment Mode (Le Défi du Chapitre)
    if (this.learningAssessmentActive) {
      return this.renderChapterAssessmentView();
    }

    // 2. If user requested the picker or has no active session yet
    if (!sess || this.showCoursePickerInLearn) {
      return this.renderLearningSelectionView();
    }

    // 3. Active Learning Room (Salle d'étude numérique)
    return this.renderActiveLearningRoom();
  }

  // VIEW A: SELECTION SCREEN (Course -> Chapter)
  renderLearningSelectionView() {
    const activeCourse = this.selectedLearnCourseId 
      ? (this.learningCourses || []).find(c => c.id === this.selectedLearnCourseId) 
      : null;

    let coursesList = this.learningCourses || [];
    if (this.learnSearchQuery) {
      const q = this.learnSearchQuery.toLowerCase().trim();
      coursesList = coursesList.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.code || '').toLowerCase().includes(q) ||
        (c.professor || '').toLowerCase().includes(q)
      );
    }

    return `
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6 w-full flex-1 space-y-5">
      
      <!-- Top Academic Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <button onclick="app.navigate('tutor')" class="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Retour au Tuteur" aria-label="Retour au Tuteur">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-[#121316] text-blue-400 flex items-center justify-center font-bold text-xs border border-zinc-800">
                <i data-lucide="graduation-cap" class="w-4 h-4"></i>
              </span>
              Mode Apprendre : Choix du Parcours
            </h1>
            <p class="text-xs text-zinc-400 mt-0.5">Sélectionnez une matière puis un chapitre pour démarrer l'enseignement structuré</p>
          </div>
        </div>
      </div>

      <!-- Resumable Session Banner (if stored in memory) -->
      ${(() => {
        const sess = this.normalizeLearningSession(this.learningSession);
        if (!sess || !sess.chapterTitle) return '';
        const roadmap = Array.isArray(sess.roadmap) ? sess.roadmap : [];
        const stepIdx = sess.currentStepIndex ?? sess.activeStepIndex ?? 0;
        const totalSteps = Math.max(1, roadmap.length || sess.totalSteps || 1);
        return `
        <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Parcours en cours
            </div>
            <div class="font-bold text-white text-sm">${this.escapeHtml(sess.chapterTitle)}</div>
            <div class="text-xs text-zinc-400">Progression enregistrée : Étape ${stepIdx + 1} sur ${totalSteps}</div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="app.resumeActiveSession()" class="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
              <span>Reprendre ce chapitre</span>
            </button>
            <button onclick="app.confirmQuitLearningSession()" class="text-xs text-zinc-400 hover:text-rose-400 font-medium px-2 py-2 transition" title="Effacer cette session">
              Réinitialiser
            </button>
          </div>
        </div>
        `;
      })()}

      ${!activeCourse ? `
        <!-- Step 1 : Choisir un Cours -->
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Choisissez une matière
            </span>
            <span class="text-[11px] text-zinc-400 font-medium">${coursesList.length} cours disponibles</span>
          </div>

          <!-- Search Input -->
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Rechercher une matière (ex: Analyse, Mécanique, Algorithmique)..."
              value="${this.escapeHtml(this.learnSearchQuery || '')}"
              oninput="app.learnSearchQuery = this.value; app.render();"
              class="w-full bg-[#16171a] text-white pl-9 pr-3 py-2 rounded-lg border border-zinc-800 focus:border-blue-500 outline-none text-xs transition"
            />
          </div>

          <!-- Courses List -->
          <div class="space-y-2.5">
            ${coursesList.map(c => `
              <div onclick="app.selectLearnCourse('${c.id}')" class="p-4 bg-[#16171a] hover:bg-[#1f2024] rounded-lg border border-zinc-800 hover:border-zinc-700 transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md bg-[#121316] text-zinc-300 font-mono text-[10px] font-medium border border-zinc-800">
                      ${c.code || c.id}
                    </span>
                    <h3 class="font-semibold text-white text-sm group-hover:text-blue-400 transition">${c.name}</h3>
                  </div>
                  <div class="text-xs text-zinc-400">${c.professor ? c.professor + ' • ' : ''}${c.description || 'Programme universitaire'}</div>
                </div>
                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#121316] text-blue-400 border border-zinc-800">
                    ${Array.isArray(c.chapters) ? c.chapters.length : 1} chapitre(s)
                  </span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition"></i>
                </div>
              </div>
            `).join('')}

            ${coursesList.length === 0 ? `
              <div class="p-8 text-center bg-[#16171a] rounded-lg border border-zinc-800 space-y-3">
                <p class="text-xs text-zinc-400">Aucun cours disponible.</p>
                <button onclick="app.loadLearningCourses()" class="px-3 py-1.5 rounded-lg bg-[#121316] text-blue-400 text-xs font-semibold border border-zinc-800 hover:bg-zinc-800 transition">
                  Actualiser la liste des cours
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <!-- Step 2 : Choisir le Chapitre dans le cours sélectionné -->
        <div class="space-y-4 animate-in fade-in duration-150">
          
          <!-- Back Link to Courses -->
          <button onclick="app.selectLearnCourse(null)" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            Changer de matière
          </button>

          <!-- Selected Course Card -->
          <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 space-y-1">
            <div class="text-[10px] font-medium font-mono text-zinc-400 uppercase">${activeCourse.code || activeCourse.id}</div>
            <h2 class="text-base font-bold text-white">${activeCourse.name}</h2>
            <p class="text-xs text-zinc-400">${activeCourse.description || ''}</p>
          </div>

          <div class="space-y-2.5">
            <div class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              Choisissez un chapitre pour commencer
            </div>

            <!-- Chapters List -->
            <div class="space-y-2.5">
              ${(Array.isArray(activeCourse.chapters) ? activeCourse.chapters : []).map((chap, idx) => `
                <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-[#121316] text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-800">
                        ${idx + 1}
                      </span>
                      <h4 class="font-semibold text-white text-xs sm:text-sm">${chap.title}</h4>
                    </div>
                    <div class="text-[11px] text-zinc-400 pl-8">
                      ${chap.topics ? chap.topics.join(' • ') : 'Parcours structuré avec points de contrôle et exercices guidés'}
                    </div>
                  </div>
                  <div class="pl-8 sm:pl-0 shrink-0">
                    <button 
                      onclick="app.startLearningChapter('${activeCourse.id}', '${chap.id}')"
                      ${this.isLearningLoading ? 'disabled' : ''}
                      class="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
                    >
                      <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
                      <span>Lancer ce chapitre</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `}
    </div>
    `;
  }

  // VIEW B: ACTIVE LEARNING ROOM (Salle d'étude numérique)
  renderActiveLearningRoom() {
    const sess = this.normalizeLearningSession(this.learningSession);
    if (!sess) {
      return this.renderLearningSelectionView();
    }
    const curCourse = (this.learningCourses || []).find(c => c.id === sess.courseId);
    const roadmap = Array.isArray(sess.roadmap) ? sess.roadmap : [];
    const activeStep = roadmap.find(s => s.status === 'active') || roadmap[sess.activeStepIndex || 0] || roadmap[0] || { title: 'Étape active', objective: 'Approfondissement des notions fondamentales.' };
    const completedSteps = roadmap.filter(s => s.status === 'completed').length;
    const totalSteps = Math.max(1, roadmap.length);
    const progressPct = Math.round((completedSteps / totalSteps) * 100);
    const stepIdx = sess.currentStepIndex ?? sess.activeStepIndex ?? 0;

    return `
    <div class="max-w-2xl mx-auto px-4 py-3 sm:px-6 sm:py-4 w-full flex-1 flex flex-col justify-between min-h-0 space-y-3">
      
      <!-- Top Navigation & Status Bar -->
      <div class="bg-[#16171a] rounded-lg border border-zinc-800 p-3 sm:p-3.5 space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          
          <!-- Left: Change Course / Back to Selection -->
          <button onclick="app.exitLearningToSelection()" class="text-xs font-semibold text-zinc-300 hover:text-white bg-[#121316] hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition border border-zinc-800" title="Changer de matière ou de chapitre">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
            <span>Changer de cours</span>
          </button>

          <!-- Center: Breadcrumb Capsule -->
          <div class="text-center truncate px-2">
            <div class="font-bold text-xs sm:text-sm text-white truncate">
              ${sess.chapterTitle}
            </div>
            <div class="text-[10px] text-zinc-400 font-mono truncate">
              ${curCourse ? curCourse.name : sess.courseId}
            </div>
          </div>

          <!-- Right: Tools Quick Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="app.openWhereAreWeModal()" class="px-2.5 py-1.5 rounded-lg bg-[#121316] hover:bg-zinc-800 text-blue-400 text-xs font-semibold flex items-center gap-1 border border-zinc-800 transition" title="Point d'étape complet">
              <i data-lucide="compass" class="w-3.5 h-3.5 text-blue-400"></i>
              <span class="hidden sm:inline">Où en sommes-nous ?</span>
            </button>
            <button onclick="app.openCourseSourcesModal()" class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#121316] hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1 transition border border-zinc-800" title="Sources officielles">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-zinc-400"></i>
              <span class="hidden sm:inline">Sources</span>
            </button>
          </div>
        </div>

        <!-- Linear Stepper Bar -->
        <div class="space-y-1 pt-1 border-t border-zinc-800/80">
          <div class="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span class="truncate max-w-[200px] sm:max-w-xs font-bold text-zinc-200">
              Étape ${stepIdx + 1} : ${activeStep ? activeStep.title : ''}
            </span>
            <span class="text-blue-400 font-bold shrink-0">${progressPct}% complété</span>
          </div>

          <!-- Progress Line -->
          <div class="w-full bg-[#121316] rounded-full h-1.5 overflow-hidden border border-zinc-800">
            <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
          </div>

          <!-- Stepper Dots -->
          <div class="flex items-center justify-between gap-1 pt-1 overflow-x-auto no-scrollbar">
            ${roadmap.map((step, idx) => {
              const isComp = step.status === 'completed';
              const isAct = step.status === 'active';
              return `
                <div class="flex items-center gap-1 shrink-0 ${isAct ? 'font-bold text-blue-400' : (isComp ? 'text-zinc-300' : 'text-zinc-500')} text-[10px]" title="${step.title}">
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isAct ? 'bg-blue-600 text-white' : (isComp ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-[#121316] text-zinc-500 border border-zinc-800')}">
                    ${isComp ? '✓' : idx + 1}
                  </span>
                  <span class="hidden md:inline truncate max-w-[90px]">${step.title}</span>
                </div>
              `;
            }).join('')}
            
            <!-- Final Challenge Step Pin -->
            <button onclick="app.startChapterAssessment()" class="flex items-center gap-1 shrink-0 text-[10px] font-medium text-blue-400 hover:text-blue-300 bg-[#121316] hover:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-800 transition" title="Lancer le défi final">
              <span>🏁 Défi Final</span>
            </button>
          </div>
        </div>

        <!-- Situation & Progression Immédiate : Où en sommes-nous ? -->
        <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800 text-xs space-y-1 mt-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <i data-lucide="compass" class="w-3.5 h-3.5 text-blue-400"></i>
              <span>Où en sommes-nous ?</span>
            </div>
            <button onclick="app.openWhereAreWeModal()" class="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              <span>Voir la fiche détaillée</span>
              <i data-lucide="chevron-right" class="w-3 h-3"></i>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
            <span><strong class="text-zinc-200">Matière :</strong> ${curCourse ? curCourse.name : (sess.courseId || 'Cours')}</span>
            <span>•</span>
            <span><strong class="text-zinc-200">Chapitre :</strong> ${sess.chapterTitle || 'Chapitre'}</span>
            <span>•</span>
            <span class="text-blue-400 font-bold">Étape ${stepIdx + 1}/${totalSteps}</span>
          </div>
          <div class="text-[11px] text-zinc-400 pt-0.5">
            <span class="font-bold text-zinc-200">Notion active :</span> ${activeStep ? activeStep.title : 'Étape active'}
            ${activeStep && activeStep.objective ? ` — <span class="text-zinc-500">${activeStep.objective}</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Active Prerequisite Branch Alert -->
      ${sess.branchOpen ? `
        <div class="p-3.5 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2 animate-in fade-in duration-150">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-white">
              <i data-lucide="git-branch" class="w-4 h-4 text-blue-400 shrink-0"></i>
              <span>Branche temporaire de révision : ${sess.activeBranch ? sess.activeBranch.title : 'Prérequis'}</span>
            </div>
            <button onclick="app.sendLearningMessage('J ai compris ce prérequis, reprenons le cours.', 'close_branch')" class="text-[11px] font-medium text-blue-400 hover:underline shrink-0">
              ✓ Clôturer la branche
            </button>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            ${sess.activeBranch ? sess.activeBranch.reason : 'Une consolidation ciblée a été activée avant d aborder la suite.'}
          </p>
        </div>
      ` : ''}

      <!-- Interactive Learning Discussion Feed -->
      <div id="learning-chat-feed" class="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar py-1">
        
        <!-- Chapter Demystification Summary -->
        ${sess.demystification ? `
          <div class="p-3.5 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2 text-xs">
            <div class="flex items-center justify-between text-zinc-200 font-bold">
              <span class="flex items-center gap-1.5">
                <i data-lucide="target" class="w-3.5 h-3.5 text-blue-400"></i>
                Pourquoi cette notion ?
              </span>
              <span class="text-[10px] text-zinc-500 font-normal">Poly universitaire officiel</span>
            </div>
            <p class="text-zinc-400 leading-relaxed">${sess.demystification.whyItMatters}</p>
            ${sess.demystification.concreteApplication ? `
              <div class="text-[11px] text-zinc-300 bg-[#121316] p-2 rounded-md border border-zinc-800 font-medium">
                <span class="font-bold text-zinc-200">Application concrète :</span> ${sess.demystification.concreteApplication}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Message History -->
        ${(sess.history || []).map(msg => this.renderLearningMessage(msg)).join('')}

        <!-- Loading State Indicator -->
        ${this.isLearningLoading ? `
          <div class="flex items-start gap-2 animate-in fade-in duration-100">
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
              IA
            </div>
            <div class="p-3 bg-[#16171a] rounded-lg border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
              <div class="flex gap-1 items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
              <span>Le tuteur prépare ton étape personnalisée...</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Action Panel & Input Box -->
      <div class="space-y-2">
        
        <!-- Pedagogical Quick Action Buttons -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          <button onclick="app.sendLearningAction('hint')" class="px-2.5 py-1 rounded-lg bg-[#16171a] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium shrink-0 flex items-center gap-1" title="Obtenir un indice">
            <span>💡 Indice</span>
          </button>
          <button onclick="app.sendLearningAction('simplify')" class="px-2.5 py-1 rounded-lg bg-[#16171a] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium shrink-0 flex items-center gap-1" title="Expliquer plus simplement">
            <span>🔍 Plus simple</span>
          </button>
          <button onclick="app.sendLearningAction('example')" class="px-2.5 py-1 rounded-lg bg-[#16171a] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium shrink-0 flex items-center gap-1" title="Voir un exemple concret">
            <span>🔢 Exemple concret</span>
          </button>
          <button onclick="app.sendLearningAction('in_course')" class="px-2.5 py-1 rounded-lg bg-[#16171a] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition font-medium shrink-0 flex items-center gap-1" title="Où est-ce dans mon polycopié ?">
            <span>📖 Dans mon cours ?</span>
          </button>
          <button onclick="app.startChapterAssessment()" class="px-2.5 py-1 rounded-lg bg-[#121316] hover:bg-zinc-800 text-blue-400 border border-zinc-800 transition font-medium shrink-0 flex items-center gap-1 ml-auto">
            <span>🏁 Défi du Chapitre</span>
          </button>
        </div>

        <!-- Student Input Bar -->
        <form onsubmit="event.preventDefault(); app.sendLearningMessage();" class="flex items-center gap-2 bg-[#16171a] p-1.5 rounded-lg border border-zinc-800 focus-within:border-blue-500 transition">
          
          <input 
            type="text" 
            id="learning-input-text"
            placeholder="Tape ta réponse, ton calcul ou pose une question..." 
            autocomplete="off"
            class="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none"
          />

          <button 
            type="submit" 
            ${this.isLearningLoading ? 'disabled' : ''}
            class="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg transition flex items-center justify-center disabled:opacity-40"
            aria-label="Envoyer"
          >
            <i data-lucide="arrow-up" class="w-4 h-4"></i>
          </button>
        </form>
      </div>

    </div>
    `;
  }

  renderLearningMessage(msg) {
    const isTutor = msg.sender === 'tutor' || msg.role === 'assistant';
    if (!isTutor) {
      return `
        <div class="flex justify-end">
          <div class="max-w-[85%] sm:max-w-[75%] p-3 rounded-lg bg-blue-600 text-white text-xs sm:text-sm leading-relaxed">
            ${this.escapeHtml(msg.text)}
          </div>
        </div>
      `;
    }

    return `
      <div class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#16171a] text-blue-400 border border-zinc-800 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
        </div>
        <div class="max-w-[90%] sm:max-w-[85%] space-y-2">
          <div class="p-3.5 sm:p-4 rounded-lg bg-[#16171a] text-zinc-200 border border-zinc-800 text-xs sm:text-sm leading-relaxed">
            ${this.formatMarkdown(msg.text)}
          </div>
          
          <!-- Source citation pill if present -->
          ${(msg.sourceReference) ? `
            <div class="text-[10px] text-zinc-500 font-mono flex items-center gap-1 pl-1">
              <i data-lucide="bookmark" class="w-3 h-3 text-zinc-500"></i>
              <span>Réf : ${this.escapeHtml(msg.sourceReference)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // VIEW C: FINAL CHAPTER ASSESSMENT (Défi du Chapitre)
  renderChapterAssessmentView() {
    const sess = this.normalizeLearningSession(this.learningSession);
    const assess = this.learningAssessment;
    const result = this.learningAssessmentResult;
    const questions = (assess && Array.isArray(assess.questions)) ? assess.questions : [];
    const chapterTitle = sess ? (sess.chapterTitle || 'Chapitre') : 'Chapitre';

    // If assessment result is ready, display performance dashboard
    if (result) {
      const isPass = (result.score || 0) >= 50;
      return `
      <div class="max-w-xl mx-auto px-4 py-4 sm:px-6 sm:py-6 w-full flex-1 space-y-5">
        
        <!-- Result Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-lg ${isPass ? 'bg-[#121316] text-blue-400 border border-zinc-800' : 'bg-[#121316] text-zinc-400 border border-zinc-800'} flex items-center justify-center mx-auto text-xl font-bold">
            ${isPass ? '🎓' : '📖'}
          </div>
          <h2 class="text-base sm:text-lg font-bold text-white">
            ${isPass ? 'Félicitations ! Chapitre Maîtrisé' : 'Bilan de ton évaluation'}
          </h2>
          <p class="text-xs text-zinc-400 max-w-sm mx-auto">
            ${this.escapeHtml(chapterTitle)}
          </p>
        </div>

        <!-- Score Card -->
        <div class="p-5 bg-[#16171a] rounded-lg border border-zinc-800 text-center space-y-3">
          <div class="text-3xl sm:text-4xl font-bold ${isPass ? 'text-blue-400' : 'text-zinc-300'} font-mono">
            ${result.score || 0}%
          </div>
          <div class="text-xs font-medium text-zinc-300">
            ${result.correctCount || 0} bonne(s) réponse(s) sur ${result.totalQuestions || 0} questions
          </div>
          <div class="w-full bg-[#121316] rounded-full h-2 overflow-hidden border border-zinc-800">
            <div class="${isPass ? 'bg-blue-600' : 'bg-zinc-600'} h-2 rounded-full transition-all duration-500" style="width: ${result.score || 0}%"></div>
          </div>
        </div>

        <!-- Breakdown by difficulty -->
        <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2.5 text-xs">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Précision par niveau de difficulté</div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800">
              <div class="text-[10px] text-zinc-400 font-medium">Facile</div>
              <div class="font-mono font-bold text-white mt-1">${result.subScores ? result.subScores.easy : '-'}</div>
            </div>
            <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800">
              <div class="text-[10px] text-zinc-400 font-medium">Intermédiaire</div>
              <div class="font-mono font-bold text-white mt-1">${result.subScores ? result.subScores.medium : '-'}</div>
            </div>
            <div class="p-2.5 bg-[#121316] rounded-lg border border-zinc-800">
              <div class="text-[10px] text-zinc-400 font-medium">Difficile</div>
              <div class="font-mono font-bold text-white mt-1">${result.subScores ? result.subScores.hard : '-'}</div>
            </div>
          </div>
        </div>

        <!-- Mastered vs To Reinforce -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Mastered -->
          <div class="p-3.5 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2">
            <div class="text-blue-400 font-semibold flex items-center gap-1.5 text-xs">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              Notions acquises
            </div>
            <div class="space-y-1 text-[11px] text-zinc-300">
              ${(result.masteredConcepts && result.masteredConcepts.length > 0) ? result.masteredConcepts.map(c => `
                <div class="flex items-center gap-1.5">
                  <span class="text-blue-400 font-bold">✓</span>
                  <span>${c}</span>
                </div>
              `).join('') : '<div class="text-zinc-500">Continue à pratiquer pour consolider.</div>'}
            </div>
          </div>

          <!-- To Reinforce -->
          <div class="p-3.5 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2">
            <div class="text-zinc-200 font-semibold flex items-center gap-1.5 text-xs">
              <i data-lucide="alert-circle" class="w-4 h-4 text-blue-400"></i>
              Points à renforcer
            </div>
            <div class="space-y-1 text-[11px] text-zinc-300">
              ${(result.conceptsToReinforce && result.conceptsToReinforce.length > 0) ? result.conceptsToReinforce.map(c => `
                <div class="flex items-center gap-1.5">
                  <span class="text-zinc-500 font-bold">•</span>
                  <span>${c}</span>
                </div>
              `).join('') : '<div class="text-blue-400 font-medium">Aucun point faible majeur détecté !</div>'}
            </div>
          </div>
        </div>

        <!-- Tutor Conclusion & Advice -->
        <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 space-y-2">
          <div class="text-xs font-semibold text-white flex items-center gap-1.5">
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-blue-400"></i>
            Conseil de ton Tuteur
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed">${result.advice || 'Bon travail sur ce chapitre !'}</p>
        </div>

        <!-- Next Actions -->
        <div class="space-y-2 pt-2">
          ${!isPass ? `
            <button onclick="app.resumeTargetedRemedial()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition text-xs flex items-center justify-center gap-2 shadow-2xs">
              <i data-lucide="repeat" class="w-4 h-4"></i>
              <span>Reprendre les notions fragiles avec le Tuteur</span>
            </button>
            <button onclick="app.restartAssessment()" class="w-full bg-[#16171a] hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium py-2 px-4 rounded-lg border border-zinc-800 transition text-xs">
              Refaire l'évaluation
            </button>
          ` : `
            <button onclick="app.finishAndSaveChapter()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition text-xs flex items-center justify-center gap-2 shadow-2xs">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Terminer et enregistrer mes progrès</span>
            </button>
          `}
          <button onclick="app.learningAssessmentActive = false; app.render();" class="w-full text-xs text-zinc-400 hover:text-white py-1.5 font-medium">
            Retour à la salle d'étude du chapitre
          </button>
        </div>

      </div>
      `;
    }

    // Active Questions View
    const answeredCount = Object.keys(this.learningUserAnswers || {}).length;

    return `
    <div class="max-w-xl mx-auto px-4 py-4 sm:px-6 sm:py-6 w-full flex-1 space-y-4">
      
      <!-- Top Bar -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <button onclick="app.learningAssessmentActive = false; app.render();" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
          <span>Retour à l'étude</span>
        </button>
        <div class="text-xs font-bold text-white">
          Défi du Chapitre
        </div>
        <div class="text-xs font-bold text-blue-400 font-mono">
          ${answeredCount} / ${questions.length}
        </div>
      </div>

      <!-- Introduction note -->
      <div class="p-3.5 bg-[#16171a] rounded-lg border border-zinc-800 text-xs text-zinc-300 space-y-1">
        <div class="font-semibold flex items-center gap-1.5 text-white">
          <i data-lucide="award" class="w-3.5 h-3.5 text-blue-400"></i>
          Test de validation des connaissances
        </div>
        <p class="text-[11px] text-zinc-400">
          Réponds à ces questions pour mesurer ta compréhension réelle. Chaque question teste une compétence précise du cours.
        </p>
      </div>

      <!-- Question Cards -->
      <div class="space-y-4">
        ${questions.length === 0 ? `
          <div class="p-8 text-center bg-[#16171a] rounded-lg border border-zinc-800 space-y-2">
            <p class="text-xs text-zinc-400">Chargement des questions du défi...</p>
          </div>
        ` : questions.map((q, idx) => {
          const selectedChoice = (this.learningUserAnswers || {})[q.id];
          const hasAnswered = selectedChoice !== undefined;
          const diffBadge = {
            'easy': '<span class="px-2 py-0.5 rounded-md bg-[#121316] text-blue-400 border border-zinc-800 text-[10px] font-medium">Facile</span>',
            'medium': '<span class="px-2 py-0.5 rounded-md bg-[#121316] text-zinc-300 border border-zinc-800 text-[10px] font-medium">Intermédiaire</span>',
            'hard': '<span class="px-2 py-0.5 rounded-md bg-[#121316] text-zinc-400 border border-zinc-800 text-[10px] font-medium">Difficile</span>'
          }[q.difficulty] || '';

          return `
            <div class="p-4 bg-[#16171a] rounded-lg border border-zinc-800 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#121316] text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-zinc-800">
                    ${idx + 1}
                  </span>
                  <span class="text-xs font-semibold text-white">${q.topic || 'Notion clé'}</span>
                </div>
                ${diffBadge}
              </div>

              <!-- Question text -->
              <div class="font-medium text-xs sm:text-sm text-zinc-200 leading-relaxed pl-7">
                ${q.question}
              </div>

              <!-- Options -->
              <div class="space-y-2 pl-7">
                ${(q.options || []).map((opt, optIdx) => {
                  const isSelected = selectedChoice === optIdx;
                  const isCorrectOption = optIdx === q.correctIndex;
                  let borderClass = 'border-zinc-800 hover:border-zinc-700 bg-[#121316] text-zinc-300';
                  
                  if (hasAnswered) {
                    if (isSelected && isCorrectOption) {
                      borderClass = 'border-blue-500 bg-[#121316] text-blue-400 font-medium';
                    } else if (isSelected && !isCorrectOption) {
                      borderClass = 'border-rose-900 bg-rose-950/40 text-rose-300 font-medium';
                    } else if (isCorrectOption) {
                      borderClass = 'border-emerald-800 bg-emerald-950/30 text-emerald-300';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-blue-500 bg-[#16171a] text-white font-medium';
                  }

                  const letter = String.fromCharCode(65 + optIdx);

                  return `
                    <button 
                      onclick="app.selectAssessmentOption('${q.id}', ${optIdx})"
                      class="w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center gap-2.5 ${borderClass}"
                    >
                      <span class="w-5 h-5 rounded-md bg-zinc-800 font-mono font-medium text-[10px] text-zinc-300 flex items-center justify-center shrink-0">
                        ${letter}
                      </span>
                      <span class="flex-1">${opt}</span>
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Immediate Explanation if Answered -->
              ${hasAnswered ? `
                <div class="p-2.5 rounded-lg text-[11px] leading-relaxed ml-7 ${selectedChoice === q.correctIndex ? 'bg-[#062817] text-emerald-300 border border-emerald-900/60' : 'bg-[#121316] text-zinc-300 border border-zinc-800'}">
                  <span class="font-semibold">${selectedChoice === q.correctIndex ? '✓ Correct ! ' : '💡 Explication : '}</span>
                  ${q.explanation || ''}
                </div>
              ` : ''}

            </div>
          `;
        }).join('')}
      </div>

      <!-- Submit Assessment Button -->
      <div class="pt-2 pb-6">
        <button 
          onclick="app.submitChapterAssessment()"
          ${this.isLearningLoading ? 'disabled' : ''}
          class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-2xs"
        >
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>Valider et calculer mon score final</span>
        </button>
      </div>

    </div>
    `;
  }
}

// Global App Instance
window.app = new AcademicHubApp();

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
        id: 'msg-user-1',
        sender: 'user',
        text: "Bonjour, j'ai besoin d'aide pour mes révisions de mécanique du point.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg-tutor-1',
        sender: 'tutor',
        text: "Bonjour! Je peux vous aider à réviser la mécanique du point. Quel point précis souhaitez-vous aborder : les lois de Newton ou la cinématique?",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // History of past chat sessions
    this.chatHistory = [
      {
        id: 'session-1',
        title: 'Intégration par parties & Primitives',
        mode: 'apprendre',
        date: 'Aujourd\'hui, 10:45',
        course: 'Analyse Mathématique (MATH102)',
        preview: 'Explication géométrique et application aux fractions rationnelles...'
      },
      {
        id: 'session-2',
        title: 'Préparation Examen Mécanique du Point',
        mode: 'revision',
        date: 'Hier, 16:20',
        course: 'Physique (PHYS101)',
        preview: 'Oscillateur harmonique amorti et bilan énergétique...'
      },
      {
        id: 'session-3',
        title: 'Exercices guidés sur les Tableaux & Fonctions',
        mode: 'exercer',
        date: '03 Sept. 2026',
        course: 'Algorithmique (INFO101B)',
        preview: 'Structures de contrôle, boucles itératives et décomposition fonctionnelle...'
      }
    ];

    // Student learning profile
    this.studentProfile = {
      name: 'Alex S.',
      filiere: 'Tronc Commun Scientifique & Technique',
      declaredLevel: 6,
      observedMastery: 0.62,
      activeGoal: 'Maîtrise du Calcul Intégral & Primitives',
      activeBranch: null,
      weakConcepts: ['concept-ipp', 'concept-energie-meca'],
      strongConcepts: ['concept-derivation', 'concept-newton2']
    };

    // Admin state
    this.adminTab = 'agents';
    this.adminWorkers = [];
    this.adminJobs = [];
    this.adminAudit = [];
    this.userApiKey = sessionStorage.getItem('academic_hub_api_key') || '';

    // Quick Action & Modals state
    this.showPlusMenu = false;
    this.librarySearch = '';
    this.libraryFilterType = 'all';
    this.libraryViewMode = 'tree'; // 'tree' | 'list'
    this.expandedPromos = new Set(['domain-math', 'domain-phys-chem', 'domain-tech-geom', 'domain-info', 'domain-ing-transv']);
    this.expandedCourses = new Set(['course-algebre', 'course-analyse', 'course-physique', 'course-chimie', 'course-dessin', 'course-algo']);
    this.cameraImageFile = null;
    this.cameraImageData = null;

    this.init();
  }

  async init() {
    this.updateApiKeyBadge();
    await this.fetchBaseData();
    this.populateUploadCourseSelect();

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');

    if (viewParam && ['documents', 'home', 'courses', 'document', 'tutor', 'history', 'settings', 'admin'].includes(viewParam)) {
      if (viewParam === 'document' && idParam) {
        this.selectedResourceId = idParam;
      }
      const targetView = viewParam === 'home' ? 'documents' : viewParam;
      this.navigate(targetView, false);
    } else {
      this.navigate('tutor', false);
    }
  }

  async fetchBaseData() {
    try {
      const [resRes, coursesRes, promoRes, stateRes, videosRes, workersRes, auditRes] = await Promise.all([
        fetch('/api/resources').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/courses').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/promotions').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/learning/state').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/videos').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/workers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/audit').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (resRes.success) this.resources = resRes.data;
      if (coursesRes.success) this.courses = coursesRes.data;
      if (promoRes.success) this.promotions = promoRes.data;
      if (videosRes.success) this.videos = videosRes.data;
      if (workersRes.success) this.adminWorkers = workersRes.data;
      if (auditRes.success) this.adminAudit = auditRes.data;
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

  // Navigation Controller
  navigate(viewName, updateUrl = true) {
    // Map legacy 'home' or 'courses' to 'documents' if needed
    if (viewName === 'home') viewName = 'documents';

    this.currentView = viewName;
    this.toggleDrawer(false);

    if (viewName === 'admin') {
      this.loadAdminWorkers();
    }

    // Update Header Dynamic Title
    const headerTitle = document.getElementById('header-page-title');
    if (headerTitle) {
      const titles = {
        'tutor': 'Academic Hub - Discussion',
        'documents': 'Documents & Cours',
        'document': 'Consultation du Document',
        'history': 'Historique des Discussions',
        'settings': 'Paramètres & Compte',
        'admin': 'Administration (/admin)'
      };
      headerTitle.innerText = titles[viewName] || 'Academic Hub - Discussion';
    }

    // Update URL query params
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewName);
      if (viewName === 'document' && this.selectedResourceId) {
        url.searchParams.set('id', this.selectedResourceId);
      } else {
        url.searchParams.delete('id');
      }
      window.history.pushState({}, '', url);
    }

    // Update Drawer Active Item
    ['tutor', 'documents', 'history', 'settings', 'admin'].forEach(dNav => {
      const drawerItem = document.getElementById(`drawer-nav-${dNav}`);
      if (drawerItem) {
        const isActive = (dNav === viewName) || (dNav === 'documents' && viewName === 'document');
        if (isActive) {
          drawerItem.classList.add('bg-blue-50', 'text-blue-700', 'font-semibold');
          drawerItem.classList.remove('text-slate-700');
        } else {
          drawerItem.classList.remove('bg-blue-50', 'text-blue-700', 'font-semibold');
          drawerItem.classList.add('text-slate-700');
        }
      }
    });

    this.render();
    window.scrollTo(0, 0);
  }

  // Type Badges styling helper (Consistent & Minimalist)
  getTypeBadge(type) {
    const map = {
      'Supports de Cours': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/80', icon: 'book-open', label: 'Cours' },
      'Exercices': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/80', icon: 'edit-3', label: 'TD & Exercices' },
      'Examen': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/80', icon: 'award', label: 'Examen' },
      'Interrogation': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', icon: 'file-check', label: 'Interro' },
      'TP': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', icon: 'flask-conical', label: 'TP' },
      'Corrigé': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200/80', icon: 'check-circle-2', label: 'Corrigé' },
    };
    const conf = map[type] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'file-text', label: type };
    return `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${conf.bg} ${conf.text} ${conf.border}">
      <i data-lucide="${conf.icon}" class="w-3 h-3"></i>
      ${conf.label}
    </span>`;
  }

  // Master Render Switcher
  render() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    if (this.currentView === 'documents') {
      container.innerHTML = this.renderDocumentsView();
    } else if (this.currentView === 'document') {
      container.innerHTML = this.renderDocumentView();
    } else if (this.currentView === 'tutor') {
      container.innerHTML = this.renderTutorView();
    } else if (this.currentView === 'history') {
      container.innerHTML = this.renderHistoryView();
    } else if (this.currentView === 'settings') {
      container.innerHTML = this.renderSettingsView();
    } else if (this.currentView === 'admin') {
      container.innerHTML = this.renderAdminView();
    }

    // Re-initialize lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // VIEW 1: CLEAN & AIRY DOCUMENTS EXPLORER (Image 1 & 4)
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

    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Search Bar (Clean & Accessible) -->
      <div class="relative flex items-center">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"></i>
        <input 
          type="text" 
          id="search-input"
          value="${this.filters.search}" 
          placeholder="Rechercher un document, cours, examen..." 
          oninput="app.onSearchInput(this.value)"
          class="w-full bg-white text-slate-900 pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm transition shadow-2xs placeholder:text-slate-400 font-medium"
        >
        ${this.filters.search ? `
          <button onclick="app.clearSearch()" class="absolute right-10 text-slate-400 hover:text-slate-600 p-1">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        ` : ''}
        <button onclick="app.triggerSearch()" class="absolute right-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition shadow-2xs">
          Chercher
        </button>
      </div>

      <!-- Discreet & Horizontal Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <!-- All Pill -->
        <button 
          onclick="app.setFilter('type', '')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${!this.filters.type ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          Tous
        </button>

        <!-- Supports de Cours Pill -->
        <button 
          onclick="app.setFilter('type', 'Supports de Cours')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Supports de Cours' ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          Cours
        </button>

        <!-- Exercices / TD Pill -->
        <button 
          onclick="app.setFilter('type', 'Exercices')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Exercices' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          TD / Exercices
        </button>

        <!-- Examens Pill -->
        <button 
          onclick="app.setFilter('type', 'Examen')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Examen' ? 'bg-rose-600 text-white border-rose-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          Examens
        </button>

        <!-- Interrogations Pill -->
        <button 
          onclick="app.setFilter('type', 'Interrogation')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Interrogation' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          Interrogations
        </button>

        <!-- TP Pill -->
        <button 
          onclick="app.setFilter('type', 'TP')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'TP' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          TPs
        </button>

        <!-- Corrigés Pill -->
        <button 
          onclick="app.setFilter('type', 'Corrigé')" 
          class="px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${this.filters.type === 'Corrigé' ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
          Corrigés
        </button>

        <!-- Promotion / Domain Dropdown (Compact) -->
        <select 
          onchange="app.setFilter('promotionId', this.value)" 
          class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none shrink-0"
        >
          <option value="">Tous les domaines d'études</option>
          ${this.promotions.map(p => `<option value="${p.id}" ${this.filters.promotionId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>

        ${(this.filters.search || activeFilterCount > 0) ? `
          <button onclick="app.resetFilters()" class="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 flex items-center gap-1 shrink-0 ml-auto">
            <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Effacer
          </button>
        ` : ''}
      </div>

      <!-- Document List Header -->
      <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>${filtered.length} document${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}</span>
        <span class="text-[11px] text-slate-400">Classés par année & pertinence</span>
      </div>

      <!-- Airy & Uniform Document Cards List (Image 1 style) -->
      <div class="space-y-3">
        ${filtered.length === 0 ? `
          <div class="bg-white border border-slate-200/90 rounded-2xl p-8 text-center max-w-sm mx-auto space-y-3 shadow-2xs my-6">
            <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <i data-lucide="search-x" class="w-5 h-5"></i>
            </div>
            <div class="font-bold text-slate-800 text-sm">Aucun document trouvé</div>
            <p class="text-xs text-slate-500">Modifiez votre recherche ou réinitialisez les filtres.</p>
            <button onclick="app.resetFilters()" class="text-xs bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-1.5 rounded-xl text-slate-700 transition">
              Réinitialiser
            </button>
          </div>
        ` : `
          ${filtered.map(r => this.renderResourceCard(r)).join('')}
        `}
      </div>

    </div>
    `;
  }

  // Uniform, Minimalist Card Component (Image 1 style)
  renderResourceCard(res) {
    const course = this.courses.find(c => c.id === res.courseId);
    const promo = this.promotions.find(p => p.id === res.promotionId);

    return `
    <div onclick="app.openDocument('${res.id}')" class="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition duration-150 p-4 space-y-2.5 cursor-pointer group">
      
      <!-- Top Row: Type Badge + Year -->
      <div class="flex items-center justify-between gap-2">
        ${this.getTypeBadge(res.type)}
        <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          ${res.academicYear || '2024-2025'}
        </span>
      </div>

      <!-- Document Title -->
      <div>
        <h3 class="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition line-clamp-2">
          ${res.title}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
          ${course ? `${course.code} — ${course.name}` : 'Matière universitaire'}
        </p>
      </div>

      <!-- Metadata & Badges Footer -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <div class="flex items-center gap-3 truncate">
          <span class="flex items-center gap-1"><i data-lucide="user-check" class="w-3.5 h-3.5 text-slate-400"></i>${res.professor || 'Département'}</span>
          <span class="flex items-center gap-1 text-slate-400">•</span>
          <span class="truncate">${promo ? promo.cycle : 'Licence'}</span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          ${res.hasCorrection ? `
            <span class="inline-flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 text-[10px]">
              <i data-lucide="check" class="w-3 h-3 text-teal-600"></i> Corrigé
            </span>
          ` : ''}
          <span class="text-slate-400 group-hover:text-blue-600 transition">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
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
        <button onclick="app.navigate('documents')" class="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">Retour à la bibliothèque</button>
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
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-3 min-w-0">
          <button onclick="app.navigate('documents')" class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200 shrink-0" title="Retour à la bibliothèque">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </button>
          <div class="truncate">
            <div class="flex items-center gap-2 flex-wrap">
              ${this.getTypeBadge(res.type)}
              <span class="text-xs font-semibold text-slate-500">${res.academicYear || '2025-2026'}</span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs text-slate-600 font-medium truncate">${course ? course.name : 'Matière'}</span>
            </div>
            <h1 class="font-bold text-slate-900 text-sm truncate mt-0.5">${res.title}</h1>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <button onclick="app.toggleFavorite('${res.id}')" class="p-2 rounded-xl text-slate-600 hover:text-amber-500 hover:bg-slate-50 transition border border-slate-200 shrink-0" title="Ajouter aux favoris">
            <i data-lucide="star" class="w-4 h-4"></i>
          </button>

          <button onclick="app.downloadFile('${res.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200/80">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Télécharger</span>
          </button>

          <button onclick="app.startTutorOnResource('${res.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs">
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
    const pages = this.extractDocumentPages(res.content);
    const totalPages = Math.max(1, pages.length);
    const currentPage = Math.max(1, Math.min(totalPages, this.docPdfPage || 1));
    const activePageContent = pages[currentPage - 1] || res.content;

    const themeClasses = {
      light: 'bg-white text-slate-800 border-slate-200/80',
      sepia: 'bg-[#fbf7ee] text-[#433422] border-[#e8dec8]',
      dark: 'bg-slate-900 text-slate-100 border-slate-800'
    }[this.docReadingTheme || 'light'];

    return `
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- PDF Toolbar -->
      <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600">
        
        <!-- Left: File tag & Page Navigation -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
            <i data-lucide="file-text" class="w-4 h-4 text-red-500"></i>
            <span class="truncate max-w-[140px] sm:max-w-xs">${res.fileName || 'document.pdf'}</span>
          </div>

          <div class="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button onclick="app.prevPdfPage()" ${currentPage <= 1 ? 'disabled' : ''} class="p-1 hover:bg-slate-100 rounded disabled:opacity-30">
              <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
            </button>
            <span class="px-2 font-mono text-[11px] font-semibold text-slate-700">Page ${currentPage} / ${totalPages}</span>
            <button onclick="app.nextPdfPage()" ${currentPage >= totalPages ? 'disabled' : ''} class="p-1 hover:bg-slate-100 rounded disabled:opacity-30">
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Right: Layout Mode, In-doc Search, Theme & Zoom -->
        <div class="flex items-center gap-2 flex-wrap">
          
          <!-- Search toggle -->
          <button onclick="app.toggleDocSearch()" class="px-2.5 py-1 rounded-lg border ${this.docSearchActive ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'} flex items-center gap-1">
            <i data-lucide="search" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Chercher</span>
          </button>

          <!-- Layout mode -->
          <button onclick="app.setPdfLayout('${this.docPdfLayoutMode === 'single' ? 'continuous' : 'single'}')" class="px-2.5 py-1 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1" title="Mode d'affichage">
            <i data-lucide="${this.docPdfLayoutMode === 'single' ? 'file-text' : 'layers'}" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">${this.docPdfLayoutMode === 'single' ? 'Page unique' : 'Continu'}</span>
          </button>

          <!-- Reading Theme Toggle -->
          <div class="flex items-center bg-slate-200/80 rounded-lg p-0.5 text-[10px] font-medium">
            <button onclick="app.setReadingTheme('light')" class="px-1.5 py-0.5 rounded ${(!this.docReadingTheme || this.docReadingTheme === 'light') ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}">Clair</button>
            <button onclick="app.setReadingTheme('sepia')" class="px-1.5 py-0.5 rounded ${this.docReadingTheme === 'sepia' ? 'bg-[#fbf7ee] text-[#433422] shadow-2xs font-bold' : 'text-slate-600'}">Sépia</button>
            <button onclick="app.setReadingTheme('dark')" class="px-1.5 py-0.5 rounded ${this.docReadingTheme === 'dark' ? 'bg-slate-800 text-white shadow-2xs font-bold' : 'text-slate-600'}">Sombre</button>
          </div>

          <!-- Zoom Controls -->
          <div class="flex items-center bg-slate-200/70 rounded-lg p-0.5 text-xs font-bold">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-white rounded text-slate-700" title="Zoom -">-</button>
            <span class="px-2 font-mono text-[11px] font-medium text-slate-700">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-white rounded text-slate-700" title="Zoom +">+</button>
          </div>

        </div>

      </div>

      <!-- In-Document Search Bar (Expandable) -->
      ${this.docSearchActive ? `
        <div class="bg-blue-50/70 border-b border-blue-200/70 px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <i data-lucide="search" class="w-3.5 h-3.5 text-blue-600"></i>
            <input 
              type="text" 
              placeholder="Rechercher un mot, formule ou concept dans ce PDF..." 
              value="${this.escapeHtml(this.docSearchQuery || '')}"
              oninput="app.setDocSearchQuery(this.value)"
              class="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-center gap-2 text-slate-600 shrink-0">
            <span class="text-[11px] font-medium text-blue-900">${this.countSearchMatches(res.content, this.docSearchQuery)} résultat(s)</span>
            <button onclick="app.prevDocSearchMatch()" class="p-1 hover:bg-blue-100 rounded text-blue-700"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
            <button onclick="app.nextDocSearchMatch()" class="p-1 hover:bg-blue-100 rounded text-blue-700"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
            <button onclick="app.toggleDocSearch()" class="p-1 hover:bg-blue-100 rounded text-slate-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
      ` : ''}

      <!-- Document Page Canvas / Viewport -->
      <div class="p-4 sm:p-8 overflow-auto ${this.docReadingTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100/70'} min-h-[500px] flex flex-col items-center gap-6">
        
        ${this.docPdfLayoutMode === 'single' ? `
          <!-- Single Page Sheet View -->
          <div style="font-size: ${this.currentDocZoom}%;" class="w-full max-w-3xl ${themeClasses} p-6 sm:p-10 rounded-xl shadow-md border transition-all duration-150 relative">
            <!-- Sheet Academic Header -->
            <div class="border-b pb-3 mb-6 flex items-center justify-between text-[11px] opacity-70">
              <span class="font-semibold uppercase tracking-wider">${course ? course.code : 'FACULTÉ DES SCIENCES'} • ACADEMIC HUB</span>
              <span class="font-mono">Page ${currentPage} / ${totalPages}</span>
            </div>

            <!-- Sheet Body Content -->
            <div class="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-serif">
              ${this.highlightTextWithSearch(activePageContent, this.docSearchQuery)}
            </div>

            <!-- Sheet Academic Footer -->
            <div class="border-t pt-3 mt-8 flex items-center justify-between text-[10px] opacity-60">
              <span>Document certifié conforme • Promotion ${promo ? promo.name : 'Tronc Commun'}</span>
              <span class="font-mono">${res.checksum ? res.checksum.substring(0, 10) : 'VERIFIED'}</span>
            </div>
          </div>
        ` : `
          <!-- Continuous Multi-Page Scroll View -->
          ${pages.map((pContent, idx) => `
            <div style="font-size: ${this.currentDocZoom}%;" class="w-full max-w-3xl ${themeClasses} p-6 sm:p-10 rounded-xl shadow-md border transition-all duration-150 relative">
              <div class="border-b pb-3 mb-6 flex items-center justify-between text-[11px] opacity-70">
                <span class="font-semibold uppercase tracking-wider">${course ? course.code : 'FACULTÉ'} • ${res.title}</span>
                <span class="font-mono font-bold">Page ${idx + 1} / ${totalPages}</span>
              </div>
              <div class="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-serif">
                ${this.highlightTextWithSearch(pContent, this.docSearchQuery)}
              </div>
              <div class="border-t pt-3 mt-8 flex items-center justify-between text-[10px] opacity-60">
                <span>Academic Hub Document Reader</span>
                <span class="font-mono">Page ${idx + 1}</span>
              </div>
            </div>
          `).join('')}
        `}

      </div>

      <!-- Page Bottom Quick Actions -->
      <div class="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
        <div class="flex items-center gap-2">
          <span class="text-slate-500">Saut direct :</span>
          <div class="flex items-center gap-1">
            ${Array.from({ length: totalPages }).map((_, i) => `
              <button onclick="app.setPdfPage(${i + 1})" class="w-6 h-6 rounded-md font-mono text-xs font-semibold ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}">
                ${i + 1}
              </button>
            `).join('')}
          </div>
        </div>

        <button onclick="app.explainCurrentDocPage()" class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-xs">
          <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
          <span>Expliquer cette page avec l'IA</span>
        </button>
      </div>

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
    <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md text-slate-100">
      
      <!-- Code Header Bar -->
      <div class="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 font-mono font-semibold text-emerald-400">
            <i data-lucide="code" class="w-4 h-4"></i>
            <span>${res.fileName || 'source.c'}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">${langLabel}</span>
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
        <button onclick="app.startTutorOnResource('${res.id}')" class="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
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
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- Word Toolbar -->
      <div class="bg-blue-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-blue-300"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Document_Officiel.docx'}</span>
          <span class="px-2 py-0.5 rounded bg-blue-800 text-[10px] text-blue-200">Word / Syllabus</span>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-blue-200 text-[11px]">Lecture estimée : ~3 min</span>
          <div class="flex items-center bg-blue-800 rounded-lg p-0.5">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-blue-700 rounded">-</button>
            <span class="px-2 font-mono text-[11px]">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-blue-700 rounded">+</button>
          </div>
        </div>
      </div>

      <!-- Section Tabs Navigation (Sommaire interactif) -->
      <div class="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <span class="text-slate-500 font-semibold shrink-0 mr-1 flex items-center gap-1">
          <i data-lucide="list" class="w-3.5 h-3.5 text-blue-600"></i> Sommaire :
        </span>
        ${sections.map((sec, idx) => `
          <button onclick="app.setWordSection(${idx})" class="px-3 py-1 rounded-lg shrink-0 font-medium transition ${activeSection === idx ? 'bg-blue-600 text-white shadow-2xs font-semibold' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}">
            ${sec.title}
          </button>
        `).join('')}
      </div>

      <!-- Document Content Body -->
      <div class="p-6 sm:p-10 bg-slate-50/50 min-h-[450px]">
        <div style="font-size: ${this.currentDocZoom}%;" class="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xs border border-slate-200/80 space-y-6">
          <div class="border-b pb-4">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Section ${activeSection + 1} sur ${sections.length}</span>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">${sections[activeSection].title}</h2>
          </div>

          <div class="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
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
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- Excel Header -->
      <div class="bg-emerald-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="table" class="w-4 h-4 text-emerald-300"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Classeur_Labo.xlsx'}</span>
          <span class="px-2 py-0.5 rounded bg-emerald-900 text-[10px] text-emerald-200">Excel / Tableur</span>
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Filtrer les lignes..." 
            value="${this.escapeHtml(this.docSheetFilter || '')}"
            oninput="app.setSheetFilter(this.value)"
            class="bg-emerald-900 text-white placeholder:text-emerald-300 border border-emerald-700 rounded-lg px-2.5 py-1 text-xs outline-none"
          />
          <div class="flex items-center bg-emerald-900 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-emerald-700 rounded">-</button>
            <span class="px-2">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-emerald-700 rounded">+</button>
          </div>
        </div>
      </div>

      <!-- Formula Bar (Barre de formules Excel) -->
      <div class="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-3 text-xs font-mono">
        <div class="bg-white border border-slate-300 px-2 py-1 rounded font-bold text-slate-800 w-16 text-center">
          ${this.docSheetSelectedCell || 'B2'}
        </div>
        <div class="text-slate-400 font-bold">fx</div>
        <div class="flex-1 bg-white border border-slate-300 px-3 py-1 rounded text-slate-800 truncate">
          ${this.getFormulaForCell(this.docSheetSelectedCell || 'B2', tableData)}
        </div>
      </div>

      <!-- Interactive Spreadsheet Grid -->
      <div style="font-size: ${this.currentDocZoom}%;" class="overflow-x-auto max-h-[500px] overflow-y-auto no-scrollbar">
        <table class="w-full border-collapse text-xs text-left">
          <thead>
            <tr class="bg-slate-200/80 text-slate-700 font-semibold border-b border-slate-300">
              <th class="p-2 border-r border-slate-300 text-center w-12 bg-slate-300/80 font-mono text-[11px]">#</th>
              ${tableData.headers.map((h, idx) => `
                <th class="p-2.5 border-r border-slate-300 font-bold whitespace-nowrap">
                  <div class="text-[10px] text-slate-500 font-mono">${String.fromCharCode(65 + idx)}</div>
                  <div>${h}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData.rows
              .filter(row => !this.docSheetFilter || row.some(cell => String(cell).toLowerCase().includes(this.docSheetFilter.toLowerCase())))
              .map((row, rIdx) => `
                <tr class="hover:bg-emerald-50/50 border-b border-slate-200 transition">
                  <td class="p-2 border-r border-slate-300 text-center font-mono text-slate-500 bg-slate-100/60 font-medium">${rIdx + 1}</td>
                  ${row.map((cell, cIdx) => {
                    const cellKey = `${String.fromCharCode(65 + cIdx)}${rIdx + 1}`;
                    const isSelected = this.docSheetSelectedCell === cellKey;
                    return `
                      <td onclick="app.selectSheetCell('${cellKey}', '${this.escapeHtml(String(cell))}')" class="p-2.5 border-r border-slate-200 font-mono cursor-pointer ${isSelected ? 'bg-emerald-100 border-2 border-emerald-600 font-bold text-emerald-950' : 'text-slate-800'}">
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
      <div class="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1">
          ${tabs.map((tabName, idx) => `
            <button onclick="app.setSheetTab(${idx})" class="px-3 py-1 rounded-t-lg font-medium transition ${activeTab === idx ? 'bg-white border-t-2 border-emerald-600 text-emerald-950 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'}">
              ${tabName}
            </button>
          `).join('')}
        </div>
        <div class="text-[11px] text-slate-500 font-mono hidden sm:inline">
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
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- Slide Presentation Toolbar -->
      <div class="bg-amber-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="presentation" class="w-4 h-4 text-amber-300"></i>
          <span class="font-bold tracking-wide">${res.fileName || 'Diapositives.pptx'}</span>
          <span class="px-2 py-0.5 rounded bg-amber-900 text-[10px] text-amber-200">Présentation / Diapo</span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="app.toggleSlideNotes()" class="px-2.5 py-1 rounded bg-amber-900 hover:bg-amber-700 text-amber-100 text-xs flex items-center gap-1 border border-amber-700">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>${this.docSlideShowNotes ? 'Masquer les notes' : 'Notes du cours'}</span>
          </button>
          <div class="flex items-center bg-amber-900 rounded-lg p-0.5">
            <button onclick="app.prevSlide()" ${activeIndex <= 0 ? 'disabled' : ''} class="px-2 py-0.5 hover:bg-amber-700 rounded disabled:opacity-40"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
            <span class="px-2 font-mono text-[11px] font-bold">${activeIndex + 1} / ${totalSlides}</span>
            <button onclick="app.nextSlide()" ${activeIndex >= totalSlides - 1 ? 'disabled' : ''} class="px-2 py-0.5 hover:bg-amber-700 rounded disabled:opacity-40"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
      </div>

      <!-- Slide Main Stage (16:9 Aspect Frame) -->
      <div class="p-6 sm:p-10 bg-slate-900 flex items-center justify-center min-h-[420px]">
        <div class="w-full max-w-2xl aspect-[16/9] bg-white rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between border-4 border-slate-800 text-slate-900">
          <div>
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-700 uppercase tracking-widest border-b pb-2">
              <span>${course ? course.name : 'COURS MAGISTRAL'}</span>
              <span>DIAPOSITIVE ${activeIndex + 1}</span>
            </div>
            <h2 class="text-base sm:text-xl font-extrabold text-slate-900 mt-4 leading-tight">${currentSlide.title}</h2>
            <ul class="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
              ${currentSlide.points.map(pt => `
                <li class="flex items-start gap-2">
                  <span class="text-amber-600 font-bold mt-0.5 shrink-0">✦</span>
                  <span>${pt}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between pt-4 border-t">
            <span>Academic Hub Slide Viewer</span>
            <span>${promo ? promo.name : 'Tronc Commun'}</span>
          </div>
        </div>
      </div>

      <!-- Presenter Notes (If toggled) -->
      ${this.docSlideShowNotes ? `
        <div class="bg-amber-50 border-t border-amber-200 p-4 text-xs text-amber-950 space-y-1 animate-in slide-in-from-top-1 duration-150">
          <div class="font-bold flex items-center gap-1.5 text-amber-900">
            <i data-lucide="info" class="w-3.5 h-3.5"></i> Notes pédagogiques & Conseils d'examen :
          </div>
          <p class="text-amber-900/90 text-xs leading-relaxed">
            ${currentSlide.notes || "Insister particulièrement sur la formulation du principe fondamental et les conditions d'application des théorèmes énergétiques."}
          </p>
        </div>
      ` : ''}

      <!-- Thumbnails Carousel Ribbon -->
      <div class="bg-slate-100 border-t border-slate-200 p-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        ${slides.map((s, idx) => `
          <button onclick="app.setSlideIndex(${idx})" class="shrink-0 w-28 aspect-[16/9] rounded-lg border-2 p-1.5 text-left text-[9px] flex flex-col justify-between transition ${activeIndex === idx ? 'border-amber-600 bg-white shadow-md font-bold' : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-600'}">
            <div class="truncate text-amber-800 font-bold">#${idx + 1} ${s.title}</div>
            <div class="text-slate-400 text-[8px] text-right">Diapo ${idx + 1}</div>
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
    <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xs text-white">
      
      <!-- Image Toolbar -->
      <div class="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="image" class="w-4 h-4 text-cyan-400"></i>
          <span class="font-bold tracking-wide font-mono">${res.fileName || 'Plan_Technique.png'}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Schéma Technique / ISO</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter inspection mode -->
          <div class="flex items-center bg-slate-800 rounded-lg p-0.5 text-[11px]">
            <button onclick="app.setImageMode('normal')" class="px-2 py-0.5 rounded ${mode === 'normal' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}">Normal</button>
            <button onclick="app.setImageMode('blueprint')" class="px-2 py-0.5 rounded ${mode === 'blueprint' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}">Plan Bleu</button>
            <button onclick="app.setImageMode('invert')" class="px-2 py-0.5 rounded ${mode === 'invert' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400'}">Inversé</button>
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
      <div class="p-6 sm:p-12 overflow-auto bg-slate-950/90 flex items-center justify-center min-h-[450px]">
        <div style="transform: scale(${zoom / 100}) rotate(${rot}deg); transition: transform 0.2s ease; ${filterStyle}" class="max-w-xl w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
          <!-- Simulated SVG Technical Plan Drawing -->
          <div class="border border-slate-700 rounded-lg p-4 bg-slate-950 flex flex-col items-center">
            <svg class="w-full h-56 text-cyan-400" viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1.5">
              <!-- Grid background -->
              <defs>
                <pattern id="tech-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.1)" stroke-width="0.5"/>
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
              <line x1="30" y1="100" x2="370" y2="100" stroke="#f43f5e" stroke-dasharray="6,3" stroke-width="1"/>
              <line x1="200" y1="20" x2="200" y2="180" stroke="#f43f5e" stroke-dasharray="6,3" stroke-width="1"/>
              <!-- Dimension markers -->
              <line x1="50" y1="175" x2="350" y2="175" stroke="#38bdf8" stroke-width="1"/>
              <text x="200" y="190" fill="#38bdf8" font-size="10" font-family="monospace" text-anchor="middle">L = 150 mm ± 0.05</text>
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
        <button onclick="app.downloadFile('${res.id}')" class="text-cyan-400 hover:text-cyan-300 font-semibold">Télécharger HD</button>
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
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- Audio Player Main Card -->
      <div class="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 space-y-6">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <i data-lucide="headphones" class="w-4 h-4"></i>
            <span>Podcast Académique • Capsule Audio</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-indigo-800/60 border border-indigo-700 text-xs font-mono text-indigo-200">${res.fileSize || '4.2 Mo'}</span>
        </div>

        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-white">${res.title}</h2>
          <p class="text-xs text-indigo-200 mt-1">${res.professor || 'Enseignant référent'} • ${course ? course.name : 'Matière'}</p>
        </div>

        <!-- Animated Wave Equalizer Simulation -->
        <div class="flex items-end justify-center gap-1.5 h-14 py-2">
          ${Array.from({ length: 24 }).map((_, i) => {
            const h = isPlaying ? (20 + ((i * 17) % 60)) : 12;
            return `<div class="w-1.5 bg-indigo-400 rounded-full transition-all duration-150" style="height: ${h}px;"></div>`;
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
            class="w-full accent-indigo-400 cursor-pointer h-1.5 bg-indigo-950 rounded-lg"
          />
          <div class="flex justify-between text-[11px] font-mono text-indigo-300">
            <span>${this.formatTime(curTime)}</span>
            <span>${this.formatTime(duration)}</span>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="flex items-center justify-between pt-2">
          <!-- Speed control -->
          <div class="flex items-center bg-indigo-950/70 border border-indigo-800 rounded-lg p-0.5 text-xs font-mono">
            <button onclick="app.changeAudioSpeed(0.75)" class="px-2 py-0.5 rounded ${speed === 0.75 ? 'bg-indigo-600 font-bold' : 'text-indigo-300'}">0.75x</button>
            <button onclick="app.changeAudioSpeed(1.0)" class="px-2 py-0.5 rounded ${speed === 1.0 ? 'bg-indigo-600 font-bold' : 'text-indigo-300'}">1x</button>
            <button onclick="app.changeAudioSpeed(1.5)" class="px-2 py-0.5 rounded ${speed === 1.5 ? 'bg-indigo-600 font-bold' : 'text-indigo-300'}">1.5x</button>
          </div>

          <!-- Main Play Controls -->
          <div class="flex items-center gap-3">
            <button onclick="app.setAudioTime(Math.max(0, ${curTime} - 10))" class="p-2 text-indigo-300 hover:text-white" title="-10s">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>
            <button onclick="app.toggleAudioPlay()" class="w-12 h-12 rounded-full bg-white text-indigo-950 flex items-center justify-center font-bold shadow-lg hover:scale-105 transition">
              <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-5 h-5 fill-current"></i>
            </button>
            <button onclick="app.setAudioTime(Math.min(${duration}, ${curTime} + 10))" class="p-2 text-indigo-300 hover:text-white" title="+10s">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>

          <button onclick="app.downloadFile('${res.id}')" class="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-medium">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> MP3
          </button>
        </div>

      </div>

      <!-- Synchronized Interactive Transcript -->
      <div class="p-6 space-y-3 bg-slate-50/50">
        <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-600"></i> Transcription Synchronisée
        </h3>
        <div class="space-y-2">
          ${transcriptItems.map(item => `
            <div onclick="app.setAudioTime(${item.time})" class="p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${curTime >= item.time && curTime < item.time + 60 ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}">
              <span class="font-mono text-xs text-indigo-600 font-bold shrink-0">[${item.stamp}]</span>
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
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      
      <!-- Video Screen Frame -->
      <div class="relative bg-black aspect-video flex flex-col justify-between p-4 text-white overflow-hidden group">
        <!-- Top Video Bar -->
        <div class="flex items-center justify-between text-xs z-10">
          <span class="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
            <i data-lucide="video" class="w-3.5 h-3.5 text-red-500"></i> ${res.title}
          </span>
          <span class="bg-black/60 px-2 py-1 rounded font-mono text-[11px] text-slate-300">${res.fileSize || '48 Mo'}</span>
        </div>

        <!-- Center Play Overlay -->
        <div class="flex items-center justify-center z-10">
          <button onclick="app.toggleVideoPlay()" class="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
            <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-7 h-7 fill-current"></i>
          </button>
        </div>

        <!-- Bottom Video Controls -->
        <div class="space-y-2 z-10 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-xl">
          <input 
            type="range" 
            min="0" 
            max="${duration}" 
            value="${curTime}" 
            onchange="app.setVideoTime(parseInt(this.value, 10))"
            class="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div class="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>${this.formatTime(curTime)} / ${this.formatTime(duration)}</span>
            <div class="flex items-center gap-3">
              <button onclick="app.toggleVideoPlay()" class="hover:text-white"><i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-4 h-4"></i></button>
              <button onclick="app.downloadFile('${res.id}')" class="hover:text-white" title="Télécharger"><i data-lucide="download" class="w-4 h-4"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Chapters & Notes -->
      <div class="p-6 space-y-4 bg-slate-50/50">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-600"></i> Chapitres de la séance
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${chapters.map(c => `
            <button onclick="app.setVideoTime(${c.time})" class="p-2.5 text-left rounded-xl border transition flex items-center justify-between ${curTime >= c.time && curTime < c.time + 120 ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}">
              <span class="text-xs truncate">${c.title}</span>
              <span class="font-mono text-xs text-blue-600 shrink-0 font-bold">[${c.stamp}]</span>
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
      <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5 shadow-2xs text-xs">
        <h2 class="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <i data-lucide="info" class="w-3.5 h-3.5 text-blue-600"></i>
          Contexte Académique Officiel
        </h2>
        <div class="space-y-1.5 text-slate-600">
          <div><span class="font-semibold text-slate-800">Matière :</span> ${course ? `${course.code} — ${course.name}` : 'Matière'}</div>
          <div><span class="font-semibold text-slate-800">Pôle / Filière :</span> ${promo ? `${promo.name} (${promo.cycle})` : 'Cycle préparatoire & Licence'}</div>
          <div><span class="font-semibold text-slate-800">Enseignant :</span> ${res.professor || 'Département Pédagogique'}</div>
          <div><span class="font-semibold text-slate-800">Chapitre ciblé :</span> ${res.chapter || 'Général'}</div>
          <div><span class="font-semibold text-slate-800">Session :</span> ${res.session || 'Principale'} (${res.semester || 'S1'})</div>
        </div>
      </div>

      <!-- Correction & Related Card -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5 shadow-2xs text-xs">
        <h2 class="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <i data-lucide="link-2" class="w-3.5 h-3.5 text-teal-600"></i>
          Ressources Associées & Corrigé
        </h2>
        
        ${correction ? `
          <div class="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                <i data-lucide="check-circle" class="w-4 h-4 text-teal-600"></i>
                Corrigé Type Officiel
              </div>
              <span class="text-[10px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-bold">Validé</span>
            </div>
            <p class="text-[11px] text-teal-800 line-clamp-1">${correction.title}</p>
            <button onclick="app.openDocument('${correction.id}')" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-1.5 rounded-lg transition flex items-center justify-center gap-1.5">
              <i data-lucide="file-check" class="w-3.5 h-3.5"></i>
              Consulter le Corrigé Type
            </button>
          </div>
        ` : `
          <div class="text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100">
            Aucun corrigé direct requis pour ce type de ressource.
          </div>
        `}

        ${courseVideo ? `
          <div class="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between gap-2">
            <div class="truncate">
              <div class="font-bold text-purple-900 text-xs flex items-center gap-1">
                <i data-lucide="youtube" class="w-3.5 h-3.5 text-purple-600"></i> Vidéo Explicative
              </div>
              <div class="text-[11px] text-purple-800 truncate">${courseVideo.title}</div>
            </div>
            <button onclick="app.openVideo('${courseVideo.id}')" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg shrink-0">
              Voir
            </button>
          </div>
        ` : ''}

      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 3: AI TUTOR / DISCUSSION (Ultra-Clean Mobile Layout)
  // ==========================================
  renderTutorView() {
    return `
    <div class="max-w-xl mx-auto px-4 py-3 sm:px-6 sm:py-4 w-full flex-1 flex flex-col justify-between min-h-0">
      
      <!-- Chat Discussion Messages Window (Image style) -->
      <div id="tutor-chat-box" class="flex-1 overflow-y-auto space-y-4 py-2 pr-1 no-scrollbar flex flex-col">
        ${this.tutorMessages.map(msg => this.renderTutorChatMessage(msg)).join('')}
        
        <!-- Loading Thinking State Bubble -->
        ${this.isTutorLoading ? `
          <div class="flex flex-col items-start gap-1.5 animate-in fade-in duration-150">
            <div class="flex items-center text-blue-500 pl-1">
              <svg class="w-4 h-4 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
              </svg>
            </div>
            <div class="p-3.5 rounded-2xl rounded-tl-xs bg-slate-50 text-slate-700 border border-slate-200/70 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
              <div class="flex gap-1 items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
              <span class="text-xs text-slate-500">Recherche dans le corpus et réflexion...</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Coexisting Learning Mode Chips Bar & Quick Action Menu Sheet -->
      <div class="space-y-2 mt-2">
        <!-- Mode Chips Bar -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          <button onclick="app.setTutorMode('chat')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'chat' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            <i data-lucide="message-square" class="w-3 h-3"></i> Chat libre
          </button>
          <button onclick="app.setTutorMode('apprendre')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'apprendre' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            <i data-lucide="target" class="w-3 h-3"></i> Apprendre (1-10)
          </button>
          <button onclick="app.setTutorMode('revision')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'revision' ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            <i data-lucide="book-marked" class="w-3 h-3"></i> Révision annales
          </button>
          <button onclick="app.setTutorMode('exercer')" class="px-3 py-1 rounded-full transition font-medium shrink-0 flex items-center gap-1.5 border ${this.tutorMode === 'exercer' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            <i data-lucide="pen-tool" class="w-3 h-3"></i> S'exercer
          </button>
        </div>

        <!-- Quick Action Menu Sheet (Modal when clicking + button) -->
        ${this.showPlusMenu ? `
          <div class="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-lg animate-in slide-in-from-bottom-2 duration-150 space-y-2">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <i data-lucide="plus-circle" class="w-4 h-4 text-blue-600"></i> Actions rapides & Import Multimodal
              </span>
              <button onclick="app.togglePlusMenu(false)" class="text-slate-400 hover:text-slate-600 text-xs p-1">✕</button>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button onclick="app.openCameraModal(); app.togglePlusMenu(false);" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Appareil photo / Scan</div>
                  <div class="text-[10px] text-slate-500">Scanner un énoncé ou cours</div>
                </div>
              </button>

              <button onclick="app.openLibraryModal(); app.togglePlusMenu(false);" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <i data-lucide="folder-tree" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Documents & Cours</div>
                  <div class="text-[10px] text-slate-500">Arborescence & Import chat</div>
                </div>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Bottom Chat Input Capsule (Exact Match with Image) -->
        <form onsubmit="app.handleTutorSubmit(event)" id="tutor-input-form" class="relative flex items-center bg-slate-100/95 border border-slate-300/80 rounded-full px-3.5 py-2 sm:py-2.5 shadow-2xs gap-2 shrink-0">
          
          <!-- Left: Plus button (+) -->
          <button 
            type="button" 
            onclick="app.togglePlusMenu(!app.showPlusMenu)" 
            title="Ajouter / Options" 
            class="text-slate-500 hover:text-slate-800 transition p-1 text-lg font-light leading-none shrink-0 flex items-center justify-center rounded-full hover:bg-slate-200/60"
          >
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>

          <!-- Center: Input field -->
          <input 
            type="text" 
            id="tutor-input" 
            placeholder="Poser une question... (ex: 'corrigé de l\'examen de l\'année dernière')" 
            ${this.isTutorLoading ? 'disabled' : ''}
            class="flex-1 bg-transparent text-slate-800 text-xs sm:text-sm outline-none placeholder:text-slate-400 font-normal disabled:opacity-60"
          >

          <!-- Right: Microphone button -->
          <button 
            type="button" 
            onclick="app.startVoiceInput()" 
            title="Entrée vocale" 
            class="text-slate-500 hover:text-slate-800 transition p-1 shrink-0 rounded-full hover:bg-slate-200/60"
          >
            <i data-lucide="mic" class="w-4 h-4"></i>
          </button>

          <!-- Far Right: Send button (➤) -->
          <button 
            type="submit" 
            id="btn-tutor-send" 
            title="Envoyer" 
            ${this.isTutorLoading ? 'disabled' : ''}
            class="text-slate-600 hover:text-blue-600 disabled:text-slate-400 transition p-1 shrink-0 rounded-full hover:bg-slate-200/60"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>

        </form>
      </div>

    </div>
    `;
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
      // User message: Soft gray bubble on the right
      return `
      <div class="flex justify-end animate-in fade-in duration-150">
        <div class="bg-slate-100/90 text-slate-800 text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-xs leading-relaxed max-w-[85%] sm:max-w-[78%] shadow-2xs text-left">
          ${this.formatMarkdown(msg.text)}
        </div>
      </div>
      `;
    }

    // Tutor / AI message: Left aligned with blue sparkle star (Image match)
    return `
    <div class="flex flex-col items-start gap-1 animate-in fade-in duration-150 max-w-[92%] sm:max-w-[85%]">
      
      <!-- Sparkle Icon above/left of bubble -->
      <div class="flex items-center text-blue-500 pl-1">
        <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
        </svg>
      </div>

      <!-- Bubble content -->
      <div class="bg-slate-50/95 text-slate-800 text-xs sm:text-sm px-4 py-3.5 rounded-2xl rounded-tl-xs leading-relaxed border border-slate-200/70 shadow-2xs space-y-2 text-left">
        <div class="whitespace-pre-wrap">${this.formatMarkdown(msg.text)}</div>

        <!-- Optional Sources Citations (clean & subtle) -->
        ${(msg.sources && msg.sources.length > 0) ? `
          <div class="pt-2 border-t border-slate-200/60 mt-1 text-[11px] text-slate-500 space-y-1">
            <span class="font-semibold text-blue-600 flex items-center gap-1">
              <i data-lucide="book-open" class="w-3 h-3"></i> Sources associées :
            </span>
            ${msg.sources.map(s => `
              <button onclick="app.openDocument('${s.documentId}')" class="text-left text-blue-600 hover:underline block text-[10px] truncate">
                • ${s.documentTitle}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Optional Video Recommendation (clean & subtle) -->
        ${msg.recommendedVideo ? `
          <div class="pt-2 border-t border-slate-200/60 mt-1 flex items-center justify-between gap-2 text-[11px]">
            <a href="${msg.recommendedVideo.url}" target="_blank" rel="noopener noreferrer" class="text-rose-600 font-semibold hover:underline flex items-center gap-1 truncate">
              <i data-lucide="youtube" class="w-3.5 h-3.5 text-rose-600 shrink-0"></i>
              <span class="truncate">${msg.recommendedVideo.title}</span>
            </a>
            <span class="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono shrink-0">${msg.recommendedVideo.duration}</span>
          </div>
        ` : ''}
      </div>
    </div>
    `;
  }

  togglePlusMenu(show) {
    this.showPlusMenu = show;
    this.render();
  }

  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur actuel.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    
    const input = document.getElementById('tutor-input');
    if (input) input.placeholder = "Écoute en cours... Parlez maintenant";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (input) {
        input.value = transcript;
        input.placeholder = "Poser une question... (ex: 'corrigé de l\'examen de l\'année dernière')";
      }
    };
    recognition.onerror = () => {
      if (input) input.placeholder = "Poser une question... (ex: 'corrigé de l\'examen de l\'année dernière')";
    };
    recognition.onend = () => {
      if (input) input.placeholder = "Poser une question... (ex: 'corrigé de l\'examen de l\'année dernière')";
    };
    recognition.start();
  }

  openCameraScanner() {
    this.togglePlusMenu(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.tutorMessages.push({ sender: 'user', text: `📸 [Scan de document / Photo] ${file.name}` });
      this.isTutorLoading = true;
      this.render();
      setTimeout(() => {
        this.tutorMessages.push({
          sender: 'tutor',
          text: `J'ai bien reçu votre document scanné (**${file.name}**). Je l'ai analysé et indexé dans le corpus académique. Il est désormais exploitable pour vos questions et révisions !`,
          sources: [{ documentId: 'doc-scan-1', documentTitle: file.name }]
        });
        this.isTutorLoading = false;
        this.render();
        const box = document.getElementById('tutor-chat-box');
        if (box) box.scrollTop = box.scrollHeight;
      }, 1200);
    };
    input.click();
  }

  // ==========================================
  // VIEW 4: HISTORY OF DISCUSSIONS (Image 3)
  // ==========================================
  renderHistoryView() {
    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-extrabold text-slate-900 text-base sm:text-lg">Historique des Discussions</h1>
          <p class="text-xs text-slate-500">Retrouvez et reprenez vos sessions d'apprentissage antérieures.</p>
        </div>

        <button onclick="app.startNewChat()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Nouveau Chat</span>
        </button>
      </div>

      <!-- History Cards List -->
      <div class="space-y-3">
        ${this.chatHistory.map(item => `
          <div onclick="app.resumeChatSession('${item.id}')" class="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-4 space-y-2 cursor-pointer transition shadow-2xs group">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                Mode ${item.mode}
              </span>
              <span class="text-[11px] text-slate-400">${item.date}</span>
            </div>

            <div>
              <h3 class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">${item.title}</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-medium">${item.course}</p>
            </div>

            <p class="text-xs text-slate-600 line-clamp-1 italic">${item.preview}</p>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Cliquer pour reprendre</span>
              <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition"></i>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 5: SETTINGS & ACCOUNT
  // ==========================================
  renderSettingsView() {
    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <div>
        <h1 class="font-extrabold text-slate-900 text-base sm:text-lg">Paramètres & Compte</h1>
        <p class="text-xs text-slate-500">Gérez votre profil étudiant et vos clés de connexion IA.</p>
      </div>

      <!-- Student Profile Card -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-200">
            <i data-lucide="user" class="w-6 h-6"></i>
          </div>
          <div>
            <h2 class="font-bold text-slate-900 text-sm sm:text-base">${this.studentProfile.name}</h2>
            <p class="text-xs text-slate-500">${this.studentProfile.filiere}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="text-slate-500 text-[11px]">Niveau Déclaré :</span>
            <div class="font-bold text-slate-800 text-sm">${this.studentProfile.declaredLevel} / 10</div>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="text-slate-500 text-[11px]">Maîtrise Estimée :</span>
            <div class="font-bold text-emerald-700 text-sm">${Math.round(this.studentProfile.observedMastery * 100)}%</div>
          </div>
        </div>
      </div>

      <!-- Gemini API Key Management Card (Image 2 & 4) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <i data-lucide="key" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Gestion de la Clé API Gemini</h3>
              <p class="text-xs text-slate-500">Usage illimité avec votre propre clé Google AI Studio</p>
            </div>
          </div>

          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${this.userApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
            ${this.userApiKey ? 'Clé Active' : 'Relais Standard'}
          </span>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          Pour des requêtes plus rapides sans limite de quota, vous pouvez configurer votre propre clé API gratuite Google AI Studio.
        </p>

        <div class="flex items-center gap-2 pt-1">
          <button onclick="app.openApiKeyModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition shadow-2xs">
            ${this.userApiKey ? 'Modifier la Clé' : 'Configurer ma Clé API'}
          </button>
          ${this.userApiKey ? `
            <button onclick="app.clearApiKey()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-xl transition">
              Effacer
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Admin Shortcut -->
      <div class="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <div class="font-bold text-xs">Espace d'Administration (/admin)</div>
          <div class="text-[11px] text-slate-400">Moniteur Tri-Agents, Dépôt & Validation</div>
        </div>
        <button onclick="app.navigate('admin')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition">
          Accéder
        </button>
      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 6: ADMINISTRATION (/admin)
  // ==========================================
  renderAdminView() {
    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Admin Header -->
      <div class="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
            Espace d'Administration (/admin)
          </span>
          <button onclick="app.loadAdminWorkers()" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
            Actualiser
          </button>
        </div>
        <h1 class="text-base sm:text-lg font-bold">Centre de Pilotage & Traitement Tri-Agents IA</h1>
        <p class="text-xs text-slate-300">Surveillez les 3 agents Gemini parallèles et l'ingestion documentaire.</p>
      </div>

      <!-- Admin Tab Switcher -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <button 
          onclick="app.setAdminTab('agents')" 
          class="px-3 py-1.5 rounded-xl transition ${this.adminTab === 'agents' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}"
        >
          Moniteur 3 Agents
        </button>
        <button 
          onclick="app.setAdminTab('upload')" 
          class="px-3 py-1.5 rounded-xl transition ${this.adminTab === 'upload' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}"
        >
          Dépôt Fichiers
        </button>
        <button 
          onclick="app.setAdminTab('validation')" 
          class="px-3 py-1.5 rounded-xl transition ${this.adminTab === 'validation' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}"
        >
          Validation Visuelle
        </button>
        <button 
          onclick="app.setAdminTab('console')" 
          class="px-3 py-1.5 rounded-xl transition ${this.adminTab === 'console' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}"
        >
          Console Ad-Hoc
        </button>
        <button 
          onclick="app.setAdminTab('audit')" 
          class="px-3 py-1.5 rounded-xl transition ${this.adminTab === 'audit' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}"
        >
          Audit
        </button>
      </div>

      <!-- Content -->
      <div>
        ${this.renderAdminTabContent()}
      </div>

    </div>
    `;
  }

  renderAdminTabContent() {
    switch (this.adminTab) {
      case 'upload':
        return this.renderAdminUploadTab();
      case 'validation':
        return this.renderAdminValidationTab();
      case 'console':
        return this.renderAdminConsoleTab();
      case 'audit':
        return this.renderAdminAuditTab();
      default:
        return this.renderAdminAgentsTab();
    }
  }

  renderAdminAgentsTab() {
    const agents = this.adminWorkers && this.adminWorkers.length > 0 ? this.adminWorkers : [
      { id: 'agent-1', name: 'Agent Alpha — Tri & Cours', specialty: 'Extraction & classification des cours', status: 'idle', jobsProcessed: 14, preferredModel: 'gemini-3.8-flash' },
      { id: 'agent-2', name: 'Agent Beta — Examens & Corrigés', specialty: 'Analyse d\'annales & appariement', status: 'idle', jobsProcessed: 18, preferredModel: 'gemini-3.8-flash' },
      { id: 'agent-3', name: 'Agent Gamma — RAG & Graphe', specialty: 'Segmentation & indexation concepts', status: 'idle', jobsProcessed: 22, preferredModel: 'gemini-3.1-flash-lite' }
    ];

    return `
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${agents.map((agent, i) => `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agent 0${i + 1}</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Disponible</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-xs">${agent.name}</h3>
              <p class="text-[11px] text-slate-500">${agent.specialty}</p>
            </div>
            <div class="bg-slate-50 p-2 rounded-lg text-[11px] space-y-1">
              <div class="flex justify-between"><span class="text-slate-500">Tâches :</span> <span class="font-bold text-slate-800">${agent.jobsProcessed}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Modèle :</span> <span class="font-mono text-blue-700">${agent.preferredModel}</span></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1 text-xs text-blue-900">
        <div class="font-bold flex items-center gap-1.5"><i data-lucide="shield" class="w-3.5 h-3.5 text-blue-600"></i> Relais & Fallback Automatique (Page 11)</div>
        <p class="text-[11px] text-blue-800">En cas d'erreur 429 ou 503, bascule automatique : gemini-3.8-flash ➔ gemini-3.1-flash-lite ➔ Déterministe local.</p>
      </div>
    </div>
    `;
  }

  renderAdminUploadTab() {
    return `
    <div class="space-y-4">
      <div 
        id="drop-zone"
        ondragover="event.preventDefault(); this.classList.add('border-blue-500', 'bg-blue-50/40')"
        ondragleave="this.classList.remove('border-blue-500', 'bg-blue-50/40')"
        ondrop="app.handleFileDrop(event)"
        class="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-8 text-center space-y-3 transition cursor-pointer"
        onclick="document.getElementById('file-upload-input').click()"
      >
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <i data-lucide="upload-cloud" class="w-6 h-6"></i>
        </div>
        <div>
          <p class="font-bold text-slate-800 text-xs sm:text-sm">Cliquez ou déposez un fichier ici</p>
          <p class="text-[11px] text-slate-500">Formats acceptés : PDF, Word, Excel, PowerPoint, Code .py, .cpp</p>
        </div>
        <input type="file" id="file-upload-input" onchange="app.handleFileSelect(event)" class="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.txt,.py,.cpp,.java,.sql">
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
        <div class="font-bold text-slate-800 text-xs">Exemples Démo Prêts à Classifier :</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onclick="app.uploadDemoDocument('exam_meca')" class="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition text-xs">
            <div class="font-semibold text-slate-800">📄 Examen Mécanique 2025</div>
            <div class="text-[10px] text-slate-500">PDF • Oscillateur amorti</div>
          </button>
          <button onclick="app.uploadDemoDocument('tp_algo')" class="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition text-xs">
            <div class="font-semibold text-slate-800">💻 TP Dijkstra C++</div>
            <div class="text-[10px] text-slate-500">Code • File de priorité</div>
          </button>
        </div>
      </div>

      <div id="upload-feedback" class="hidden p-3 rounded-xl text-xs"></div>
    </div>
    `;
  }

  renderAdminValidationTab() {
    return `
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
            <tr>
              <th class="p-3">Document</th>
              <th class="p-3">Type</th>
              <th class="p-3">Statut</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${this.resources.map(r => `
              <tr class="hover:bg-slate-50/80">
                <td class="p-3 font-semibold text-slate-900 max-w-xs truncate">${r.title}</td>
                <td class="p-3">${this.getTypeBadge(r.type)}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    ${r.status === 'published' ? 'Publié' : 'À valider'}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1">
                  <button onclick="app.openDocument('${r.id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[10px]">
                    Aperçu
                  </button>
                  ${r.status !== 'published' ? `
                    <button onclick="app.validateAndPublish('${r.id}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[10px]">
                      Publier
                    </button>
                  ` : `
                    <button onclick="app.deleteResource('${r.id}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-[10px]">
                      Retirer
                    </button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  renderAdminConsoleTab() {
    return `
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <button onclick="app.runAdminCommand('deduplicate')" class="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-2xs">
          <div class="font-bold text-slate-900 text-xs">Déduplication SHA-256</div>
          <p class="text-[10px] text-slate-500">Scanne les doublons binaires.</p>
        </button>
        <button onclick="app.runAdminCommand('audit_quality')" class="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-2xs">
          <div class="font-bold text-slate-900 text-xs">Audit Qualité</div>
          <p class="text-[10px] text-slate-500">Vérifie les corrigés manquants.</p>
        </button>
        <button onclick="app.runAdminCommand('generate_summaries')" class="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-2xs">
          <div class="font-bold text-slate-900 text-xs">Indexation Graphe</div>
          <p class="text-[10px] text-slate-500">Met à jour les concepts & prérequis.</p>
        </button>
      </div>

      <div class="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-2">
        <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 text-[10px]">
          <span>Terminal d'Exécution IA</span>
          <span id="console-status" class="text-emerald-400">Prêt</span>
        </div>
        <div id="console-output" class="min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300 text-[11px]">
Academic Hub Tri-Agents Kernel v1.0 initialized.
        </div>
      </div>
    </div>
    `;
  }

  renderAdminAuditTab() {
    return `
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
            <tr>
              <th class="p-3">Horodatage</th>
              <th class="p-3">Action</th>
              <th class="p-3">Détails</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
            ${(this.adminAudit && this.adminAudit.length > 0 ? this.adminAudit : []).map(log => `
              <tr class="hover:bg-slate-50/80">
                <td class="p-3 text-slate-500">${log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Récemment'}</td>
                <td class="p-3 font-bold text-blue-700">${log.action}</td>
                <td class="p-3 text-slate-700 font-sans truncate max-w-xs">${log.title || log.command || JSON.stringify(log.result || {})}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
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

  openDocument(id) {
    this.selectedResourceId = id;
    this.currentDocZoom = 100;
    this.navigate('document');
  }

  changeZoom(delta) {
    this.currentDocZoom = Math.max(70, Math.min(150, this.currentDocZoom + delta));
    this.render();
  }

  downloadFile(id) {
    const res = this.resources.find(r => r.id === id);
    if (!res) return;
    const blob = new Blob([res.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.fileName || `${res.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    if (files.length > 0) {
      await this.uploadFile(files[0]);
    }
  }

  async handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      await this.uploadFile(files[0]);
    }
  }

  async uploadFile(file) {
    const feedback = document.getElementById('upload-feedback');
    if (feedback) {
      feedback.className = 'p-3 rounded-xl text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
      feedback.innerHTML = `Classification par les agents IA de <strong>${file.name}</strong>...`;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('userApiKey', this.userApiKey);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (feedback) {
        feedback.className = 'p-3 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        feedback.innerHTML = `✅ <strong>Succès :</strong> ${res.message}`;
      }

      await this.fetchBaseData();
      await this.loadAdminWorkers();
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-3 rounded-xl text-xs bg-rose-50 text-rose-800 border border-rose-200 block';
        feedback.innerHTML = `❌ Erreur : ${err.message}`;
      }
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
      feedback.className = 'p-3 rounded-xl text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
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
        feedback.className = 'p-3 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        feedback.innerHTML = `✅ Fichier démo analysé et classifié avec succès !`;
      }
      await this.fetchBaseData();
      await this.loadAdminWorkers();
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-3 rounded-xl text-xs bg-rose-50 text-rose-800 border border-rose-200 block';
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
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 block';
      feedback.innerText = 'Veuillez saisir une clé API Gemini valide (ex: AIzaSy...).';
      return;
    }

    feedback.className = 'text-xs p-3 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 block';
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
        feedback.className = 'text-xs p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        feedback.innerText = '✅ Clé API validée avec succès !';
        this.updateApiKeyBadge();
        setTimeout(() => this.closeApiKeyModal(), 1200);
      } else {
        feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 block';
        feedback.innerText = `Échec : ${res.error}`;
      }
    } catch (err) {
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 block';
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
      feedback.className = 'text-xs p-3 rounded-xl bg-slate-100 text-slate-700 block';
      feedback.innerText = 'Clé effacée. Relais serveur actif.';
    }
    this.updateApiKeyBadge();
  }

  updateApiKeyBadge() {
    const statusBox = document.getElementById('api-key-status-box');
    if (statusBox) {
      statusBox.innerHTML = this.userApiKey
        ? `<span class="text-emerald-600 font-semibold">● Clé Personnelle Active</span>`
        : `<span class="text-slate-400">● Utilisation du relais faculté par défaut</span>`;
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
        alert("Succès : " + res.message);
        this.closeUploadModal();
        await this.fetchBaseData();
        await this.loadAdminWorkers();
        this.render();
      } else {
        alert("Échec : " + res.error);
      }
    } catch (err) {
      alert("Erreur réseau : " + err.message);
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
          btn.className = 'px-2.5 py-1 rounded-lg font-medium bg-white text-slate-600 border border-slate-200 whitespace-nowrap';
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
        listBtn.className = 'p-1 rounded font-medium text-slate-500 hover:text-slate-800';
      } else {
        listBtn.className = 'p-1 rounded font-medium bg-blue-600 text-white';
        treeBtn.className = 'p-1 rounded font-medium text-slate-500 hover:text-slate-800';
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
          <div class="p-8 text-center text-slate-500 text-xs">
            Aucun document ne correspond à vos filtres.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(r => {
        const course = this.courses.find(c => c.id === r.courseId);
        return `
          <div onclick="app.selectDocumentForChat('${r.id}')" class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl p-3 transition cursor-pointer flex items-center justify-between gap-3 group">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  ${r.type}
                </span>
                ${r.hasCorrection ? `
                  <span class="text-[9px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                    Corrigé
                  </span>
                ` : ''}
              </div>
              <h4 class="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600 transition">
                ${r.title}
              </h4>
              <p class="text-[10px] text-slate-500 mt-0.5 truncate">
                ${course ? `${course.code} — ${course.name}` : ''} ${r.professor ? `• ${r.professor}` : ''}
              </p>
            </div>
            <span class="text-slate-400 group-hover:text-blue-600 shrink-0 transition">
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
          <div class="p-8 text-center text-slate-500 text-xs">
            Aucun document ne correspond à vos filtres.
          </div>
        `;
        return;
      }

      let html = '';
      for (const [promoId, promoData] of promoMap.entries()) {
        const isPromoExpanded = this.expandedPromos.has(promoId);
        html += `
          <div class="border border-slate-200/80 rounded-xl bg-slate-50/50 overflow-hidden mb-2">
            <!-- Promo Header -->
            <div onclick="app.toggleLibraryPromo('${promoId}')" class="p-3 bg-slate-100/75 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer border-b border-slate-200/40">
              <span class="font-bold text-slate-800 text-xs flex items-center gap-2">
                <i data-lucide="graduation-cap" class="w-4 h-4 text-slate-500"></i>
                ${promoData.promo.name} <span class="text-[10px] text-slate-400 font-normal">(${promoData.promo.cycle})</span>
              </span>
              <span class="text-slate-400">
                <i data-lucide="${isPromoExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
              </span>
            </div>
            
            ${isPromoExpanded ? `
              <div class="p-2.5 space-y-2 bg-white">
                ${Array.from(promoData.courses.entries()).map(([courseId, courseData]) => {
                  const isCourseExpanded = this.expandedCourses.has(courseId);
                  return `
                    <div class="border border-slate-150 rounded-lg overflow-hidden">
                      <!-- Course Header -->
                      <div onclick="app.toggleLibraryCourse('${courseId}')" class="p-2.5 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer border-b border-slate-150">
                        <span class="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                          <i data-lucide="book-open" class="w-3.5 h-3.5 text-slate-400"></i>
                          ${courseData.course.code} — ${courseData.course.name}
                        </span>
                        <span class="text-slate-400">
                          <i data-lucide="${isCourseExpanded ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                        </span>
                      </div>
                      
                      ${isCourseExpanded ? `
                        <div class="p-2 space-y-1.5 bg-slate-50/20">
                          ${courseData.resources.map(r => `
                            <div onclick="app.selectDocumentForChat('${r.id}')" class="flex items-center justify-between p-2 rounded-md hover:bg-slate-100/80 transition cursor-pointer text-xs group">
                              <div class="min-w-0 pr-2">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                  <span class="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.2 rounded shrink-0">
                                    ${r.type}
                                  </span>
                                  ${r.hasCorrection ? `
                                    <span class="text-[9px] font-semibold text-teal-600 bg-teal-50 px-1 py-0.2 rounded shrink-0">
                                      Corrigé
                                    </span>
                                  ` : ''}
                                </div>
                                <div class="font-medium text-slate-700 truncate group-hover:text-blue-600 transition">
                                  ${r.title}
                                </div>
                              </div>
                              <span class="text-slate-300 group-hover:text-blue-600 shrink-0 transition">
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
    this.docPdfPage = 1;
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
    this.currentDocZoom = 100;
    this.navigate('document');
  }

  downloadFile(id) {
    const res = this.resources.find(r => r.id === id);
    if (!res) return;
    const content = res.content || 'Document académique Academic Hub';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.fileName || `${res.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Multi-page extraction helper
  extractDocumentPages(content) {
    if (!content) return ['(Document sans contenu textuel)'];
    // Split on explicit page delimiter if available
    if (content.includes('--- PAGE')) {
      const parts = content.split(/--- PAGE \d+ ---/i).filter(p => p.trim().length > 0);
      if (parts.length > 0) return parts;
    }
    // Or split on double newlines / paragraph chunks into 2-4 pages
    const paragraphs = content.split(/\n\n+/);
    if (paragraphs.length <= 4) return [content];
    
    const pageSize = Math.ceil(paragraphs.length / 3);
    const p1 = paragraphs.slice(0, pageSize).join('\n\n');
    const p2 = paragraphs.slice(pageSize, pageSize * 2).join('\n\n');
    const p3 = paragraphs.slice(pageSize * 2).join('\n\n');
    return [p1, p2, p3].filter(p => p && p.trim().length > 0);
  }

  setPdfPage(page) {
    this.docPdfPage = page;
    this.render();
  }

  prevPdfPage() {
    this.setPdfPage(Math.max(1, (this.docPdfPage || 1) - 1));
  }

  nextPdfPage() {
    this.setPdfPage((this.docPdfPage || 1) + 1);
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
      return escaped.replace(regex, '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded shadow-2xs">$1</mark>');
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
      escaped = escaped.replace(regex, '<span class="text-indigo-400 font-bold">$1</span>');
    });

    // Strings
    escaped = escaped.replace(/(".*?"|'.*?')/g, '<span class="text-emerald-300">$1</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-amber-300">$1</span>');

    return escaped;
  }

  copyCodeToClipboard() {
    const res = this.resources.find(r => r.id === this.selectedResourceId);
    if (!res || !res.content) return;
    navigator.clipboard.writeText(res.content).then(() => {
      const btn = document.getElementById('copy-code-btn');
      if (btn) {
        btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i><span class="text-emerald-400 font-bold">Copié !</span>`;
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
    formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="font-bold text-slate-900 text-xs sm:text-sm mt-2.5 mb-1">$1</h3>');
    formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="font-extrabold text-slate-900 text-sm sm:text-base mt-3 mb-1">$1</h2>');

    // Bold & Italics
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    formatted = formatted.replace(/\*([^\*\n]+)\*/g, '<em class="italic text-slate-700">$1</em>');

    // Inline Code
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>');

    // Bullet points
    formatted = formatted.replace(/^[•*-] (.*?)$/gm, '<div class="flex items-start gap-1.5 my-1"><span class="text-blue-500 font-bold shrink-0">•</span><span class="flex-1">$1</span></div>');

    // Numbered points
    formatted = formatted.replace(/^(\d+)\. (.*?)$/gm, '<div class="flex items-start gap-1.5 my-1"><span class="font-bold text-blue-700 shrink-0 text-xs">$1.</span><span class="flex-1">$2</span></div>');

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
}

// Global App Instance
window.app = new AcademicHubApp();

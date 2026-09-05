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
        course: 'Analyse II (MATH201)',
        preview: 'Explication géométrique et application aux fractions rationnelles...'
      },
      {
        id: 'session-2',
        title: 'Préparation Examen Mécanique du Point',
        mode: 'revision',
        date: 'Hier, 16:20',
        course: 'Physique I (PHYS101)',
        preview: 'Oscillateur harmonique amorti et bilan énergétique...'
      },
      {
        id: 'session-3',
        title: 'Exercices guidés sur les Graphes (Dijkstra)',
        mode: 'exercer',
        date: '03 Sept. 2026',
        course: 'Algorithmique & Graphes (INFO201)',
        preview: 'Complexité avec file de priorité et recherche du plus court chemin...'
      }
    ];

    // Student learning profile
    this.studentProfile = {
      name: 'Alex S.',
      filiere: 'Licence 2 — Sciences Physiques & Informatique',
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
          drawerItem.classList.add('bg-blue-600/20', 'text-blue-400', 'font-semibold');
          drawerItem.classList.remove('text-slate-300');
        } else {
          drawerItem.classList.remove('bg-blue-600/20', 'text-blue-400', 'font-semibold');
          drawerItem.classList.add('text-slate-300');
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

        <!-- Promotion Dropdown (Compact) -->
        <select 
          onchange="app.setFilter('promotionId', this.value)" 
          class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none shrink-0"
        >
          <option value="">Toutes les promotions</option>
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
        <p class="text-sm text-slate-600">Document introuvable ou retiré.</p>
        <button onclick="app.navigate('documents')" class="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">Retour aux documents</button>
      </div>
      `;
    }

    const course = this.courses.find(c => c.id === res.courseId);
    const promo = this.promotions.find(p => p.id === res.promotionId);
    let correction = null;
    if (res.correctionId) {
      correction = this.resources.find(r => r.id === res.correctionId);
    } else if (res.type === 'Examen' || res.type === 'Interrogation') {
      correction = this.resources.find(r => r.type === 'Corrigé' && r.courseId === res.courseId);
    }

    const related = this.resources.filter(r => r.id !== res.id && r.courseId === res.courseId).slice(0, 3);
    const courseVideo = (this.videos || []).find(v => v.courseId === res.courseId);

    return `
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Action Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-3 min-w-0">
          <button onclick="app.navigate('documents')" class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200 shrink-0" title="Retour">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </button>
          <div class="truncate">
            <div class="flex items-center gap-2">
              ${this.getTypeBadge(res.type)}
              <span class="text-xs font-semibold text-slate-500">${res.academicYear || '2024-2025'}</span>
            </div>
            <h1 class="font-bold text-slate-900 text-sm truncate mt-0.5">${res.title}</h1>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
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

      <!-- Main Reader Content -->
      <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        
        <!-- Viewer Header Bar -->
        <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div class="flex items-center gap-2 truncate">
            <i data-lucide="file-text" class="w-4 h-4 text-blue-600 shrink-0"></i>
            <span class="font-mono font-semibold truncate">${res.fileName || 'document.pdf'}</span>
            <span class="text-slate-400">(${res.fileSize || '380 Ko'})</span>
          </div>
          <!-- Zoom Controls -->
          <div class="flex items-center bg-slate-200/70 rounded-lg p-0.5 text-xs font-bold">
            <button onclick="app.changeZoom(-10)" class="px-2 py-0.5 hover:bg-white rounded text-slate-700">-</button>
            <span class="px-2 font-mono text-[11px] font-medium text-slate-700">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-0.5 hover:bg-white rounded text-slate-700">+</button>
          </div>
        </div>

        <!-- Document Text Viewer Area -->
        <div class="p-6 sm:p-8 overflow-auto bg-slate-50/40 min-h-[420px]">
          <div style="font-size: ${this.currentDocZoom}%; line-height: 1.65;" class="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xs border border-slate-200/80 transition-all duration-150">
            ${res.format === 'code' ? `
              <div class="font-mono text-xs text-slate-100 bg-slate-900 p-4 rounded-xl overflow-x-auto leading-relaxed">
                ${this.escapeHtml(res.content)}
              </div>
            ` : `
              <div class="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                ${this.escapeHtml(res.content)}
              </div>
            `}
          </div>
        </div>

      </div>

      <!-- Associated Resources & Context Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- Context Card -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2 shadow-2xs text-xs">
          <h2 class="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-600"></i>
            Contexte Académique
          </h2>
          <div class="space-y-1 text-slate-600">
            <div><span class="font-semibold text-slate-800">Matière :</span> ${course ? `${course.code} — ${course.name}` : 'Matière'}</div>
            <div><span class="font-semibold text-slate-800">Promotion :</span> ${promo ? `${promo.name} (${promo.faculty})` : 'Licence'}</div>
            <div><span class="font-semibold text-slate-800">Référent :</span> ${res.professor || 'Département'}</div>
            <div><span class="font-semibold text-slate-800">Période :</span> ${res.session || 'Session Principale'} (${res.semester || 'S1'})</div>
          </div>
        </div>

        <!-- Correction / Related Card -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2 shadow-2xs text-xs">
          <h2 class="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <i data-lucide="link-2" class="w-3.5 h-3.5 text-teal-600"></i>
            Ressources Associées
          </h2>
          
          ${correction ? `
            <div class="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-1.5">
              <div class="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                <i data-lucide="check-circle" class="w-4 h-4 text-teal-600"></i>
                Corrigé Officiel Validé
              </div>
              <p class="text-[11px] text-teal-800 line-clamp-1">${correction.title}</p>
              <button onclick="app.openDocument('${correction.id}')" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-1.5 rounded-lg transition">
                Consulter le Corrigé
              </button>
            </div>
          ` : `
            <div class="text-slate-500 italic p-2 bg-slate-50 rounded-lg">
              Aucun corrigé direct requis ou disponible pour cette ressource.
            </div>
          `}
        </div>

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
            <i data-lucide="book-marked" class="w-3 h-3"></i> Révision faculté
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
              <button onclick="app.openCameraScanner()" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Appareil photo / Scan</div>
                  <div class="text-[10px] text-slate-500">Scanner un document</div>
                </div>
              </button>

              <button onclick="app.startVoiceInput(); app.togglePlusMenu(false);" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <i data-lucide="mic" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Note Vocale</div>
                  <div class="text-[10px] text-slate-500">Dicter votre question</div>
                </div>
              </button>

              <button onclick="app.navigate('documents'); app.togglePlusMenu(false);" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Documents & Cours</div>
                  <div class="text-[10px] text-slate-500">Explorer la bibliothèque</div>
                </div>
              </button>

              <button onclick="app.openApiKeyModal(); app.togglePlusMenu(false);" class="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <i data-lucide="key" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                  <div class="font-semibold text-slate-800">Clé API & IA</div>
                  <div class="text-[10px] text-slate-500">Intelligence Personnalisée</div>
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
        return `Priorité absolue aux annales et examens de la faculté.`;
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
        text: `Nouvelle session de tuteur démarrée !\n\nSur quel thème ou cours de votre faculté souhaitez-vous travailler aujourd'hui ?`,
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
    let demoContent = `UNIVERSITÉ - DÉPARTEMENT DE PHYSIQUE (PHYS101)
Épreuve d'Examen Final : Mécanique du Point Matériel — Session Janvier 2025
Professeur : Dr. Marc Beauchamp
Exercice 1 : Oscillations libres amorties, équation différentielle x'' + 2gamma x' + w0^2 x = 0.`;

    if (type === 'tp_algo') {
      demoFileName = 'TP4_Dijkstra_Graphes_INFO201.cpp';
      demoContent = `// Algorithmique II - TP Graphes et Dijkstra
// Faculté d'Informatique
#include <iostream>
#include <vector>
// Implémentation de la file à priorité pour Dijkstra`;
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

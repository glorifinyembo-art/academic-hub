// Academic Hub — Client-Side Application Core
// Conçu par les étudiants, pour les étudiants.

class AcademicHubApp {
  constructor() {
    this.currentView = 'home';
    this.resources = [];
    this.courses = [];
    this.promotions = [];
    this.videos = [];
    this.selectedResourceId = null;
    this.currentDocZoom = 100;
    this.docSearchQuery = '';

    // Filter state
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
    this.tutorMessages = [
      {
        id: 'msg-init-1',
        sender: 'tutor',
        text: `Bienvenue sur le **Tuteur Pédagogique d'Academic Hub** !\n\nJe suis connecté à la base de connaissances de votre faculté (supports de cours, annales d'examens, interrogations et corrigés officiels).\n\nChoisissez un mode selon votre objectif d'étude :\n• **Chat** : Pour poser n'importe quelle question sur un cours.\n• **Apprendre** : Auto-évaluation de 1 à 10, diagnostic et progression étape par étape.\n• **Révision** : Priorité absolue aux annales et exigences du professeur.\n• **S'exercer** : Problèmes guidés avec indices progressifs sans donner la solution tout de suite !`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // Student learning profile
    this.studentProfile = {
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
    this.render();

    // Check URL parameters (e.g. ?view=document&id=res-exam-math-2025)
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');
    if (viewParam && ['home', 'courses', 'document', 'tutor', 'admin'].includes(viewParam)) {
      if (viewParam === 'document' && idParam) {
        this.selectedResourceId = idParam;
      }
      this.navigate(viewParam, false);
    } else {
      this.navigate('home', false);
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

  navigate(viewName, updateUrl = true) {
    this.currentView = viewName;
    if (viewName === 'admin') {
      this.loadAdminWorkers();
    }

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

    // Update Desktop Nav UI
    ['home', 'courses', 'tutor', 'admin'].forEach(v => {
      const el = document.getElementById(`nav-${v}`);
      if (el) {
        if (v === viewName || (v === 'home' && viewName === 'document')) {
          el.className = 'px-3.5 py-1.5 rounded-lg bg-white text-blue-600 shadow-sm border border-slate-200/60 font-semibold';
        } else {
          el.className = 'px-3.5 py-1.5 rounded-lg transition-all text-slate-600 hover:text-slate-900';
        }
      }

      // Update mobile tabs
      const tabEl = document.getElementById(`tab-${v}`);
      if (tabEl) {
        if (v === viewName || (v === 'home' && viewName === 'document')) {
          tabEl.className = 'flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-3 rounded-lg text-blue-600';
        } else {
          tabEl.className = 'flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg text-slate-400';
        }
      }
    });

    this.render();
    window.scrollTo(0, 0);
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  }

  // Type Badges styling helper
  getTypeBadge(type) {
    const map = {
      'TP': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'flask-conical' },
      'Interrogation': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'file-check' },
      'Examen': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'award' },
      'Exercices': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'edit-3' },
      'Supports de Cours': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'book-open' },
      'Corrigé': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: 'check-circle-2' },
    };
    const conf = map[type] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'file-text' };
    return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${conf.bg} ${conf.text} ${conf.border}">
      <i data-lucide="${conf.icon}" class="w-3 h-3"></i>
      ${type}
    </span>`;
  }

  // Master Render Switcher
  render() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    if (this.currentView === 'home') {
      container.innerHTML = this.renderHomeView();
    } else if (this.currentView === 'courses') {
      container.innerHTML = this.renderCoursesView();
    } else if (this.currentView === 'document') {
      container.innerHTML = this.renderDocumentView();
    } else if (this.currentView === 'tutor') {
      container.innerHTML = this.renderTutorView();
    } else if (this.currentView === 'admin') {
      container.innerHTML = this.renderAdminView();
    }

    // Re-initialize lucide icons for newly rendered DOM elements
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // VIEW 1: HOME & HYBRID SEARCH EXPLORER
  // ==========================================
  renderHomeView() {
    // Apply client-side filters
    const filtered = this.resources.filter(r => {
      if (this.filters.promotionId && r.promotionId !== this.filters.promotionId) return false;
      if (this.filters.courseId && r.courseId !== this.filters.courseId) return false;
      if (this.filters.type && r.type !== this.filters.type) return false;
      if (this.filters.hasCorrection === 'true' && !r.hasCorrection) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inProf = r.professor.toLowerCase().includes(q);
        const inContent = (r.content || '').toLowerCase().includes(q);
        const inChapter = (r.chapter || '').toLowerCase().includes(q);
        if (!inTitle && !inProf && !inContent && !inChapter) return false;
      }
      return true;
    });

    const examsWithCorr = this.resources.filter(r => (r.type === 'Examen' || r.type === 'Interrogation') && r.hasCorrection).length;

    return `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      <!-- Clean Welcome & Search Hero -->
      <div class="bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Mémoire Académique de la Faculté — Semestre 1 & 2
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Tous vos cours, examens et travaux dirigés, centralisés & vérifiés.
          </h1>
          <p class="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Consultez instantanément les annales corrigées, fiches de révision et sujets pratiques. Posez vos questions au tuteur IA nourri par les supports de vos professeurs.
          </p>
        </div>

        <!-- Natural Language Search Bar -->
        <div class="mt-5">
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none"></i>
            <input 
              type="text" 
              id="search-input"
              value="${this.filters.search}" 
              placeholder="Ex : Examen Analyse 2 avec corrigé, TP Arbre AVL, Théorème Énergie mécanique..." 
              oninput="app.onSearchInput(this.value)"
              class="w-full bg-white text-slate-900 pl-11 pr-24 py-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm transition shadow-sm"
            >
            ${this.filters.search ? `
              <button onclick="app.clearSearch()" class="absolute right-12 text-slate-400 hover:text-slate-600 p-1">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            ` : ''}
            <button onclick="app.triggerSearch()" class="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5">
              <span>Chercher</span>
            </button>
          </div>
        </div>

        <!-- Quick Filter Pills -->
        <div class="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span class="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i> Filtres :
          </span>

          <!-- Promotion selector -->
          <select onchange="app.setFilter('promotionId', this.value)" class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none">
            <option value="">Toutes les promotions</option>
            ${this.promotions.map(p => `<option value="${p.id}" ${this.filters.promotionId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>

          <!-- Type selector -->
          <select onchange="app.setFilter('type', this.value)" class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none">
            <option value="">Tous les types</option>
            <option value="Examen" ${this.filters.type === 'Examen' ? 'selected' : ''}>Examens</option>
            <option value="Interrogation" ${this.filters.type === 'Interrogation' ? 'selected' : ''}>Interrogations</option>
            <option value="TP" ${this.filters.type === 'TP' ? 'selected' : ''}>Travaux Pratiques (TP)</option>
            <option value="Exercices" ${this.filters.type === 'Exercices' ? 'selected' : ''}>Exercices / TD</option>
            <option value="Supports de Cours" ${this.filters.type === 'Supports de Cours' ? 'selected' : ''}>Supports de Cours</option>
            <option value="Corrigé" ${this.filters.type === 'Corrigé' ? 'selected' : ''}>Corrigés Officiels</option>
          </select>

          <!-- Has correction toggle -->
          <button 
            onclick="app.toggleCorrectionFilter()" 
            class="text-xs font-medium px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${this.filters.hasCorrection === 'true' ? 'bg-teal-50 text-teal-700 border-teal-300 font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
          >
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-teal-600"></i>
            <span>Avec corrigé vérifié</span>
          </button>

          ${(this.filters.search || this.filters.promotionId || this.filters.type || this.filters.hasCorrection) ? `
            <button onclick="app.resetFilters()" class="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 ml-auto flex items-center gap-1">
              <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Réinitialiser
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Faculty Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div class="text-xl font-black text-slate-900">${this.resources.length}</div>
          <div class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Documents Actifs</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div class="text-xl font-black text-teal-600">${examsWithCorr}</div>
          <div class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Épreuves Corrigées</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div class="text-xl font-black text-blue-600">${this.courses.length}</div>
          <div class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Cours & Filières</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div class="text-xl font-black text-indigo-600">100%</div>
          <div class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Validé par la Faculté</div>
        </div>
      </div>

      <!-- Resources Grid / List -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="book-marked" class="w-5 h-5 text-blue-600"></i>
            Ressources Académiques (${filtered.length})
          </h2>
          <span class="text-xs text-slate-500">Classées par pertinence & date</span>
        </div>

        ${filtered.length === 0 ? `
          <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <i data-lucide="search-x" class="w-6 h-6"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-sm">Aucun document ne correspond à vos filtres</h3>
            <p class="text-xs text-slate-500">Essayez d'élargir votre recherche ou de réinitialiser la promotion et les filtres de type.</p>
            <button onclick="app.resetFilters()" class="text-xs bg-slate-100 hover:bg-slate-200 font-semibold px-4 py-2 rounded-xl text-slate-700 transition">
              Réinitialiser les filtres
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filtered.map(r => this.renderResourceCard(r)).join('')}
          </div>
        `}
      </div>

    </div>
    `;
  }

  renderResourceCard(res) {
    const course = this.courses.find(c => c.id === res.courseId);
    const promo = this.promotions.find(p => p.id === res.promotionId);

    return `
    <div class="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group">
      <div class="p-5 space-y-3">
        
        <!-- Header badge & Year -->
        <div class="flex items-start justify-between gap-2">
          ${this.getTypeBadge(res.type)}
          <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            ${res.academicYear || '2024-2025'}
          </span>
        </div>

        <!-- Title -->
        <div>
          <h3 onclick="app.openDocument('${res.id}')" class="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 cursor-pointer transition line-clamp-2">
            ${res.title}
          </h3>
          <p class="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
            ${course ? `${course.code} — ${course.name}` : 'Matière universitaire'}
          </p>
        </div>

        <!-- Academic Context Details -->
        <div class="pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <span class="flex items-center gap-1"><i data-lucide="user-check" class="w-3.5 h-3.5 text-slate-400"></i>${res.professor || 'Département'}</span>
          <span class="flex items-center gap-1"><i data-lucide="layers" class="w-3.5 h-3.5 text-slate-400"></i>${promo ? promo.cycle : 'Licence'}</span>
          ${res.hasCorrection ? `
            <span class="flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded">
              <i data-lucide="check" class="w-3 h-3 text-teal-600"></i> Corrigé lié
            </span>
          ` : ''}
        </div>

      </div>

      <!-- Action Footer -->
      <div class="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button onclick="app.openDocument('${res.id}')" class="flex-1 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Lire le document</span>
        </button>
        <button onclick="app.startTutorOnResource('${res.id}')" title="Réviser avec l'IA" class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 p-2 rounded-xl transition">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
    `;
  }

  // ==========================================
  // VIEW 2: COURSES BANK & FOLDER TREE
  // ==========================================
  renderCoursesView() {
    return `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      <div class="border-b border-slate-200 pb-4">
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="folder-tree" class="w-6 h-6 text-blue-600"></i>
          Banque par Matières & Filières
        </h1>
        <p class="text-slate-600 text-xs sm:text-sm mt-1">
          Arborescence académique structurée : cours, travaux pratiques, examens et corrigés de chaque promotion.
        </p>
      </div>

      <div class="space-y-8">
        ${this.promotions.map(promo => {
          const promoCourses = this.courses.filter(c => c.promotionId === promo.id);
          if (promoCourses.length === 0) return '';

          return `
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-blue-600"></div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">${promo.name}</h2>
              <span class="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                ${promo.faculty}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${promoCourses.map(course => this.renderCourseFolderCard(course)).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  }

  renderCourseFolderCard(course) {
    const courseResources = this.resources.filter(r => r.courseId === course.id);
    const tpCount = courseResources.filter(r => r.type === 'TP').length;
    const interroCount = courseResources.filter(r => r.type === 'Interrogation').length;
    const examenCount = courseResources.filter(r => r.type === 'Examen').length;
    const coursCount = courseResources.filter(r => r.type === 'Supports de Cours').length;

    return `
    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
            ${course.code}
          </span>
          <h3 class="font-bold text-slate-900 text-base mt-1.5 leading-snug">${course.name}</h3>
          <p class="text-xs text-slate-500 mt-1 font-medium">Référent : ${course.professor}</p>
        </div>
        <button onclick="app.launchRevisionForCourse('${course.id}')" class="text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200/60 transition flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Réviser</span>
        </button>
      </div>

      <p class="text-xs text-slate-600 leading-relaxed">${course.description}</p>

      <!-- Sub-folder category counts -->
      <div class="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
        <button onclick="app.filterByCourseAndType('${course.id}', 'TP')" class="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 p-2 rounded-xl border border-slate-200/80 transition">
          <div class="text-sm font-bold text-emerald-700">${tpCount}</div>
          <div class="text-[10px] text-slate-500 font-medium">TPs</div>
        </button>
        <button onclick="app.filterByCourseAndType('${course.id}', 'Interrogation')" class="bg-slate-50 hover:bg-amber-50 hover:border-amber-200 p-2 rounded-xl border border-slate-200/80 transition">
          <div class="text-sm font-bold text-amber-700">${interroCount}</div>
          <div class="text-[10px] text-slate-500 font-medium">Interros</div>
        </button>
        <button onclick="app.filterByCourseAndType('${course.id}', 'Examen')" class="bg-slate-50 hover:bg-rose-50 hover:border-rose-200 p-2 rounded-xl border border-slate-200/80 transition">
          <div class="text-sm font-bold text-rose-700">${examenCount}</div>
          <div class="text-[10px] text-slate-500 font-medium">Examens</div>
        </button>
        <button onclick="app.filterByCourseAndType('${course.id}', 'Supports de Cours')" class="bg-slate-50 hover:bg-purple-50 hover:border-purple-200 p-2 rounded-xl border border-slate-200/80 transition">
          <div class="text-sm font-bold text-purple-700">${coursCount}</div>
          <div class="text-[10px] text-slate-500 font-medium">Syllabus</div>
        </button>
      </div>

      <!-- Chapters list -->
      <div class="space-y-1.5 pt-2">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chapitres au programme :</div>
        ${course.chapters.map(c => `
          <div class="text-xs text-slate-700 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span class="font-medium text-slate-800">Ch. ${c.number} :</span>
            <span class="truncate">${c.title}</span>
          </div>
        `).join('')}
      </div>
    </div>
    `;
  }

  // ==========================================
  // VIEW 3: MULTI-FORMAT DOCUMENT READER
  // ==========================================
  renderDocumentView() {
    const res = this.resources.find(r => r.id === this.selectedResourceId);
    if (!res) {
      return `
      <div class="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p class="text-sm text-slate-600">Document introuvable ou retiré du centre d'information.</p>
        <button onclick="app.navigate('home')" class="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl">Retour aux ressources</button>
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
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Top Reader Navigation Bar -->
      <div class="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-3">
          <button onclick="app.navigate('home')" class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </button>
          <div>
            <div class="flex items-center gap-2">
              ${this.getTypeBadge(res.type)}
              <span class="text-xs font-semibold text-slate-500">${res.academicYear || '2024-2025'}</span>
            </div>
            <h1 class="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 mt-0.5">${res.title}</h1>
          </div>
        </div>

        <!-- Reader Controls -->
        <div class="flex items-center gap-2">
          <!-- Zoom Controls -->
          <div class="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button onclick="app.changeZoom(-10)" class="px-2 py-1 hover:bg-white rounded text-slate-700 font-bold">-</button>
            <span class="px-2 font-mono font-medium text-slate-600">${this.currentDocZoom}%</span>
            <button onclick="app.changeZoom(10)" class="px-2 py-1 hover:bg-white rounded text-slate-700 font-bold">+</button>
          </div>

          <button onclick="app.downloadFile('${res.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Télécharger</span>
          </button>

          <button onclick="app.startTutorOnResource('${res.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
            <i data-lucide="bot" class="w-3.5 h-3.5"></i>
            <span>Tuteur IA</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: Viewer (Left) + Academic Context & Relations (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Viewer Container (75% / 8 cols on desktop) -->
        <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[550px]">
          
          <!-- Document Header toolbar -->
          <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i>
              <span class="font-mono font-semibold">${res.fileName || 'document.pdf'}</span>
              <span class="text-slate-400">(${res.fileSize || '380 Ko'})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] bg-slate-200/80 px-2 py-0.5 rounded font-mono">SHA-256: ${(res.checksum || '').substring(0, 10)}...</span>
            </div>
          </div>

          <!-- Document Render Area (Zoomable) -->
          <div class="p-6 sm:p-8 flex-1 overflow-auto bg-slate-50/50">
            <div style="font-size: ${this.currentDocZoom}%; line-height: 1.6;" class="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-slate-200/80 transition-all duration-150">
              
              ${res.format === 'code' ? `
                <div class="font-mono text-xs text-slate-800 whitespace-pre-wrap bg-slate-900 text-slate-100 p-5 rounded-xl overflow-x-auto leading-relaxed">
                  ${this.escapeHtml(res.content)}
                </div>
              ` : `
                <div class="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm whitespace-pre-wrap font-serif leading-relaxed">
                  ${this.escapeHtml(res.content)}
                </div>
              `}

            </div>
          </div>

        </div>

        <!-- Academic Context & Relations Sidebar (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- Official Meta Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <i data-lucide="info" class="w-4 h-4 text-blue-600"></i>
              Contexte Académique
            </h2>

            <div class="space-y-2 text-xs">
              <div>
                <span class="text-slate-500 font-medium">Matière :</span>
                <p class="font-semibold text-slate-800">${course ? `${course.code} — ${course.name}` : 'Matière'}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Promotion & Faculté :</span>
                <p class="font-semibold text-slate-800">${promo ? `${promo.name} (${promo.faculty})` : 'Licence'}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Professeur référent :</span>
                <p class="font-semibold text-slate-800">${res.professor || 'Département'}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Session / Période :</span>
                <p class="font-semibold text-slate-800">${res.session || 'Session Principale'} (${res.semester || 'S1'})</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Chapitre rattaché :</span>
                <p class="font-semibold text-slate-800">${res.chapter || 'Général'}</p>
              </div>
            </div>
          </div>

          <!-- Associated Resources (Page 15: Corrigés de Première Classe) -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <i data-lucide="link-2" class="w-4 h-4 text-teal-600"></i>
              Ressources Associées
            </h2>

            <!-- Official Correction Link -->
            ${correction ? `
              <div class="bg-teal-50/80 border border-teal-200 rounded-xl p-3 space-y-2">
                <div class="flex items-center gap-2 text-teal-900 text-xs font-bold">
                  <i data-lucide="check-circle" class="w-4 h-4 text-teal-600"></i>
                  Corrigé Officiel Validé
                </div>
                <p class="text-[11px] text-teal-800 font-medium leading-snug">${correction.title}</p>
                <button onclick="app.openDocument('${correction.id}')" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  Consulter le Corrigé Type
                </button>
              </div>
            ` : `
              <div class="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                Aucun corrigé direct officiel n'est requis ou disponible pour ce format.
              </div>
            `}

            <!-- Other exercises or documents of the same course -->
            ${related.length > 0 ? `
              <div class="space-y-2 pt-2">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Autres annales du cours :</div>
                ${related.map(rel => `
                  <div onclick="app.openDocument('${rel.id}')" class="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition text-xs space-y-1 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      ${this.getTypeBadge(rel.type)}
                      <span class="text-[10px] text-slate-500">${rel.academicYear}</span>
                    </div>
                    <p class="font-semibold text-slate-800 line-clamp-1">${rel.title}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Video recommendation if available (Page 16) -->
            ${courseVideo ? `
              <div class="pt-2 border-t border-slate-100">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vidéo de synthèse validée :</div>
                <div class="bg-rose-50/60 border border-rose-200 rounded-xl p-3 space-y-2">
                  <div class="flex items-center gap-2 text-rose-800 text-xs font-bold">
                    <i data-lucide="youtube" class="w-4 h-4 text-rose-600"></i>
                    ${courseVideo.title}
                  </div>
                  <p class="text-[11px] text-slate-600">${courseVideo.channel} (${courseVideo.duration})</p>
                  <a href="${courseVideo.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900">
                    <span>Ouvrir sur YouTube</span>
                    <i data-lucide="external-link" class="w-3 h-3"></i>
                  </a>
                </div>
              </div>
            ` : ''}

          </div>

        </div>

      </div>

    </div>
    `;
  }

  // ==========================================
  // VIEW 4: AI TUTOR & LEARNING AGENT
  // ==========================================
  renderTutorView() {
    return `
    <div class="max-w-5xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      
      <!-- Tutor Top Mode Bar (Page 18) -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <i data-lucide="bot" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-extrabold text-slate-900 text-base">Tuteur Pédagogique Intelligent</h1>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">IA Faculté</span>
              </div>
              <p class="text-xs text-slate-500">RAG académique & adaptation en temps réel</p>
            </div>
          </div>

          <!-- 4 Operating Modes (Page 18) -->
          <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button 
              onclick="app.setTutorMode('chat')" 
              class="px-3 py-1.5 rounded-lg transition ${this.tutorMode === 'chat' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              Chat Libre
            </button>
            <button 
              onclick="app.setTutorMode('apprendre')" 
              class="px-3 py-1.5 rounded-lg transition ${this.tutorMode === 'apprendre' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              Apprendre (1-10)
            </button>
            <button 
              onclick="app.setTutorMode('revision')" 
              class="px-3 py-1.5 rounded-lg transition ${this.tutorMode === 'revision' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              Révision Annales
            </button>
            <button 
              onclick="app.setTutorMode('exercer')" 
              class="px-3 py-1.5 rounded-lg transition ${this.tutorMode === 'exercer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              S'exercer (Indices)
            </button>
          </div>
        </div>

        <!-- Mode Explanation Banner -->
        <div class="text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
          <i data-lucide="info" class="w-4 h-4 text-blue-600 shrink-0 mt-0.5"></i>
          <div class="text-slate-600 leading-relaxed">
            ${this.getTutorModeDescription()}
          </div>
        </div>

        <!-- Learning State Tree & Mastery Indicators (Pages 19-23) -->
        <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-slate-500 font-medium">Niveau auto-déclaré :</span>
            <div class="flex items-center gap-1">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => `
                <button 
                  onclick="app.setDeclaredMasteryLevel(${lvl})" 
                  class="w-6 h-6 rounded-md font-bold text-[11px] transition ${this.studentProfile.declaredLevel === lvl ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
                >
                  ${lvl}
                </button>
              `).join('')}
              <span class="text-[10px] text-slate-400 ml-1">/10</span>
            </div>
          </div>

          <!-- Active branch breadcrumbs -->
          ${this.studentProfile.activeBranch ? `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              <i data-lucide="git-branch" class="w-3.5 h-3.5 text-amber-600"></i>
              <span>Branche active : ${this.studentProfile.activeBranch.title}</span>
              <button onclick="app.closeActiveBranch()" class="ml-1 text-amber-600 hover:text-amber-800 underline text-[10px]">
                (Clôturer)
              </button>
            </div>
          ` : `
            <div class="text-[11px] text-slate-500">
              <span class="font-medium text-slate-700">Objectif :</span> ${this.studentProfile.activeGoal}
            </div>
          `}
        </div>

      </div>

      <!-- Chat Discussion Messages Window -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col h-[520px]">
        <div id="tutor-chat-box" class="flex-1 overflow-y-auto space-y-4 pr-1">
          ${this.tutorMessages.map(msg => this.renderTutorChatMessage(msg)).join('')}
        </div>

        <!-- Suggestion Chips -->
        <div class="py-2 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap border-t border-slate-100 mt-2">
          <span class="text-slate-400 text-[11px] mr-1">Suggestions :</span>
          <button onclick="app.sendQuickPrompt('Sur une échelle de 1 à 10, teste mon niveau sur l\'intégration par parties')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition">
            🎯 Tester mon niveau (1 à 10)
          </button>
          <button onclick="app.sendQuickPrompt('Donne-moi un exercice guidé de niveau intermédiaire avec indices')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition">
            📝 Exercice avec indices
          </button>
          <button onclick="app.sendQuickPrompt('Je bloque sur le calcul des primitives de fonctions usuelles')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition">
            🔍 Je bloque sur un prérequis
          </button>
          <button onclick="app.sendQuickPrompt('Quels sont les pièges fréquents à l\'examen d\'Analyse II ?')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition">
            ⚠️ Pièges d'examen
          </button>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="app.handleTutorSubmit(event)" class="mt-2 flex items-center gap-2">
          <input 
            type="text" 
            id="tutor-input" 
            placeholder="Posez votre question académique, proposez une réponse ou demandez un indice..." 
            class="flex-1 bg-slate-50 text-slate-900 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm transition"
          >
          <button type="submit" id="btn-tutor-send" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0">
            <span>Envoyer</span>
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
        return `<strong>Mode Apprendre</strong> : Évalue votre niveau initial (1-10), repère immédiatement les confusions de prérequis et ouvre des branches d'assimilation ciblées avec analogies et exemples progressifs.`;
      case 'revision':
        return `<strong>Mode Révision Faculté</strong> : Donne la priorité absolue aux polycopiés, partiels précédents et corrigés officiels de vos professeurs pour vous aligner sur les critères de notation.`;
      case 'exercer':
        return `<strong>Mode S'exercer</strong> : Vous propose des problèmes ciblés et délivre 3 niveaux d'indices progressifs (Théorie ➔ Stratégie ➔ Première étape) pour vous laisser le temps de chercher.`;
      default:
        return `<strong>Mode Chat Libre</strong> : Répond à toutes vos questions académiques en sourçant chaque affirmation avec les documents du centre de connaissances.`;
    }
  }

  renderTutorChatMessage(msg) {
    const isTutor = msg.sender === 'tutor';

    return `
    <div class="flex items-start gap-3 ${isTutor ? '' : 'flex-row-reverse'} animate-in fade-in duration-150">
      <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${isTutor ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}">
        ${isTutor ? '<i data-lucide="bot" class="w-4 h-4"></i>' : '<i data-lucide="user" class="w-4 h-4"></i>'}
      </div>

      <div class="max-w-[85%] space-y-2">
        <div class="p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${isTutor ? 'bg-slate-100/90 text-slate-900 border border-slate-200/60' : 'bg-blue-600 text-white shadow-sm'}">
          <div class="whitespace-pre-wrap">${this.formatMarkdown(msg.text)}</div>
        </div>

        <!-- Sources Citations Accordion (Pages 25, 26) -->
        ${(msg.sources && msg.sources.length > 0) ? `
          <div class="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-blue-900">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Sources du corpus utilisées (${msg.sources.length}) :</span>
            </div>
            <div class="space-y-1">
              ${msg.sources.map(s => `
                <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-blue-100 text-[11px]">
                  <div class="truncate">
                    <span class="font-bold text-blue-800">[${s.sourceIndex}]</span>
                    <span class="font-medium text-slate-800">${s.documentTitle}</span>
                    <span class="text-slate-500">(${s.section || s.resourceType})</span>
                  </div>
                  <button onclick="app.openDocument('${s.documentId}')" class="text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 bg-blue-50 rounded text-[10px] shrink-0">
                    Ouvrir
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Recommended YouTube Video Card (Page 16 & 72) -->
        ${msg.recommendedVideo ? `
          <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 font-bold text-rose-900">
                <i data-lucide="youtube" class="w-4 h-4 text-rose-600"></i>
                <span>Vidéo recommandée par le tuteur</span>
              </div>
              <span class="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">${msg.recommendedVideo.duration}</span>
            </div>
            <p class="font-semibold text-slate-800">${msg.recommendedVideo.title}</p>
            <p class="text-[11px] text-slate-600 italic">"${msg.recommendedVideo.transcript.substring(0, 140)}..."</p>
            <div class="flex items-center gap-2 pt-1">
              <a href="${msg.recommendedVideo.url}" target="_blank" rel="noopener noreferrer" class="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] px-3 py-1 rounded-lg inline-flex items-center gap-1">
                <span>Visionner</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <button onclick="app.triggerVideoComprehensionCheck('${msg.recommendedVideo.id}')" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                Vérifier ma compréhension
              </button>
            </div>
          </div>
        ` : ''}

        <div class="text-[10px] text-slate-400 ${isTutor ? '' : 'text-right'}">
          ${msg.timestamp}
        </div>
      </div>
    </div>
    `;
  }

  // ==========================================
  // VIEW 5: ADMINISTRATION & TRI-AGENTS
  // ==========================================
  renderAdminView() {
    return `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      
      <!-- Admin Top Banner -->
      <div class="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/30">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
            Espace d'Administration (/admin) — Accès Privilégié
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight">
            Centre de Pilotage & Traitement Tri-Agents IA
          </h1>
          <p class="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Surveillez les 3 agents Gemini parallèles, téléversez de nouveaux cours et examens, inspectez la chaîne de relais (Fallback) et validez la qualité du corpus.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="app.loadAdminWorkers()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Actualiser
          </button>
        </div>
      </div>

      <!-- Admin Tabs Navigation -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button 
          onclick="app.setAdminTab('agents')" 
          class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${this.adminTab === 'agents' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
        >
          <i data-lucide="cpu" class="w-4 h-4"></i> Moniteur Tri-Agents
        </button>
        <button 
          onclick="app.setAdminTab('upload')" 
          class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${this.adminTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
        >
          <i data-lucide="upload-cloud" class="w-4 h-4"></i> Dépôt de Documents
        </button>
        <button 
          onclick="app.setAdminTab('validation')" 
          class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${this.adminTab === 'validation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
        >
          <i data-lucide="check-square" class="w-4 h-4"></i> Validation Visuelle
        </button>
        <button 
          onclick="app.setAdminTab('console')" 
          class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${this.adminTab === 'console' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
        >
          <i data-lucide="terminal" class="w-4 h-4"></i> Console Ad-Hoc IA
        </button>
        <button 
          onclick="app.setAdminTab('audit')" 
          class="px-4 py-2 rounded-xl transition flex items-center gap-2 ${this.adminTab === 'audit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
        >
          <i data-lucide="list-checks" class="w-4 h-4"></i> Journal d'Audit
        </button>
      </div>

      <!-- Admin Tab Content -->
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

  // Admin Tab 1: Tri-Agents Live Monitor (Pages 10, 52)
  renderAdminAgentsTab() {
    const agents = this.adminWorkers && this.adminWorkers.length > 0 ? this.adminWorkers : [
      { id: 'agent-1', name: 'Agent Alpha — Tri & Métadonnées', specialty: 'Extraction, typage & classification des cours', status: 'idle', jobsProcessed: 14, preferredModel: 'gemini-3.8-flash' },
      { id: 'agent-2', name: 'Agent Beta — Examens & Corrigés', specialty: 'Analyse d\'annales, sessions & appariement corrigés', status: 'idle', jobsProcessed: 18, preferredModel: 'gemini-3.8-flash' },
      { id: 'agent-3', name: 'Agent Gamma — Indexation RAG & Graphe', specialty: 'Segmentation, chunking, concepts & graphe', status: 'idle', jobsProcessed: 22, preferredModel: 'gemini-3.1-flash-lite' }
    ];

    return `
    <div class="space-y-6">
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
          État en Temps Réel des 3 Agents Gemini Autonomes
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Conformément au cahier des charges : 3 instances indépendantes pour accélérer le tri et éviter la saturation d'un seul quota.
        </p>
      </div>

      <!-- 3 Parallel Agents Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        ${agents.map((agent, i) => `
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${agent.status === 'processing' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Agent 0${i + 1}</span>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${agent.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
                ${agent.status === 'processing' ? 'En Traitement' : 'Disponible'}
              </span>
            </div>

            <div>
              <h3 class="font-bold text-slate-900 text-sm">${agent.name}</h3>
              <p class="text-xs text-slate-500 mt-1 font-medium">${agent.specialty}</p>
            </div>

            <div class="bg-slate-50 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
              <div class="flex justify-between">
                <span class="text-slate-500">Tâches traitées :</span>
                <span class="font-bold text-slate-800">${agent.jobsProcessed}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Modèle configuré :</span>
                <span class="font-mono font-semibold text-blue-700">${agent.preferredModel}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500">Clé & Quota :</span>
                <span class="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Relais Actif</span>
              </div>
            </div>

            <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1">
              <span>Heartbeat: OK</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Fallback Relay Policy Banner (Page 11) -->
      <div class="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-2">
        <h3 class="font-bold text-blue-900 text-sm flex items-center gap-2">
          <i data-lucide="shield" class="w-4 h-4 text-blue-600"></i>
          Architecture de Relais et Fallback Automatique (Page 11)
        </h3>
        <p class="text-xs text-blue-800 leading-relaxed">
          En cas de code d'erreur <strong>429 (Rate Limit / Quota Exceeded)</strong> ou <strong>503 (Service Unavailable)</strong>, le système intercepte l'exception et bascule immédiatement sur le modèle suivant de la chaîne :
        </p>
        <div class="flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 flex-wrap pt-1">
          <span class="px-2.5 py-1 bg-white rounded-lg border border-blue-200 shadow-2xs">gemini-3.8-flash (Principal)</span>
          <span>➔</span>
          <span class="px-2.5 py-1 bg-white rounded-lg border border-blue-200 shadow-2xs">gemini-3.1-flash-lite (Secours Rapide)</span>
          <span>➔</span>
          <span class="px-2.5 py-1 bg-white rounded-lg border border-blue-200 shadow-2xs">Mode Déterministe Local</span>
        </div>
      </div>
    </div>
    `;
  }

  // Admin Tab 2: Drag and Drop Upload (Page 08)
  renderAdminUploadTab() {
    return `
    <div class="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 class="text-base font-bold text-slate-900">Dépôt et Ingestion Automatique</h2>
        <p class="text-xs text-slate-500">Glissez-déposez des fichiers universitaires (PDF, DOCX, XLSX, Code C++/Python, etc.). L'un des 3 agents prendra en charge l'extraction et la classification.</p>
      </div>

      <!-- Drag & Drop Zone -->
      <div 
        id="drop-zone"
        ondragover="event.preventDefault(); this.classList.add('border-blue-500', 'bg-blue-50/40')"
        ondragleave="this.classList.remove('border-blue-500', 'bg-blue-50/40')"
        ondrop="app.handleFileDrop(event)"
        class="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-10 text-center space-y-4 transition cursor-pointer"
        onclick="document.getElementById('file-upload-input').click()"
      >
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <i data-lucide="upload-cloud" class="w-7 h-7"></i>
        </div>
        <div>
          <p class="font-bold text-slate-800 text-sm">Cliquez pour parcourir ou glissez un fichier ici</p>
          <p class="text-xs text-slate-500 mt-1">Formats acceptés : PDF, Word, Excel, PowerPoint, Code .py, .cpp, .java, .sql</p>
        </div>
        <input type="file" id="file-upload-input" onchange="app.handleFileSelect(event)" class="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.txt,.py,.cpp,.java,.sql">
      </div>

      <!-- Quick Upload Simulation Example -->
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wide">Ou tester immédiatement un exemple académique réel :</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onclick="app.uploadDemoDocument('exam_meca')" class="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition text-xs space-y-1">
            <div class="font-bold text-slate-800 line-clamp-1">📄 Examen Mécanique Session 2025</div>
            <div class="text-[11px] text-slate-500">PDF • Oscillateur amorti & Newton</div>
          </button>
          <button onclick="app.uploadDemoDocument('tp_algo')" class="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition text-xs space-y-1">
            <div class="font-bold text-slate-800 line-clamp-1">💻 TP Dijkstra & Graphes C++</div>
            <div class="text-[11px] text-slate-500">Code • File de priorité</div>
          </button>
        </div>
      </div>

      <!-- Upload Status / Feedback -->
      <div id="upload-feedback" class="hidden p-4 rounded-xl text-xs"></div>
    </div>
    `;
  }

  // Admin Tab 3: Visual Validation Panel (Page 53)
  renderAdminValidationTab() {
    return `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Validation Visuelle des Documents</h2>
          <p class="text-xs text-slate-500">Vérifiez les métadonnées extraites par l'IA avant publication définitive aux étudiants.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3.5">Document</th>
                <th class="p-3.5">Type Détecté</th>
                <th class="p-3.5">Matière / Promo</th>
                <th class="p-3.5">Confiance IA</th>
                <th class="p-3.5">Statut</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${this.resources.map(r => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3.5 font-semibold text-slate-900 max-w-xs truncate">${r.title}</td>
                  <td class="p-3.5">${this.getTypeBadge(r.type)}</td>
                  <td class="p-3.5 text-slate-600">${r.chapter || 'Général'}</td>
                  <td class="p-3.5 font-mono text-emerald-700 font-semibold">${Math.round((r.confidenceScore || 0.95) * 100)}%</td>
                  <td class="p-3.5">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      ${r.status === 'published' ? 'Publié' : 'À valider'}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-1">
                    <button onclick="app.openDocument('${r.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition">
                      Aperçu
                    </button>
                    ${r.status !== 'published' ? `
                      <button onclick="app.validateAndPublish('${r.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] transition">
                        Valider & Publier
                      </button>
                    ` : `
                      <button onclick="app.deleteResource('${r.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-[11px] transition">
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
    </div>
    `;
  }

  // Admin Tab 4: Ad-Hoc AI Console (Page 51)
  renderAdminConsoleTab() {
    return `
    <div class="space-y-6">
      <div>
        <h2 class="text-base font-bold text-slate-900">Console de Commandes Ad-Hoc aux Agents</h2>
        <p class="text-xs text-slate-500">Confiez des tâches de maintenance, d'audit ou de déduplication aux 3 agents IA.</p>
      </div>

      <!-- Quick Commands -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onclick="app.runAdminCommand('deduplicate')" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-xs space-y-1">
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <i data-lucide="fingerprint" class="w-4 h-4"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-xs">Déduplication SHA-256</h4>
          <p class="text-[11px] text-slate-500">Scanne tous les documents pour repérer les doublons binaires.</p>
        </button>

        <button onclick="app.runAdminCommand('audit_quality')" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-xs space-y-1">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-xs">Audit Qualité & Gouvernance</h4>
          <p class="text-[11px] text-slate-500">Vérifie les examens sans correction et chapitres manquants.</p>
        </button>

        <button onclick="app.runAdminCommand('generate_summaries')" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 text-left transition shadow-xs space-y-1">
          <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-xs">Indexation Concepts & Graphe</h4>
          <p class="text-[11px] text-slate-500">Met à jour les relations et prérequis dans le graphe académique.</p>
        </button>
      </div>

      <!-- Terminal Output Display -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 font-mono text-xs text-slate-200 space-y-3">
        <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
          <span class="flex items-center gap-2"><i data-lucide="terminal" class="w-3.5 h-3.5 text-blue-400"></i> Terminal d'Exécution IA</span>
          <span id="console-status" class="text-emerald-400">Prêt</span>
        </div>
        <div id="console-output" class="min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
Academic Hub Tri-Agents Kernel v1.0 initialized.
3 workers running. Fallback policy active: gemini-3.8-flash ➔ gemini-3.1-flash-lite.
Cliquez sur une commande ci-dessus pour lancer une tâche ad-hoc.
        </div>
      </div>
    </div>
    `;
  }

  // Admin Tab 5: Audit Trail
  renderAdminAuditTab() {
    return `
    <div class="space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-900">Journal d'Audit & Traçabilité (Page 45)</h2>
        <p class="text-xs text-slate-500">Historique immuable de toutes les actions, classifications et validations.</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3.5">Horodatage</th>
                <th class="p-3.5">Action</th>
                <th class="p-3.5">Détails</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              ${(this.adminAudit && this.adminAudit.length > 0 ? this.adminAudit : []).map(log => `
                <tr class="hover:bg-slate-50/80">
                  <td class="p-3.5 text-slate-500 text-[11px]">${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Récemment'}</td>
                  <td class="p-3.5 font-bold text-blue-700">${log.action}</td>
                  <td class="p-3.5 text-slate-700 font-sans truncate max-w-md">${log.title || log.command || JSON.stringify(log.result || log.updatedFields || {})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
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
    // refocus input
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

  toggleCorrectionFilter() {
    this.filters.hasCorrection = this.filters.hasCorrection === 'true' ? '' : 'true';
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

  filterByCourseAndType(courseId, type) {
    this.filters.courseId = courseId;
    this.filters.type = type;
    this.navigate('home');
  }

  launchRevisionForCourse(courseId) {
    this.tutorMode = 'revision';
    this.tutorCourseId = courseId;
    const course = this.courses.find(c => c.id === courseId);
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `Mode **Révision Faculté** activé pour le cours **${course ? course.name : 'universitaire'}** !\n\nJe priorise les supports du professeur référent (${course ? course.professor : 'département'}) et les annales des examens passés. Que souhaitez-vous réviser en priorité ?`,
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.navigate('tutor');
  }

  startTutorOnResource(id) {
    const res = this.resources.find(r => r.id === id);
    if (!res) return;
    this.tutorCourseId = res.courseId;
    this.tutorMode = 'revision';
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `J'ai chargé le document **"${res.title}"** (${res.type}, ${res.academicYear}) dans notre contexte d'étude !\n\nSouhaitez-vous :\n1. Une explication des points clés de cette épreuve ?\n2. Vous entraîner sur un exercice similaire ?\n3. Consulter les astuces pour réussir ce partiel ?`,
      sources: [
        { sourceIndex: 1, documentId: res.id, documentTitle: res.title, resourceType: res.type, section: res.chapter || 'Principal' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.navigate('tutor');
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

  closeActiveBranch() {
    this.studentProfile.activeBranch = null;
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `✅ **Branche de prérequis assimilée !**\n\nNous revenons à notre objectif principal : **${this.studentProfile.activeGoal}**. Êtes-vous prêt pour un exercice d'application ?`,
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
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

    // Add student message to chat
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    this.render();

    // Scroll chat to bottom
    const box = document.getElementById('tutor-chat-box');
    if (box) box.scrollTop = box.scrollHeight;

    // Send to backend API
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
      }
    } catch (err) {
      this.tutorMessages.push({
        id: `msg-err-${Date.now()}`,
        sender: 'tutor',
        text: "Désolé, une anomalie temporaire est survenue lors de la communication avec le moteur d'apprentissage.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    this.render();
    const boxAfter = document.getElementById('tutor-chat-box');
    if (boxAfter) boxAfter.scrollTop = boxAfter.scrollHeight;
  }

  triggerVideoComprehensionCheck(videoId) {
    const video = (this.videos || []).find(v => v.id === videoId);
    if (!video) return;
    this.tutorMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: `🎯 **Vérification d'assimilation post-vidéo :**\n\n${video.checkQuestion}\n\nExpliquez avec vos propres mots ce que vous avez retenu de cette explication visuelle !`,
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.render();
    const box = document.getElementById('tutor-chat-box');
    if (box) box.scrollTop = box.scrollHeight;
  }

  // Admin tab switcher
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
        out.innerText += `\n[Agent Worker] Résultat structuré :\n` + JSON.stringify(res.data, null, 2);
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
    if (!confirm('Confirmer le retrait de ce document du centre d\'information ?')) return;
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      this.resources = this.resources.filter(r => r.id !== id);
      this.render();
    } catch (e) {
      console.warn('Error deleting resource:', e);
    }
  }

  // Upload handlers
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
      feedback.className = 'p-4 rounded-xl text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
      feedback.innerHTML = `Traitement en cours par les 3 agents IA de <strong>${file.name}</strong>... Déduplication SHA-256 et classification...`;
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
        feedback.className = 'p-4 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        feedback.innerHTML = `✅ <strong>Succès :</strong> ${res.message} (Job ID: ${res.jobId})`;
      }

      await this.fetchBaseData();
      await this.loadAdminWorkers();
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-4 rounded-xl text-xs bg-rose-50 text-rose-800 border border-rose-200 block';
        feedback.innerHTML = `❌ Erreur de téléversement : ${err.message}`;
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
      feedback.className = 'p-4 rounded-xl text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
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
        feedback.className = 'p-4 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        feedback.innerHTML = `✅ Fichier démo analysé et classifié par l'agent IA avec succès !`;
      }
      await this.fetchBaseData();
      await this.loadAdminWorkers();
    } catch (err) {
      if (feedback) {
        feedback.className = 'p-4 rounded-xl text-xs bg-rose-50 text-rose-800 border border-rose-200 block';
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
    feedback.innerText = 'Test de connexion avec Google AI Studio en cours...';

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
        feedback.innerText = '✅ Clé API validée avec succès auprès de Gemini ! Elle sera utilisée pour vos requêtes.';
        this.updateApiKeyBadge();
        setTimeout(() => this.closeApiKeyModal(), 1200);
      } else {
        feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 block';
        feedback.innerText = `Échec de validation : ${res.error}`;
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
      feedback.innerText = 'Clé personnalisée effacée. Le système utilise le relais serveur par défaut.';
    }
    this.updateApiKeyBadge();
  }

  updateApiKeyBadge() {
    const label = document.getElementById('api-key-status-label');
    const btn = document.getElementById('btn-api-key');
    if (!label || !btn) return;

    if (this.userApiKey) {
      label.innerText = 'Clé Perso Active';
      btn.className = 'text-xs px-2.5 py-1.5 rounded-lg font-medium border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center gap-1.5 shadow-xs';
    } else {
      label.innerText = 'Clé Gemini';
      btn.className = 'text-xs px-2.5 py-1.5 rounded-lg font-medium border border-slate-200 hover:border-slate-300 bg-white text-slate-700 flex items-center gap-1.5 shadow-xs transition';
    }
  }

  // Format markdown into safe and elegant HTML with source badges
  formatMarkdown(text) {
    if (!text) return '';
    let formatted = this.escapeHtml(text);

    // Headers
    formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="font-bold text-slate-900 text-xs sm:text-sm mt-3 mb-1">$1</h3>');
    formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="font-extrabold text-slate-900 text-sm sm:text-base mt-3.5 mb-1.5">$1</h2>');

    // Horizontal Rule
    formatted = formatted.replace(/^---$/gm, '<hr class="my-3 border-slate-200" />');

    // Bold & Italics
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    formatted = formatted.replace(/\*([^\*\n]+)\*/g, '<em class="italic text-slate-700">$1</em>');

    // Inline Code
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>');

    // Bullet points (both •, -, and *)
    formatted = formatted.replace(/^[•*-] (.*?)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-blue-500 font-bold shrink-0 leading-tight">•</span><span class="flex-1">$1</span></div>');

    // Numbered points
    formatted = formatted.replace(/^(\d+)\. (.*?)$/gm, '<div class="flex items-start gap-2 my-1"><span class="font-bold text-blue-700 shrink-0 text-xs">$1.</span><span class="flex-1">$2</span></div>');

    // Source references like [SOURCE 1] or [SOURCE 2]
    formatted = formatted.replace(/\[SOURCE (\d+)\]/gi, '<span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-blue-100/80 text-blue-800 text-[10px] font-bold mx-0.5 border border-blue-200/60 shadow-2xs">Source $1</span>');

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

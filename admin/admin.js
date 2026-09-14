// Academic Hub — Administration Portal Logic
// Pure Vanilla JavaScript, strict shadcn/ui inspired components with Tailwind, rounded-lg everywhere

class AdminApp {
  constructor() {
    this.currentTab = 'overview'; // 'overview' | 'courses' | 'resources' | 'upload' | 'agents' | 'audit'
    this.courses = [];
    this.promotions = [];
    this.resources = [];
    this.auditLogs = [];
    this.workers = [];
    this.activeJob = null;
    this.docSearch = '';
    this.docCourseFilter = '';
    this.docTypeFilter = '';
    this.previewDoc = null;
    this.isUploading = false;
    this.consoleLogs = ['[Kernel IA] Console d\'orchestration prête. Base connectée.'];
  }

  async init() {
    await this.fetchData();
    this.setupEventListeners();
    this.render();
  }

  async fetchData() {
    try {
      const [coursesRes, promoRes, resRes, auditRes, workersRes] = await Promise.all([
        fetch('/api/courses').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/promotions').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/resources').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/admin/audit').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/admin/workers').then(r => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (coursesRes.success && Array.isArray(coursesRes.data)) this.courses = coursesRes.data;
      if (promoRes.success && Array.isArray(promoRes.data)) this.promotions = promoRes.data;
      if (resRes.success && Array.isArray(resRes.data)) this.resources = resRes.data;
      if (auditRes.success && Array.isArray(auditRes.data)) this.auditLogs = auditRes.data;
      if (workersRes.success && Array.isArray(workersRes.data)) this.workers = workersRes.data;
    } catch (err) {
      console.error('Erreur chargement données administration:', err);
    }
  }

  setupEventListeners() {
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'courses', 'resources', 'upload', 'agents', 'audit'].includes(tab)) {
        this.currentTab = tab;
        this.render();
      }
    });

    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get('tab');
    if (initialTab && ['overview', 'courses', 'resources', 'upload', 'agents', 'audit'].includes(initialTab)) {
      this.currentTab = initialTab;
    }
  }

  setTab(tab) {
    this.currentTab = tab;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
    this.render();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const isError = type === 'error';
    const borderCls = isSuccess ? 'border-blue-200 bg-blue-50 text-blue-900' : isError ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-200 bg-white text-slate-900';
    toast.className = `p-3 rounded-lg border shadow-sm text-xs font-medium flex items-center justify-between gap-3 transition-all transform duration-200 translate-y-1 opacity-0 ${borderCls}`;
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <i data-lucide="${isSuccess ? 'check-circle' : isError ? 'alert-circle' : 'info'}" class="w-4 h-4 shrink-0 text-blue-600"></i>
        <span>${this.escapeHtml(message)}</span>
      </div>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      toast.classList.remove('translate-y-1', 'opacity-0');
    }, 10);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  render() {
    const container = document.getElementById('admin-viewport');
    if (!container) return;

    // Update active tab buttons
    ['overview', 'courses', 'resources', 'upload', 'agents', 'audit'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        if (t === this.currentTab) {
          btn.className = 'px-3.5 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs flex items-center gap-2 transition shadow-2xs shrink-0';
        } else {
          btn.className = 'px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 flex items-center gap-2 transition shrink-0';
        }
      }
    });

    switch (this.currentTab) {
      case 'overview':
        container.innerHTML = this.renderOverviewTab();
        break;
      case 'courses':
        container.innerHTML = this.renderCoursesTab();
        break;
      case 'resources':
        container.innerHTML = this.renderResourcesTab();
        break;
      case 'upload':
        container.innerHTML = this.renderUploadTab();
        break;
      case 'agents':
        container.innerHTML = this.renderAgentsTab();
        break;
      case 'audit':
        container.innerHTML = this.renderAuditTab();
        break;
      default:
        container.innerHTML = this.renderOverviewTab();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 1. OVERVIEW TAB
  renderOverviewTab() {
    const corrigesCount = this.resources.filter(r => r.type === 'Corrigé' || r.hasCorrection).length;
    const coursCount = this.resources.filter(r => r.type === 'Supports de Cours').length;
    const tdCount = this.resources.filter(r => r.type === 'Exercices' || r.type === 'TP').length;
    const examCount = this.resources.filter(r => r.type === 'Examen' || r.type === 'Interrogation').length;

    return `
    <div class="space-y-6">
      <!-- Welcome & Status Banner -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
              Portail d'Administration Académique
            </div>
            <h1 class="text-base sm:text-lg font-bold text-slate-900">Tableau de Bord & Gestion Centrale</h1>
            <p class="text-xs text-slate-500">Supervision du corpus universitaire, ingestion automatisée et orchestration des agents pédagogiques.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="adminApp.refreshData()" class="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              Actualiser
            </button>
            <a href="/student" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 transition">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              Ouvrir le site Étudiant
            </a>
          </div>
        </div>

        <!-- 4 KPI Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-blue-600"></i>
              Matières Actives
            </div>
            <div class="text-xl font-bold text-slate-900">${this.courses.length}</div>
            <div class="text-[10px] text-slate-400">Totalité du catalogue</div>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-600"></i>
              Documents Indexés
            </div>
            <div class="text-xl font-bold text-slate-900">${this.resources.length}</div>
            <div class="text-[10px] text-slate-400">PDF, Word, Exercices, Cours</div>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-blue-600"></i>
              Filières & Niveaux
            </div>
            <div class="text-xl font-bold text-slate-900">${this.promotions.length}</div>
            <div class="text-[10px] text-slate-400">Cycles L1 à M2</div>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div class="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-blue-600"></i>
              Corrigés Officiels
            </div>
            <div class="text-xl font-bold text-slate-900">${corrigesCount}</div>
            <div class="text-[10px] text-slate-400">Solutions vérifiées</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <i data-lucide="upload-cloud" class="w-4 h-4 text-blue-600"></i>
            Ajout Rapide de Document
          </div>
          <p class="text-xs text-slate-500">Téléversez un nouveau support de cours magistral, TD ou sujet d'examen.</p>
          <button onclick="adminApp.setTab('upload')" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            Téléverser un document
          </button>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <i data-lucide="book-plus" class="w-4 h-4 text-blue-600"></i>
            Nouvelle Matière Académique
          </div>
          <p class="text-xs text-slate-500">Créez un nouveau cours avec son code officiel et ses chapitres de programme.</p>
          <button onclick="adminApp.setTab('courses')" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5">
            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
            Gérer les cours & filières
          </button>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <i data-lucide="bot" class="w-4 h-4 text-blue-600"></i>
            Système Tri-Agents IA
          </div>
          <p class="text-xs text-slate-500">Contrôlez l'extraction OCR, la structuration socratique et l'audit qualité.</p>
          <button onclick="adminApp.setTab('agents')" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5">
            <i data-lucide="activity" class="w-3.5 h-3.5"></i>
            Console des Agents
          </button>
        </div>
      </div>

      <!-- Corpus Distribution by Type -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-blue-600"></i>
            Répartition du Fonds Académique
          </h2>
          <span class="text-[11px] text-slate-400 font-medium">Base de données partagée</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-slate-500 font-medium text-[11px]">Cours Magistraux :</span>
            <div class="font-bold text-slate-900 mt-0.5 text-sm">${coursCount} documents</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-slate-500 font-medium text-[11px]">Exercices & TD :</span>
            <div class="font-bold text-slate-900 mt-0.5 text-sm">${tdCount} documents</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-slate-500 font-medium text-[11px]">Examens & Partiels :</span>
            <div class="font-bold text-slate-900 mt-0.5 text-sm">${examCount} documents</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-slate-500 font-medium text-[11px]">Corrigés Types :</span>
            <div class="font-bold text-slate-900 mt-0.5 text-sm">${corrigesCount} documents</div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  // 2. COURSES & PROMOTIONS TAB
  renderCoursesTab() {
    return `
    <div class="space-y-6">
      <!-- Section A: Create Course Form -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4 text-blue-600"></i>
              Créer une nouvelle matière académique
            </h2>
            <p class="text-xs text-slate-500">Ajoutez une discipline avec son code officiel, son enseignant et ses chapitres de programme.</p>
          </div>
        </div>

        <form onsubmit="adminApp.createCourse(event)" class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Code Matière *</label>
              <input type="text" id="admin-course-code" placeholder="ex: MATH101, INFO201" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Nom du cours *</label>
              <input type="text" id="admin-course-name" placeholder="ex: Analyse Mathématique" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Enseignant référent</label>
              <input type="text" id="admin-course-prof" placeholder="ex: Dr. Laurent" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Filière / Pôle associé</label>
              <select id="admin-course-promo" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                <option value="">-- Sans filière spécifique --</option>
                ${this.promotions.map(p => `<option value="${p.id}">${this.escapeHtml(p.name)} (${this.escapeHtml(p.cycle || p.code)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Semestre</label>
              <select id="admin-course-sem" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                <option value="S1">Semestre 1 (S1)</option>
                <option value="S2">Semestre 2 (S2)</option>
                <option value="Annuel">Annuel</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Chapitres du programme (un par ligne)</label>
            <textarea id="admin-course-chapters" rows="3" placeholder="Chapitre 1 : Calcul Intégral & Primitives&#10;Chapitre 2 : Équations Différentielles&#10;Chapitre 3 : Séries Numériques" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium"></textarea>
          </div>

          <div class="flex justify-end pt-1">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              Enregistrer cette matière
            </button>
          </div>
        </form>

        <!-- Courses List -->
        <div class="space-y-3 pt-2">
          <div class="font-bold text-slate-900 text-xs flex items-center justify-between">
            <span>Matières actuellement enregistrées (${this.courses.length})</span>
          </div>

          ${this.courses.length === 0 ? `
            <div class="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-200">
              Aucune matière n'est configurée pour le moment.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${this.courses.map(c => {
                const docCount = this.resources.filter(r => r.courseId === c.id).length;
                const promo = this.promotions.find(p => p.id === c.promotionId);
                return `
                <div class="p-4 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 transition space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-1 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-700">${this.escapeHtml(c.code)}</span>
                        ${c.semester ? `<span class="text-[10px] font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-lg">${this.escapeHtml(c.semester)}</span>` : ''}
                        ${promo ? `<span class="text-[10px] text-slate-500 truncate font-medium">${this.escapeHtml(promo.name)}</span>` : ''}
                      </div>
                      <h4 class="font-semibold text-slate-900 text-xs sm:text-sm truncate">${this.escapeHtml(c.name)}</h4>
                      <p class="text-[11px] text-slate-500">${c.professor ? 'Prof. ' + this.escapeHtml(c.professor) + ' • ' : ''}${docCount} document(s)</p>
                    </div>
                    <button onclick="adminApp.deleteCourse('${c.id}')" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Supprimer cette matière">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>

                  ${c.chapters && c.chapters.length > 0 ? `
                    <div class="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                      <div class="font-medium text-slate-700 text-[10px] uppercase tracking-wider">${c.chapters.length} Chapitres :</div>
                      <div class="space-y-0.5 text-slate-600">
                        ${c.chapters.slice(0, 3).map((ch, idx) => `
                          <div class="truncate flex items-center gap-1.5">
                            <span class="w-3.5 h-3.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold flex items-center justify-center shrink-0">${idx + 1}</span>
                            <span class="truncate">${this.escapeHtml(ch.title)}</span>
                          </div>
                        `).join('')}
                        ${c.chapters.length > 3 ? `<div class="text-[10px] text-slate-400 italic pl-5">+ ${c.chapters.length - 3} autres chapitres...</div>` : ''}
                      </div>
                    </div>
                  ` : ''}

                  <div class="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <button onclick="adminApp.filterResourcesByCourse('${c.id}')" class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                      <i data-lucide="file-text" class="w-3 h-3"></i>
                      Voir les documents (${docCount})
                    </button>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Section B: Promotions & Filières -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="graduation-cap" class="w-4 h-4 text-blue-600"></i>
              Gestion des Filières & Domaines Académiques (${this.promotions.length})
            </h2>
            <p class="text-xs text-slate-500">Définissez vos filières et promotions universitaires pour organiser les parcours.</p>
          </div>
        </div>

        <form onsubmit="adminApp.createPromotion(event)" class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Nom de la filière *</label>
              <input type="text" id="admin-promo-name" placeholder="ex: Informatique & Télécoms" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Code abrégé *</label>
              <input type="text" id="admin-promo-code" placeholder="ex: INFO-L2" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Cycle / Niveau</label>
              <input type="text" id="admin-promo-cycle" placeholder="ex: Licence 2, Master 1" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              Ajouter cette filière
            </button>
          </div>
        </form>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${this.promotions.map(p => `
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="font-semibold text-slate-900 text-xs truncate">${this.escapeHtml(p.name)}</div>
                <div class="text-[11px] text-slate-500 font-medium">${this.escapeHtml(p.cycle || p.code)}</div>
              </div>
              <button onclick="adminApp.deletePromotion('${p.id}')" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Supprimer">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    `;
  }

  // 3. RESOURCES TAB
  renderResourcesTab() {
    let docs = this.resources || [];
    if (this.docSearch.trim()) {
      const q = this.docSearch.toLowerCase().trim();
      docs = docs.filter(d =>
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.courseName && d.courseName.toLowerCase().includes(q)) ||
        (d.type && d.type.toLowerCase().includes(q)) ||
        (d.chapter && d.chapter.toLowerCase().includes(q))
      );
    }
    if (this.docCourseFilter) {
      docs = docs.filter(d => d.courseId === this.docCourseFilter);
    }
    if (this.docTypeFilter) {
      docs = docs.filter(d => d.type === this.docTypeFilter);
    }

    return `
    <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i>
            Tous les Documents & Ressources du Corpus (${docs.length})
          </h2>
          <p class="text-xs text-slate-500">Visualisez, filtrez, validez et gérez l'ensemble des fichiers disponibles.</p>
        </div>
        <button onclick="adminApp.setTab('upload')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 shadow-2xs">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          Nouveau Document
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        <div class="sm:col-span-2 relative">
          <input 
            type="text" 
            placeholder="Rechercher par titre ou mot-clé..." 
            value="${this.escapeHtml(this.docSearch)}"
            oninput="adminApp.onSearchInput(this.value)"
            class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600 font-medium"
          >
        </div>
        <div>
          <select onchange="adminApp.onCourseFilter(this.value)" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-600 font-medium">
            <option value="">Toutes les matières</option>
            ${this.courses.map(c => `<option value="${c.id}" ${this.docCourseFilter === c.id ? 'selected' : ''}>${this.escapeHtml(c.code)} — ${this.escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <select onchange="adminApp.onTypeFilter(this.value)" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-600 font-medium">
            <option value="">Tous les types</option>
            <option value="Supports de Cours" ${this.docTypeFilter === 'Supports de Cours' ? 'selected' : ''}>Supports de Cours</option>
            <option value="Exercices" ${this.docTypeFilter === 'Exercices' ? 'selected' : ''}>Exercices / TD</option>
            <option value="Examen" ${this.docTypeFilter === 'Examen' ? 'selected' : ''}>Examen</option>
            <option value="Interrogation" ${this.docTypeFilter === 'Interrogation' ? 'selected' : ''}>Interrogation</option>
            <option value="TP" ${this.docTypeFilter === 'TP' ? 'selected' : ''}>Travaux Pratiques</option>
            <option value="Corrigé" ${this.docTypeFilter === 'Corrigé' ? 'selected' : ''}>Corrigé Type</option>
          </select>
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
            <tr>
              <th class="p-3">Titre du document</th>
              <th class="p-3">Matière</th>
              <th class="p-3">Type</th>
              <th class="p-3">Statut</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${docs.length === 0 ? `
              <tr>
                <td colspan="5" class="p-8 text-center text-slate-400 text-xs">
                  Aucun document ne correspond à vos filtres.
                </td>
              </tr>
            ` : docs.map(doc => `
              <tr class="hover:bg-slate-50/80 transition">
                <td class="p-3 font-semibold text-slate-900 max-w-xs truncate">
                  ${this.escapeHtml(doc.title)}
                  ${doc.hasCorrection ? '<span class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-700 border border-blue-200 font-medium">Corrigé</span>' : ''}
                </td>
                <td class="p-3 text-slate-600 font-medium">${this.escapeHtml(doc.courseName || doc.courseId || '-')}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    ${this.escapeHtml(doc.type || 'Document')}
                  </span>
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold ${doc.status === 'published' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                    ${doc.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                  <button onclick="adminApp.previewDocument('${doc.id}')" class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-[11px] border border-slate-200 transition">
                    Aperçu
                  </button>
                  ${doc.status !== 'published' ? `
                    <button onclick="adminApp.publishDocument('${doc.id}')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-[11px] transition shadow-2xs">
                      Publier
                    </button>
                  ` : `
                    <button onclick="adminApp.unpublishDocument('${doc.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px] transition">
                      Masquer
                    </button>
                  `}
                  <button onclick="adminApp.deleteResource('${doc.id}')" class="px-2 py-1 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-slate-100" title="Supprimer définitivement">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  // 4. UPLOAD TAB
  renderUploadTab() {
    return `
    <div class="space-y-6">
      <!-- File Drag & Drop Upload -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="upload-cloud" class="w-4 h-4 text-blue-600"></i>
            Téléverser un document externe (PDF, Word, Code)
          </h2>
          <p class="text-xs text-slate-500">Ajoutez un document numérisé ou fichier texte avec indexation automatique.</p>
        </div>

        <div 
          id="admin-drop-zone"
          ondragover="event.preventDefault(); this.classList.add('border-blue-600', 'bg-blue-50')"
          ondragleave="this.classList.remove('border-blue-600', 'bg-blue-50')"
          ondrop="adminApp.handleFileDrop(event)"
          class="border-2 border-dashed border-slate-300 hover:border-blue-600 bg-slate-50 rounded-lg p-8 text-center space-y-3 transition cursor-pointer"
          onclick="document.getElementById('admin-file-input').click()"
        >
          <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <i data-lucide="upload-cloud" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="font-bold text-slate-800 text-xs sm:text-sm">Cliquez ou glissez-déposez un fichier ici</p>
            <p class="text-[11px] text-slate-500 mt-1">Formats acceptés : PDF, Word (.docx), Code source, Fichier texte</p>
          </div>
          <input type="file" id="admin-file-input" onchange="adminApp.handleFileSelect(event)" class="hidden" accept=".pdf,.docx,.doc,.txt,.py,.cpp,.java,.sql">
        </div>

        <!-- Pre-Classification Form -->
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
          <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <i data-lucide="sliders" class="w-3.5 h-3.5 text-blue-600"></i>
            Paramètres de rattachement académique
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Matière de rattachement</label>
              <select id="upload-course-id" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                <option value="">-- Détection automatique selon contenu --</option>
                ${this.courses.map(c => `<option value="${c.id}">${this.escapeHtml(c.code)} — ${this.escapeHtml(c.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Type de document</label>
              <select id="upload-doc-type" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                <option value="Supports de Cours">Supports de Cours</option>
                <option value="Exercices">Exercices / TD</option>
                <option value="Examen">Examen</option>
                <option value="Interrogation">Interrogation</option>
                <option value="TP">Travaux Pratiques</option>
                <option value="Corrigé">Corrigé Type</option>
              </select>
            </div>
          </div>
        </div>

        <div id="admin-upload-status" class="hidden p-3 rounded-lg text-xs"></div>
      </div>

      <!-- Option B: Direct Resource Text Form -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-blue-600"></i>
            Rédiger / Insérer un document textuel directement
          </h2>
          <p class="text-xs text-slate-500">Ajoutez une fiche de révision, un énoncé d'exercice ou un corrigé type sans fichier externe.</p>
        </div>

        <form onsubmit="adminApp.createDirectResource(event)" class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Titre du document *</label>
              <input type="text" id="direct-title" placeholder="ex: TD 3 : Séries de Fourier & Applications" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Matière *</label>
              <select id="direct-course" required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                ${this.courses.map(c => `<option value="${c.id}">${this.escapeHtml(c.code)} — ${this.escapeHtml(c.name)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Type de ressource</label>
              <select id="direct-type" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
                <option value="Supports de Cours">Supports de Cours</option>
                <option value="Exercices">Exercices / TD</option>
                <option value="Examen">Examen</option>
                <option value="Interrogation">Interrogation</option>
                <option value="TP">Travaux Pratiques</option>
                <option value="Corrigé">Corrigé Type</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Chapitre associé</label>
              <input type="text" id="direct-chapter" placeholder="ex: Chapitre 2 : Séries" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Année Académique</label>
              <input type="text" id="direct-year" placeholder="ex: 2024-2025" value="2024-2025" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-medium">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Contenu textuel / Énoncé / Corrigé *</label>
            <textarea id="direct-content" rows="4" placeholder="Saisissez ou collez ici le contenu du cours, des exercices ou de la solution détaillée..." required class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 font-mono"></textarea>
          </div>

          <div class="flex justify-end pt-1">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              Enregistrer dans la bibliothèque
            </button>
          </div>
        </form>
      </div>
    </div>
    `;
  }

  // 5. AGENTS TAB
  renderAgentsTab() {
    return `
    <div class="space-y-6">
      <div class="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="bot" class="w-4 h-4 text-blue-600"></i>
            Architecture des 3 Agents d'Ingénierie Académique
          </h2>
          <p class="text-xs text-slate-500">Pipeline de traitement cognitif assurant la cohérence et l'intégrité du fonds documentaire.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Agent 1 -->
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">Agent 1</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500" title="Actif"></span>
            </div>
            <h3 class="font-bold text-slate-900 text-xs">Ingestion & Extraction Structurée</h3>
            <p class="text-[11px] text-slate-500">Extraction de texte, OCR des équations et parsing des sections PDF & Word.</p>
          </div>

          <!-- Agent 2 -->
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">Agent 2</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500" title="Actif"></span>
            </div>
            <h3 class="font-bold text-slate-900 text-xs">Enseignant IA & Pédagogie</h3>
            <p class="text-[11px] text-slate-500">Structuration didactique, graphe de prérequis et guidage socratique.</p>
          </div>

          <!-- Agent 3 -->
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">Agent 3</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500" title="Actif"></span>
            </div>
            <h3 class="font-bold text-slate-900 text-xs">Auditeur Qualité & Rigueur</h3>
            <p class="text-[11px] text-slate-500">Vérification de véracité scientifique, détection de doublons et contrôle des corrigés.</p>
          </div>
        </div>
      </div>

      <!-- Command Center -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <h3 class="font-bold text-slate-900 text-xs sm:text-sm">Déclencher une Action d'Ingénierie</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button onclick="adminApp.runConsoleCommand('deduplicate')" class="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600 text-left transition space-y-1">
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              <i data-lucide="copy-check" class="w-3.5 h-3.5 text-blue-600"></i>
              Déduplication SHA-256
            </div>
            <p class="text-[11px] text-slate-500">Analyse et supprime les doublons binaires et sémantiques.</p>
          </button>

          <button onclick="adminApp.runConsoleCommand('audit_quality')" class="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600 text-left transition space-y-1">
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              <i data-lucide="check-check" class="w-3.5 h-3.5 text-blue-600"></i>
              Audit Qualité des Corrigés
            </div>
            <p class="text-[11px] text-slate-500">Repère les énoncés d'examens sans solution officielle.</p>
          </button>

          <button onclick="adminApp.runConsoleCommand('generate_summaries')" class="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600 text-left transition space-y-1">
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              <i data-lucide="network" class="w-3.5 h-3.5 text-blue-600"></i>
              Graphe de Prérequis
            </div>
            <p class="text-[11px] text-slate-500">Synchronise les concepts clés avec le moteur d'apprentissage.</p>
          </button>
        </div>

        <!-- Terminal Output -->
        <div class="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 space-y-2">
          <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[10px]">
            <span class="flex items-center gap-1.5">
              <i data-lucide="terminal" class="w-3 h-3 text-blue-400"></i>
              Terminal d'Exécution des Agents
            </span>
            <span class="text-emerald-400 font-bold">Synchronisé</span>
          </div>
          <div id="admin-terminal-output" class="min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300 text-[11px]">
${this.consoleLogs.join('\n')}
          </div>
        </div>
      </div>
    </div>
    `;
  }

  // 6. AUDIT TAB
  renderAuditTab() {
    return `
    <div class="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-blue-600"></i>
            Journal d'Activité & Traçabilité des Opérations (${this.auditLogs.length})
          </h2>
          <p class="text-xs text-slate-500">Historique des ajouts, suppressions, classifications et exécutions d'agents.</p>
        </div>
        <button onclick="adminApp.refreshData()" class="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
          <i data-lucide="refresh-cw" class="w-3 h-3"></i>
          Actualiser
        </button>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
            <tr>
              <th class="p-3">Horodatage</th>
              <th class="p-3">Action</th>
              <th class="p-3">Détails</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
            ${this.auditLogs.length === 0 ? `
              <tr>
                <td colspan="3" class="p-8 text-center text-slate-400 text-xs font-sans">
                  Aucun événement dans le journal d'activité.
                </td>
              </tr>
            ` : this.auditLogs.map(log => `
              <tr class="hover:bg-slate-50/80 transition">
                <td class="p-3 text-slate-500 whitespace-nowrap">${log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Récemment'}</td>
                <td class="p-3 font-bold text-blue-700">
                  <span class="bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-lg text-[10px]">
                    ${this.escapeHtml(log.action || 'INFO')}
                  </span>
                </td>
                <td class="p-3 text-slate-700 font-sans truncate max-w-sm">
                  ${this.escapeHtml(log.title || log.command || (log.result ? JSON.stringify(log.result) : '-'))}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  // --- Handlers & Actions ---

  async refreshData() {
    await this.fetchData();
    this.showToast('Données actualisées', 'info');
    this.render();
  }

  onSearchInput(val) {
    this.docSearch = val;
    this.render();
    const el = document.querySelector('input[placeholder="Rechercher par titre ou mot-clé..."]');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }

  onCourseFilter(val) {
    this.docCourseFilter = val;
    this.render();
  }

  onTypeFilter(val) {
    this.docTypeFilter = val;
    this.render();
  }

  filterResourcesByCourse(courseId) {
    this.currentTab = 'resources';
    this.docCourseFilter = courseId;
    this.docSearch = '';
    this.docTypeFilter = '';
    this.render();
  }

  async createCourse(e) {
    e.preventDefault();
    const code = document.getElementById('admin-course-code').value.trim();
    const name = document.getElementById('admin-course-name').value.trim();
    const prof = document.getElementById('admin-course-prof').value.trim();
    const promo = document.getElementById('admin-course-promo').value;
    const sem = document.getElementById('admin-course-sem').value;
    const chapText = document.getElementById('admin-course-chapters').value.trim();

    const chapters = chapText
      ? chapText.split('\n').flatMap(l => l.split(',')).map(s => s.trim()).filter(Boolean).map((title, i) => ({
          id: `chap-${i + 1}`,
          title: title.replace(/^\d+[\.\-\)]\s*/, ''),
          topics: []
        }))
      : [{ id: 'chap-1', title: 'Introduction & Fondamentaux', topics: [] }];

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          professor: prof,
          promotionId: promo,
          semester: sem,
          chapters
        })
      }).then(r => r.json());

      if (res.success) {
        this.showToast(`Matière "${name}" créée avec succès !`, 'success');
        await this.fetchData();
        this.render();
      } else {
        this.showToast(`Erreur : ${res.error}`, 'error');
      }
    } catch (err) {
      this.showToast(`Erreur réseau : ${err.message}`, 'error');
    }
  }

  async deleteCourse(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette matière ?')) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      this.showToast('Matière supprimée', 'info');
      await this.fetchData();
      this.render();
    } catch (err) {
      this.showToast('Erreur suppression : ' + err.message, 'error');
    }
  }

  async createPromotion(e) {
    e.preventDefault();
    const name = document.getElementById('admin-promo-name').value.trim();
    const code = document.getElementById('admin-promo-code').value.trim();
    const cycle = document.getElementById('admin-promo-cycle').value.trim();

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, cycle })
      }).then(r => r.json());

      if (res.success) {
        this.showToast(`Filière "${name}" ajoutée avec succès !`, 'success');
        await this.fetchData();
        this.render();
      } else {
        this.showToast(`Erreur : ${res.error}`, 'error');
      }
    } catch (err) {
      this.showToast(`Erreur réseau : ${err.message}`, 'error');
    }
  }

  async deletePromotion(id) {
    if (!confirm('Supprimer cette filière ?')) return;
    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      this.showToast('Filière supprimée', 'info');
      await this.fetchData();
      this.render();
    } catch (err) {
      this.showToast('Erreur suppression : ' + err.message, 'error');
    }
  }

  async handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await this.uploadFile(files[0]);
    }
  }

  async handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      await this.uploadFile(files[0]);
    }
  }

  async uploadFile(file) {
    const statusBox = document.getElementById('admin-upload-status');
    if (statusBox) {
      statusBox.className = 'p-3 rounded-lg text-xs bg-blue-50 text-blue-800 border border-blue-200 block';
      statusBox.innerHTML = `Traitement et indexation de <strong>${this.escapeHtml(file.name)}</strong>...`;
    }

    const courseSelect = document.getElementById('upload-course-id');
    const typeSelect = document.getElementById('upload-doc-type');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
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
        if (statusBox) {
          statusBox.className = 'p-3 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200 block';
          statusBox.innerHTML = `<strong>Succès :</strong> ${res.message || 'Fichier indexé'}`;
        }
        this.showToast(res.message || 'Document téléversé avec succès !', 'success');
        await this.fetchData();
        this.currentTab = 'resources';
        this.render();
      } else {
        if (statusBox) {
          statusBox.className = 'p-3 rounded-lg text-xs bg-red-50 text-red-800 border border-red-200 block';
          statusBox.innerHTML = `<strong>Erreur :</strong> ${res.error || 'Échec du traitement'}`;
        }
        this.showToast(res.error || 'Erreur lors du téléversement', 'error');
      }
    } catch (err) {
      if (statusBox) {
        statusBox.className = 'p-3 rounded-lg text-xs bg-red-50 text-red-800 border border-red-200 block';
        statusBox.innerHTML = `Erreur réseau : ${err.message}`;
      }
      this.showToast('Erreur réseau : ' + err.message, 'error');
    }
  }

  async createDirectResource(e) {
    e.preventDefault();
    const title = document.getElementById('direct-title').value.trim();
    const courseId = document.getElementById('direct-course').value;
    const type = document.getElementById('direct-type').value;
    const chapter = document.getElementById('direct-chapter').value.trim();
    const year = document.getElementById('direct-year').value.trim();
    const content = document.getElementById('direct-content').value.trim();

    const course = this.courses.find(c => c.id === courseId);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          courseId,
          courseName: course ? course.name : '',
          promotionId: course ? course.promotionId : '',
          type,
          chapter: chapter || 'Général',
          academicYear: year || '2024-2025',
          content,
          hasCorrection: type === 'Corrigé',
          status: 'published',
          validationStatus: 'approved'
        })
      }).then(r => r.json());

      if (res.success) {
        this.showToast('Le document a été enregistré avec succès !', 'success');
        await this.fetchData();
        this.currentTab = 'resources';
        this.render();
      } else {
        this.showToast('Erreur enregistrement : ' + (res.error || 'Inconnue'), 'error');
      }
    } catch (err) {
      this.showToast('Erreur réseau : ' + err.message, 'error');
    }
  }

  async publishDocument(id) {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      }).then(r => r.json());
      if (res.success) {
        this.showToast('Document publié pour les étudiants', 'success');
        await this.fetchData();
        this.render();
      }
    } catch (err) {
      this.showToast('Erreur : ' + err.message, 'error');
    }
  }

  async unpublishDocument(id) {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' })
      }).then(r => r.json());
      if (res.success) {
        this.showToast('Document masqué', 'info');
        await this.fetchData();
        this.render();
      }
    } catch (err) {
      this.showToast('Erreur : ' + err.message, 'error');
    }
  }

  async deleteResource(id) {
    if (!confirm('Supprimer définitivement ce document de la base de données ?')) return;
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      this.showToast('Document supprimé', 'info');
      await this.fetchData();
      this.render();
    } catch (err) {
      this.showToast('Erreur suppression : ' + err.message, 'error');
    }
  }

  previewDocument(id) {
    const doc = this.resources.find(r => r.id === id);
    if (!doc) return;
    const modal = document.getElementById('modal-doc-preview');
    const contentBox = document.getElementById('doc-preview-content');
    const titleBox = document.getElementById('doc-preview-title');
    if (modal && contentBox && titleBox) {
      titleBox.textContent = doc.title || 'Aperçu du document';
      contentBox.textContent = doc.content || '(Aucun contenu textuel disponible pour cet extrait)';
      modal.classList.remove('hidden');
    }
  }

  closePreviewModal() {
    const modal = document.getElementById('modal-doc-preview');
    if (modal) modal.classList.add('hidden');
  }

  async runConsoleCommand(command) {
    this.consoleLogs.push(`> Exécution : ${command}...`);
    this.render();
    try {
      const res = await fetch('/api/admin/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      }).then(r => r.json());

      if (res.success) {
        this.consoleLogs.push(`[Succès] ${JSON.stringify(res.result || res.message || 'Terminé avec succès')}`);
        this.showToast('Commande exécutée avec succès', 'success');
        await this.fetchData();
      } else {
        this.consoleLogs.push(`[Erreur] ${res.error}`);
        this.showToast('Erreur exécution : ' + res.error, 'error');
      }
    } catch (err) {
      this.consoleLogs.push(`[Exception Réseau] ${err.message}`);
      this.showToast('Erreur réseau : ' + err.message, 'error');
    }
    this.render();
  }
}

const adminApp = new AdminApp();
window.adminApp = adminApp;
document.addEventListener('DOMContentLoaded', () => adminApp.init());

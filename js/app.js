/**
 * UniDocs - Faculté Polytechnique (Université de Lubumbashi)
 * Logique Applicative & Gestion des Données Académiques
 */

class UniDocsApp {
  constructor() {
    this.courses = [];
    this.documents = [];
    const savedPromo = localStorage.getItem('unidocs_user_promotion');
    this.selectedPromotion = savedPromo || 'prepo'; // 'prepo', 'bac1', 'bac2', 'bac3', 'all'
    this.selectedDepartment = 'all'; // 'all', 'mines', 'metallurgie', 'chimie', 'electromec', 'civil'
    this.selectedCourseId = null;
    this.activeCategory = 'all'; // 'all', 'cours', 'tp', 'exercice', 'examen', 'interro', 'favorites'
    this.searchQuery = '';
    this.isOnline = navigator.onLine;

    this.init();
  }

  async init() {
    this.setupTheme();
    this.setupNetwork();

    await window.localDB.init();
    await window.supabaseService.init();

    await this.loadData();
    this.bindEvents();
    this.render();
  }

  checkOnboarding() {
    // Désactivé pour accès immédiat et direct au document
    const modal = document.getElementById('promotion-onboarding-modal');
    if (modal) modal.classList.add('hidden');
  }

  selectOnboardingPromotion(promo) {
    this.selectedPromotion = promo;
    localStorage.setItem('unidocs_user_promotion', promo);
    const modal = document.getElementById('promotion-onboarding-modal');
    if (modal) modal.classList.add('hidden');

    const promoSelect = document.getElementById('promotion-select');
    if (promoSelect) promoSelect.value = promo;

    this.updateDepartmentVisibility();
    this.render();
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('unidocs_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light', !isDark);
        localStorage.setItem('unidocs_theme', isDark ? 'dark' : 'light');
        if (window.lucide) window.lucide.createIcons();
      };
    }
  }

  setupNetwork() {
    const updateNet = () => {
      this.isOnline = navigator.onLine;
      const dot = document.getElementById('sidebar-online-dot');
      const text = document.getElementById('sidebar-online-text');
      if (dot && text) {
        if (this.isOnline) {
          dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
          text.textContent = 'En ligne';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-amber-500';
          text.textContent = 'Mode Hors-ligne';
        }
      }
    };
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    updateNet();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  async loadData(forceReload = false) {
    if (forceReload) {
      await window.localDB.resetAllData(window.INITIAL_COURSES, window.INITIAL_DOCUMENTS);
      this.courses = await window.localDB.getAllCourses();
      this.documents = await window.localDB.getAllDocuments();
      return;
    }

    let courses = await window.localDB.getAllCourses();
    let documents = await window.localDB.getAllDocuments();

    if (!courses || courses.length === 0 || !documents || documents.length === 0) {
      await window.localDB.resetAllData(window.INITIAL_COURSES, window.INITIAL_DOCUMENTS);
      courses = await window.localDB.getAllCourses();
      documents = await window.localDB.getAllDocuments();
    }

    this.courses = courses;
    this.documents = documents;
  }

  bindEvents() {
    // Sélecteur de Promotion
    const promoSelect = document.getElementById('promotion-select');
    if (promoSelect) {
      promoSelect.value = this.selectedPromotion;
      promoSelect.onchange = (e) => {
        this.selectedPromotion = e.target.value;
        localStorage.setItem('unidocs_user_promotion', e.target.value);
        this.selectedCourseId = null; // Réinitialiser le cours sélectionné
        this.updateDepartmentVisibility();
        this.render();
      };
    }

    // Sélecteur de Département
    const deptSelect = document.getElementById('department-select');
    if (deptSelect) {
      deptSelect.value = this.selectedDepartment;
      deptSelect.onchange = (e) => {
        this.selectedDepartment = e.target.value;
        this.selectedCourseId = null;
        this.render();
      };
    }

    // Recherche instantanée
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDocuments();
      };
    }

    // Category chips
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('filter-chip-active'));
        chip.classList.add('filter-chip-active');
        this.activeCategory = chip.dataset.category;
        this.renderDocuments();
      };
    });

    // Bouton de réinitialisation des données
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        if (confirm('Voulez-vous recharger l\'ensemble du programme académique officiel de Polytechnique UNILU ?')) {
          await this.loadData(true);
          this.render();
          alert('Programme officiel UNILU rechargé avec succès !');
        }
      };
    }

    this.setupModals();
  }

  updateDepartmentVisibility() {
    const deptContainer = document.getElementById('department-selector-container');
    if (deptContainer) {
      if (this.selectedPromotion === 'bac2' || this.selectedPromotion === 'bac3' || this.selectedPromotion === 'all') {
        deptContainer.classList.remove('hidden');
      } else {
        deptContainer.classList.add('hidden');
        this.selectedDepartment = 'all';
      }
    }
  }

  setSubjectFilter(courseId) {
    this.selectedCourseId = courseId;
    this.activeCategory = 'all';

    // Si on a cliqué sur un cours spécifique, ajuster la promotion si nécessaire
    if (courseId) {
      const course = this.courses.find(c => c.id === courseId);
      if (course && this.selectedPromotion !== 'all' && course.promotion !== this.selectedPromotion) {
        this.selectedPromotion = course.promotion;
        const promoSelect = document.getElementById('promotion-select');
        if (promoSelect) promoSelect.value = this.selectedPromotion;
        this.updateDepartmentVisibility();
      }
    }

    // Mettre à jour les chips
    document.querySelectorAll('.category-chip').forEach(c => {
      c.classList.toggle('filter-chip-active', c.dataset.category === 'all');
    });

    this.render();
  }

  setQuickCategory(category) {
    this.selectedCourseId = null;
    this.activeCategory = category;

    // Reset chips
    document.querySelectorAll('.category-chip').forEach(c => {
      c.classList.toggle('filter-chip-active', c.dataset.category === category);
    });

    this.render();
  }

  getFilteredCourses() {
    return this.courses.filter(course => {
      // Filtre Promotion
      if (this.selectedPromotion !== 'all' && course.promotion !== this.selectedPromotion) {
        return false;
      }
      // Filtre Département
      if (this.selectedDepartment !== 'all') {
        if (course.department !== 'tronc' && course.department !== this.selectedDepartment) {
          return false;
        }
      }
      return true;
    });
  }

  render() {
    this.updateDepartmentVisibility();
    this.renderSidebar();
    this.renderHeaderBanner();
    this.renderDocuments();

    if (window.lucide) window.lucide.createIcons();
  }

  renderSidebar() {
    // Compteurs globaux
    const countAll = document.getElementById('nav-count-all');
    const countFavs = document.getElementById('nav-count-favs');
    if (countAll) countAll.textContent = this.documents.length;
    if (countFavs) countFavs.textContent = this.documents.filter(d => d.isFavorite).length;

    // Activer l'élément de menu correspondant
    const navAll = document.getElementById('nav-all');
    const navFavs = document.getElementById('nav-favs');
    if (navAll) navAll.className = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${!this.selectedCourseId && this.activeCategory !== 'favorites' ? 'nav-item-active' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`;
    if (navFavs) navFavs.className = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${this.activeCategory === 'favorites' ? 'nav-item-active' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`;

    // Filtrer les cours selon la promotion & département sélectionnés
    const visibleCourses = this.getFilteredCourses();
    const s1Courses = visibleCourses.filter(c => c.semester === 'S1');
    const s2Courses = visibleCourses.filter(c => c.semester === 'S2');

    const s1Container = document.getElementById('nav-courses-s1');
    const s2Container = document.getElementById('nav-courses-s2');
    const s1CountEl = document.getElementById('s1-course-count');
    const s2CountEl = document.getElementById('s2-course-count');

    if (s1CountEl) s1CountEl.textContent = `${s1Courses.length} UE`;
    if (s2CountEl) s2CountEl.textContent = `${s2Courses.length} UE`;

    const renderCourseItem = (course) => {
      const docsCount = this.documents.filter(d => d.courseId === course.id).length;
      const isSelected = this.selectedCourseId === course.id;

      return `
        <button onclick="window.app.setSubjectFilter('${course.id}')" class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition group ${isSelected ? 'nav-item-active font-semibold shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}">
          <div class="flex items-center gap-2 min-w-0 mr-2">
            <span class="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0">${course.code.split('/')[0].trim()}</span>
            <span class="truncate text-left">${course.name}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/50 dark:bg-zinc-800 text-slate-500 font-mono shrink-0">${docsCount}</span>
        </button>
      `;
    };

    if (s1Container) {
      if (s1Courses.length > 0) {
        s1Container.innerHTML = s1Courses.map(renderCourseItem).join('');
        document.getElementById('section-s1')?.classList.remove('hidden');
      } else {
        s1Container.innerHTML = `<div class="px-3 py-1 text-[11px] text-slate-400 dark:text-zinc-600 italic">Aucun cours</div>`;
      }
    }

    if (s2Container) {
      if (s2Courses.length > 0) {
        s2Container.innerHTML = s2Courses.map(renderCourseItem).join('');
        document.getElementById('section-s2')?.classList.remove('hidden');
      } else {
        s2Container.innerHTML = `<div class="px-3 py-1 text-[11px] text-slate-400 dark:text-zinc-600 italic">Aucun cours</div>`;
      }
    }
  }

  renderHeaderBanner() {
    const titleEl = document.getElementById('view-title');
    const subEl = document.getElementById('view-subtitle');
    const promoBadge = document.getElementById('view-promotion-badge');
    const docCountEl = document.getElementById('view-doc-count');

    const promoLabels = {
      all: 'Toutes les promotions',
      prepo: 'Prépo (P0)',
      bac1: 'Bac 1',
      bac2: 'Bac 2',
      bac3: 'Bac 3'
    };

    const deptLabels = {
      all: '',
      mines: ' • Mines',
      metallurgie: ' • Métallurgie',
      chimie: ' • Chimie',
      electromec: ' • Électroméc.',
      civil: ' • Génie Civil'
    };

    if (this.selectedCourseId) {
      const course = this.courses.find(c => c.id === this.selectedCourseId);
      if (course) {
        const promoName = promoLabels[course.promotion] || 'Polytechnique';
        promoBadge.textContent = `${promoName} • ${course.semester} ${course.credits ? `• ${course.credits}` : ''} ${course.hours ? `• ${course.hours}` : ''}`;
        titleEl.textContent = `${course.code} : ${course.name}`;
        subEl.textContent = course.description || 'Unité d\'enseignement officielle de la Faculté Polytechnique UNILU.';
      }
    } else if (this.activeCategory === 'favorites') {
      promoBadge.textContent = 'Espace Révision';
      titleEl.textContent = 'Mes Documents Favoris';
      subEl.textContent = 'Retrouvez tous vos cours, examens et travaux pratiques épinglés pour une révision rapide.';
    } else {
      const curPromoName = promoLabels[this.selectedPromotion] || 'Toutes les promotions';
      const curDeptName = deptLabels[this.selectedDepartment] || '';
      promoBadge.textContent = `${curPromoName}${curDeptName}`;
      
      if (this.selectedPromotion === 'prepo') {
        titleEl.textContent = 'Classe Préparatoire (Prépolytechnique)';
        subEl.textContent = 'Socle fondamental en mathématiques, physique, chimie générale et sciences de l\'ingénieur.';
      } else if (this.selectedPromotion === 'bac1') {
        titleEl.textContent = 'Premier Bachelier (Bac 1)';
        subEl.textContent = 'Tronc commun d\'approfondissement : analyse 2, thermodynamique, mécanique rationnelle et programmation.';
      } else if (this.selectedPromotion === 'bac2') {
        titleEl.textContent = 'Deuxième Bachelier (Bac 2)';
        subEl.textContent = 'Début de la spécialisation par département : Mines, Métallurgie, Chimie Industrielle, Électromécanique, Génie Civil.';
      } else if (this.selectedPromotion === 'bac3') {
        titleEl.textContent = 'Troisième Bachelier (Bac 3)';
        subEl.textContent = 'Cycle terminal d\'ingénierie : dimensionnement, modélisation, gestion industrielle et projets de fin de cycle (TFC).';
      } else {
        titleEl.textContent = 'Tous les documents académiques';
        subEl.textContent = 'Programme complet de la Faculté Polytechnique de l\'Université de Lubumbashi.';
      }
    }

    // Calcul du nombre de documents visibles
    const filteredDocs = this.getFilteredDocuments();
    if (docCountEl) docCountEl.textContent = filteredDocs.length;
  }

  getFilteredDocuments() {
    return this.documents.filter(doc => {
      // Si un cours est sélectionné
      if (this.selectedCourseId && doc.courseId !== this.selectedCourseId) return false;

      // Si aucun cours n'est sélectionné, filtrer par promotion et département du cours associé
      if (!this.selectedCourseId) {
        const course = this.courses.find(c => c.id === doc.courseId);
        if (course) {
          if (this.selectedPromotion !== 'all' && course.promotion !== this.selectedPromotion) return false;
          if (this.selectedDepartment !== 'all' && course.department !== 'tronc' && course.department !== this.selectedDepartment) return false;
        }
      }

      // Favoris
      if (this.activeCategory === 'favorites' && !doc.isFavorite) return false;

      // Type de doc (cours, tp, exercice, examen, interro)
      if (this.activeCategory !== 'all' && this.activeCategory !== 'favorites' && doc.type !== this.activeCategory) return false;

      // Recherche
      if (this.searchQuery) {
        const course = this.courses.find(c => c.id === doc.courseId);
        const matchTitle = doc.title.toLowerCase().includes(this.searchQuery);
        const matchDesc = (doc.description || '').toLowerCase().includes(this.searchQuery);
        const matchAuthor = (doc.author || '').toLowerCase().includes(this.searchQuery);
        const matchCourse = course ? (course.name.toLowerCase().includes(this.searchQuery) || course.code.toLowerCase().includes(this.searchQuery)) : false;
        if (!matchTitle && !matchDesc && !matchAuthor && !matchCourse) return false;
      }

      return true;
    });
  }

  renderDocuments() {
    const table = document.getElementById('documents-table');
    const emptyState = document.getElementById('documents-empty');
    if (!table) return;

    const filtered = this.getFilteredDocuments();

    // Mettre à jour le compteur dans la bannière
    const docCountEl = document.getElementById('view-doc-count');
    if (docCountEl) docCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      table.innerHTML = '';
      table.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    table.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    const badgeStyles = {
      cours: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
      tp: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50',
      exercice: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50',
      examen: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/50',
      interro: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50'
    };

    const typeLabels = {
      cours: 'Cours',
      tp: 'TP',
      exercice: 'Exercice',
      examen: 'Examen',
      interro: 'Interro'
    };

    table.innerHTML = filtered.map(doc => {
      const course = this.courses.find(c => c.id === doc.courseId);
      const bStyle = badgeStyles[doc.type] || badgeStyles.cours;
      const tLabel = typeLabels[doc.type] || 'Doc';

      return `
        <div class="p-2.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-2.5 sm:gap-4 cursor-pointer group" onclick="window.app.openDocument('${doc.id}')">
          
          <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold border ${bStyle} shrink-0">
              ${tLabel}
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">${doc.title}</h4>
                ${doc.hasSolution ? `<span class="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 shrink-0">Corrigé</span>` : ''}
              </div>
              
              <div class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-medium">
                ${course ? `<span class="text-slate-700 dark:text-zinc-300 font-semibold">${course.code}</span><span>•</span>` : ''}
                <span>${doc.year || '2024'}</span>
                <span>•</span>
                <span>5 p.</span>
                ${doc.size ? `<span class="hidden sm:inline">• <span class="font-mono text-[10px]">${doc.size}</span></span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 shrink-0" onclick="event.stopPropagation()">
            <!-- Bouton Favori -->
            <button onclick="window.app.toggleFav('${doc.id}')" class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition" title="Mettre en favori">
              <i data-lucide="star" class="w-3.5 h-3.5 sm:w-4 sm:h-4 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : ''}"></i>
            </button>

            <!-- Bouton Lire le PDF -->
            <button onclick="window.app.openDocument('${doc.id}')" class="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Lire le PDF (5p)</span>
              <span class="sm:hidden">Lire</span>
            </button>
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async toggleFav(docId) {
    await window.localDB.toggleFavorite(docId);
    await this.loadData();
    this.render();
    this.updateSettingsStats();
  }

  openDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;
    const course = this.courses.find(c => c.id === doc.courseId);
    window.pdfViewer.open(doc, course);
  }

  setupModals() {
    // -------------------------------------------------------------
    // MODAL PARAMÈTRES ÉTUDIANT & HORS-LIGNE
    // -------------------------------------------------------------
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsPromoSelect = document.getElementById('settings-promo-select');
    const settingsThemeToggle = document.getElementById('settings-theme-toggle');
    const settingsReloadBtn = document.getElementById('settings-reload-btn');
    const settingsClearCacheBtn = document.getElementById('settings-clear-cache-btn');

    const openSettings = () => {
      this.updateSettingsStats();
      if (settingsPromoSelect) settingsPromoSelect.value = this.selectedPromotion;
      const isDark = document.documentElement.classList.contains('dark');
      const label = document.getElementById('settings-theme-label');
      if (label) label.textContent = isDark ? 'Clair' : 'Sombre';
      if (settingsModal) settingsModal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    };

    const closeSettings = () => settingsModal && settingsModal.classList.add('hidden');

    if (openSettingsBtn) openSettingsBtn.onclick = openSettings;
    if (closeSettingsBtn) closeSettingsBtn.onclick = closeSettings;

    if (settingsPromoSelect) {
      settingsPromoSelect.onchange = (e) => {
        this.selectedPromotion = e.target.value;
        localStorage.setItem('unidocs_user_promotion', e.target.value);
        const mainPromoSelect = document.getElementById('promotion-select');
        if (mainPromoSelect) mainPromoSelect.value = e.target.value;
        this.selectedCourseId = null;
        this.updateDepartmentVisibility();
        this.render();
        this.updateSettingsStats();
      };
    }

    if (settingsThemeToggle) {
      settingsThemeToggle.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light', !isDark);
        localStorage.setItem('unidocs_theme', isDark ? 'dark' : 'light');
        const label = document.getElementById('settings-theme-label');
        if (label) label.textContent = isDark ? 'Clair' : 'Sombre';
        if (window.lucide) window.lucide.createIcons();
      };
    }

    if (settingsReloadBtn) {
      settingsReloadBtn.onclick = async () => {
        if (confirm('Recharger l\'intégralité du programme académique officiel de Polytechnique UNILU ?')) {
          await this.loadData(true);
          this.render();
          this.updateSettingsStats();
          alert('Programme académique rechargé avec succès !');
        }
      };
    }

    if (settingsClearCacheBtn) {
      settingsClearCacheBtn.onclick = async () => {
        if (confirm('Voulez-vous vider le cache local ? Vos données d\'origine seront réinitialisées.')) {
          await window.localDB.clear();
          await this.loadData(true);
          this.render();
          this.updateSettingsStats();
          alert('Cache local réinitialisé.');
        }
      };
    }
  }

  updateSettingsStats() {
    const totalDocsEl = document.getElementById('stat-total-docs');
    const favDocsEl = document.getElementById('stat-fav-docs');
    const completedDocsEl = document.getElementById('stat-completed-docs');
    const coursesCountEl = document.getElementById('stat-courses-count');

    if (totalDocsEl) totalDocsEl.textContent = this.documents.length;
    if (favDocsEl) favDocsEl.textContent = this.documents.filter(d => d.isFavorite).length;
    if (completedDocsEl) completedDocsEl.textContent = this.documents.filter(d => d.revisionStatus === 'completed').length;
    if (coursesCountEl) coursesCountEl.textContent = this.courses.length;
  }

  // -------------------------------------------------------------
  // NAVIGATION MOBILE (BOTTOM BAR & MATIÈRES DRAWER)
  // -------------------------------------------------------------
  handleBottomNav(tab) {
    document.querySelectorAll('.bnav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`bnav-${tab === 'favorites' ? 'favs' : tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tab === 'home') {
      this.selectedCourseId = null;
      this.activeCategory = 'all';
      document.querySelectorAll('.category-chip').forEach(c => {
        c.classList.toggle('filter-chip-active', c.dataset.category === 'all');
      });
      this.closeMobileCoursesSheet();
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'favorites') {
      this.setQuickCategory('favorites');
      this.closeMobileCoursesSheet();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'courses') {
      this.openMobileCoursesSheet();
    } else if (tab === 'settings') {
      this.closeMobileCoursesSheet();
      const settingsModal = document.getElementById('settings-modal');
      if (settingsModal) {
        this.updateSettingsStats();
        settingsModal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  openMobileCoursesSheet() {
    const sheet = document.getElementById('mobile-courses-sheet');
    const list = document.getElementById('mobile-courses-list');
    const promoNameEl = document.getElementById('mobile-sheet-promo-name');
    if (!sheet || !list) return;

    const promoTitles = {
      all: 'Toutes les promotions',
      prepo: 'Classe Préparatoire (Prépo - P0)',
      bac1: 'Premier Bachelier (Bac 1)',
      bac2: 'Deuxième Bachelier (Bac 2)',
      bac3: 'Troisième Bachelier (Bac 3)'
    };
    if (promoNameEl) promoNameEl.textContent = promoTitles[this.selectedPromotion] || 'Matières Polytechniques';

    const visibleCourses = this.getFilteredCourses();
    const s1 = visibleCourses.filter(c => c.semester === 'S1');
    const s2 = visibleCourses.filter(c => c.semester === 'S2');

    const renderCourseBtn = (c) => {
      const count = this.documents.filter(d => d.courseId === c.id).length;
      const isSelected = this.selectedCourseId === c.id;
      return `
        <button onclick="window.app.selectMobileCourse('${c.id}')" class="w-full flex items-center justify-between p-3 rounded-xl border ${isSelected ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 text-slate-800 dark:text-zinc-200'} text-xs text-left transition">
          <div class="min-w-0 pr-2">
            <span class="font-mono text-[10px] uppercase font-bold text-slate-400 block">${c.code}</span>
            <span class="truncate block font-semibold">${c.name}</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-[11px] font-mono shrink-0">${count} docs</span>
        </button>
      `;
    };

    list.innerHTML = `
      <div class="space-y-3">
        <button onclick="window.app.selectMobileCourse(null)" class="w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-center">
          Afficher toutes les matières de cette promotion
        </button>

        ${s1.length > 0 ? `
          <div class="space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Semestre 1 (${s1.length} matières)</p>
            <div class="space-y-1.5">
              ${s1.map(renderCourseBtn).join('')}
            </div>
          </div>
        ` : ''}

        ${s2.length > 0 ? `
          <div class="space-y-2 pt-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Semestre 2 (${s2.length} matières)</p>
            <div class="space-y-1.5">
              ${s2.map(renderCourseBtn).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    sheet.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeMobileCoursesSheet() {
    const sheet = document.getElementById('mobile-courses-sheet');
    if (sheet) sheet.classList.add('hidden');
  }

  selectMobileCourse(courseId) {
    this.setSubjectFilter(courseId);
    this.closeMobileCoursesSheet();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new UniDocsApp();
});

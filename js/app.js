/**
 * UniDocs - Logique Minimaliste & Moderne
 */

class UniDocsApp {
  constructor() {
    this.courses = [];
    this.documents = [];
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

    // Service Worker PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  async loadData() {
    let localCourses = await window.localDB.getAllCourses();
    let localDocs = await window.localDB.getAllDocuments();

    if (localCourses.length === 0 && window.INITIAL_COURSES) {
      await window.localDB.saveCourses(window.INITIAL_COURSES);
      localCourses = window.INITIAL_COURSES;
    }

    if (localDocs.length === 0 && window.INITIAL_DOCUMENTS) {
      await window.localDB.saveDocuments(window.INITIAL_DOCUMENTS);
      localDocs = window.INITIAL_DOCUMENTS;
    }

    this.courses = localCourses;
    this.documents = localDocs;
  }

  bindEvents() {
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

    this.setupModals();
  }

  setSubjectFilter(courseId) {
    this.selectedCourseId = courseId;
    this.activeCategory = 'all';

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

  render() {
    this.renderSidebar();
    this.renderHeaderTitle();
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
    if (navAll) navAll.className = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${!this.selectedCourseId && this.activeCategory !== 'favorites' ? 'nav-item-active' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`;
    if (navFavs) navFavs.className = `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${this.activeCategory === 'favorites' ? 'nav-item-active' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`;

    // Semestre 1 & Semestre 2
    const s1Container = document.getElementById('nav-courses-s1');
    const s2Container = document.getElementById('nav-courses-s2');

    const renderCourseItem = (course) => {
      const docsCount = this.documents.filter(d => d.courseId === course.id).length;
      const isSelected = this.selectedCourseId === course.id;

      return `
        <button onclick="window.app.setSubjectFilter('${course.id}')" class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected ? 'nav-item-active font-semibold' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}">
          <span class="truncate text-left mr-2">${course.name}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/50 dark:bg-zinc-800 text-slate-500 font-mono">${docsCount}</span>
        </button>
      `;
    };

    if (s1Container) {
      s1Container.innerHTML = this.courses.filter(c => c.semester === 'S1').map(renderCourseItem).join('');
    }
    if (s2Container) {
      s2Container.innerHTML = this.courses.filter(c => c.semester === 'S2').map(renderCourseItem).join('');
    }
  }

  renderHeaderTitle() {
    const titleEl = document.getElementById('view-title');
    const subEl = document.getElementById('view-subtitle');

    if (this.selectedCourseId) {
      const course = this.courses.find(c => c.id === this.selectedCourseId);
      if (course) {
        titleEl.textContent = course.name;
        subEl.textContent = `${course.code} • ${course.semester} • ${course.description || ''}`;
      }
    } else if (this.activeCategory === 'favorites') {
      titleEl.textContent = 'Mes Documents Favoris';
      subEl.textContent = 'Vos cours et examens épinglés pour révision rapide.';
    } else {
      titleEl.textContent = 'Tous les documents';
      subEl.textContent = 'Consultez l\'ensemble des ressources pédagogiques disponibles.';
    }
  }

  renderDocuments() {
    const table = document.getElementById('documents-table');
    const emptyState = document.getElementById('documents-empty');
    if (!table) return;

    let filtered = this.documents.filter(doc => {
      if (this.selectedCourseId && doc.courseId !== this.selectedCourseId) return false;
      if (this.activeCategory === 'favorites' && !doc.isFavorite) return false;
      if (this.activeCategory !== 'all' && this.activeCategory !== 'favorites' && doc.type !== this.activeCategory) return false;

      if (this.searchQuery) {
        const course = this.courses.find(c => c.id === doc.courseId);
        const matchTitle = doc.title.toLowerCase().includes(this.searchQuery);
        const matchDesc = (doc.description || '').toLowerCase().includes(this.searchQuery);
        const matchAuthor = (doc.author || '').toLowerCase().includes(this.searchQuery);
        const matchCourse = course ? course.name.toLowerCase().includes(this.searchQuery) : false;
        if (!matchTitle && !matchDesc && !matchAuthor && !matchCourse) return false;
      }
      return true;
    });

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
        <div class="p-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-4 cursor-pointer" onclick="window.app.openDocument('${doc.id}')">
          
          <div class="flex items-center gap-3.5 min-w-0 flex-1">
            <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold border ${bStyle} shrink-0">
              ${tLabel}
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">${doc.title}</h4>
                ${doc.hasSolution ? `<span class="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">💡 Corrigé</span>` : ''}
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                ${course ? course.name : ''} • ${doc.year || '2024-2025'} • ${doc.author || 'Faculté'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0" onclick="event.stopPropagation()">
            <!-- Bouton Favori -->
            <button onclick="window.app.toggleFav('${doc.id}')" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition" title="Favori">
              <i data-lucide="star" class="w-4 h-4 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : ''}"></i>
            </button>

            <!-- Bouton Consulter -->
            <button onclick="window.app.openDocument('${doc.id}')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition">
              Ouvrir
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
  }

  openDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;
    const course = this.courses.find(c => c.id === doc.courseId);
    window.pdfViewer.open(doc, course);
  }

  setupModals() {
    // Add Doc Modal
    const addModal = document.getElementById('add-doc-modal');
    const openAddBtn = document.getElementById('open-add-doc-btn');
    const closeAddBtn = document.getElementById('close-add-doc-btn');
    const cancelAddBtn = document.getElementById('cancel-add-doc-btn');
    const addForm = document.getElementById('add-doc-form');

    if (openAddBtn && addModal) {
      openAddBtn.onclick = () => {
        const select = document.getElementById('add-doc-course');
        if (select) {
          select.innerHTML = this.courses.map(c => `
            <option value="${c.id}" ${this.selectedCourseId === c.id ? 'selected' : ''}>${c.name}</option>
          `).join('');
        }
        addModal.classList.remove('hidden');
      };
    }

    const closeAdd = () => addModal && addModal.classList.add('hidden');
    if (closeAddBtn) closeAddBtn.onclick = closeAdd;
    if (cancelAddBtn) cancelAddBtn.onclick = closeAdd;

    if (addForm) {
      addForm.onsubmit = async (e) => {
        e.preventDefault();
        const courseId = document.getElementById('add-doc-course').value;
        const title = document.getElementById('add-doc-title').value.trim();
        const type = document.getElementById('add-doc-type').value;
        const year = document.getElementById('add-doc-year').value.trim() || '2024-2025';
        const author = document.getElementById('add-doc-author').value.trim() || 'Faculté';
        const hasSolution = document.getElementById('add-doc-solution').checked;
        const course = this.courses.find(c => c.id === courseId);

        const newDoc = {
          id: `doc-${Date.now()}`,
          courseId,
          title,
          type,
          year,
          semester: course ? course.semester : 'S1',
          author,
          hasSolution,
          size: '1.2 Mo',
          dateAdded: new Date().toISOString().split('T')[0],
          revisionStatus: 'todo',
          isFavorite: false
        };

        await window.localDB.addDocument(newDoc);
        await this.loadData();
        this.render();
        closeAdd();
        addForm.reset();
      };
    }

    // Supabase Modal
    const supModal = document.getElementById('supabase-modal');
    const openSupBtn = document.getElementById('open-supabase-btn');
    const closeSupBtn = document.getElementById('close-supabase-btn');
    const supForm = document.getElementById('supabase-form');

    if (openSupBtn && supModal) {
      openSupBtn.onclick = async () => {
        document.getElementById('supabase-url').value = await window.localDB.getSetting('supabase_url', '');
        document.getElementById('supabase-key').value = await window.localDB.getSetting('supabase_anon_key', '');
        supModal.classList.remove('hidden');
      };
    }

    if (closeSupBtn && supModal) {
      closeSupBtn.onclick = () => supModal.classList.add('hidden');
    }

    if (supForm) {
      supForm.onsubmit = async (e) => {
        e.preventDefault();
        const url = document.getElementById('supabase-url').value;
        const key = document.getElementById('supabase-key').value;
        const res = await window.supabaseService.setCredentials(url, key);
        alert(res.message);
      };
    }
  }

}


window.addEventListener('DOMContentLoaded', () => {
  window.app = new UniDocsApp();
});

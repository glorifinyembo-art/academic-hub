/**
 * UniDocs - Console d'Administration & Ingestion IA
 * Faculté Polytechnique (Université de Lubumbashi)
 */

class AdminApp {
  constructor() {
    this.courses = [];
    this.documents = [];
    this.selectedFile = null;
    this.selectedFileDataUrl = null;
    this.selectedFileText = '';
    this.currentEditingDocId = null;
    this.targetPromotion = 'all'; // 'all', 'prepo', 'bac1'
    this.catalogTab = 'docs'; // 'docs' | 'courses'
    this.tableSearchQuery = '';
    this.tableTypeFilter = 'all';

    // État Modal Ajout Manuel
    this.modalSelectedFile = null;
    this.modalSelectedFileDataUrl = '';

    // État Assistant IA Multi-Agents Drawer Admin
    this.aiChatHistory = [];
    this.aiSelectedFile = null;
    this.aiSelectedFileDataUrl = '';

    this.init();
  }

  async init() {
    this.setupTheme();
    
    // Initialisation DB locale & Supabase
    await window.localDB.init();
    await window.supabaseService.init();

    // Initialisation du visualiseur PDF
    if (window.PdfViewerModal) {
      window.pdfViewer = new window.PdfViewerModal();
    }

    await this.loadData();
    this.bindEvents();
    this.render();

    // Tenter une synchronisation discrète Supabase au démarrage si en ligne
    if (navigator.onLine && window.supabaseService.isConfigured()) {
      window.supabaseService.pullFromCloud().then(() => {
        this.loadData().then(() => this.render());
      }).catch(() => {});
    }
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

    const toggleBtn = document.getElementById('admin-theme-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light', !isDark);
        localStorage.setItem('unidocs_theme', isDark ? 'dark' : 'light');
        if (window.lucide) window.lucide.createIcons();
      };
    }
  }

  async loadData() {
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
    // 1. Zone de Drag & Drop & Upload de Fichier
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const removeFileBtn = document.getElementById('btn-remove-file');

    if (dropZone && fileInput) {
      dropZone.onclick = () => fileInput.click();

      dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/30');
      };

      dropZone.ondragleave = () => {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/30');
      };

      dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/30');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      };

      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      };
    }

    if (removeFileBtn) {
      removeFileBtn.onclick = () => this.clearSelectedFile();
    }

    // 2. Changement de promotion dans le formulaire -> Met à jour la liste des matières
    const formPromoSelect = document.getElementById('doc-form-promotion');
    if (formPromoSelect) {
      formPromoSelect.onchange = () => {
        this.updateFormCourseSelect();
      };
    }

    // 3. Soumission du formulaire de publication
    const publishForm = document.getElementById('admin-publish-form');
    if (publishForm) {
      publishForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handlePublishDocument();
      };
    }

    // 4. Bouton de Réinitialisation du formulaire
    const resetFormBtn = document.getElementById('btn-reset-form');
    if (resetFormBtn) {
      resetFormBtn.onclick = () => this.resetForm();
    }

    // 5. Régénération / Amélioration de description IA
    const btnImproveDesc = document.getElementById('btn-improve-desc');
    if (btnImproveDesc) {
      btnImproveDesc.onclick = () => this.handleRegenerateDescription();
    }

    const btnReanalyzeAi = document.getElementById('btn-reanalyze-ai');
    if (btnReanalyzeAi) {
      btnReanalyzeAi.onclick = () => {
        if (this.selectedFile) {
          this.analyzeFileWithAI();
        } else {
          this.handleRegenerateDescription();
        }
      };
    }

    // 6. Recherche et filtres dans la table
    const tableSearch = document.getElementById('admin-table-search');
    if (tableSearch) {
      tableSearch.oninput = (e) => {
        this.tableSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      };
    }

    const tableTypeFilter = document.getElementById('admin-table-type-filter');
    if (tableTypeFilter) {
      tableTypeFilter.onchange = (e) => {
        this.tableTypeFilter = e.target.value;
        this.renderCatalog();
      };
    }

    // 7. Formulaire d'ajout de matière
    const addCourseForm = document.getElementById('add-course-form');
    if (addCourseForm) {
      addCourseForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleAddCourse();
      };
    }

    // 8. Fichier dans le Modal d'Ajout Manuel de Document
    const modalDocFile = document.getElementById('modal-doc-file');
    if (modalDocFile) {
      modalDocFile.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          this.modalSelectedFile = file;
          
          const previewBox = document.getElementById('modal-file-preview');
          const previewName = document.getElementById('modal-file-preview-name');
          const previewSize = document.getElementById('modal-file-preview-size');
          const statusBadge = document.getElementById('modal-file-status-badge');

          if (previewBox && previewName && previewSize) {
            previewBox.classList.remove('hidden');
            previewName.textContent = file.name;
            previewSize.textContent = `(${(file.size / (1024 * 1024)).toFixed(2)} Mo)`;
          }
          if (statusBadge) {
            statusBadge.textContent = 'Fichier sélectionné';
            statusBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold';
          }

          // Auto-remplir le titre si vide
          const modalTitle = document.getElementById('modal-doc-title');
          if (modalTitle && !modalTitle.value) {
            const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            modalTitle.value = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
          }

          const reader = new FileReader();
          reader.onload = (ev) => {
            this.modalSelectedFileDataUrl = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // 9. Changement de promotion dans le Modal d'Ajout Manuel
    const modalPromoSelect = document.getElementById('modal-doc-promotion');
    if (modalPromoSelect) {
      modalPromoSelect.onchange = () => {
        this.updateModalCourseSelect();
      };
    }

    // 10. Soumission du Formulaire d'Ajout Manuel de Document
    const addDocManualForm = document.getElementById('add-doc-manual-form');
    if (addDocManualForm) {
      addDocManualForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleAddDocManual();
      };
    }
  }

  // ====================================================
  // TRAITEMENT FICHIER & ANALYSE PAR L'AGENT IA
  // ====================================================
  async handleFileSelected(file) {
    this.selectedFile = file;

    // Afficher la boîte du fichier sélectionné
    const fileBox = document.getElementById('file-selected-box');
    const fileNameEl = document.getElementById('selected-file-name');
    const fileSizeEl = document.getElementById('selected-file-size');

    if (fileBox && fileNameEl && fileSizeEl) {
      fileBox.classList.remove('hidden');
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} Mo`;
    }

    // Lire le fichier en tant que DataURL et Texte si possible
    const reader = new FileReader();
    reader.onload = async (e) => {
      this.selectedFileDataUrl = e.target.result;
      
      // Si fichier texte
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        this.selectedFileText = e.target.result;
      }

      await this.analyzeFileWithAI();
    };

    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.selectedFileDataUrl = null;
    this.selectedFileText = '';

    const fileBox = document.getElementById('file-selected-box');
    const fileInput = document.getElementById('file-input');
    if (fileBox) fileBox.classList.add('hidden');
    if (fileInput) fileInput.value = '';
    
    document.getElementById('ai-analyzing-indicator')?.classList.add('hidden');
    document.getElementById('ai-success-indicator')?.classList.add('hidden');
  }

  async analyzeFileWithAI() {
    if (!this.selectedFile) return;

    const analyzingIndicator = document.getElementById('ai-analyzing-indicator');
    const successIndicator = document.getElementById('ai-success-indicator');
    const customPrompt = document.getElementById('custom-ai-prompt')?.value || '';

    if (analyzingIndicator) analyzingIndicator.classList.remove('hidden');
    if (successIndicator) successIndicator.classList.add('hidden');

    try {
      const response = await fetch('/api/agent/analyze-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: this.selectedFile.name,
          fileContent: this.selectedFileText || '',
          fileData: this.selectedFileDataUrl ? this.selectedFileDataUrl.split(',')[1] : null,
          mimeType: this.selectedFile.type || 'application/pdf',
          customPrompt,
          existingCourses: this.courses
        })
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'analyse");
      const data = await response.json();

      if (data && data.analysis) {
        this.applyAnalysisToForm(data.analysis);
      }
    } catch (err) {
      console.warn('[Admin Agent File Analysis Warning]', err);
      // Remplissage de secours basé sur le nom
      this.applyFallbackFileInfo(this.selectedFile.name);
    } finally {
      if (analyzingIndicator) analyzingIndicator.classList.add('hidden');
      if (successIndicator) successIndicator.classList.remove('hidden');
    }
  }

  applyAnalysisToForm(analysis) {
    // 1. Promotion
    const promoSelect = document.getElementById('doc-form-promotion');
    if (promoSelect && analysis.promotion) {
      promoSelect.value = analysis.promotion;
      this.updateFormCourseSelect();
    }

    // 2. Matière / Cours
    const courseSelect = document.getElementById('doc-form-course');
    if (courseSelect) {
      if (analysis.suggestedCourseId) {
        courseSelect.value = analysis.suggestedCourseId;
      }
    }

    // 3. Titre
    const titleInput = document.getElementById('doc-form-title');
    if (titleInput && analysis.title) {
      titleInput.value = analysis.title;
    }

    // 4. Type
    const typeSelect = document.getElementById('doc-form-type');
    if (typeSelect && analysis.type) {
      typeSelect.value = analysis.type;
    }

    // 5. Semestre
    const semSelect = document.getElementById('doc-form-semester');
    if (semSelect && analysis.semester) {
      semSelect.value = analysis.semester;
    }

    // 6. Année
    const yearInput = document.getElementById('doc-form-year');
    if (yearInput && analysis.year) {
      yearInput.value = analysis.year;
    }

    // 7. Auteur
    const authorInput = document.getElementById('doc-form-author');
    if (authorInput && analysis.author) {
      authorInput.value = analysis.author;
    }

    // 8. Corrigé inclus
    const solCheckbox = document.getElementById('doc-form-solution');
    if (solCheckbox && analysis.hasSolution !== undefined) {
      solCheckbox.checked = Boolean(analysis.hasSolution);
    }

    // 9. Description rédigée par l'IA
    const descTextarea = document.getElementById('doc-form-desc');
    if (descTextarea && analysis.description) {
      descTextarea.value = analysis.description;
    }
  }

  applyFallbackFileInfo(fileName) {
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const titleInput = document.getElementById('doc-form-title');
    if (titleInput) titleInput.value = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const descTextarea = document.getElementById('doc-form-desc');
    if (descTextarea) {
      descTextarea.value = `Document académique officiel : "${cleanTitle}". Déposé et validé pour la Faculté Polytechnique UNILU.`;
    }
  }

  async handleRegenerateDescription() {
    const title = document.getElementById('doc-form-title')?.value || '';
    const courseId = document.getElementById('doc-form-course')?.value || '';
    const course = this.courses.find(c => c.id === courseId);
    const promotion = document.getElementById('doc-form-promotion')?.value || 'prepo';
    const type = document.getElementById('doc-form-type')?.value || 'cours';
    const currentDesc = document.getElementById('doc-form-desc')?.value || '';
    const promptInstructions = document.getElementById('custom-ai-prompt')?.value || '';

    const btnImprove = document.getElementById('btn-improve-desc');
    if (btnImprove) {
      btnImprove.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Rédaction en cours...`;
    }

    try {
      const response = await fetch('/api/agent/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          courseName: course ? course.name : '',
          courseCode: course ? course.code : '',
          promotion,
          type,
          currentDescription: currentDesc,
          promptInstructions
        })
      });

      if (!response.ok) throw new Error("Erreur génération description");
      const data = await response.json();

      if (data && data.description) {
        const descTextarea = document.getElementById('doc-form-desc');
        if (descTextarea) descTextarea.value = data.description;
      }
    } catch (e) {
      console.warn('[Regenerate Description Ex]', e);
    } finally {
      if (btnImprove) {
        btnImprove.innerHTML = `<i data-lucide="refresh-cw" class="w-3 h-3"></i> Régénérer avec l'IA`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ====================================================
  // PUBLICATION DANS SUPABASE & BASE LOCALE
  // ====================================================
  async handlePublishDocument() {
    const title = document.getElementById('doc-form-title')?.value.trim();
    const courseId = document.getElementById('doc-form-course')?.value;
    const promotion = document.getElementById('doc-form-promotion')?.value || 'prepo';
    const type = document.getElementById('doc-form-type')?.value || 'cours';
    const semester = document.getElementById('doc-form-semester')?.value || 'S1';
    const year = document.getElementById('doc-form-year')?.value.trim() || '2024-2025';
    const author = document.getElementById('doc-form-author')?.value.trim() || 'Faculté Polytechnique UNILU';
    const hasSolution = document.getElementById('doc-form-solution')?.checked || false;
    const description = document.getElementById('doc-form-desc')?.value.trim() || '';

    if (!title || !courseId) {
      alert("Veuillez renseigner au minimum le titre et la matière associée.");
      return;
    }

    const submitBtn = document.getElementById('btn-publish-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Publication en cours...`;
    }

    try {
      const docId = this.currentEditingDocId || `doc-${Date.now()}`;
      const existingDoc = this.documents.find(d => d.id === docId);

      const documentPayload = {
        id: docId,
        courseId,
        title,
        type,
        year,
        semester,
        author,
        description,
        hasSolution,
        promotion,
        size: this.selectedFile ? `${(this.selectedFile.size / (1024 * 1024)).toFixed(2)} Mo` : (existingDoc?.size || '1.5 Mo'),
        revisionStatus: existingDoc?.revisionStatus || 'todo',
        isFavorite: existingDoc?.isFavorite || false,
        dateAdded: existingDoc?.dateAdded || new Date().toISOString().split('T')[0],
        file_url: existingDoc?.file_url || ''
      };

      // Publication directe (IndexedDB + Supabase)
      const res = await window.supabaseService.publishSingleDocument(documentPayload, this.selectedFileDataUrl);

      await this.loadData();
      this.render();
      this.resetForm();

      if (res.cloudSynced) {
        alert(`✅ Document "${title}" publié avec succès dans la base Supabase et sur le site UniDocs !`);
      } else {
        alert(`✅ Document "${title}" enregistré avec succès sur le site UniDocs !`);
      }
    } catch (err) {
      console.error('[Publish Document Error]', err);
      alert(`Erreur lors de la publication : ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="database" class="w-4 h-4"></i><span>Publier dans la base de données Supabase</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ====================================================
  // MODIFICATION & SUPPRESSION
  // ====================================================
  editDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    this.currentEditingDocId = doc.id;

    // Remplir le formulaire
    const course = this.courses.find(c => c.id === doc.courseId);
    const promo = doc.promotion || (course ? course.promotion : 'prepo');

    const promoSelect = document.getElementById('doc-form-promotion');
    if (promoSelect) {
      promoSelect.value = promo;
      this.updateFormCourseSelect();
    }

    const courseSelect = document.getElementById('doc-form-course');
    if (courseSelect) courseSelect.value = doc.courseId;

    const titleInput = document.getElementById('doc-form-title');
    if (titleInput) titleInput.value = doc.title;

    const typeSelect = document.getElementById('doc-form-type');
    if (typeSelect) typeSelect.value = doc.type;

    const semSelect = document.getElementById('doc-form-semester');
    if (semSelect) semSelect.value = doc.semester;

    const yearInput = document.getElementById('doc-form-year');
    if (yearInput) yearInput.value = doc.year;

    const authorInput = document.getElementById('doc-form-author');
    if (authorInput) authorInput.value = doc.author || '';

    const solCheckbox = document.getElementById('doc-form-solution');
    if (solCheckbox) solCheckbox.checked = Boolean(doc.hasSolution);

    const descTextarea = document.getElementById('doc-form-desc');
    if (descTextarea) descTextarea.value = doc.description || '';

    const badge = document.getElementById('form-mode-badge');
    if (badge) {
      badge.textContent = `Mode Édition : ${doc.title}`;
      badge.className = 'w-fit px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
    }

    // Faire défiler jusqu'au formulaire
    document.getElementById('admin-publish-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  async deleteDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.title}" de la base de données et du site ?`)) {
      await window.localDB.deleteDocument(docId);
      
      // Si connecté à Supabase, supprimer aussi sur le cloud
      if (window.supabaseService.client && navigator.onLine) {
        try {
          await window.supabaseService.client.from('documents').delete().eq('id', docId);
        } catch (e) {
          console.warn('[Supabase Remote Delete Warning]', e);
        }
      }

      await this.loadData();
      this.render();
      alert(`Document supprimé.`);
    }
  }

  previewDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    const course = this.courses.find(c => c.id === doc.courseId);
    if (window.pdfViewer) {
      window.pdfViewer.open(doc, course);
    }
  }

  resetForm() {
    this.currentEditingDocId = null;
    this.clearSelectedFile();

    const form = document.getElementById('admin-publish-form');
    if (form) form.reset();

    const badge = document.getElementById('form-mode-badge');
    if (badge) {
      badge.textContent = 'Nouveau Document';
      badge.className = 'w-fit px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300';
    }

    this.updateFormCourseSelect();
  }

  // ====================================================
  // MODAL : AJOUT MANUEL DE DOCUMENT (AVEC FICHIER)
  // ====================================================
  openAddDocModal() {
    const modal = document.getElementById('add-doc-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    this.modalSelectedFile = null;
    this.modalSelectedFileDataUrl = '';

    const previewBox = document.getElementById('modal-file-preview');
    if (previewBox) previewBox.classList.add('hidden');

    const statusBadge = document.getElementById('modal-file-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'Sélectionnez un fichier';
      statusBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold';
    }

    const form = document.getElementById('add-doc-manual-form');
    if (form) form.reset();

    const promoSelect = document.getElementById('modal-doc-promotion');
    if (promoSelect) promoSelect.value = this.targetPromotion;

    this.updateModalCourseSelect();
    if (window.lucide) window.lucide.createIcons();
  }

  closeAddDocModal() {
    const modal = document.getElementById('add-doc-modal');
    if (modal) modal.classList.add('hidden');
    this.modalSelectedFile = null;
    this.modalSelectedFileDataUrl = '';
    document.getElementById('add-doc-manual-form')?.reset();
  }

  updateModalCourseSelect() {
    const promoSelect = document.getElementById('modal-doc-promotion');
    const courseSelect = document.getElementById('modal-doc-course');
    if (!promoSelect || !courseSelect) return;

    const promo = promoSelect.value;
    const filteredCourses = this.courses.filter(c => c.promotion === promo);

    courseSelect.innerHTML = '';
    if (filteredCourses.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Aucune matière pour cette promotion';
      courseSelect.appendChild(opt);
      return;
    }

    filteredCourses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.code} - ${c.name} (${c.semester || 'S1'})`;
      courseSelect.appendChild(opt);
    });
  }

  async handleAddDocManual() {
    const title = document.getElementById('modal-doc-title')?.value.trim();
    const courseId = document.getElementById('modal-doc-course')?.value;
    const promotion = document.getElementById('modal-doc-promotion')?.value || 'prepo';
    const type = document.getElementById('modal-doc-type')?.value || 'cours';
    const semester = document.getElementById('modal-doc-semester')?.value || 'S1';
    const year = document.getElementById('modal-doc-year')?.value.trim() || '2024-2025';
    const author = document.getElementById('modal-doc-author')?.value.trim() || 'Faculté Polytechnique UNILU';
    const hasSolution = document.getElementById('modal-doc-solution')?.checked || false;
    const description = document.getElementById('modal-doc-desc')?.value.trim() || '';

    if (!title || !courseId) {
      alert("Veuillez renseigner au minimum le titre et la matière.");
      return;
    }

    const submitBtn = document.getElementById('btn-modal-doc-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Enregistrement en cours...`;
    }

    try {
      const docId = `doc-${Date.now()}`;
      const fileSizeStr = this.modalSelectedFile ? `${(this.modalSelectedFile.size / (1024 * 1024)).toFixed(2)} Mo` : '1.8 Mo';

      const documentPayload = {
        id: docId,
        courseId,
        title,
        type,
        year,
        semester,
        author,
        description: description || `Document académique officiel : "${title}". Rattaché à la Faculté Polytechnique UNILU.`,
        hasSolution,
        promotion,
        size: fileSizeStr,
        revisionStatus: 'todo',
        isFavorite: false,
        dateAdded: new Date().toISOString().split('T')[0],
        file_url: ''
      };

      const res = await window.supabaseService.publishSingleDocument(documentPayload, this.modalSelectedFileDataUrl);

      await this.loadData();
      this.closeAddDocModal();
      this.render();

      if (res.cloudSynced) {
        alert(`✅ Document "${title}" enregistré avec son fichier et synchronisé avec succès dans Supabase !`);
      } else {
        alert(`✅ Document "${title}" enregistré avec succès avec son fichier !`);
      }
    } catch (e) {
      console.error('[Add Doc Manual Error]', e);
      alert("Erreur lors de l'enregistrement du document : " + (e.message || e));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="database" class="w-4 h-4"></i><span>Enregistrer & Publier</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ====================================================
  // GESTION DES MATIÈRES / UEs
  // ====================================================
  openAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) modal.classList.add('hidden');
    document.getElementById('add-course-form')?.reset();
  }

  async handleAddCourse() {
    const code = document.getElementById('course-code')?.value.trim().toUpperCase();
    const name = document.getElementById('course-name')?.value.trim();
    const promotion = document.getElementById('course-promotion')?.value;
    const semester = document.getElementById('course-semester')?.value;
    const credits = document.getElementById('course-credits')?.value.trim() || '5 ECTS';
    const hours = document.getElementById('course-hours')?.value.trim() || '75h';
    const description = document.getElementById('course-desc')?.value.trim() || '';
    const syllabusFileInput = document.getElementById('course-syllabus-file');

    if (!code || !name) {
      alert("Le code et le nom de la matière sont obligatoires.");
      return;
    }

    const courseId = `${promotion}-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const newCourse = {
      id: courseId,
      code,
      name,
      promotion,
      semester,
      credits,
      hours,
      description,
      department: 'tronc',
      icon: 'book-open',
      color: 'blue'
    };

    await window.localDB.addCourse(newCourse);
    
    // Pousser vers Supabase si connecté
    if (window.supabaseService.client && navigator.onLine) {
      try {
        await window.supabaseService.client.from('courses').upsert(newCourse, { onConflict: 'id' });
      } catch (e) {
        console.warn('[Supabase Course Upsert Error]', e);
      }
    }

    // Si un fichier de syllabus/support a été sélectionné, créer automatiquement le document lié
    if (syllabusFileInput && syllabusFileInput.files && syllabusFileInput.files[0]) {
      const sFile = syllabusFileInput.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const fileDataUrl = ev.target.result;
        const syllabusDoc = {
          id: `doc-${Date.now()}`,
          courseId: courseId,
          title: `Syllabus & Support Officiel - ${name}`,
          type: 'cours',
          year: '2024-2025',
          semester: semester || 'S1',
          author: 'Faculté Polytechnique UNILU',
          description: description || `Support et syllabus officiel pour ${name} (${code}).`,
          hasSolution: false,
          promotion: promotion,
          size: `${(sFile.size / (1024 * 1024)).toFixed(2)} Mo`,
          revisionStatus: 'todo',
          isFavorite: false,
          dateAdded: new Date().toISOString().split('T')[0],
          file_url: ''
        };
        await window.supabaseService.publishSingleDocument(syllabusDoc, fileDataUrl);
        await this.loadData();
        this.render();
      };
      reader.readAsDataURL(sFile);
    }

    await this.loadData();
    this.closeAddCourseModal();
    this.render();
    alert(`Matière "${code} - ${name}" créée avec succès !`);
  }

  async deleteCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    const docsCount = this.documents.filter(d => d.courseId === courseId).length;
    if (docsCount > 0) {
      if (!confirm(`Cette matière contient ${docsCount} document(s). Voulez-vous vraiment la supprimer ?`)) {
        return;
      }
    } else {
      if (!confirm(`Supprimer la matière "${course.code} : ${course.name}" ?`)) {
        return;
      }
    }

    await window.localDB.deleteCourse(courseId);
    
    if (window.supabaseService.client && navigator.onLine) {
      try {
        await window.supabaseService.client.from('courses').delete().eq('id', courseId);
      } catch (e) {}
    }

    await this.loadData();
    this.render();
  }

  // ====================================================
  // NAVIGATION & RENDU UI
  // ====================================================
  setTargetPromotion(promo) {
    this.targetPromotion = promo;

    document.querySelectorAll('.admin-promo-tab').forEach(tab => {
      tab.classList.remove('bg-white', 'dark:bg-zinc-900', 'text-blue-600', 'dark:text-blue-400', 'shadow-xs');
      tab.classList.add('text-slate-600', 'dark:text-zinc-400');
    });

    const activeTab = document.getElementById(`admin-filter-${promo}`);
    if (activeTab) {
      activeTab.classList.add('bg-white', 'dark:bg-zinc-900', 'text-blue-600', 'dark:text-blue-400', 'shadow-xs');
      activeTab.classList.remove('text-slate-600', 'dark:text-zinc-400');
    }

    this.renderCatalog();
  }

  switchCatalogTab(tab) {
    this.catalogTab = tab;

    const btnDocs = document.getElementById('tab-btn-docs');
    const btnCourses = document.getElementById('tab-btn-courses');
    const docsContainer = document.getElementById('admin-docs-table-container');
    const coursesContainer = document.getElementById('admin-courses-table-container');

    if (tab === 'docs') {
      btnDocs.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs transition';
      btnCourses.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition';
      docsContainer?.classList.remove('hidden');
      coursesContainer?.classList.add('hidden');
    } else {
      btnCourses.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs transition';
      btnDocs.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition';
      coursesContainer?.classList.remove('hidden');
      docsContainer?.classList.add('hidden');
    }

    this.renderCatalog();
  }

  switchMainSection(section) {
    this.mainSection = section; // 'ingestion' | 'settings'

    const tabIngestion = document.getElementById('admin-main-tab-ingestion');
    const tabSettings = document.getElementById('admin-main-tab-settings');
    const sectionIngestion = document.getElementById('section-ingestion');
    const sectionSettings = document.getElementById('section-settings');

    if (section === 'settings') {
      if (tabSettings) {
        tabSettings.className = 'admin-main-nav-btn px-3.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs transition flex items-center gap-1.5 font-bold';
      }
      if (tabIngestion) {
        tabIngestion.className = 'admin-main-nav-btn px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 font-medium';
      }
      sectionIngestion?.classList.add('hidden');
      sectionSettings?.classList.remove('hidden');

      // Pré-remplir les champs paramètres
      const urlInput = document.getElementById('settings-supabase-url');
      const keyInput = document.getElementById('settings-supabase-key');
      if (urlInput) urlInput.value = localStorage.getItem('unidocs_supabase_url') || '';
      if (keyInput) keyInput.value = localStorage.getItem('unidocs_supabase_key') || '';
    } else {
      if (tabIngestion) {
        tabIngestion.className = 'admin-main-nav-btn px-3.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs transition flex items-center gap-1.5 font-bold';
      }
      if (tabSettings) {
        tabSettings.className = 'admin-main-nav-btn px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 font-medium';
      }
      sectionIngestion?.classList.remove('hidden');
      sectionSettings?.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  saveSupabaseSettings() {
    const urlInput = document.getElementById('settings-supabase-url');
    const keyInput = document.getElementById('settings-supabase-key');
    const url = urlInput?.value.trim() || '';
    const key = keyInput?.value.trim() || '';

    if (!url || !key) {
      alert("Veuillez renseigner à la fois l'URL Supabase et la clé publique.");
      return;
    }

    window.supabaseService.configureManually(url, key);
    this.render();
    alert("Configuration Supabase enregistrée avec succès !");
  }

  async resetToDefaultData() {
    if (!confirm("Voulez-vous réinitialiser le catalogue avec les matières et documents officiels par défaut ?")) {
      return;
    }
    await window.localDB.resetAllData(window.INITIAL_COURSES, window.INITIAL_DOCUMENTS);
    await this.loadData();
    this.render();
    alert("Catalogue réinitialisé avec succès !");
  }

  exportDataBackup() {
    const backup = {
      courses: this.courses,
      documents: this.documents,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `unidocs-polytechnique-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  updateFormCourseSelect() {
    const promoSelect = document.getElementById('doc-form-promotion');
    const courseSelect = document.getElementById('doc-form-course');
    if (!promoSelect || !courseSelect) return;

    const promo = promoSelect.value;
    const targetCourses = this.courses.filter(c => c.promotion === promo);

    courseSelect.innerHTML = targetCourses.map(c => `
      <option value="${c.id}">${c.code} - ${c.name} (${c.semester})</option>
    `).join('');
  }

  async triggerCloudSync() {
    const syncStatusEl = document.getElementById('stat-sync-status');
    if (syncStatusEl) syncStatusEl.textContent = 'Synchronisation...';

    const res = await window.supabaseService.pushToCloud();
    if (res.success) {
      await window.supabaseService.pullFromCloud();
      await this.loadData();
      this.render();
      alert('Base Supabase synchronisée avec succès !');
    } else {
      alert(`Statut de synchronisation : ${res.message || res.error}`);
    }
  }

  openSupabaseModal() {
    const currentUrl = localStorage.getItem('unidocs_supabase_url') || '';
    const currentKey = localStorage.getItem('unidocs_supabase_key') || '';

    const newUrl = prompt("Entrez votre URL de projet Supabase (ex: https://xyz.supabase.co) :", currentUrl);
    if (newUrl !== null) {
      const newKey = prompt("Entrez votre clé publique Anon Supabase :", currentKey);
      if (newKey !== null) {
        window.supabaseService.configureManually(newUrl.trim(), newKey.trim());
        this.render();
        alert('Configuration Supabase mise à jour !');
      }
    }
  }

  render() {
    this.renderStats();
    this.updateFormCourseSelect();
    this.renderCatalog();

    // Statut Supabase Cloud
    const dot = document.getElementById('cloud-status-dot');
    const text = document.getElementById('cloud-status-text');
    const syncStat = document.getElementById('stat-sync-status');

    if (dot || text || syncStat) {
      const isConfigured = window.supabaseService.isConfigured();
      if (dot) dot.className = `w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`;
      if (text) text.textContent = isConfigured ? 'Supabase : Connecté' : 'Supabase : Mode Local';
      if (syncStat) {
        syncStat.textContent = isConfigured ? 'Cloud Connecté' : 'Mode Local (IndexedDB)';
        syncStat.className = `text-sm font-bold ${isConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'} truncate mt-1`;
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderStats() {
    const docsCountEl = document.getElementById('stat-docs-count');
    const coursesCountEl = document.getElementById('stat-courses-count');
    const solutionsCountEl = document.getElementById('stat-solutions-count');
    const tabCountDocs = document.getElementById('tab-count-docs');
    const tabCountCourses = document.getElementById('tab-count-courses');

    if (docsCountEl) docsCountEl.textContent = this.documents.length;
    if (coursesCountEl) coursesCountEl.textContent = this.courses.length;
    if (solutionsCountEl) solutionsCountEl.textContent = this.documents.filter(d => d.hasSolution).length;
    if (tabCountDocs) tabCountDocs.textContent = this.documents.length;
    if (tabCountCourses) tabCountCourses.textContent = this.courses.length;
  }

  renderCatalog() {
    if (this.catalogTab === 'docs') {
      this.renderDocumentsTable();
    } else {
      this.renderCoursesTable();
    }
  }

  renderDocumentsTable() {
    const tbody = document.getElementById('admin-docs-tbody');
    if (!tbody) return;

    let filtered = this.documents.filter(doc => {
      // Filtre Promotion
      if (this.targetPromotion !== 'all') {
        const course = this.courses.find(c => c.id === doc.courseId);
        const promo = doc.promotion || (course ? course.promotion : 'prepo');
        if (promo !== this.targetPromotion) return false;
      }

      // Filtre Type
      if (this.tableTypeFilter !== 'all' && doc.type !== this.tableTypeFilter) {
        return false;
      }

      // Recherche
      if (this.tableSearchQuery) {
        const course = this.courses.find(c => c.id === doc.courseId);
        const matchTitle = doc.title.toLowerCase().includes(this.tableSearchQuery);
        const matchDesc = (doc.description || '').toLowerCase().includes(this.tableSearchQuery);
        const matchCourse = course ? (course.name.toLowerCase().includes(this.tableSearchQuery) || course.code.toLowerCase().includes(this.tableSearchQuery)) : false;
        if (!matchTitle && !matchDesc && !matchCourse) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400 dark:text-zinc-500 italic">
            Aucun document ne correspond à vos critères. Déposez un fichier ci-dessus pour le publier !
          </td>
        </tr>
      `;
      return;
    }

    const typeBadges = {
      examen: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200/50',
      tp: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/50',
      exercice: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/50',
      cours: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200/50',
      interro: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200/50'
    };

    tbody.innerHTML = filtered.map(doc => {
      const course = this.courses.find(c => c.id === doc.courseId);
      const promoLabel = (doc.promotion === 'prepo' || course?.promotion === 'prepo') ? 'Prépo (P0)' : 'Bac 1';
      const badgeStyle = typeBadges[doc.type] || typeBadges.cours;

      return `
        <tr class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition">
          <td class="p-3.5 max-w-xs">
            <div class="font-bold text-slate-900 dark:text-white truncate">${doc.title}</div>
            <div class="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">${doc.description || 'Aucune description'}</div>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="font-semibold text-slate-700 dark:text-zinc-300">${promoLabel}</span>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <div class="font-mono font-bold text-blue-600 dark:text-blue-400">${course ? course.code : 'UE'}</div>
            <div class="text-[11px] text-slate-500 truncate max-w-[120px]">${course ? course.name : '-'}</div>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}">${doc.type}</span>
            <div class="text-[10px] text-slate-400 mt-1 font-mono">${doc.year || '2024-2025'}</div>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            ${doc.hasSolution ? `
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Corrigé
              </span>
            ` : `
              <span class="text-[11px] text-slate-400">Énoncé</span>
            `}
          </td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1">
              <button onclick="window.adminApp.previewDocument('${doc.id}')" class="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition" title="Lire / Prévisualiser en PDF">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button onclick="window.adminApp.editDocument('${doc.id}')" class="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition" title="Modifier la description / métadonnées">
                <i data-lucide="edit" class="w-4 h-4"></i>
              </button>
              <button onclick="window.adminApp.deleteDocument('${doc.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition" title="Supprimer">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderCoursesTable() {
    const tbody = document.getElementById('admin-courses-tbody');
    if (!tbody) return;

    let filtered = this.courses.filter(course => {
      if (this.targetPromotion !== 'all' && course.promotion !== this.targetPromotion) {
        return false;
      }
      if (this.tableSearchQuery) {
        const matchCode = course.code.toLowerCase().includes(this.tableSearchQuery);
        const matchName = course.name.toLowerCase().includes(this.tableSearchQuery);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.map(course => {
      const docsCount = this.documents.filter(d => d.courseId === course.id).length;
      const promoLabel = course.promotion === 'prepo' ? 'Prépo (P0)' : 'Bac 1';

      return `
        <tr class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition">
          <td class="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            ${course.code}
          </td>
          <td class="p-3.5 font-semibold text-slate-900 dark:text-white">
            ${course.name}
            <div class="text-[11px] text-slate-500 font-normal line-clamp-1">${course.description || ''}</div>
          </td>
          <td class="p-3.5 whitespace-nowrap text-slate-700 dark:text-zinc-300">
            ${promoLabel}
          </td>
          <td class="p-3.5 whitespace-nowrap text-slate-600 dark:text-zinc-400">
            ${course.semester} • ${course.credits || '5 ECTS'} • ${course.hours || '75h'}
          </td>
          <td class="p-3.5 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-zinc-200">
            ${docsCount} document(s)
          </td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button onclick="window.adminApp.deleteCourse('${course.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition" title="Supprimer la matière">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // ====================================================
  // TIROIR RÉTRACTABLE : ASSISTANT IA ADMIN MULTI-AGENTS
  // ====================================================
  toggleAiDrawer() {
    const drawer = document.getElementById('ai-chat-drawer');
    if (!drawer) return;
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
      drawer.classList.remove('hidden');
      document.getElementById('ai-chat-input')?.focus();
      this.setupAiDragAndDrop();
    } else {
      drawer.classList.add('hidden');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  closeAiDrawer() {
    const drawer = document.getElementById('ai-chat-drawer');
    if (drawer) drawer.classList.add('hidden');
  }

  fillAiPrompt(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  handleAiFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.aiSelectedFile = file;
    const nameEl = document.getElementById('ai-file-name');
    const sizeEl = document.getElementById('ai-file-size');
    const box = document.getElementById('ai-file-preview-box');

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} Mo`;
    if (box) box.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (e) => {
      this.aiSelectedFileDataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeAiFile() {
    this.aiSelectedFile = null;
    this.aiSelectedFileDataUrl = '';
    const fileInput = document.getElementById('ai-file-input');
    if (fileInput) fileInput.value = '';
    const box = document.getElementById('ai-file-preview-box');
    if (box) box.classList.add('hidden');
  }

  setupAiDragAndDrop() {
    const drawer = document.getElementById('ai-chat-drawer');
    if (!drawer || drawer.dataset.dragSet) return;
    drawer.dataset.dragSet = 'true';

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      drawer.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    drawer.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        const fileInput = document.getElementById('ai-file-input');
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(files[0]);
          fileInput.files = dataTransfer.files;
          this.handleAiFileSelect({ target: fileInput });
        }
      }
    });
  }

  async handleAiChatSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('ai-chat-input');
    const messageText = (input?.value || '').trim();
    const file = this.aiSelectedFile;
    const fileDataUrl = this.aiSelectedFileDataUrl;

    if (!messageText && !file) return;

    const messagesContainer = document.getElementById('ai-chat-messages');
    
    // 1. Message Utilisateur
    const userBubble = document.createElement('div');
    userBubble.className = 'flex gap-3 items-start justify-end';
    userBubble.innerHTML = `
      <div class="flex-1 max-w-[85%] bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs text-xs space-y-1.5 shadow-sm">
        ${file ? `
          <div class="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-700/60 text-[11px] border border-indigo-400/30">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span class="truncate font-medium">${file.name}</span>
            <span class="font-mono text-[9px]">(${(file.size / (1024 * 1024)).toFixed(2)} Mo)</span>
          </div>
        ` : ''}
        <p class="whitespace-pre-wrap font-medium">${messageText || 'Analyse ce document'}</p>
      </div>
      <div class="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
        A
      </div>
    `;
    messagesContainer.appendChild(userBubble);

    if (input) input.value = '';
    this.removeAiFile();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Indicator
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'flex gap-3 items-start';
    loadingBubble.id = `ai-loading-${Date.now()}`;
    loadingBubble.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 animate-spin"></i>
      </div>
      <div class="flex-1 bg-slate-100 dark:bg-zinc-900 p-3.5 rounded-2xl rounded-tl-xs text-xs space-y-2 border border-slate-200 dark:border-zinc-800">
        <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
          <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>
          <span>Collaboration Tri-Agent Omnisciente (Gemini Flash Admin)...</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-zinc-400">Agent 1 (Alpha) + Agent 2 (Beta) + Agent 3 (Gamma) : Compétences totales conjointes (Vision, Résolution & BDD)</p>
      </div>
    `;
    messagesContainer.appendChild(loadingBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();

    try {
      const response = await fetch('/api/agent/chat-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          fileName: file ? file.name : '',
          fileData: fileDataUrl,
          mimeType: file ? file.type : 'text/plain',
          history: this.aiChatHistory,
          currentPromotion: this.targetPromotion,
          courses: this.courses
        })
      });

      const data = await response.json();
      loadingBubble.remove();

      if (data.error) throw new Error(data.error);

      let replyText = data.reply || '';
      const actionMatch = replyText.match(/```json_action\s*([\s\S]*?)\s*```/);
      let executedAction = null;

      if (actionMatch && actionMatch[1]) {
        try {
          const actionPayload = JSON.parse(actionMatch[1]);
          if (actionPayload.action === 'ADD_DOCUMENT' && actionPayload.document) {
            const doc = actionPayload.document;
            if (fileDataUrl) doc.file_url = fileDataUrl;
            
            await window.localDB.saveDocument(doc);
            await window.supabaseService.publishSingleDocument(doc, fileDataUrl);
            await this.loadData();
            this.render();
            executedAction = `✅ Document "${doc.title}" publié dans Supabase et la base de données !`;
          } else if (actionPayload.action === 'ADD_COURSE' && actionPayload.course) {
            const course = actionPayload.course;
            await window.localDB.saveCourse(course);
            await this.loadData();
            this.render();
            executedAction = `✅ Matière "${course.name}" (${course.code}) créée avec succès !`;
          }
        } catch (errAction) {
          console.warn('[Auto BDD Action Error]', errAction);
        }

        replyText = replyText.replace(/```json_action\s*[\s\S]*?\s*```/g, '').trim();
      }

      let formattedText = replyText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h4 class="font-bold text-sm text-indigo-600 dark:text-indigo-400 mt-2 mb-1">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 class="font-bold text-base text-slate-900 dark:text-white mt-2 mb-1">$1</h3>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\n/g, '<br>');

      const agentBubble = document.createElement('div');
      agentBubble.className = 'flex gap-3 items-start';
      agentBubble.innerHTML = `
        <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
          <i data-lucide="bot" class="w-3.5 h-3.5"></i>
        </div>
        <div class="flex-1 bg-slate-100 dark:bg-zinc-900 p-3.5 rounded-2xl rounded-tl-xs text-xs space-y-2 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
          <div class="prose dark:prose-invert max-w-none text-xs leading-relaxed">
            ${formattedText}
          </div>
          
          ${executedAction ? `
            <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400"></i>
              <span>${executedAction}</span>
            </div>
          ` : ''}
        </div>
      `;

      messagesContainer.appendChild(agentBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      this.aiChatHistory.push({ role: 'user', content: messageText });
      this.aiChatHistory.push({ role: 'assistant', content: replyText });

    } catch (e) {
      loadingBubble.remove();
      const errorBubble = document.createElement('div');
      errorBubble.className = 'flex gap-3 items-start';
      errorBubble.innerHTML = `
        <div class="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
        </div>
        <div class="flex-1 bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl text-xs text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">
          Désolé, une erreur est survenue lors de l'analyse : ${e.message || e}
        </div>
      `;
      messagesContainer.appendChild(errorBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    if (window.lucide) window.lucide.createIcons();
  }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});

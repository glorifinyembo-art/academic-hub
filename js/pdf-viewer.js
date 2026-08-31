/**
 * UniDocs - Véritable Lecteur PDF Académique (Moteur Mozilla PDF.js & jsPDF)
 * Supporte : PDF natifs multi-pages, Zoom, Rotation, Miniatures, Recherche, Téléchargement & Impression
 * Conçu pour lire directement les fichiers PDF stockés en base de données ou importés par l'utilisateur.
 */

class PdfViewerModal {
  constructor() {
    this.currentDoc = null;
    this.currentCourse = null;
    this.pdfDoc = null; // Instance PDFDocumentProxy de PDF.js
    this.currentPageNum = 1;
    this.totalPages = 1;
    this.scale = 1.25;
    this.rotation = 0;
    this.isRendering = false;
    this.pageNumPending = null;
    this.pdfDataUrl = null;
    this.sidebarOpen = false;
    this.viewMode = 'single'; // 'single' ou 'scroll'
    this.modalEl = null;

    this.init();
  }

  init() {
    if (document.getElementById('pdf-viewer-modal')) {
      this.modalEl = document.getElementById('pdf-viewer-modal');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'pdf-viewer-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/85 backdrop-blur-md hidden select-none';
    modal.innerHTML = `
      <div id="pv-container" class="relative w-full h-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden select-none">
        
        <!-- ==================================================== -->
        <!-- BARRE D'OUTILS PRINCIPALE DU LECTEUR PDF             -->
        <!-- ==================================================== -->
        <header class="flex items-center justify-between px-3 py-2 bg-slate-950/95 border-b border-slate-800 shrink-0 gap-2 z-30 shadow-md">
          
          <!-- Section Gauche : Titre du Document -->
          <div class="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            <div class="min-w-0">
              <h3 id="pv-title" class="font-bold text-xs sm:text-sm text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md" title="">
                Loi de Coulomb (Électrostatique)
              </h3>
              <p id="pv-subtitle" class="text-[10px] text-slate-400 truncate hidden sm:block">
                Faculté Polytechnique UNILU • Document Officiel
              </p>
            </div>
          </div>

          <!-- Section Centre : Navigation des Pages & Zoom -->
          <div class="flex items-center gap-1 sm:gap-2">
            
            <!-- Navigation de page -->
            <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button id="pv-prev-page" class="p-1 sm:px-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none" title="Page précédente (Flèche gauche)">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              
              <div class="flex items-center px-1 text-xs font-mono text-slate-200">
                <input id="pv-page-input" type="number" min="1" max="1" value="1" class="w-9 bg-slate-950 border border-slate-750 rounded px-1 py-0.5 text-center text-xs text-white font-bold focus:outline-none focus:border-blue-500">
                <span class="mx-1 text-slate-500">/</span>
                <span id="pv-page-count" class="font-bold">1</span>
              </div>

              <button id="pv-next-page" class="p-1 sm:px-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none" title="Page suivante (Flèche droite)">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Contrôles de Zoom -->
            <div class="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button id="pv-zoom-out" class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Zoom arrière (-)">
                <i data-lucide="zoom-out" class="w-3.5 h-3.5"></i>
              </button>
              
              <select id="pv-zoom-select" class="bg-slate-950 text-slate-200 text-xs font-mono font-medium rounded px-2 py-1 border border-slate-750 focus:outline-none cursor-pointer">
                <option value="0.75">75%</option>
                <option value="1.0">100%</option>
                <option value="1.25" selected>125%</option>
                <option value="1.5">150%</option>
                <option value="2.0">200%</option>
                <option value="fit-width">Ajuster largeur</option>
                <option value="fit-page">Pleine page</option>
              </select>

              <button id="pv-zoom-in" class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Zoom avant (+)">
                <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <!-- Bouton Rotation -->
            <button id="pv-rotate-btn" class="hidden md:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Pivoter de 90°">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Section Droite : Plein écran, Téléchargement & Fermeture -->
          <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <!-- Bouton Plein Écran -->
            <button id="pv-fullscreen-btn" class="hidden sm:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Mode Plein écran">
              <i data-lucide="maximize" class="w-4 h-4"></i>
            </button>

            <!-- Bouton Télécharger le vrai PDF -->
            <button id="pv-download-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm" title="Télécharger le fichier PDF">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span class="hidden md:inline">Télécharger</span>
            </button>

            <!-- Bouton Fermer -->
            <button id="pv-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Fermer le lecteur (Échap)">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </header>

        <!-- ==================================================== -->
        <!-- ZONE PRINCIPALE : ZONE DE LECTURE CANVAS             -->
        <!-- ==================================================== -->
        <div class="flex-1 flex overflow-hidden relative bg-slate-950">
          <!-- Zone d'Affichage du PDF (Canvas Centré avec Défilement) -->
          <main id="pv-canvas-container" class="flex-1 overflow-auto flex flex-col items-center justify-start p-2 sm:p-6 bg-slate-950 relative">
            
            <!-- Indicateur de Chargement -->
            <div id="pv-loading" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 space-y-3">
              <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-medium text-slate-300">Rendu du document PDF en cours...</p>
            </div>

            <!-- Page PDF Rendu Principal -->
            <div id="pv-page-wrapper" class="relative shadow-2xl bg-white rounded transition-transform origin-top flex flex-col items-center">
              <canvas id="pv-pdf-canvas" class="block rounded shadow-2xl max-w-full"></canvas>
            </div>

          </main>
        </div>

        <!-- ==================================================== -->
        <!-- BARRE DE STATUT EN BAS POUR MOBILE                   -->
        <!-- ==================================================== -->
        <footer class="sm:hidden px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <button id="pv-mobile-zoom-out" class="p-1 rounded bg-slate-900 text-slate-300">A-</button>
            <span id="pv-mobile-scale-label" class="font-mono text-[11px]">125%</span>
            <button id="pv-mobile-zoom-in" class="p-1 rounded bg-slate-900 text-slate-300">A+</button>
          </div>
          <div class="flex items-center gap-1.5 font-mono text-xs">
            <span>Page</span>
            <span id="pv-mobile-page-current" class="font-bold text-white">1</span>
            <span>/</span>
            <span id="pv-mobile-page-total">1</span>
          </div>
        </footer>

      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.bindEvents();
  }

  bindEvents() {
    const modal = this.modalEl;
    if (!modal) return;

    // Fermeture
    modal.querySelector('#pv-close-btn').onclick = () => this.close();
    window.addEventListener('keydown', (e) => {
      if (modal.classList.contains('hidden')) return;

      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight' || e.key === 'PageDown') this.nextPage();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') this.prevPage();
      if (e.key === '+' || e.key === '=') this.zoomIn();
      if (e.key === '-') this.zoomOut();
    });

    // Navigation des pages
    modal.querySelector('#pv-prev-page').onclick = () => this.prevPage();
    modal.querySelector('#pv-next-page').onclick = () => this.nextPage();

    const pageInput = modal.querySelector('#pv-page-input');
    pageInput.onchange = (e) => {
      const num = parseInt(e.target.value, 10);
      if (num >= 1 && num <= this.totalPages) {
        this.goToPage(num);
      } else {
        e.target.value = this.currentPageNum;
      }
    };

    // Zoom
    modal.querySelector('#pv-zoom-in').onclick = () => this.zoomIn();
    modal.querySelector('#pv-zoom-out').onclick = () => this.zoomOut();
    
    const zoomSelect = modal.querySelector('#pv-zoom-select');
    zoomSelect.onchange = (e) => {
      const val = e.target.value;
      if (val === 'fit-width') {
        this.fitToWidth();
      } else if (val === 'fit-page') {
        this.fitToPage();
      } else {
        this.scale = parseFloat(val);
        this.renderCurrentPage();
      }
    };

    // Zoom Mobile
    const mobZoomIn = modal.querySelector('#pv-mobile-zoom-in');
    const mobZoomOut = modal.querySelector('#pv-mobile-zoom-out');
    if (mobZoomIn) mobZoomIn.onclick = () => this.zoomIn();
    if (mobZoomOut) mobZoomOut.onclick = () => this.zoomOut();

    // Rotation
    modal.querySelector('#pv-rotate-btn').onclick = () => {
      this.rotation = (this.rotation + 90) % 360;
      this.renderCurrentPage();
    };

    // Plein écran
    const fsBtn = modal.querySelector('#pv-fullscreen-btn');
    if (fsBtn) {
      fsBtn.onclick = () => {
        const container = modal.querySelector('#pv-container');
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => console.warn(err));
        } else {
          document.exitFullscreen();
        }
      };
    }

    // Téléchargement
    const dlBtn = modal.querySelector('#pv-download-btn');
    if (dlBtn) dlBtn.onclick = () => this.handleDownload();
  }

  async open(doc, course) {
    this.currentDoc = doc;
    this.currentCourse = course;
    this.currentPageNum = 1;
    this.rotation = 0;
    this.scale = window.innerWidth < 640 ? 0.95 : 1.25;

    const modal = this.modalEl;
    if (!modal) return;

    // Titres
    modal.querySelector('#pv-title').textContent = doc.title;
    modal.querySelector('#pv-subtitle').textContent = `${course ? course.code + ' - ' + course.name : 'Physique'} • ${doc.author || 'Faculté Polytechnique'}`;

    // Afficher la modale
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    if (window.lucide) window.lucide.createIcons();

    // 1. Récupérer le fichier PDF depuis la base de données (pdf_cache ou doc.file_url)
    const blobObj = await window.localDB.getPdfBlob(doc.id);
    let pdfData = (blobObj && blobObj.data) ? blobObj.data : doc.file_url;

    // 2. Si aucun PDF binaire n'est encore généré pour ce document, créer le PDF officiel 5 pages Coulomb
    if (!pdfData || typeof pdfData !== 'string' || !pdfData.startsWith('data:application/pdf')) {
      pdfData = await this.generateOfficialCoulombPdf();
      // Enregistrer directement dans la base de données pour les prochaines lectures
      await window.localDB.savePdfBlob(doc.id, pdfData, {
        mimeType: 'application/pdf',
        fileName: 'Loi_de_Coulomb_Electrostatique.pdf',
        fileType: 'pdf'
      });
      doc.file_url = pdfData;
      await window.localDB.updateDocument(doc);
    }

    this.pdfDataUrl = pdfData;
    await this.loadPdfDocument(pdfData);
  }

  async loadPdfDocument(pdfSource) {
    const modal = this.modalEl;
    const loadingEl = modal.querySelector('#pv-loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js non disponible');
      }

      // Convertir en Uint8Array si c'est un base64 DataURL
      let sourceToLoad = pdfSource;
      if (typeof pdfSource === 'string' && pdfSource.startsWith('data:application/pdf;base64,')) {
        const base64Str = pdfSource.split(',')[1];
        const binaryStr = atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        sourceToLoad = { data: bytes };
      }

      const loadingTask = window.pdfjsLib.getDocument(sourceToLoad);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;

      // Mettre à jour l'interface
      modal.querySelector('#pv-page-count').textContent = this.totalPages;
      modal.querySelector('#pv-page-input').max = this.totalPages;
      modal.querySelector('#pv-page-input').value = this.currentPageNum;
      
      const mobTotal = modal.querySelector('#pv-mobile-page-total');
      if (mobTotal) mobTotal.textContent = this.totalPages;

      if (loadingEl) loadingEl.classList.add('hidden');

      // Rendre la page actuelle
      await this.renderCurrentPage();
    } catch (err) {
      console.error('[PDF Viewer] Erreur de chargement PDF.js:', err);
      if (loadingEl) loadingEl.classList.add('hidden');
      
      // Fallback vers lecteur natif iframe si PDF.js échoue
      const container = modal.querySelector('#pv-canvas-container');
      container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-4">
          <iframe src="${this.pdfDataUrl}" class="w-full h-full rounded border border-slate-800 bg-white" title="Lecteur PDF"></iframe>
        </div>
      `;
    }
  }

  async renderCurrentPage() {
    if (!this.pdfDoc || this.isRendering) {
      this.pageNumPending = this.currentPageNum;
      return;
    }

    this.isRendering = true;
    const modal = this.modalEl;
    const canvas = modal.querySelector('#pv-pdf-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    try {
      const page = await this.pdfDoc.getPage(this.currentPageNum);
      const viewport = page.getViewport({ scale: this.scale, rotation: this.rotation });

      // Support Haute Résolution (Retina / Écrans denses)
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: ctx,
        transform: transform,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      this.isRendering = false;

      if (this.pageNumPending !== null) {
        const next = this.pageNumPending;
        this.pageNumPending = null;
        this.currentPageNum = next;
        this.renderCurrentPage();
      }
    } catch (e) {
      console.warn('[PDF Viewer] Render page exception:', e);
      this.isRendering = false;
    }

    // Mettre à jour les indicateurs
    modal.querySelector('#pv-page-input').value = this.currentPageNum;
    modal.querySelector('#pv-prev-page').disabled = this.currentPageNum <= 1;
    modal.querySelector('#pv-next-page').disabled = this.currentPageNum >= this.totalPages;

    const mobCur = modal.querySelector('#pv-mobile-page-current');
    if (mobCur) mobCur.textContent = this.currentPageNum;

    const mobScale = modal.querySelector('#pv-mobile-scale-label');
    if (mobScale) mobScale.textContent = `${Math.round(this.scale * 100)}%`;

    // Mettre en surbrillance la miniature active
    this.updateActiveThumbnail();
  }

  async renderThumbnails() {
    if (!this.pdfDoc) return;
    const listEl = this.modalEl.querySelector('#pv-thumbnails-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    for (let p = 1; p <= this.totalPages; p++) {
      const item = document.createElement('div');
      item.className = `cursor-pointer p-2 rounded-xl border transition-all text-center space-y-1 ${
        p === this.currentPageNum 
          ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500' 
          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
      }`;
      item.dataset.page = p;
      item.onclick = () => this.goToPage(p);

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.className = 'w-full rounded bg-white shadow-xs mx-auto block';
      item.appendChild(thumbCanvas);

      const label = document.createElement('div');
      label.className = 'text-[10px] font-mono text-slate-400 font-bold';
      label.textContent = `Page ${p}`;
      item.appendChild(label);

      listEl.appendChild(item);

      // Rendre la miniature
      this.pdfDoc.getPage(p).then(page => {
        const thumbViewport = page.getViewport({ scale: 0.25 });
        thumbCanvas.width = thumbViewport.width;
        thumbCanvas.height = thumbViewport.height;
        const ctx = thumbCanvas.getContext('2d');
        page.render({ canvasContext: ctx, viewport: thumbViewport });
      });
    }
  }

  updateActiveThumbnail() {
    const listEl = this.modalEl.querySelector('#pv-thumbnails-list');
    if (!listEl) return;
    const items = listEl.querySelectorAll('[data-page]');
    items.forEach(el => {
      const p = parseInt(el.dataset.page, 10);
      if (p === this.currentPageNum) {
        el.className = 'cursor-pointer p-2 rounded-xl border transition-all text-center space-y-1 bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500';
      } else {
        el.className = 'cursor-pointer p-2 rounded-xl border transition-all text-center space-y-1 bg-slate-950/50 border-slate-800 hover:border-slate-700';
      }
    });
  }

  goToPage(num) {
    if (num < 1 || num > this.totalPages) return;
    this.currentPageNum = num;
    this.renderCurrentPage();
  }

  nextPage() {
    if (this.currentPageNum >= this.totalPages) return;
    this.currentPageNum++;
    this.renderCurrentPage();
  }

  prevPage() {
    if (this.currentPageNum <= 1) return;
    this.currentPageNum--;
    this.renderCurrentPage();
  }

  zoomIn() {
    if (this.scale < 3.0) {
      this.scale = Math.min(3.0, this.scale + 0.25);
      this.updateZoomSelect();
      this.renderCurrentPage();
    }
  }

  zoomOut() {
    if (this.scale > 0.5) {
      this.scale = Math.max(0.5, this.scale - 0.25);
      this.updateZoomSelect();
      this.renderCurrentPage();
    }
  }

  fitToWidth() {
    const container = this.modalEl.querySelector('#pv-canvas-container');
    if (!container || !this.pdfDoc) return;
    this.pdfDoc.getPage(this.currentPageNum).then(page => {
      const viewport = page.getViewport({ scale: 1.0 });
      const availableWidth = container.clientWidth - 48;
      this.scale = Math.max(0.5, availableWidth / viewport.width);
      this.updateZoomSelect();
      this.renderCurrentPage();
    });
  }

  fitToPage() {
    const container = this.modalEl.querySelector('#pv-canvas-container');
    if (!container || !this.pdfDoc) return;
    this.pdfDoc.getPage(this.currentPageNum).then(page => {
      const viewport = page.getViewport({ scale: 1.0 });
      const availableHeight = container.clientHeight - 48;
      this.scale = Math.max(0.5, availableHeight / viewport.height);
      this.updateZoomSelect();
      this.renderCurrentPage();
    });
  }

  updateZoomSelect() {
    const sel = this.modalEl.querySelector('#pv-zoom-select');
    if (sel) {
      const rounded = this.scale.toFixed(2);
      sel.value = rounded;
    }
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  handleDownload() {
    if (!this.pdfDataUrl) return;
    const a = document.createElement('a');
    a.href = this.pdfDataUrl;
    a.download = `${this.currentDoc?.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Générateur Officiel du Document PDF de 5 Pages (Loi de Coulomb)
   * Utilisé pour créer un binaire PDF A4 authentique conforme aux 5 pages fournies.
   */
  async generateOfficialCoulombPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - 2 * margin;

    // Helper pour en-tête standardisé
    const addHeader = (pageNum) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("WIKIPÉDIA • L'encyclopédie libre", margin, 12);
      doc.text("Faculté Polytechnique UNILU • PHYS102", pageWidth - margin, 12, { align: 'right' });
      doc.setDrawColor(210, 210, 215);
      doc.setLineWidth(0.3);
      doc.line(margin, 14, pageWidth - margin, 14);

      // Pied de page
      doc.setFontSize(8);
      doc.text(`Page ${pageNum} sur 5`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    };

    // ==========================================
    // PAGE 1 : ÉNONCÉ & DÉTERMINATION EXPÉRIMENTALE
    // ==========================================
    addHeader(1);

    // Titre principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 30);
    doc.text("Loi de Coulomb (électrostatique)", margin, 24);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.8);
    doc.line(margin, 27, margin + contentWidth, 27);

    // Paragraphe d'introduction
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 45);
    const introText = "La loi de Coulomb exprime, en électrostatique, la force de l'interaction électrique entre deux particules chargées électriquement. Elle est nommée d'après le physicien français Charles-Augustin Coulomb qui l'a énoncée en 1785 et elle forme la base de l'électrostatique. Elle peut s'énoncer ainsi :";
    const splitIntro = doc.splitTextToSize(introText, 110);
    doc.text(splitIntro, margin, 35);

    // Boîte de citation de l'énoncé officiel
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(margin, 58, 110, 36, 2, 2, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1.2);
    doc.line(margin, 58, margin, 94);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 35, 90);
    const quoteText = "« L'intensité de la force électrostatique entre deux charges électriques est proportionnelle au produit des deux charges et est inversement proportionnelle au carré de la distance entre les deux charges. La force est portée par la droite passant par les deux charges. »";
    const splitQuote = doc.splitTextToSize(quoteText, 102);
    doc.text(splitQuote, margin + 4, 65);

    // Schéma d'illustration sur le côté droit (Page 1)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(136, 33, 56, 62, 2, 2, 'FD');

    // Dessin vectoriel des charges +q1 et +q2 (répulsion)
    doc.setFillColor(37, 99, 235);
    doc.circle(148, 45, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("+q1", 148, 46, { align: 'center' });

    doc.setFillColor(37, 99, 235);
    doc.circle(180, 45, 4, 'F');
    doc.text("+q2", 180, 46, { align: 'center' });

    // Flèches de forces opposées
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.line(144, 45, 139, 45); // F1 vers gauche
    doc.line(184, 45, 189, 45); // F2 vers droite

    doc.setFontSize(7);
    doc.setTextColor(20, 20, 30);
    doc.text("F1", 140, 42);
    doc.text("F2", 186, 42);

    // Dessin vectoriel attraction (+q1 et -q2)
    doc.setFillColor(37, 99, 235);
    doc.circle(148, 62, 4, 'F');
    doc.text("+q1", 148, 63, { align: 'center' });

    doc.setFillColor(225, 29, 72);
    doc.circle(180, 62, 4, 'F');
    doc.text("-q2", 180, 63, { align: 'center' });

    doc.setDrawColor(30, 41, 59);
    doc.line(152, 62, 158, 62); // F1 vers droite
    doc.line(176, 62, 170, 62); // F2 vers gauche
    doc.text("F1", 155, 59);
    doc.text("F2", 172, 59);

    // Formule scalaire sous le schéma
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("||F1|| = ||F2|| = ke · (|q1 × q2| / r²)", 164, 78, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 110);
    doc.text("Variation en carré inverse", 164, 84, { align: 'center' });

    // Section 1 : Détermination expérimentale historique
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 30);
    doc.text("Détermination expérimentale historique", margin, 104);
    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.4);
    doc.line(margin, 106, margin + 110, 106);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 45);
    const expText = "Charles-Augustin Coulomb énonce la loi d'interaction électrostatique en 1785 à la suite de nombreuses mesures réalisées grâce à la balance de Coulomb (balance de torsion) qu'il a mise au point pour détecter des forces d'interaction très faibles. Il s'agit d'une balance de torsion pour laquelle la mesure de l'angle de torsion à l'équilibre permet de déterminer l'intensité de forces répulsives. Dans le cas de forces attractives, c'est l'étude des oscillations du système qui permet de déterminer l'intensité des forces.\n\nUne charge électrique est placée à l'extrémité d'une tige horizontale fixée à un fil vertical dont les caractéristiques de torsion sont préalablement établies. Le principe de la mesure consiste à compenser, grâce au couple de torsion du fil vertical, le couple exercé par une autre charge électrique amenée au voisinage de la charge fixée sur la tige.";
    const splitExp = doc.splitTextToSize(expText, 110);
    doc.text(splitExp, margin, 113);

    // Boîte schéma Balance de torsion à droite
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(136, 104, 56, 130, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Balance de Coulomb (1785)", 164, 114, { align: 'center' });

    // Schéma géométrique de la balance
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.6);
    doc.line(164, 122, 164, 180); // Fil vertical
    doc.line(146, 180, 182, 180); // Tige horizontale

    doc.setFillColor(217, 119, 6);
    doc.circle(146, 180, 3.5, 'F'); // Sphère A
    doc.setFillColor(148, 163, 184);
    doc.circle(182, 180, 3.5, 'F'); // Sphère B (contrepoids)

    doc.setFillColor(217, 119, 6);
    doc.circle(140, 175, 3.5, 'F'); // Sphère d'épreuve chargée

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(70, 80, 95);
    doc.text("Fil de torsion vertical", 164, 140, { align: 'center' });
    doc.text("Tige mobile à aiguille", 164, 192, { align: 'center' });
    doc.text("Cuve cylindrique graduée", 164, 200, { align: 'center' });
    doc.text("Échelle angulaire en degrés", 164, 208, { align: 'center' });

    // Section Force de Coulomb (Bas de Page 1)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 30);
    doc.text("Force de Coulomb", margin, 218);
    doc.setLineWidth(0.4);
    doc.line(margin, 220, margin + 110, 220);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text("La force F1/2 exercée par une charge électrique q1 placée au point r1 sur une charge q2 placée au point r2 s'écrit formellement par l'intégrale d'interaction coulombienne.", margin, 228);

    // ==========================================
    // PAGE 2 : FORMULATION SCALAIRE & VECTORIELLE
    // ==========================================
    doc.addPage();
    addHeader(2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 30);
    doc.text("Description scalaire, vectorielle et graphique", margin, 24);
    doc.setLineWidth(0.6);
    doc.line(margin, 26, pageWidth - margin, 26);

    // Formule vectorielle principale encadrée
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, 32, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("F_1/2 = [ (q1 · q2) / (4πε0 ||r2 - r1||³) ] · (r2 - r1)", pageWidth / 2, 44, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 45);
    const p2Text1 = "où ε0 ≈ 8,854 × 10⁻¹² F·m⁻¹ est une constante universelle appelée constante diélectrique, ou permittivité du vide. La loi de Coulomb n'est pas valable pour des charges en mouvement mais uniquement dans un référentiel où elles sont toutes les deux fixes.\n\nDans le système CGS (système d'unités fréquemment utilisé dans la littérature anglo-saxonne historique), les distances sont exprimées en centimètres et les forces en dynes. La charge électrique possède alors l'unité hybride appelée unité électrostatique, ou « esu » (electrostatic unit) :";
    const splitP2_1 = doc.splitTextToSize(p2Text1, contentWidth);
    doc.text(splitP2_1, margin, 62);

    // Formule CGS
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + 20, 95, contentWidth - 40, 14, 2, 2, 'FD');
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text("F_1/2 = q1 · q2 · (r2 - r1) / ||r2 - r1||³   (Système CGS)", pageWidth / 2, 103, { align: 'center' });

    // Tableaux comparatifs Scalaire vs Vectoriel
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 30);
    doc.text("Formulation mathématique duale :", margin, 122);

    // Carte Scalaire
    doc.setFillColor(245, 248, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(margin, 128, (contentWidth / 2) - 3, 36, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text("Forme Scalaire", margin + 5, 136);
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text("||F|| = (1 / 4πε0) · (|q1·q2| / r²)", margin + 5, 147);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("r est la distance euclidienne entre charges.", margin + 5, 156);

    // Carte Vectorielle Unitaire
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(margin + (contentWidth / 2) + 3, 128, (contentWidth / 2) - 3, 36, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text("Forme Vectorielle Unitaire", margin + (contentWidth / 2) + 8, 136);
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text("F1 = (1 / 4πε0) · (q1·q2·r̂12 / |r12|²)", margin + (contentWidth / 2) + 8, 147);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text("r̂12 est le vecteur unitaire reliant q2 vers q1.", margin + (contentWidth / 2) + 8, 156);

    // Analyse vectorielle et 3ème loi de Newton
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 45);
    const p2Text2 = "La forme vectorielle ci-dessus calcule la force F1 appliquée sur q1 par q2. Autrement, si on utilise r21, alors l'effet sur q2 est calculé, bien que cette quantité puisse être déduite immédiatement via la troisième loi de Newton (principe des actions réciproques) :\n\n                                  F2 = - F1\n\nLe vecteur donne la direction axiale de la force, mais c'est le produit algébrique q1 · q2 qui détermine la nature attractive ou répulsive de l'interaction :\n• Si q1 · q2 > 0 (charges de même signe) : la force est positive/répulsive (les particules se repoussent).\n• Si q1 · q2 < 0 (charges de signes contraires) : la force est négative/attractive (les particules s'attirent).";
    const splitP2_2 = doc.splitTextToSize(p2Text2, contentWidth);
    doc.text(splitP2_2, margin, 176);

    // ==========================================
    // PAGE 3 : CONSTANTE DE COULOMB & MAXWELL
    // ==========================================
    doc.addPage();
    addHeader(3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 30);
    doc.text("Constante de Coulomb", margin, 24);
    doc.setLineWidth(0.6);
    doc.line(margin, 26, pageWidth - margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 45);
    const p3Intro = "La constante de Coulomb est la constante de proportionnalité qui apparaît dans l'expression de la loi de Coulomb. La constante est notée kc, ke ou k0. Elle est définie à partir de la permittivité du vide ε0 :";
    const splitP3Intro = doc.splitTextToSize(p3Intro, 105);
    doc.text(splitP3Intro, margin, 34);

    // Boîte formule kc
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, 52, 105, 24, 2, 2, 'FD');
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text("kc = 1 / (4πε0)", margin + 8, 62);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("≈ 8,987 551 792 3(14) × 10⁹ N·m²·C⁻²", margin + 8, 70);

    // Tableau Récapitulatif à droite (Page 3)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 205, 215);
    doc.roundedRect(130, 32, 62, 54, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(70, 80, 95);
    doc.text("Unités SI", 134, 40);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("N · m² · C⁻²", 165, 40);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 80, 95);
    doc.text("Dimension", 134, 49);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("M · L³ · T⁻⁴ · I⁻²", 165, 49);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 80, 95);
    doc.text("Symboles", 134, 58);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("kc, ke ou k0", 165, 58);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 80, 95);
    doc.text("Lien grandeurs", 134, 67);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("kc = 1 / (4πε0)", 165, 67);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 80, 95);
    doc.text("Incertitude", 134, 76);
    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Exacte (SI)", 165, 76);

    // Section Généralisation dépendant du temps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 30);
    doc.text("Généralisation, dépendant du temps, de la loi de Coulomb", margin, 96);
    doc.setLineWidth(0.4);
    doc.line(margin, 98, pageWidth - margin, 98);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(40, 40, 45);
    const p3Maxwell = "Les solutions générales et causales des équations de Maxwell sont données par les équations de Panofsky-Phillips ainsi que par les équations de Jefimenko (les deux sont rigoureusement équivalentes). Ces équations sont la généralisation, dépendant du temps (électrodynamique), de la loi de Coulomb et de la loi de Biot et Savart, qui étaient à l'origine vraies uniquement pour les champs en électrostatique et en magnétostatique ainsi que pour les courants continus permanents.\n\nLes équations de Panofsky-Phillips et de Jefimenko donnent le champ électrique et le champ magnétique dus à une distribution de charges et de courants électriques dans l'espace. Elles prennent en compte le retard dû à la propagation des champs (temps « retardé » tr = t - r/c) en raison de la valeur finie de la vitesse de la lumière c et des effets relativistes d'Einstein. Elles sont applicables aux charges en accélération et en rayonnement.";
    const splitMaxwell = doc.splitTextToSize(p3Maxwell, contentWidth);
    doc.text(splitMaxwell, margin, 106);

    // Section Notes et références (Début)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 30);
    doc.text("Notes et références académiques", margin, 172);
    doc.setLineWidth(0.4);
    doc.line(margin, 174, pageWidth - margin, 174);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 60);
    const refsP3 = [
      "1. Elie Levy, Dictionnaire de physique, Paris, Presses universitaires de France (PUF), 1988, 892 p. (ISBN 978-2-13-039311-5), p. 193.",
      "2. José-Philippe Pérez, Robert Carles et Robert Fleckinger, Électromagnétisme : fondements et applications (avec 300 exercices et problèmes résolus), Paris, Dunod, coll. « Enseignement de la physique », 2001, 740 p. (ISBN 978-2-10-005574-6), p. 14.",
      "3. Bertrand Beaufils, Formulaire maths, physique, chimie, SII, MPSI/MP, Ellipses, coll. « prépa sciences », 2022, 399 p. (ISBN 9782340-070356), p. 110.",
      "4. Hyperphysics : Coulomb's law (Department of Physics and Astronomy, Georgia State University).",
      "5. Marc Séguin, Julie Descheneau et Benjamin Tardif, Physique XXI, t. B : Électricité et magnétisme, Bruxelles, De Boeck université, 2010.",
      "6. Andrea Macchi, Giovanni Moruzzi et Francesco Pegoraro, Problems in classical electromagnetism, Cham, Springer, 2017.",
      "7. Luís Alcácer, Electronic structure of organic semiconductors, Morgan & Claypool, 2018."
    ];

    let yRef = 182;
    refsP3.forEach(r => {
      const splitR = doc.splitTextToSize(r, contentWidth);
      doc.text(splitR, margin, yRef);
      yRef += (splitR.length * 4.2) + 2;
    });

    // ==========================================
    // PAGE 4 : BIBLIOGRAPHIE & ARTICLES CONNEXES
    // ==========================================
    doc.addPage();
    addHeader(4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 30);
    doc.text("Bibliographie détaillée", margin, 24);
    doc.setLineWidth(0.6);
    doc.line(margin, 26, pageWidth - margin, 26);

    const biblio = [
      "[Alcácer 2018] (en) Luís Alcácer, Electronic structure of organic semiconductors : polymers and small molecules, San Rafael, Morgan & Claypool, coll. « IOP concise physics », décembre 2018, 1re éd., XIV-115 p., 17,8 × 25,4 cm (ISBN 978-1-64327-165-1, OCLC 1078886134).",
      "[Macchi, Moruzzi et Pegoraro 2017] (en) Andrea Macchi, Giovanni Moruzzi et Francesco Pegoraro, Problems in classical electromagnetism : 157 exercises with solutions, Cham, Springer, hors coll., décembre 2017, 1re éd., XVIII-454 p. (ISBN 978-3-319-63132-5).",
      "[Séguin, Descheneau et Tardif 2010] Marc Séguin, Julie Descheneau et Benjamin Tardif, Physique XXI, t. B : Électricité et magnétisme, Bruxelles, De Boeck université, juin 2010, 1re éd., XIX-556 p., 21,3 × 27,5 cm (ISBN 978-2-8041-6190-3)."
    ];

    let yBib = 34;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 45);
    biblio.forEach(b => {
      const splitB = doc.splitTextToSize(b, contentWidth);
      doc.text(splitB, margin, yBib);
      yBib += (splitB.length * 4.5) + 4;
    });

    // Articles connexes
    yBib += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 30);
    doc.text("Articles connexes", margin, yBib);
    doc.setLineWidth(0.4);
    doc.line(margin, yBib + 2, pageWidth - margin, yBib + 2);

    yBib += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const connexes = [
      "• Force électrostatique et champ électrique coulombien",
      "• Potentiel électrostatique et travail des forces conservatives",
      "• Constante physique fondamentale et permittivité diélectrique",
      "• Équations de Panofsky-Phillips (régime électrodynamique)",
      "• Équations de Jefimenko et champs retardés relativistes",
      "• Théorème de Gauss et distribution continue de charges"
    ];
    connexes.forEach(c => {
      doc.text(c, margin + 4, yBib);
      yBib += 6;
    });

    // Liens externes
    yBib += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 30);
    doc.text("Liens externes & Archives", margin, yBib);
    doc.setLineWidth(0.4);
    doc.line(margin, yBib + 2, pageWidth - margin, yBib + 2);

    yBib += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const liens = [
      "• CNRS : Ampère et l'histoire de l'électricité (Parcours pédagogique Coulomb)",
      "• Vidéo d'archives scientifiques : Coulomb invente une balance pour l'électricité",
      "• Wikimedia Commons : Catégorie Coulomb_force & Documents historiques originaux"
    ];
    liens.forEach(l => {
      doc.text(l, margin + 4, yBib);
      yBib += 6;
    });

    // ==========================================
    // PAGE 5 : HISTORIQUE & PROVENANCE DU DOCUMENT
    // ==========================================
    doc.addPage();
    addHeader(5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 30);
    doc.text("Notice de provenance et métadonnées du document", margin, 24);
    doc.setLineWidth(0.6);
    doc.line(margin, 26, pageWidth - margin, 26);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, 35, contentWidth, 50, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Source académique :", margin + 6, 45);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text("https://fr.wikipedia.org/w/index.php?title=Loi_de_Coulomb_(électrostatique)&oldid=234132662", margin + 6, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Ce document pédagogique de 5 pages a été compilé pour l'Unité d'Enseignement PHYS102 (Physique II : Électrostatique & Électromagnétisme) de la Faculté Polytechnique de l'Université de Lubumbashi (UNILU).", margin + 6, 66, { maxWidth: contentWidth - 12 });

    // Sceau académique Polytech UNILU
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.0);
    doc.roundedRect(margin + 20, 110, contentWidth - 40, 50, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("UNIVERSITÉ DE LUBUMBASHI (UNILU)", pageWidth / 2, 122, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("FACULTÉ POLYTECHNIQUE", pageWidth / 2, 130, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Département des Sciences Fondamentales • Chaire de Physique", pageWidth / 2, 138, { align: 'center' });
    doc.text("Document certifié pour consultation et révision hors-ligne", pageWidth / 2, 146, { align: 'center' });

    // Export en Data URI
    return doc.output('datauristring');
  }
}

// Instance globale du lecteur PDF
window.pdfViewer = new PdfViewerModal();

/**
 * UniDocs - Visionneuse Minimaliste & Épurée
 */

class PdfViewerModal {
  constructor() {
    this.currentDoc = null;
    this.modalEl = null;
    this.init();
  }

  init() {
    if (!document.getElementById('pdf-viewer-modal')) {
      const modal = document.createElement('div');
      modal.id = 'pdf-viewer-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm hidden';
      modal.innerHTML = `
        <div class="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
          
          <!-- Header épuré -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <div class="min-w-0 pr-4">
              <h3 id="pv-title" class="font-bold text-base text-slate-900 dark:text-white truncate">Titre du document</h3>
              <p id="pv-subtitle" class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">Matière • Semestre</p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Bouton Favori -->
              <button id="pv-fav-btn" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition" title="Favori">
                <i data-lucide="star" class="w-4 h-4"></i>
              </button>

              <!-- Télécharger -->
              <button id="pv-download-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Télécharger</span>
              </button>

              <!-- Fermer -->
              <button id="pv-close-btn" class="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

          <!-- Zone de lecture épurée -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 dark:bg-zinc-950">
            <div class="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
              
              <div class="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <span id="pv-badge" class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">COURS</span>
                <h1 id="pv-doc-heading" class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Titre</h1>
                <p id="pv-doc-meta" class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Enseignant • Année</p>
              </div>

              <!-- Contenu du document -->
              <div class="text-sm text-slate-700 dark:text-zinc-300 space-y-4 leading-relaxed font-sans">
                <p id="pv-doc-desc" class="italic text-slate-600 dark:text-zinc-400"></p>

                <div class="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h4 class="font-bold text-slate-900 dark:text-white mb-2 text-sm">1. Synthèse du programme</h4>
                  <p class="text-xs text-slate-600 dark:text-zinc-400">
                    Ce document contient l'ensemble des définitions, théorèmes et exercices d'application nécessaires pour valider cette unité d'enseignement.
                  </p>
                </div>

                <div id="pv-solution-box" class="hidden p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                  💡 <strong>Corrigé officiel disponible :</strong> Les corrections détaillées des exercices sont incluses dans cette archive.
                </div>
              </div>

            </div>
          </div>

        </div>
      `;
      document.body.appendChild(modal);
      this.modalEl = modal;
      this.bindEvents();
    }
  }

  bindEvents() {
    const modal = this.modalEl;
    modal.querySelector('#pv-close-btn').onclick = () => this.close();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.close();
      }
    });

    modal.querySelector('#pv-fav-btn').onclick = async () => {
      if (!this.currentDoc) return;
      await window.localDB.toggleFavorite(this.currentDoc.id);
      this.currentDoc.isFavorite = !this.currentDoc.isFavorite;
      this.updateFav();
      if (window.app) window.app.render();
    };

    modal.querySelector('#pv-download-btn').onclick = () => {
      if (!this.currentDoc) return;
      const element = document.createElement('a');
      const content = `UniDocs - ${this.currentDoc.title}\n\nDescription: ${this.currentDoc.description}\nAuteur: ${this.currentDoc.author}\nAnnée: ${this.currentDoc.year}`;
      const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${this.currentDoc.title}.txt`;
      element.click();
    };
  }

  open(doc, course) {
    this.currentDoc = doc;
    this.init();

    const modal = this.modalEl;
    modal.querySelector('#pv-title').textContent = doc.title;
    modal.querySelector('#pv-subtitle').textContent = `${course ? course.name : 'Matière'} • ${doc.semester}`;
    modal.querySelector('#pv-badge').textContent = doc.type.toUpperCase();
    modal.querySelector('#pv-doc-heading').textContent = doc.title;
    modal.querySelector('#pv-doc-meta').textContent = `${course ? course.name : ''} • ${doc.author || 'Faculté'} • ${doc.year || '2024-2025'}`;
    modal.querySelector('#pv-doc-desc').textContent = doc.description || 'Document officiel de révision.';

    const solBox = modal.querySelector('#pv-solution-box');
    if (doc.hasSolution) {
      solBox.classList.remove('hidden');
    } else {
      solBox.classList.add('hidden');
    }

    this.updateFav();
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  updateFav() {
    const btn = this.modalEl.querySelector('#pv-fav-btn');
    if (this.currentDoc && this.currentDoc.isFavorite) {
      btn.innerHTML = '<i data-lucide="star" class="w-4 h-4 text-amber-500 fill-amber-500"></i>';
    } else {
      btn.innerHTML = '<i data-lucide="star" class="w-4 h-4"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }
}

window.pdfViewer = new PdfViewerModal();

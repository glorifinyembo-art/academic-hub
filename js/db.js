/**
 * UniDocs - IndexedDB Storage Layer
 * Gestionnaire de base de données locale pour fonctionnement 100% hors-ligne
 */

const DB_NAME = 'UniDocsOfflineDB';
const DB_VERSION = 1;

class LocalDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Table des Matières / Cours
        if (!db.objectStoreNames.contains('courses')) {
          const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
          courseStore.createIndex('semester', 'semester', { unique: false });
          courseStore.createIndex('code', 'code', { unique: true });
        }

        // Table des Documents (Cours, TPs, TD, Examens, Interros)
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('courseId', 'courseId', { unique: false });
          docStore.createIndex('type', 'type', { unique: false });
          docStore.createIndex('semester', 'semester', { unique: false });
          docStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Table des Fichiers Binaires PDF (stockage offline)
        if (!db.objectStoreNames.contains('pdf_cache')) {
          db.createObjectStore('pdf_cache', { keyPath: 'docId' });
        }

        // Table des Paramètres & Préférences
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[IndexedDB] Base de données locale initialisée avec succès');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Erreur d\'initialisation:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // --- GESTION DES COURS ---
  async getAllCourses() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['courses'], 'readonly');
      const store = transaction.objectStore('courses');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCourses(courses) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['courses'], 'readwrite');
      const store = transaction.objectStore('courses');
      courses.forEach(c => store.put(c));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addCourse(course) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['courses'], 'readwrite');
      const store = transaction.objectStore('courses');
      const request = store.put(course);
      request.onsuccess = () => resolve(course);
      request.onerror = () => reject(request.error);
    });
  }

  // --- GESTION DES DOCUMENTS ---
  async getAllDocuments() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocuments(documents) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      documents.forEach(d => store.put(d));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addDocument(doc) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.put(doc);
      request.onsuccess = () => resolve(doc);
      request.onerror = () => reject(request.error);
    });
  }

  async updateDocument(doc) {
    return this.addDocument(doc);
  }

  async deleteDocument(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['documents', 'pdf_cache'], 'readwrite');
      transaction.objectStore('documents').delete(id);
      transaction.objectStore('pdf_cache').delete(id);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async toggleFavorite(id) {
    const doc = await this.getDocument(id);
    if (!doc) return null;
    doc.isFavorite = !doc.isFavorite;
    await this.updateDocument(doc);
    return doc.isFavorite;
  }

  async setRevisionStatus(id, status) {
    const doc = await this.getDocument(id);
    if (!doc) return null;
    doc.revisionStatus = status; // 'todo', 'in_progress', 'completed'
    await this.updateDocument(doc);
    return doc;
  }

  // --- CACHE PDF HORS-LIGNE ---
  async savePdfBlob(docId, blobOrDataUrl) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pdf_cache'], 'readwrite');
      const store = transaction.objectStore('pdf_cache');
      const request = store.put({
        docId: docId,
        data: blobOrDataUrl,
        savedAt: new Date().toISOString()
      });
      request.onsuccess = async () => {
        // Mettre à jour l'indicateur isOfflineAvailable du document
        const doc = await this.getDocument(docId);
        if (doc) {
          doc.isOfflineAvailable = true;
          await this.updateDocument(doc);
        }
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPdfBlob(docId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pdf_cache'], 'readonly');
      const store = transaction.objectStore('pdf_cache');
      const request = store.get(docId);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => reject(request.error);
    });
  }

  async removePdfBlob(docId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pdf_cache'], 'readwrite');
      const store = transaction.objectStore('pdf_cache');
      const request = store.delete(docId);
      request.onsuccess = async () => {
        const doc = await this.getDocument(docId);
        if (doc) {
          doc.isOfflineAvailable = false;
          await this.updateDocument(doc);
        }
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- PARAMÈTRES ---
  async getSetting(key, defaultValue = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : defaultValue);
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

// Instance globale
window.localDB = new LocalDatabase();


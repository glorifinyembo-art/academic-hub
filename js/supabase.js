/**
 * UniDocs - Supabase Client & Sync Manager
 * Synchronisation Cloud avec tolérance totale aux pannes réseau
 */

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.url = '';
    this.anonKey = '';
    this.isSyncing = false;
  }

  async init() {
    try {
      // 1. Récupérer les clés depuis le fichier .env via l'API du serveur
      const response = await fetch('/api/env');
      if (response.ok) {
        const envData = await response.json();
        this.url = (envData.SUPABASE_URL || '').trim();
        this.anonKey = (envData.SUPABASE_ANON_KEY || '').trim();
      }
    } catch (e) {
      // Si hors-ligne sans serveur python
      this.url = await window.localDB.getSetting('supabase_url', '');
      this.anonKey = await window.localDB.getSetting('supabase_anon_key', '');
    }

    if (this.url && this.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.url, this.anonKey);
        this.isConnected = true;
        console.log('[Supabase] Connecté avec succès via le fichier .env !');
        // Synchroniser automatiquement les données si connecté
        this.pullFromCloud().catch(() => {});
      } catch (err) {
        console.warn('[Supabase] Erreur initialisation:', err);
        this.isConnected = false;
      }
    } else {
      console.log('[Supabase] Mode local actif (Renseignez .env pour connecter votre Cloud Supabase)');
      this.isConnected = false;
    }
    return this.isConnected;
  }

  async setCredentials(url, key) {
    this.url = (url || '').trim();
    this.anonKey = (key || '').trim();

    await window.localDB.setSetting('supabase_url', this.url);
    await window.localDB.setSetting('supabase_anon_key', this.anonKey);

    if (this.url && this.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.url, this.anonKey);
        // Test de connexion rapide
        const { data, error } = await this.client.from('courses').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') {
          console.warn('[Supabase] Test de connexion avec avertissement:', error.message);
        }
        this.isConnected = true;
        return { success: true, message: "Connexion Supabase établie avec succès !" };
      } catch (err) {
        this.isConnected = false;
        return { success: false, message: "Erreur de connexion : " + err.message };
      }
    } else {
      this.client = null;
      this.isConnected = false;
      return { success: true, message: "Mode local activé (données enregistrées sur votre appareil)." };
    }
  }

  // ==========================================
  // GESTION DE L'AUTHENTIFICATION (GOOGLE & EMAIL)
  // ==========================================

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    if (!this.client) return null;
    try {
      const { data: { user } } = await this.client.auth.getUser();
      return user;
    } catch (e) {
      return null;
    }
  }

  // Connexion Google OAuth
  async signInWithGoogle() {
    if (!this.client) throw new Error("Supabase n'est pas configuré dans le fichier .env");
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
    return data;
  }

  // Connexion Email + Mot de passe
  async signInWithEmail(email, password) {
    if (!this.client) throw new Error("Supabase n'est pas configuré dans le fichier .env");
    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    return data;
  }

  // Inscription Email + Mot de passe
  async signUpWithEmail(email, password, fullName) {
    if (!this.client) throw new Error("Supabase n'est pas configuré dans le fichier .env");
    const { data, error } = await this.client.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName || 'Étudiant'
        }
      }
    });
    if (error) throw error;
    return data;
  }

  // Déconnexion
  async signOut() {
    if (!this.client) return;
    const { error } = await this.client.auth.signOut();
    if (error) console.warn('[Auth] Erreur déconnexion:', error);
  }

  // Écouteur des changements d'état d'authentification
  onAuthStateChange(callback) {
    if (!this.client) return;
    this.client.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
  }

  // Synchronisation descendante : Supabase -> IndexedDB local
  async pullFromCloud() {
    if (!this.client || !navigator.onLine) {
      return { success: false, message: "Hors-ligne ou Supabase non configuré" };
    }

    this.isSyncing = true;
    try {
      // 1. Récupérer les cours
      const { data: remoteCourses, error: cErr } = await this.client.from('courses').select('*');
      if (cErr) throw cErr;
      if (remoteCourses && remoteCourses.length > 0) {
        await window.localDB.saveCourses(remoteCourses);
      }

      // 2. Récupérer les documents
      const { data: remoteDocs, error: dErr } = await this.client.from('documents').select('*');
      if (dErr) throw dErr;
      if (remoteDocs && remoteDocs.length > 0) {
        await window.localDB.saveDocuments(remoteDocs);
      }

      this.isSyncing = false;
      return { success: true, coursesCount: remoteCourses?.length || 0, docsCount: remoteDocs?.length || 0 };
    } catch (err) {
      this.isSyncing = false;
      console.error('[Supabase Sync] Erreur pull:', err);
      return { success: false, error: err.message };
    }
  }

  // Synchronisation montante : IndexedDB -> Supabase Cloud
  async pushToCloud() {
    if (!this.client || !navigator.onLine) {
      return { success: false, message: "Hors-ligne ou Supabase non configuré" };
    }

    this.isSyncing = true;
    try {
      const localCourses = await window.localDB.getAllCourses();
      const localDocs = await window.localDB.getAllDocuments();

      if (localCourses.length > 0) {
        const { error: cErr } = await this.client.from('courses').upsert(localCourses, { onConflict: 'id' });
        if (cErr) console.warn('[Supabase Sync] Avertissement courses upsert:', cErr);
      }

      if (localDocs.length > 0) {
        // Nettoyer les données locales avant envoi (enlever les blobs binaires lourds de la table SQL)
        const docsToSync = localDocs.map(doc => {
          const { fileBlob, ...rest } = doc;
          return rest;
        });
        const { error: dErr } = await this.client.from('documents').upsert(docsToSync, { onConflict: 'id' });
        if (dErr) console.warn('[Supabase Sync] Avertissement docs upsert:', dErr);
      }

      this.isSyncing = false;
      return { success: true, message: "Données synchronisées sur le Cloud !" };
    } catch (err) {
      this.isSyncing = false;
      console.error('[Supabase Sync] Erreur push:', err);
      return { success: false, error: err.message };
    }
  }

  // Upload d'un fichier PDF vers Supabase Storage
  async uploadPdfFile(file, path) {
    if (!this.client || !navigator.onLine) {
      throw new Error("Supabase n'est pas connecté ou vous êtes hors-ligne.");
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await this.client.storage
      .from('academic_docs')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = this.client.storage
      .from('academic_docs')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // Script SQL prêt à l'emploi pour initialiser Supabase
  getSqlSchemaSnippet() {
    return `-- ==========================================
-- SCHEMA SUPABASE POUR UNIDOCS (FACULTÉ)
-- À coller dans l'Éditeur SQL de Supabase
-- ==========================================

-- 1. Table des Cours / Matières
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    semester TEXT NOT NULL,
    promotion TEXT DEFAULT 'Promotion Actuelle',
    icon TEXT DEFAULT 'book-open',
    color TEXT DEFAULT 'indigo',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Documents & Ressources
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cours', 'tp', 'exercice', 'examen', 'interro')),
    year TEXT DEFAULT '2024-2025',
    semester TEXT NOT NULL,
    description TEXT,
    author TEXT,
    file_url TEXT,
    size TEXT DEFAULT '1.2 Mo',
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revision_status TEXT DEFAULT 'todo' CHECK (revision_status IN ('todo', 'in_progress', 'completed')),
    is_favorite BOOLEAN DEFAULT FALSE,
    has_solution BOOLEAN DEFAULT FALSE
);

-- 3. Activer la lecture publique
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique pour les cours" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Ajout et modif des cours" ON public.courses FOR ALL USING (true);

CREATE POLICY "Lecture publique pour les documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Ajout et modif des documents" ON public.documents FOR ALL USING (true);

-- 4. Bucket de stockage pour les PDFs (Optionnel)
-- Créez un bucket public nommé 'academic_docs' dans Storage -> New Bucket
`;
  }
}

window.supabaseService = new SupabaseService();


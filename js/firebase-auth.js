/**
 * UniDocs - Firebase Authentication Service (Google & Email)
 * Lit les identifiants depuis le fichier .env via /api/env
 */

class FirebaseAuthService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      const response = await fetch('/api/env');
      if (!response.ok) return false;

      const env = await response.json();
      const apiKey = (env.FIREBASE_API_KEY || '').trim();
      const projectId = (env.FIREBASE_PROJECT_ID || '').trim();

      if (!apiKey || !projectId) {
        console.log('[Firebase Auth] Clés non renseignées dans le fichier .env');
        return false;
      }

      const firebaseConfig = {
        apiKey: apiKey,
        authDomain: env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId: projectId,
        storageBucket: env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: env.FIREBASE_APP_ID || ''
      };

      // Initialisation de Firebase
      if (window.firebase) {
        if (!window.firebase.apps.length) {
          this.app = window.firebase.initializeApp(firebaseConfig);
        } else {
          this.app = window.firebase.app();
        }
        this.auth = window.firebase.auth();
        // Langue française pour les emails d'authentification
        this.auth.useDeviceLanguage();
        this.isInitialized = true;
        console.log('[Firebase Auth] Connecté avec succès via le fichier .env !');
        return true;
      }
    } catch (err) {
      console.warn('[Firebase Auth] Erreur initialisation:', err);
      this.isInitialized = false;
      return false;
    }
    return false;
  }

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    if (!this.auth) return null;
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  // Connexion Google OAuth
  async signInWithGoogle() {
    if (!this.isInitialized || !this.auth) {
      throw new Error("Firebase n'est pas encore configuré. Renseignez vos clés dans le fichier .env");
    }

    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    try {
      const result = await this.auth.signInWithPopup(provider);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("La fenêtre de connexion Google a été fermée.");
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error("L'authentification Google n'est pas activée dans votre console Firebase (Onglet Authentication > Sign-in method).");
      }
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Connexion Email & Mot de passe
  async signInWithEmail(email, password) {
    if (!this.isInitialized || !this.auth) {
      throw new Error("Firebase n'est pas configuré. Remplissez le fichier .env");
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email.trim(), password);
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Inscription Email & Mot de passe
  async signUpWithEmail(email, password, fullName) {
    if (!this.isInitialized || !this.auth) {
      throw new Error("Firebase n'est pas configuré. Remplissez le fichier .env");
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email.trim(), password);
      const user = userCredential.user;

      if (fullName && user) {
        await user.updateProfile({
          displayName: fullName.trim()
        });
      }
      return user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Déconnexion
  async signOut() {
    if (!this.auth) return;
    await this.auth.signOut();
  }

  // Écouteur des changements de session (connexion / déconnexion)
  onAuthStateChange(callback) {
    if (!this.auth) return;
    this.auth.onAuthStateChanged((user) => {
      callback(user);
    });
  }

  // Traduction des erreurs Firebase en français
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/invalid-email':
        return "L'adresse email saisie est invalide.";
      case 'auth/user-disabled':
        return "Ce compte utilisateur a été désactivé.";
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return "Identifiants incorrects (email ou mot de passe erroné).";
      case 'auth/wrong-password':
        return "Le mot de passe saisi est incorrect.";
      case 'auth/email-already-in-use':
        return "Un compte existe déjà avec cette adresse email.";
      case 'auth/weak-password':
        return "Le mot de passe est trop court (au moins 6 caractères).";
      case 'auth/operation-not-allowed':
        return "Ce mode de connexion n'est pas activé dans la console Firebase (Authentication > Sign-in method).";
      case 'auth/network-request-failed':
        return "Erreur réseau. Vérifiez votre connexion internet.";
      default:
        return error.message || "Une erreur est survenue lors de l'authentification.";
    }
  }
}

window.authService = new FirebaseAuthService();


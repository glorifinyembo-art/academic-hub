# Academic Hub — Espace Étudiant (Site Autonome)

Ce site web est l'application étudiante dédiée d'Academic Hub, conçue pour être déployée indépendamment du portail d'administration.

## Fonctionnalités Étudiant
- **Tuteur IA Pédagogique** : Accompagnement méthodologique socratique, questions guidées, RAG universitaire.
- **Mode Apprendre (Parcours linéaire par chapitre)** : Étapes progressives, démystification, questions de compréhension et défi final du chapitre.
- **Bibliothèque de Documents** : Consultation et téléchargement des supports de cours, TD et annales d'examens.
- **Lecteur Intégré** : Support natif PDF, Word et code source.
- **Scanner & Capture photo** : Pour analyser un énoncé d'exercice ou un tableau.
- **Historique & Paramètres personnels**.

## Déploiement Autonome
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer la variable d'environnement vers la base de données / API centrale :
   ```env
   DATABASE_API_URL=https://votre-api-academique.com/api
   PORT=3002
   ```
3. Lancer le serveur :
   ```bash
   npm start
   ```
Ce site ne contient aucun accès ni code d'administration et ne communique avec le portail d'administration que par l'intermédiaire de la base de données.

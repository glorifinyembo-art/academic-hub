# Academic Hub — Portail d'Administration (Site Autonome)

Ce site web est le portail d'administration dédié d'Academic Hub, conçu pour être déployé indépendamment du site étudiant.

## Fonctionnalités Administrateur
- **Tableau de Bord & KPIs** : Indicateurs clés (matières, documents, filières, corrigés officiels).
- **Gestion des Matières & Filières** : Création, modification et suppression des cours, filières et chapitres de programme.
- **Gestion du Corpus de Documents** : Table complète, filtres instantanés, publication / dépublication, aperçu textuel et suppression.
- **Téléversement & Rédaction** : Dépôt de fichiers PDF, Word, code avec classification automatique et formulaire de rédaction directe de fiches.
- **Orchestration Tri-Agents IA** : Ingestion OCR, alignement didactique et auditeur qualité (déduplication SHA-256, détection des manques de corrigés).
- **Journal d'Audit** : Historique exhaustif et horodaté de toutes les actions.

## Déploiement Autonome
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer la variable d'environnement vers la base de données / API centrale :
   ```env
   DATABASE_API_URL=https://votre-api-academique.com/api
   PORT=3001
   ```
3. Lancer le serveur d'administration :
   ```bash
   npm start
   ```

Ce site n'embarque aucun composant étudiant et ne communique avec le site étudiant que par le biais de la base de données partagée.

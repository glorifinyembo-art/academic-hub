/**
 * UniDocs - Jeu de données initial complet & structuré
 */

const INITIAL_COURSES = [
  {
    id: 'course-algo',
    code: 'INF-201',
    name: 'Algorithmique & Structures de Données',
    semester: 'S1',
    promotion: 'Licence 2 Informatique',
    icon: 'code',
    color: 'indigo',
    description: 'Arbres binaires, AVL, graphes, algorithmes de tri, complexité asymptotique (O, Omega, Theta).'
  },
  {
    id: 'course-bd',
    code: 'INF-202',
    name: 'Bases de Données & Modélisation SQL',
    semester: 'S1',
    promotion: 'Licence 2 Informatique',
    icon: 'database',
    color: 'emerald',
    description: 'Modèle Entité-Association, normalisation 1FN-3FN, requêtes SQL avancées, jointures et indexation.'
  },
  {
    id: 'course-os',
    code: 'INF-203',
    name: 'Systèmes d\'Exploitation & Shell Linux',
    semester: 'S1',
    promotion: 'Licence 2 Informatique',
    icon: 'terminal',
    color: 'amber',
    description: 'Gestion des processus, threads, sémaphores, mémoire virtuelle, scripts Bash et appels système POSIX.'
  },
  {
    id: 'course-math',
    code: 'MAT-201',
    name: 'Mathématiques & Probabilités Appliquées',
    semester: 'S1',
    promotion: 'Licence 2 Informatique',
    icon: 'sigma',
    color: 'rose',
    description: 'Variables aléatoires discrètes et continues, lois usuelles, algèbre linéaire et décompositions matricielles.'
  },
  {
    id: 'course-reseaux',
    code: 'INF-204',
    name: 'Réseaux Informatiques & Protocoles',
    semester: 'S2',
    promotion: 'Licence 2 Informatique',
    icon: 'wifi',
    color: 'sky',
    description: 'Modèle OSI / TCP-IP, routage IP, masques sous-réseau CIDR, protocoles DNS, HTTP, DHCP et analyse Wireshark.'
  },
  {
    id: 'course-poo',
    code: 'INF-205',
    name: 'Programmation Orientée Objet & Java',
    semester: 'S2',
    promotion: 'Licence 2 Informatique',
    icon: 'cpu',
    color: 'violet',
    description: 'Encapsulation, héritage, polymorphisme, design patterns fondamentaux (Singleton, Factory, Observer).'
  }
];

const INITIAL_DOCUMENTS = [
  // --- ALGORITHMIQUE ---
  {
    id: 'doc-algo-cours-1',
    courseId: 'course-algo',
    title: 'Chapitre 1 : Analyse de Complexité & Notations Asymptotiques',
    type: 'cours',
    year: '2024-2025',
    semester: 'S1',
    description: 'Définitions rigoureuses de O, Ω, Θ, calcul de complexité des boucles imbriquées et récurrences.',
    author: 'Prof. Laurent Dupont',
    size: '2.4 Mo',
    dateAdded: '2024-09-15',
    revisionStatus: 'completed',
    isFavorite: true,
    hasSolution: false,
    fileUrl: 'sample-algo-c1.pdf'
  },
  {
    id: 'doc-algo-cours-2',
    courseId: 'course-algo',
    title: 'Chapitre 2 : Arbres Binaires de Recherche & Équilibrage AVL',
    type: 'cours',
    year: '2024-2025',
    semester: 'S1',
    description: 'Rotations droite/gauche, insertion et suppression AVL avec maintien de l\'invariance.',
    author: 'Prof. Laurent Dupont',
    size: '3.1 Mo',
    dateAdded: '2024-10-02',
    revisionStatus: 'in_progress',
    isFavorite: false,
    hasSolution: false,
    fileUrl: 'sample-algo-c2.pdf'
  },
  {
    id: 'doc-algo-tp-1',
    courseId: 'course-algo',
    title: 'TP 1 : Implémentation des Piles, Files et Listes Chaînées en C',
    type: 'tp',
    year: '2024-2025',
    semester: 'S1',
    description: 'Énoncé complet du TP avec squelette de code, tests unitaires et barème d\'évaluation.',
    author: 'Dr. Sarah Benali',
    size: '1.1 Mo',
    dateAdded: '2024-09-22',
    revisionStatus: 'completed',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-algo-tp1.pdf'
  },
  {
    id: 'doc-algo-tp-2',
    courseId: 'course-algo',
    title: 'TP 2 : Arbres Généalogiques & Parcours Pré/In/Postfixe',
    type: 'tp',
    year: '2024-2025',
    semester: 'S1',
    description: 'Manipulation des arbres binaires, calcul de hauteur et chemins maximaux.',
    author: 'Dr. Sarah Benali',
    size: '1.4 Mo',
    dateAdded: '2024-10-18',
    revisionStatus: 'todo',
    isFavorite: false,
    hasSolution: false,
    fileUrl: 'sample-algo-tp2.pdf'
  },
  {
    id: 'doc-algo-td-1',
    courseId: 'course-algo',
    title: 'TD 1 : Séries d\'exercices sur les relations de récurrence (Master Theorem)',
    type: 'exercice',
    year: '2024-2025',
    semester: 'S1',
    description: '15 exercices gradués avec corrigé détaillé pas à pas.',
    author: 'Équipe Pédagogique',
    size: '1.8 Mo',
    dateAdded: '2024-09-28',
    revisionStatus: 'in_progress',
    isFavorite: true,
    hasSolution: true,
    fileUrl: 'sample-algo-td1.pdf'
  },
  {
    id: 'doc-algo-interro-1',
    courseId: 'course-algo',
    title: 'Interrogation Écrite #1 : Récursivité et Tris Rapides (Quicksort)',
    type: 'interro',
    year: '2024-2025',
    semester: 'S1',
    description: 'Sujet officiel de 45 minutes + Corrigé type et grille de notation.',
    author: 'Prof. Laurent Dupont',
    size: '850 Ko',
    dateAdded: '2024-10-25',
    revisionStatus: 'todo',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-algo-interro1.pdf'
  },
  {
    id: 'doc-algo-exam-2024',
    courseId: 'course-algo',
    title: 'Examen Final - Session Principale Janvier 2024',
    type: 'examen',
    year: '2023-2024',
    semester: 'S1',
    description: 'Épreuve complète de 2h30 portant sur l\'ensemble du programme + Corrigé officiel.',
    author: 'Département Informatique',
    size: '2.9 Mo',
    dateAdded: '2024-01-20',
    revisionStatus: 'todo',
    isFavorite: true,
    hasSolution: true,
    fileUrl: 'sample-algo-exam2024.pdf'
  },
  {
    id: 'doc-algo-exam-2023',
    courseId: 'course-algo',
    title: 'Examen Final - Session de Rattrapage Juin 2023',
    type: 'examen',
    year: '2022-2023',
    semester: 'S1',
    description: 'Épreuve de rattrapage avec focus sur les graphes (Dijkstra, BFS/DFS).',
    author: 'Département Informatique',
    size: '2.1 Mo',
    dateAdded: '2023-06-30',
    revisionStatus: 'todo',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-algo-exam2023.pdf'
  },

  // --- BASES DE DONNÉES ---
  {
    id: 'doc-bd-cours-1',
    courseId: 'course-bd',
    title: 'Polycopié : Modélisation Conceptuelle & Formes Normales (1FN à BCNF)',
    type: 'cours',
    year: '2024-2025',
    semester: 'S1',
    description: 'Guide complet pour concevoir des schémas relationnels sans redondance.',
    author: 'Pr. Marc Villeneuve',
    size: '4.2 Mo',
    dateAdded: '2024-09-18',
    revisionStatus: 'completed',
    isFavorite: true,
    hasSolution: false,
    fileUrl: 'sample-bd-cours.pdf'
  },
  {
    id: 'doc-bd-tp-1',
    courseId: 'course-bd',
    title: 'TP 1 : Création de Schéma & Requêtes SQL PostgreSQL',
    type: 'tp',
    year: '2024-2025',
    semester: 'S1',
    description: 'Script DDL, insertion de données d\'une e-boutique et 20 requêtes SELECT avec GROUP BY / HAVING.',
    author: 'Ing. Nadia K.',
    size: '1.3 Mo',
    dateAdded: '2024-10-05',
    revisionStatus: 'in_progress',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-bd-tp1.pdf'
  },
  {
    id: 'doc-bd-exam-2024',
    courseId: 'course-bd',
    title: 'Examen Terminal - Session Décembre 2024',
    type: 'examen',
    year: '2024-2025',
    semester: 'S1',
    description: 'Sujet sur la gestion d\'un parc hospitalier : Diagramme E/A, passage au relationnel et requêtes SQL complexes.',
    author: 'Département Informatique',
    size: '1.9 Mo',
    dateAdded: '2024-12-15',
    revisionStatus: 'todo',
    isFavorite: true,
    hasSolution: true,
    fileUrl: 'sample-bd-exam2024.pdf'
  },

  // --- SYSTÈMES D'EXPLOITATION ---
  {
    id: 'doc-os-cours-1',
    courseId: 'course-os',
    title: 'Cours Magistral : Synchronisation des Processus & Sémaphores de Dijkstra',
    type: 'cours',
    year: '2024-2025',
    semester: 'S1',
    description: 'Problèmes classiques (Producteurs-Consommateurs, Lecteurs-Rédacteurs, Dîner des philosophes).',
    author: 'Dr. Alain Mercier',
    size: '3.6 Mo',
    dateAdded: '2024-10-10',
    revisionStatus: 'in_progress',
    isFavorite: false,
    hasSolution: false,
    fileUrl: 'sample-os-cours.pdf'
  },
  {
    id: 'doc-os-interro-1',
    courseId: 'course-os',
    title: 'Interrogation Surprise : fork(), exec() et Gestion des Signaux en C',
    type: 'interro',
    year: '2024-2025',
    semester: 'S1',
    description: 'Questions d\'analyse de code avec diagrammes d\'arbres de processus générés.',
    author: 'Dr. Alain Mercier',
    size: '720 Ko',
    dateAdded: '2024-11-04',
    revisionStatus: 'todo',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-os-interro.pdf'
  },

  // --- MATHÉMATIQUES & PROBABILITÉS ---
  {
    id: 'doc-math-td-1',
    courseId: 'course-math',
    title: 'TD 3 : Lois de Probabilités Discrètes (Binomiale, Poisson, Géométrique)',
    type: 'exercice',
    year: '2024-2025',
    semester: 'S1',
    description: 'Applications concrètes en informatique (temps d\'attente serveur, paquets perdus).',
    author: 'Prof. Émilie Roussel',
    size: '1.5 Mo',
    dateAdded: '2024-10-12',
    revisionStatus: 'completed',
    isFavorite: false,
    hasSolution: true,
    fileUrl: 'sample-math-td.pdf'
  },
  {
    id: 'doc-math-exam-2024',
    courseId: 'course-math',
    title: 'Examen de Mi-Parcours (Partiel) - Novembre 2024',
    type: 'examen',
    year: '2024-2025',
    semester: 'S1',
    description: '3 exercices + Problème de synthèse sur les chaînes de Markov.',
    author: 'Département Mathématiques',
    size: '1.2 Mo',
    dateAdded: '2024-11-20',
    revisionStatus: 'todo',
    isFavorite: true,
    hasSolution: true,
    fileUrl: 'sample-math-partiel.pdf'
  }
];

window.INITIAL_COURSES = INITIAL_COURSES;
window.INITIAL_DOCUMENTS = INITIAL_DOCUMENTS;


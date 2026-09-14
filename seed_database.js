import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'server', 'academic_data.json');

const computeHash = (content) => crypto.createHash('sha256').update(content || '').digest('hex');

const promotions = [
  { id: 'promo-l1-st', name: 'Licence 1 — Sciences & Technologies', cycle: 'Licence 1', faculty: 'UFR Sciences' },
  { id: 'promo-l2-info', name: 'Licence 2 — Informatique & Mathématiques', cycle: 'Licence 2', faculty: 'UFR Informatique' },
  { id: 'promo-l2-phys', name: 'Licence 2 — Physique & Ingénierie', cycle: 'Licence 2', faculty: 'UFR Physique' }
];

const courses = [
  {
    id: 'course-analyse',
    code: 'MATH101',
    name: 'Analyse Mathématique',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Laurent',
    description: 'Calcul intégral, équations différentielles, séries et fonctions de plusieurs variables.',
    credits: 6,
    chapters: [
      { id: 'chap-analyse-1', number: 1, title: 'Calcul Intégral & Primitives' },
      { id: 'chap-analyse-2', number: 2, title: 'Équations Différentielles Ordinaires' },
      { id: 'chap-analyse-3', number: 3, title: 'Séries Numériques & Séries Entières' },
      { id: 'chap-analyse-4', number: 4, title: 'Fonctions de Plusieurs Variables & Extrema' }
    ]
  },
  {
    id: 'course-algebre',
    code: 'MATH102',
    name: 'Algèbre Linéaire & Géométrie',
    promotionId: 'promo-l1-st',
    professor: 'Pr. Bensaid',
    description: 'Espaces vectoriels, applications linéaires, calcul matriciel et diagonalisation.',
    credits: 6,
    chapters: [
      { id: 'chap-algebre-1', number: 1, title: 'Espaces Vectoriels & Familles Libres' },
      { id: 'chap-algebre-2', number: 2, title: 'Applications Linéaires & Matrices' },
      { id: 'chap-algebre-3', number: 3, title: 'Déterminants & Systèmes Linéaires' },
      { id: 'chap-algebre-4', number: 4, title: 'Diagonalisation & Valeurs Propres' }
    ]
  },
  {
    id: 'course-physique',
    code: 'PHYS101',
    name: 'Mécanique du Point & Systèmes',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Moreau',
    description: 'Cinématique, dynamique newtonienne, théorèmes énergétiques et oscillateurs.',
    credits: 6,
    chapters: [
      { id: 'chap-physique-1', number: 1, title: 'Cinématique du Point Matériel' },
      { id: 'chap-physique-2', number: 2, title: 'Dynamique Newtonienne & Théorèmes Généraux' },
      { id: 'chap-physique-3', number: 3, title: 'Travail, Énergie & Oscillateurs' },
      { id: 'chap-physique-4', number: 4, title: 'Mouvement à Force Centrale & Gravitation' }
    ]
  },
  {
    id: 'course-algo',
    code: 'INFO101',
    name: 'Algorithmique & Structures de Données',
    promotionId: 'promo-l2-info',
    professor: 'Pr. Girard',
    description: 'Complexité algorithmique, listes, arbres, graphes et algorithmes de tri.',
    credits: 6,
    chapters: [
      { id: 'chap-algo-1', number: 1, title: 'Complexité Algorithmique & Notations O' },
      { id: 'chap-algo-2', number: 2, title: 'Listes Chaînées, Piles & Files' },
      { id: 'chap-algo-3', number: 3, title: 'Arbres Binaires & Parcours' },
      { id: 'chap-algo-4', number: 4, title: 'Algorithmes de Tri & Diviser pour Régner' }
    ]
  },
  {
    id: 'course-elec',
    code: 'ELEC101',
    name: 'Électronique & Circuits RLC',
    promotionId: 'promo-l2-phys',
    professor: 'Dr. Dufour',
    description: 'Lois des circuits, régimes transitoires, régimes sinusoïdaux et filtres analogiques.',
    credits: 5,
    chapters: [
      { id: 'chap-elec-1', number: 1, title: 'Lois Fondamentales & Théorèmes des Circuits' },
      { id: 'chap-elec-2', number: 2, title: 'Régimes Transitoires RC et RL' },
      { id: 'chap-elec-3', number: 3, title: 'Circuits RLC & Facteur de Qualité' },
      { id: 'chap-elec-4', number: 4, title: 'Régime Sinusoïdal & Diagrammes de Bode' }
    ]
  }
];

const concepts = [
  { id: 'concept-ipp', title: 'Intégration par parties', courseId: 'course-analyse', chapterId: 'chap-analyse-1', description: 'Méthode d\'intégration utilisant la formule ∫ u·v\' = u·v - ∫ u\'·v' },
  { id: 'concept-edo2', title: 'Équations différentielles du 2nd ordre', courseId: 'course-analyse', chapterId: 'chap-analyse-2', description: 'Résolution avec équation caractéristique et discriminant' },
  { id: 'concept-diag', title: 'Diagonalisation de matrice', courseId: 'course-algebre', chapterId: 'chap-algebre-4', description: 'Recherche des valeurs propres det(A - λI) = 0 et vecteurs propres' },
  { id: 'concept-pfd', title: 'Principe Fondamental de la Dynamique (PFD)', courseId: 'course-physique', chapterId: 'chap-physique-2', description: 'Somme des forces = m·a dans un référentiel galiléen' },
  { id: 'concept-osc-amorti', title: 'Oscillateur harmonique amorti', courseId: 'course-physique', chapterId: 'chap-physique-3', description: 'Équation différentielle x\'\' + 2λω0 x\' + ω0² x = 0' },
  { id: 'concept-quicksort', title: 'Tri Rapide (Quicksort)', courseId: 'course-algo', chapterId: 'chap-algo-4', description: 'Algorithme de tri basé sur le paradigme Diviser pour Régner' }
];

const videos = [
  {
    id: 'vid-analyse-ipp',
    title: 'Démonstration & Application : Intégration par parties',
    courseId: 'course-analyse',
    conceptId: 'concept-ipp',
    duration: '14:20',
    professor: 'Dr. Laurent',
    url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'vid-phys-osc',
    title: 'Oscillateur Harmonique Amorti & Résonance',
    courseId: 'course-physique',
    conceptId: 'concept-osc-amorti',
    duration: '18:45',
    professor: 'Dr. Moreau',
    url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
  }
];

const resources = [
  // 1. Analyse - Cours
  {
    id: 'res-cours-analyse-1',
    title: 'Cours Magistral 01 : Calcul Intégral & Primitives',
    courseId: 'course-analyse',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Laurent',
    type: 'Supports de Cours',
    format: 'pdf',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Calcul Intégral & Primitives',
    hasCorrection: false,
    fileSize: '1.4 Mo',
    publishedAt: '12 Sept. 2024',
    content: `UNIVERSITÉ DES SCIENCES — DÉPARTEMENT DE MATHÉMATIQUES
COURS : ANALYSE MATHÉMATIQUE 1 (MATH101) — DR. LAURENT
CHAPITRE 1 : CALCUL INTÉGRAL & PRIMITIVES

1. RAPPEL ET DÉFINITION DE LA PRIMITIVE
Soit f : I -> R une fonction continue sur un intervalle I. Une fonction F : I -> R est une primitive de f sur I si F est dérivable sur I et pour tout x dans I : F'(x) = f(x).

2. THÉORÈME DE LA MOYENNE & INTÉGRALE DE RIEMANN
Pour toute fonction f continue sur [a, b], il existe c dans [a, b] tel que :
∫[a à b] f(t) dt = f(c) · (b - a)

3. MÉTHODE DE L'INTÉGRATION PAR PARTIES (IPP)
Soient u et v deux fonctions de classe C1 sur [a, b]. La formule fondamentale s'écrit :
∫[a à b] u(t)·v'(t) dt = [u(t)·v(t)][a à b] - ∫[a à b] u'(t)·v(t) dt

Règle pratique ALPES pour choisir u(t) :
- A : Arc-fonctions (Arctan, Arcsin)
- L : Logarithmes (ln(x))
- P : Polynômes (x^n, x² + 1)
- E : Exponentielles (e^x)
- S : Sinus et Cosinus trigonometriques

Exemple résolu : Calcul de ∫ x·e^(2x) dx
Posons u(x) = x (polynôme) => u'(x) = 1
Posons v'(x) = e^(2x) => v(x) = 1/2 · e^(2x)
Donc : ∫ x·e^(2x) dx = x/2 · e^(2x) - ∫ 1/2 · e^(2x) dx = (x/2 - 1/4)·e^(2x) + C.

4. INTÉGRATION PAR CHANGEMENT DE VARIABLE
Soit φ : [α, β] -> [a, b] une bijection de classe C1.
∫[a à b] f(x) dx = ∫[α à β] f(φ(t)) · φ'(t) dt.`
  },

  // 2. Analyse - Examen
  {
    id: 'res-exam-analyse-2025',
    title: 'Examen Final — Analyse Mathématique (Session Janvier 2025)',
    courseId: 'course-analyse',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Laurent',
    type: 'Examen',
    format: 'pdf',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Calcul Intégral & Primitives',
    hasCorrection: true,
    correctionId: 'res-corr-analyse-2025',
    fileSize: '420 Ko',
    publishedAt: '15 Janv. 2025',
    content: `UNIVERSITÉ DES SCIENCES — SESSION JANVIER 2025
ÉPREUVE D'ANALYSE MATHÉMATIQUE (MATH101) — DURÉE 2H00 — CALCULATRICE INTERDITE

EXERCICE 1 (6 POINTS) — CALCUL INTÉGRAL & PRIMITIVES
1. Calculer l'intégrale I1 = ∫[0 à 1] x · arctan(x) dx en utilisant une intégration par parties.
2. Décomposer en éléments simples la fraction rationnelle R(x) = (2x + 3) / (x² - 3x + 2).
3. En déduire la primitive J = ∫ R(x) dx sur l'intervalle ]2, +∞[.

EXERCICE 2 (7 POINTS) — ÉQUATIONS DIFFÉRENTIELLES DU 2ND ORDRE
On considère l'équation différentielle (E) : y''(t) - 4y'(t) + 4y(t) = 8e^(2t) + 4t.
1. Déterminer l'ensemble des solutions de l'équation homogène (E0) associée.
2. Déterminer une solution particulière yp1(t) pour le second membre f1(t) = 8e^(2t).
3. Déterminer une solution particulière yp2(t) pour le second membre f2(t) = 4t.
4. En déduire la solution générale de (E) vérifiant les conditions initiales y(0) = 1 et y'(0) = 0.

EXERCICE 3 (7 POINTS) — SÉRIES NUMÉRIQUES
Étudier la nature de la série de terme général un = (n! · 2^n) / n^n.`
  },

  // 3. Analyse - Corrigé
  {
    id: 'res-corr-analyse-2025',
    title: 'Corrigé Officiel Détaillé — Examen Analyse (Janvier 2025)',
    courseId: 'course-analyse',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Laurent',
    type: 'Corrigé',
    format: 'pdf',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Calcul Intégral & Primitives',
    hasCorrection: false,
    fileSize: '580 Ko',
    publishedAt: '18 Janv. 2025',
    content: `CORRIGÉ OFFICIEL DE L'EXAMEN D'ANALYSE (JANVIER 2025)

CORRECTION DE L'EXERCICE 1 :
1. Calcul de I1 = ∫[0 à 1] x · arctan(x) dx :
On pose :
- u(x) = arctan(x)  => u'(x) = 1 / (1 + x²)
- v'(x) = x         => v(x) = x² / 2

Par la formule d'intégration par parties :
I1 = [ (x² / 2) · arctan(x) ][0 à 1] - ∫[0 à 1] (x² / 2) · (1 / (1 + x²)) dx
I1 = (1/2) · arctan(1) - 0 - (1/2) · ∫[0 à 1] (x² + 1 - 1) / (x² + 1) dx
I1 = (1/2) · (π / 4) - (1/2) · ∫[0 à 1] (1 - 1/(x² + 1)) dx
I1 = π / 8 - (1/2) · [ x - arctan(x) ][0 à 1]
I1 = π / 8 - (1/2) · (1 - π / 4) = π / 8 - 1/2 + π / 8 = π / 4 - 1/2.
Résultat final : I1 = (π - 2) / 4 ≈ 0.2854.

2. Décomposition de R(x) = (2x + 3) / (x² - 3x + 2) :
Le dénominateur se factorise : x² - 3x + 2 = (x - 1)(x - 2).
R(x) = A / (x - 1) + B / (x - 2)
Par identification ou limites :
A = (2(1) + 3) / (1 - 2) = 5 / (-1) = -5
B = (2(2) + 3) / (2 - 1) = 7 / 1 = 7
D'où : R(x) = -5 / (x - 1) + 7 / (x - 2).

3. Primitive J sur ]2, +∞[ :
J(x) = ∫ (-5/(x - 1) + 7/(x - 2)) dx = -5·ln(x - 1) + 7·ln(x - 2) + C = ln((x - 2)^7 / (x - 1)^5) + C.`
  },

  // 4. Physique - Examen
  {
    id: 'res-exam-physique-2025',
    title: 'Partiel de Mécanique du Point — Oscillateur Harmonique Amorti',
    courseId: 'course-physique',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Moreau',
    type: 'Examen',
    format: 'pdf',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Travail, Énergie & Oscillateurs',
    hasCorrection: true,
    correctionId: 'res-corr-physique-2025',
    fileSize: '390 Ko',
    publishedAt: '20 Nov. 2024',
    content: `DÉPARTEMENT DE PHYSIQUE — LICENCE 1 SCIENCES
ÉPREUVE DE MÉCANIQUE DU POINT MATÉRIEL (PHYS101) — DR. MOREAU

PROBLÈME : ÉTUDE D'UN OSCILLATEUR HARMONIQUE AMORTI
Un point matériel M de masse m est astreint à se déplacer sans frottement solide le long d'un axe horizontal Ox. Il est relié à un ressort de constante de raideur k et de longueur à vide l0. Le point M subit en outre une force de frottement fluide de type visqueux : f = -h · v (avec h > 0).

1. Établir l'équation différentielle régissant la position x(t) du mobile en appliquant le Principe Fondamental de la Dynamique.
2. Mettre cette équation sous la forme canonique : x''(t) + 2·λ·x'(t) + ω0²·x(t) = 0. Exprimer λ et ω0 en fonction de m, h et k.
3. Définir le facteur de qualité Q du système.
4. On suppose le frottement faible (régime pseudo-périodique : λ < ω0). Donner l'expression générale de x(t) en faisant apparaître la pseudo-pulsation Ω.
5. Établir le bilan énergétique : calculer la dérivée temporelle de l'énergie mécanique totale Em(t) et interpréter physiquement son signe.`
  },

  // 5. Physique - Corrigé
  {
    id: 'res-corr-physique-2025',
    title: 'Corrigé Partiel Mécanique — Oscillateur Amorti & Bilan Énergétique',
    courseId: 'course-physique',
    promotionId: 'promo-l1-st',
    professor: 'Dr. Moreau',
    type: 'Corrigé',
    format: 'pdf',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Travail, Énergie & Oscillateurs',
    hasCorrection: false,
    fileSize: '450 Ko',
    publishedAt: '22 Nov. 2024',
    content: `CORRIGÉ TYPE DE MÉCANIQUE DU POINT (PHYS101)

1. APPLICATION DU PFD DANS LE RÉFÉRENTIEL DU LABORATOIRE (GALILÉEN) :
Bilan des forces appliquées à la masse m :
- Poids P = -m·g·uz
- Réaction du support R = R·uz (pas de frottement selon Oz)
- Force de rappel élastique : F_e = -k·x·ux
- Force de frottement visqueux : f = -h·(dx/dt)·ux

Projection sur l'axe horizontal Ox :
m · (d²x / dt²) = -k·x - h·(dx/dt)
Soit : m · x''(t) + h · x'(t) + k · x(t) = 0.

2. FORME CANONIQUE :
En divisant par la masse m :
x''(t) + (h/m)·x'(t) + (k/m)·x(t) = 0
Par identification avec x''(t) + 2λ·x'(t) + ω0²·x(t) = 0 :
- Pulsation propre : ω0 = √(k / m)
- Coefficient d'amortissement : λ = h / (2m)

3. FACTEUR DE QUALITÉ Q :
Q = ω0 / (2λ) = (√(k·m)) / h.

4. RÉGIME PSEUDO-PÉRIODIQUE (λ < ω0) :
Le discriminant réduit de l'équation caractéristique est Δ' = λ² - ω0² < 0.
Les racines sont complexes : r = -λ ± i·Ω avec la pseudo-pulsation Ω = √(ω0² - λ²).
La solution générale s'écrit :
x(t) = X0 · e^(-λ·t) · cos(Ω·t + φ0)

5. BILAN ÉNERGÉTIQUE :
Énergie mécanique totale : Em(t) = (1/2)·m·(x')² + (1/2)·k·x²
Dérivée par rapport au temps :
dEm/dt = m·x'·x'' + k·x·x' = x' · (m·x'' + k·x)
Or d'après le PFD, m·x'' + k·x = -h·x'.
D'où : dEm/dt = -h · (x')² ≤ 0.
Conclusion : L'énergie mécanique décroît strictement au cours du temps, dissipée sous forme de chaleur par effet de viscosité (frottement fluide).`
  },

  // 6. Algorithmique - TD & TP
  {
    id: 'res-td-algo-1',
    title: 'Fiche TD & TP 02 : Arbres Binaires de Recherche & Quicksort',
    courseId: 'course-algo',
    promotionId: 'promo-l2-info',
    professor: 'Pr. Girard',
    type: 'Exercices',
    format: 'code',
    academicYear: '2024-2025',
    semester: 'S1',
    chapter: 'Algorithmes de Tri & Diviser pour Régner',
    hasCorrection: true,
    fileSize: '180 Ko',
    publishedAt: '05 Oct. 2024',
    content: `// DÉPARTEMENT INFORMATIQUE — LICENCE 2
// MODULE INFO101 : ALGORITHMIQUE & STRUCTURES DE DONNÉES
// FICHE TD/TP 2 : ARBRES BINAIRES & TRI RAPIDE (C++ / PYTHON)

EXERCICE 1 : INSERTION ET RECHERCHE DANS UN ABR
Écrire la fonction récursive d'insertion d'une clé dans un Arbre Binaire de Recherche (ABR).
Montrer que la complexité moyenne est en O(log n) et donner le pire des cas (arbre dégénéré/peigne).

EXERCICE 2 : IMPLÉMENTATION DE QUICKSORT (PARTITION DE LOMUTO)
#include <vector>
#include <iostream>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
  }
];

// Combine all into the persistent JSON structure
const initialData = {
  promotions,
  courses,
  concepts,
  videos,
  resources,
  adminAgents: [
    {
      id: 'agent-1',
      name: 'Agent Alpha (Cours & Ingestion)',
      specialty: 'Supports de cours, syllabus & TPs',
      status: 'idle',
      apiKeyStatus: 'active (System Fallback Relay)',
      preferredModel: 'gemini-3.8-flash',
      jobsProcessed: 12,
      currentJobId: null,
      lastHeartbeat: new Date().toISOString(),
      lastError: null
    },
    {
      id: 'agent-2',
      name: 'Agent Bêta (Examens & Mathématiques)',
      specialty: 'Examens, Interrogations & Corrigés',
      status: 'idle',
      apiKeyStatus: 'active (System Fallback Relay)',
      preferredModel: 'gemini-3.8-flash',
      jobsProcessed: 18,
      currentJobId: null,
      lastHeartbeat: new Date().toISOString(),
      lastError: null
    },
    {
      id: 'agent-3',
      name: 'Agent Gamma (Contrôle & Qualité)',
      specialty: 'Classification, Déduplication & Tâches Ad-Hoc',
      status: 'idle',
      apiKeyStatus: 'active (System Fallback Relay)',
      preferredModel: 'gemini-3.1-flash-lite',
      jobsProcessed: 24,
      currentJobId: null,
      lastHeartbeat: new Date().toISOString(),
      lastError: null
    }
  ],
  jobs: [],
  studentProfiles: {
    'default-student': {
      studentId: 'default-student',
      levelDeclared: 6,
      masteryScores: {
        'concept-ipp': 0.75,
        'concept-pfd': 0.85,
        'concept-osc-amorti': 0.60
      },
      learningStateTree: {
        activeGoal: 'Maîtrise du Calcul Intégral & Primitives',
        activeNodeId: null,
        nodes: []
      },
      weakConcepts: ['concept-osc-amorti'],
      strongConcepts: ['concept-pfd', 'concept-ipp'],
      preferredExplanationStyle: 'Explications claires pas-à-pas avec exemples concrets'
    }
  },
  learningSessions: {},
  favorites: [],
  history: [],
  auditLogs: []
};

fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
console.log('Successfully seeded database with realistic academic courses and resources in', DATA_FILE);

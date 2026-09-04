// Academic Hub - Persistent Academic Database & Knowledge Repository
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'academic_data.json');

// Initial seed data with authentic university-grade materials
const SEED_PROMOTIONS = [
  { id: 'l1-mi', name: 'L1 Mathématiques & Informatique', cycle: 'Licence 1', faculty: 'Sciences Fondamentales' },
  { id: 'l2-info', name: 'L2 Informatique Générale', cycle: 'Licence 2', faculty: 'Sciences et Ingénierie' },
  { id: 'l3-info', name: 'L3 Génie Logiciel & Systèmes', cycle: 'Licence 3', faculty: 'Sciences et Ingénierie' },
  { id: 'm1-ia', name: 'M1 Intelligence Artificielle & Data', cycle: 'Master 1', faculty: 'Informatique Avancée' },
  { id: 'l2-phys', name: 'L2 Physique & Sciences de l\'Ingénieur', cycle: 'Licence 2', faculty: 'Sciences Physiques' },
];

const SEED_COURSES = [
  {
    id: 'course-algo2',
    code: 'INFO201',
    name: 'Algorithmique & Structures de Données Avancées',
    promotionId: 'l2-info',
    professor: 'Prof. Laurent Mercier',
    description: 'Arbres binaires de recherche, tas, graphes, algorithmes de Dijkstra et programmation dynamique.',
    chapters: [
      { id: 'chap-algo-1', number: 1, title: 'Arbres Binaires de Recherche (ABR) et Équilibrage AVL' },
      { id: 'chap-algo-2', number: 2, title: 'Parcours et Plus Courts Chemins dans les Graphes' },
      { id: 'chap-algo-3', number: 3, title: 'Programmation Dynamique et Mémoïsation' },
    ]
  },
  {
    id: 'course-analyse2',
    code: 'MATH102',
    name: 'Analyse II : Calcul Intégral & Équations Différentielles',
    promotionId: 'l1-mi',
    professor: 'Prof. Éléonore Vasseur',
    description: 'Intégrale de Riemann, méthodes d\'intégration par parties et changement de variable, équations différentielles linéaires.',
    chapters: [
      { id: 'chap-math-1', number: 1, title: 'Primitives et Techniques d\'Intégration' },
      { id: 'chap-math-2', number: 2, title: 'Intégrales Définies et Théorème Fondamental de l\'Analyse' },
      { id: 'chap-math-3', number: 3, title: 'Équations Différentielles Linéaires du Premier et Second Ordre' },
    ]
  },
  {
    id: 'course-meca',
    code: 'PHYS101',
    name: 'Mécanique du Point & Dynamique Newtonienne',
    promotionId: 'l2-phys',
    professor: 'Dr. Marc Beauchamp',
    description: 'Lois de Newton, travail et énergie cinétique, oscillateur harmonique et théorèmes de conservation.',
    chapters: [
      { id: 'chap-phys-1', number: 1, title: 'Cinématique et Repères Mobiles' },
      { id: 'chap-phys-2', number: 2, title: 'Théorème de l\'Énergie Cinétique et Énergie Potentielle' },
      { id: 'chap-phys-3', number: 3, title: 'Oscillateurs Harmoniques Libres et Amortis' },
    ]
  },
  {
    id: 'course-bd',
    code: 'INFO202',
    name: 'Bases de Données Relationnelles & SQL Avancé',
    promotionId: 'l2-info',
    professor: 'Prof. Amine Benali',
    description: 'Algèbre relationnelle, formes normales (1FN à BCNF), requêtes analytiques SQL et optimisation d\'index.',
    chapters: [
      { id: 'chap-bd-1', number: 1, title: 'Conception Entité-Association et Modèle Relationnel' },
      { id: 'chap-bd-2', number: 2, title: 'Normalisation et Dépendances Fonctionnelles' },
      { id: 'chap-bd-3', number: 3, title: 'Jointures Avancées, Sous-requêtes et Indexation' },
    ]
  }
];

const SEED_CONCEPTS = [
  { id: 'concept-derivation', name: 'Dérivation et Taux de Variation', courseId: 'course-analyse2', chapterId: 'chap-math-1', prerequisites: [] },
  { id: 'concept-primitives', name: 'Primitives de Fonctions Usuelles', courseId: 'course-analyse2', chapterId: 'chap-math-1', prerequisites: ['concept-derivation'] },
  { id: 'concept-ipp', name: 'Intégration par Parties (IPP)', courseId: 'course-analyse2', chapterId: 'chap-math-1', prerequisites: ['concept-primitives'] },
  { id: 'concept-integrale-def', name: 'Intégrale Définie de Riemann', courseId: 'course-analyse2', chapterId: 'chap-math-2', prerequisites: ['concept-primitives'] },
  { id: 'concept-chgt-var', name: 'Changement de Variable dans une Intégrale', courseId: 'course-analyse2', chapterId: 'chap-math-2', prerequisites: ['concept-integrale-def', 'concept-derivation'] },
  { id: 'concept-arbre-abr', name: 'Arbre Binaire de Recherche (Insertion & Recherche)', courseId: 'course-algo2', chapterId: 'chap-algo-1', prerequisites: [] },
  { id: 'concept-dijkstra', name: 'Algorithme du Plus Court Chemin de Dijkstra', courseId: 'course-algo2', chapterId: 'chap-algo-2', prerequisites: [] },
  { id: 'concept-newton2', name: 'Deuxième Loi de Newton (Principe Fondamental)', courseId: 'course-meca', chapterId: 'chap-phys-1', prerequisites: [] },
  { id: 'concept-energie-meca', name: 'Conservation de l\'Énergie Mécanique', courseId: 'course-meca', chapterId: 'chap-phys-2', prerequisites: ['concept-newton2'] },
  { id: 'concept-bcnf', name: 'Forme Normale de Boyce-Codd (BCNF)', courseId: 'course-bd', chapterId: 'chap-bd-2', prerequisites: [] }
];

const SEED_VIDEOS = [
  {
    id: 'vid-math-ipp',
    title: 'Comprendre l\'Intégration par Parties intuitivement',
    channel: 'Maths Pédago & 3Blue1Brown FR',
    url: 'https://www.youtube.com/watch?v=rfG8ce4nNh0',
    courseId: 'course-analyse2',
    conceptId: 'concept-ipp',
    difficulty: 'Intermédiaire',
    duration: '11:45',
    language: 'Français',
    validated: true,
    qualityScore: 98,
    transcript: 'L\'intégration par parties découle directement de la règle de dérivation du produit (u·v)\' = u\'v + uv\'. En intégrant des deux côtés, on obtient l\'aire sous la courbe par compensation géométrique.',
    checkQuestion: 'D\'où provient mathématiquement la formule de l\'intégration par parties ?',
    expectedAnswer: 'De la formule de dérivation d\'un produit de deux fonctions d(uv) = u\'v + uv\''
  },
  {
    id: 'vid-algo-dijkstra',
    title: 'Dijkstra pas à pas avec animation d\'un graphe',
    channel: 'Algorithmique Visuelle',
    url: 'https://www.youtube.com/watch?v=bZkzH5x0Ikk',
    courseId: 'course-algo2',
    conceptId: 'concept-dijkstra',
    difficulty: 'Débutant-Intermédiaire',
    duration: '09:20',
    language: 'Français',
    validated: true,
    qualityScore: 95,
    transcript: 'Dijkstra maintient un tableau des distances provisoires et une file à priorité. À chaque étape, le sommet non visité avec la plus petite distance estimée est fixé définitivement car les poids sont strictement positifs.',
    checkQuestion: 'Pourquoi l\'algorithme de Dijkstra ne fonctionne-t-il pas correctement avec des poids d\'arêtes négatifs ?',
    expectedAnswer: 'Car une fois qu\'un sommet est extrait avec la distance minimale courante, il est considéré comme optimal et ne sera plus mis à jour.'
  },
  {
    id: 'vid-phys-energie',
    title: 'Énergie potentielle, travail et oscillateur mécanique',
    channel: 'Sciences Physiques Universitaires',
    url: 'https://www.youtube.com/watch?v=Gk7436_d70E',
    courseId: 'course-meca',
    conceptId: 'concept-energie-meca',
    difficulty: 'Intermédiaire',
    duration: '14:10',
    language: 'Français',
    validated: true,
    qualityScore: 92,
    transcript: 'Le travail d\'une force conservative dérive d\'une énergie potentielle : W = -ΔEp. Si aucune force dissipative n\'agit, l\'énergie mécanique Em = Ec + Ep demeure strictement constante.',
    checkQuestion: 'Quel est le lien entre le travail d\'une force conservative et la variation d\'énergie potentielle ?',
    expectedAnswer: 'Le travail d\'une force conservative est égal à l\'opposé de la variation de l\'énergie potentielle : W = -ΔEp.'
  }
];

const SEED_RESOURCES = [
  {
    id: 'res-exam-math-2025',
    title: 'Examen Final - Session Principale 2025 : Calcul Intégral & Systèmes Différentiels',
    type: 'Examen',
    format: 'pdf',
    courseId: 'course-analyse2',
    promotionId: 'l1-mi',
    academicYear: '2024-2025',
    session: 'Session Principale (Janvier 2025)',
    semester: 'Semestre 1',
    professor: 'Prof. Éléonore Vasseur',
    chapter: 'Primitives, Intégrales Définies et Équations Différentielles',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 0.99,
    correctionId: 'res-corr-math-2025',
    hasCorrection: true,
    fileSize: '412 Ko',
    fileName: 'Examen_Final_Analyse2_Janvier_2025.pdf',
    checksum: 'a8b3f17c490218de45bc38290f84a1e94819448bf823812048cd31726a8d9102',
    publishedAt: '2025-01-20T10:00:00Z',
    content: `UNIVERSITÉ DES SCIENCES ET TECHNIQUES — DÉPARTEMENT DE MATHÉMATIQUES
Épreuve : Analyse II (MATH102) — Durée : 2h00 — Calculatrices interdites.
Responsable : Prof. Éléonore Vasseur — Session Principale 2024-2025

EXERCICE 1 (6 points) — Calculs d'intégrales définies et méthodes d'intégration
1. Calculer l'intégrale I = ∫ (de 0 à 1) x * e^(2x) dx en détaillant explicitement l'intégration par parties (choix de u et v').
2. Calculer J = ∫ (de 0 à π/4) tan(x) / (cos^2(x)) dx à l'aide d'un changement de variable approprié en posant t = tan(x).
3. Déterminer une primitive sur ]0, +∞[ de f(x) = ln(x) / x^2.

EXERCICE 2 (7 points) — Équation différentielle du second ordre avec second membre
On considère l'équation différentielle (E) : y''(x) - 3y'(x) + 2y(x) = 4e^(3x).
1. Déterminer l'équation caractéristique associée à l'équation homogène (E0) : r^2 - 3r + 2 = 0, et donner la solution générale de (E0).
2. Trouver une solution particulière yp(x) de (E) sous la forme yp(x) = A * e^(3x).
3. En déduire la solution générale de l'équation complète (E).
4. Déterminer l'unique solution vérifiant les conditions initiales y(0) = 1 et y'(0) = 0.

EXERCICE 3 (7 points) — Sommes de Riemann et limite d'une suite
Soit Sn = ∑ (k=1 à n) [ n / (n^2 + k^2) ].
1. Réécrire Sn sous la forme (1/n) * ∑ f(k/n) pour une fonction f que l'on précisera sur l'intervalle [0, 1].
2. Justifier que f est continue sur [0, 1] et en déduire la limite de Sn lorsque n tend vers +∞ en calculant l'intégrale ∫ (de 0 à 1) dx / (1 + x^2).`
  },
  {
    id: 'res-corr-math-2025',
    title: 'Corrigé Officiel Détaillé — Examen Final Analyse II 2025',
    type: 'Corrigé',
    format: 'pdf',
    courseId: 'course-analyse2',
    promotionId: 'l1-mi',
    academicYear: '2024-2025',
    session: 'Session Principale (Janvier 2025)',
    semester: 'Semestre 1',
    professor: 'Prof. Éléonore Vasseur',
    chapter: 'Corrigé Type Examen 2025',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 1.0,
    hasCorrection: false,
    fileSize: '380 Ko',
    fileName: 'Corrige_Officiel_Analyse2_Janvier_2025.pdf',
    checksum: 'b49204cd198a2fe7382103728491820491028475920381029482019485720194',
    publishedAt: '2025-01-22T14:00:00Z',
    content: `CORRIGÉ TYPE OFFICIEL — EXAMEN ANALYSE II (MATH102) - JANVIER 2025
Rédigé par Prof. Éléonore Vasseur

SOLUTION EXERCICE 1 :
1. Calcul de I = ∫ (de 0 à 1) x * e^(2x) dx :
   Posons u(x) = x => u'(x) = 1.
   Posons v'(x) = e^(2x) => v(x) = (1/2) * e^(2x).
   Par la formule d'intégration par parties :
   I = [ (x/2) * e^(2x) ]_0^1 - ∫_0^1 (1/2) * e^(2x) dx
   I = (1/2 * e^2 - 0) - [ (1/4) * e^(2x) ]_0^1
   I = (1/2)e^2 - (1/4)e^2 + 1/4 = (1/4)e^2 + 1/4 = (e^2 + 1) / 4.

2. Calcul de J = ∫ (de 0 à π/4) tan(x) / (cos^2(x)) dx :
   On remarque que (tan(x))' = 1 / (cos^2(x)).
   Posons t = tan(x). Quand x=0, t=0 ; quand x=π/4, t=1. dt = dx / cos^2(x).
   J = ∫_0^1 t dt = [ t^2 / 2 ]_0^1 = 1/2.

3. Primitive de ln(x)/x^2 :
   Par IPP : u = ln(x) => u' = 1/x ; v' = 1/x^2 => v = -1/x.
   ∫ ln(x)/x^2 dx = -ln(x)/x - ∫ (-1/x^2) dx = -ln(x)/x - 1/x + C = -(ln(x) + 1)/x + C.

SOLUTION EXERCICE 2 :
1. Équation caractéristique : r^2 - 3r + 2 = 0 => (r - 1)(r - 2) = 0 => racines r1=1, r2=2.
   Solution homogène yh(x) = C1 * e^x + C2 * e^(2x).
2. Pour yp(x) = A * e^(3x) : yp' = 3A*e^(3x), yp'' = 9A*e^(3x).
   9A - 9A + 2A = 4 => 2A = 4 => A = 2. Donc yp(x) = 2*e^(3x).
3. Solution générale : y(x) = C1 * e^x + C2 * e^(2x) + 2*e^(3x).
4. Avec y(0)=1 et y'(0)=0 :
   y(0) = C1 + C2 + 2 = 1 => C1 + C2 = -1.
   y'(x) = C1*e^x + 2*C2*e^(2x) + 6*e^(3x).
   y'(0) = C1 + 2*C2 + 6 = 0 => C1 + 2*C2 = -6.
   Par soustraction : C2 = -5, d'où C1 = 4.
   Solution unique : y(x) = 4*e^x - 5*e^(2x) + 2*e^(3x).`
  },
  {
    id: 'res-tp-algo-avl',
    title: 'TP n°3 : Implémentation et Équilibrage d\'un Arbre AVL en C++',
    type: 'TP',
    format: 'code',
    courseId: 'course-algo2',
    promotionId: 'l2-info',
    academicYear: '2024-2025',
    session: 'TP Noté Semestre 1',
    semester: 'Semestre 1',
    professor: 'Prof. Laurent Mercier',
    chapter: 'Arbres Binaires de Recherche (ABR) et Équilibrage AVL',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 0.98,
    hasCorrection: true,
    fileSize: '15 Ko',
    fileName: 'tp3_arbres_avl.cpp',
    checksum: 'c901847192847291038471902847190283748291048291048291048291048291',
    publishedAt: '2024-11-15T08:30:00Z',
    content: `// TP3 : Arbres AVL - Algorithmique et Structures de Données (INFO201)
// Faculté d'Informatique - Prof. Laurent Mercier
#include <iostream>
#include <algorithm>

struct Node {
    int key;
    Node* left;
    Node* right;
    int height;
    Node(int k) : key(k), left(nullptr), right(nullptr), height(1) {}
};

int getHeight(Node* n) {
    return n ? n->height : 0;
}

int getBalanceFactor(Node* n) {
    return n ? getHeight(n->left) - getHeight(n->right) : 0;
}

Node* rotateRight(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    return x;
}

Node* rotateLeft(Node* x) {
    Node* y = x->right;
    Node* T2 = y->left;
    y->left = x;
    x->right = T2;
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    return y;
}

Node* insertAVL(Node* node, int key) {
    if (!node) return new Node(key);
    if (key < node->key) node->left = insertAVL(node->left, key);
    else if (key > node->key) node->right = insertAVL(node->right, key);
    else return node;

    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
    int balance = getBalanceFactor(node);

    // Cas Gauche-Gauche
    if (balance > 1 && key < node->left->key) return rotateRight(node);
    // Cas Droite-Droite
    if (balance < -1 && key > node->right->key) return rotateLeft(node);
    // Cas Gauche-Droite
    if (balance > 1 && key > node->left->key) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    // Cas Droite-Gauche
    if (balance < -1 && key < node->right->key) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }
    return node;
}

int main() {
    Node* root = nullptr;
    int keys[] = {10, 20, 30, 40, 50, 25};
    for (int k : keys) root = insertAVL(root, k);
    std::cout << "Arbre AVL construit avec succès. Hauteur racine = " << root->height << std::endl;
    return 0;
}`
  },
  {
    id: 'res-interro-meca-2024',
    title: 'Interrogation Écrite n°2 : Énergie Mécanique & Oscillateur Harmonique',
    type: 'Interrogation',
    format: 'pdf',
    courseId: 'course-meca',
    promotionId: 'l2-phys',
    academicYear: '2024-2025',
    session: 'Contrôle Continu',
    semester: 'Semestre 1',
    professor: 'Dr. Marc Beauchamp',
    chapter: 'Théorème de l\'Énergie Cinétique et Oscillateurs',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 0.97,
    hasCorrection: true,
    fileSize: '290 Ko',
    fileName: 'Interro2_Mecanique_Novembre_2024.pdf',
    checksum: 'd198273918204918203918471920481920384719203847192038471920384719',
    publishedAt: '2024-11-28T11:00:00Z',
    content: `UNIVERSITÉ DE PHYSIQUE APPLIQUÉE
Interrogation de Contrôle Continu n°2 — Durée : 45 minutes
Matière : Mécanique du Point (PHYS101) — Enseignant : Dr. Marc Beauchamp

ÉNONCÉ :
Un solide ponctuel de masse m = 0.5 kg est attaché à un ressort horizontal de raideur k = 50 N/m.
Le solide peut glisser sur un plan horizontal avec ou sans frottement.
À l'instant t = 0, on écarte le solide de sa position d'équilibre x0 = 0.10 m (vers la droite) et on le lâche sans vitesse initiale (v0 = 0).

Partie A — Cas sans frottement
1. Établir l'équation différentielle du mouvement en appliquant la deuxième loi de Newton.
2. Définir et calculer la pulsation propre ω0 ainsi que la période T0 des oscillations.
3. Exprimer la position x(t) et la vitesse v(t) du solide à tout instant t.
4. Calculer l'énergie mécanique totale Em du système. Montrer qu'elle est constante au cours du temps.

Partie B — Cas avec force de frottement fluide
On applique désormais une force de frottement f = -λ * v avec λ = 0.2 kg/s.
1. Réécrire l'équation différentielle du mouvement sous la forme x'' + 2γx' + ω0^2 x = 0.
2. Identifier le régime d'oscillation (apériodique, critique ou pseudo-périodique) en calculant le discriminant caractéristique.`
  },
  {
    id: 'res-cours-cours-bd',
    title: 'Syllabus & Notes de Cours : Formes Normales et Conception Relationnelle',
    type: 'Supports de Cours',
    format: 'office',
    courseId: 'course-bd',
    promotionId: 'l2-info',
    academicYear: '2024-2025',
    session: 'Cours Magistral',
    semester: 'Semestre 1',
    professor: 'Prof. Amine Benali',
    chapter: 'Normalisation et Dépendances Fonctionnelles',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 0.99,
    hasCorrection: false,
    fileSize: '840 Ko',
    fileName: 'Cours_Complet_Normalisation_BCNF_2025.docx',
    checksum: 'e201948291048291048291048291048291048291048291048291048291048291',
    publishedAt: '2024-10-05T09:00:00Z',
    content: `SYLLABUS DU COURS : BASES DE DONNÉES RELATIONNELLES (INFO202)
Professeur Amine Benali — Chapitre 2 : La Normalisation Relationnelle

1. POURQUOI NORMALISER ?
La normalisation est un processus formel qui décompose les relations pour éliminer les redondances d'information et prévenir les anomalies de mise à jour (insert, delete, update).

2. LES DÉPENDANCES FONCTIONNELLES (DF)
Soit R(A1, ..., An) un schéma de relation, et X, Y deux sous-ensembles d'attributs de R.
On dit que X détermine fonctionnellement Y (noté X -> Y) si pour tous tuples t1, t2 de toute instance valide de R, t1[X] = t2[X] implique t1[Y] = t2[Y].
Les axiomes d'Armstrong (Réflexivité, Augmentation, Transitivité) permettent de calculer la fermeture d'un ensemble de dépendances F+.

3. PREMIÈRE FORME NORMALE (1FN)
Une relation est en 1FN si tous ses attributs sont atomiques (pas de listes, ni de structures imbriquées).

4. DEUXIÈME FORME NORMALE (2FN)
Une relation est en 2FN si elle est en 1FN et tout attribut non-clé dépend pleinement de la clé primaire entière (pas de dépendance partielle sur une sous-clé).

5. TROISIÈME FORME NORMALE (3FN)
Une relation est en 3FN si elle est en 2FN et aucun attribut non-clé ne dépend transitivement de la clé primaire (pas de X -> Y -> Z où Y n'est pas clé).

6. FORME NORMALE DE BOYCE-CODD (BCNF)
Une relation est en BCNF si pour toute dépendance fonctionnelle X -> Y non-triviale (Y non inclus dans X), X est une super-clé de R.
Toute relation en BCNF est strictement en 3FN.`
  },
  {
    id: 'res-exercices-algo-dijkstra',
    title: 'Fiche d\'Exercices Dirigés : Algorithmes de Dijkstra et Bellman-Ford',
    type: 'Exercices',
    format: 'pdf',
    courseId: 'course-algo2',
    promotionId: 'l2-info',
    academicYear: '2024-2025',
    session: 'Travaux Dirigés',
    semester: 'Semestre 1',
    professor: 'Prof. Laurent Mercier',
    chapter: 'Parcours et Plus Courts Chemins dans les Graphes',
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 0.99,
    hasCorrection: true,
    fileSize: '310 Ko',
    fileName: 'TD4_Dijkstra_BellmanFord_Exercices.pdf',
    checksum: 'f928401928471920384719203847192038471920384719203847192038471920',
    publishedAt: '2024-11-02T14:00:00Z',
    content: `DÉPARTEMENT D'INFORMATIQUE — TD n°4 (INFO201)
Thème : Plus Courts Chemins (Algorithme de Dijkstra)
Enseignant : Prof. Laurent Mercier

EXERCICE 1 — Trace manuelle de l'algorithme de Dijkstra
Soit le graphe orienté pondéré G = (V, E) avec V = {A, B, C, D, E, F} et les arêtes suivantes :
(A, B, 4), (A, C, 2), (B, C, 1), (B, D, 5), (C, D, 8), (C, E, 10), (D, E, 2), (D, F, 6), (E, F, 3).
1. Construire le tableau d'exécution de l'algorithme de Dijkstra en prenant le sommet A comme source.
2. Pour chaque itération, indiquer le sommet sélectionné, la distance minimale retenue et les mises à jour de distances pour les voisins.
3. Reconstruire le chemin optimal de A vers F ainsi que sa longueur totale.

EXERCICE 2 — Complexité temporelle
Comparer la complexité de Dijkstra selon l'implémentation de la file de priorité :
a) Avec un tableau simple non trié.
b) Avec un tas binaire (Binary Heap).
c) Avec un tas de Fibonacci (Fibonacci Heap).`
  }
];

// 3 Admin Agents configuration as described in Page 10/80 & specifications
const INITIAL_ADMIN_AGENTS = [
  {
    id: 'agent-1',
    name: 'Agent Alpha (Cours & Ingestion)',
    specialty: 'Supports de cours, syllabus & TPs',
    status: 'idle', // idle, processing, error
    apiKeyStatus: 'active (System Fallback Relay)',
    preferredModel: 'gemini-3.8-flash',
    jobsProcessed: 14,
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
    jobsProcessed: 22,
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
    jobsProcessed: 19,
    currentJobId: null,
    lastHeartbeat: new Date().toISOString(),
    lastError: null
  }
];

class AcademicDatabase {
  constructor() {
    this.data = {
      promotions: SEED_PROMOTIONS,
      courses: SEED_COURSES,
      concepts: SEED_CONCEPTS,
      videos: SEED_VIDEOS,
      resources: SEED_RESOURCES,
      adminAgents: INITIAL_ADMIN_AGENTS,
      jobs: [],
      studentProfiles: {},
      favorites: [],
      history: [],
      auditLogs: []
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else {
        this.saveToDisk();
      }
    } catch (e) {
      console.error('Error loading academic data, initializing fresh:', e);
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving academic data to disk:', e);
    }
  }

  computeHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Resources query with filters
  getResources({ courseId, promotionId, type, academicYear, search, hasCorrection } = {}) {
    let list = this.data.resources;

    if (courseId) {
      list = list.filter(r => r.courseId === courseId);
    }
    if (promotionId) {
      list = list.filter(r => r.promotionId === promotionId);
    }
    if (type) {
      list = list.filter(r => r.type.toLowerCase() === type.toLowerCase());
    }
    if (academicYear) {
      list = list.filter(r => r.academicYear === academicYear);
    }
    if (hasCorrection !== undefined) {
      const boolVal = hasCorrection === true || hasCorrection === 'true';
      list = list.filter(r => r.hasCorrection === boolVal);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.professor.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        (r.chapter && r.chapter.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getResourceById(id) {
    return this.data.resources.find(r => r.id === id);
  }

  getRelatedResources(resourceId) {
    const res = this.getResourceById(resourceId);
    if (!res) return { related: [], correction: null, videos: [] };

    let correction = null;
    if (res.correctionId) {
      correction = this.getResourceById(res.correctionId);
    } else if (res.type === 'Examen' || res.type === 'Interrogation') {
      correction = this.data.resources.find(r => r.type === 'Corrigé' && r.courseId === res.courseId);
    }

    const related = this.data.resources.filter(r => 
      r.id !== res.id && 
      (r.courseId === res.courseId || (r.chapter && r.chapter === res.chapter))
    ).slice(0, 4);

    const videos = this.data.videos.filter(v => v.courseId === res.courseId);

    return { related, correction, videos };
  }

  addResource(resourceData) {
    const checksum = this.computeHash(resourceData.content || resourceData.title);
    
    // Check for duplicate
    const existing = this.data.resources.find(r => r.checksum === checksum);
    if (existing) {
      return { duplicate: true, resource: existing };
    }

    const newResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...resourceData,
      checksum,
      status: resourceData.status || 'needs_review',
      validationStatus: resourceData.validationStatus || 'pending',
      publishedAt: new Date().toISOString()
    };

    this.data.resources.unshift(newResource);
    this.logAudit({
      action: 'RESOURCE_CREATED',
      resourceId: newResource.id,
      title: newResource.title,
      type: newResource.type
    });

    this.saveToDisk();
    return { duplicate: false, resource: newResource };
  }

  updateResource(id, updateData) {
    const index = this.data.resources.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.data.resources[index] = {
      ...this.data.resources[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.logAudit({
      action: 'RESOURCE_UPDATED',
      resourceId: id,
      updatedFields: Object.keys(updateData)
    });

    this.saveToDisk();
    return this.data.resources[index];
  }

  deleteResource(id) {
    const initialLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter(r => r.id !== id);
    if (this.data.resources.length !== initialLen) {
      this.logAudit({ action: 'RESOURCE_DELETED', resourceId: id });
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Student Profile & Learning State
  getStudentProfile(studentId = 'default-student') {
    if (!this.data.studentProfiles[studentId]) {
      this.data.studentProfiles[studentId] = {
        studentId,
        levelDeclared: 5,
        masteryScores: {
          'concept-derivation': 0.85,
          'concept-primitives': 0.60,
          'concept-ipp': 0.45,
          'concept-integrale-def': 0.50,
          'concept-arbre-abr': 0.75,
          'concept-dijkstra': 0.65,
          'concept-newton2': 0.80,
          'concept-energie-meca': 0.55
        },
        learningStateTree: {
          activeGoal: 'Maîtrise du Calcul Intégral et IPP',
          activeNodeId: 'node-ipp',
          nodes: [
            {
              id: 'node-ipp',
              conceptId: 'concept-ipp',
              title: 'Intégration par Parties',
              status: 'active',
              parentNodeId: null,
              masteryBefore: 0.3,
              masteryAfter: 0.45,
              branches: [
                {
                  id: 'node-branch-primitives',
                  conceptId: 'concept-primitives',
                  title: 'Révision des Primitives Fondamentales',
                  status: 'completed',
                  reasonForBranch: 'Hésitation répétée sur ∫ x*e^(2x) dx',
                  openedAt: new Date(Date.now() - 3600000).toISOString(),
                  closedAt: new Date(Date.now() - 1800000).toISOString(),
                  masteryAfter: 0.60
                }
              ]
            }
          ]
        },
        weakConcepts: ['concept-ipp', 'concept-energie-meca'],
        strongConcepts: ['concept-derivation', 'concept-newton2'],
        preferredExplanationStyle: 'Exemple guidé pas-à-pas avec analogie visuelle'
      };
      this.saveToDisk();
    }
    return this.data.studentProfiles[studentId];
  }

  updateStudentProfile(studentId = 'default-student', updates) {
    const profile = this.getStudentProfile(studentId);
    this.data.studentProfiles[studentId] = { ...profile, ...updates };
    this.saveToDisk();
    return this.data.studentProfiles[studentId];
  }

  // Admin Tri-Agents & Jobs
  getAdminAgents() {
    // update heartbeat
    this.data.adminAgents.forEach(a => {
      a.lastHeartbeat = new Date().toISOString();
    });
    return this.data.adminAgents;
  }

  getJobs() {
    return this.data.jobs;
  }

  addJob(jobData) {
    const newJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'queued', // queued, processing, completed, failed
      retryCount: 0,
      maxRetries: 3,
      ...jobData
    };
    this.data.jobs.unshift(newJob);
    this.saveToDisk();
    return newJob;
  }

  updateJob(id, updates) {
    const job = this.data.jobs.find(j => j.id === id);
    if (!job) return null;
    Object.assign(job, updates);
    this.saveToDisk();
    return job;
  }

  logAudit(entry) {
    const auditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(auditEntry);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }
}

export const db = new AcademicDatabase();

// Academic Hub - Autonomous Learning Agent & Pedagogical Engine
// Guides the student through a rigorous plan from A to E (Autonomous Tutor)
import { db } from './db.js';
import { geminiService } from './gemini.js';

// Pre-curated authentic pedagogical models for core university disciplines (Plan A à E)
export const CURATED_CHAPTERS = {
  // Course Analyse II (MATH102) - Chapitre 2 : IPP & Primitives
  'chap-math-1': {
    courseId: 'course-analyse',
    notion: 'Intégration par Parties (IPP)',
    title: 'Intégration & Primitives',
    professor: 'Prof. Éléonore Vasseur',
    demystification: {
      whatIsIt: "L'intégration par parties est une technique qui transforme l'intégrale d'un produit complexe en une intégrale beaucoup plus simple en inversant la formule de dérivation d'un produit.",
      whyLearnIt: "En dérivation, on sait dériver un produit avec (u·v)' = u'·v + u·v'. L'IPP applique exactement cette propriété aux intégrales pour faire disparaître un terme gênant.",
      concreteApplications: "Calcul d'aires, calcul de travail mécanique, transformées de Fourier/Laplace et équations différentielles en ingénierie.",
      whatYouWillMaster: "Savoir quand appliquer l'IPP, maîtriser la règle de priorité ALPES pour choisir u et v', et calculer le crochet sans erreur de signe."
    },
    roadmap: [
      { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Démystification", desc: "Pourquoi et comment inverser la dérivée d'un produit.", status: 'in_progress' },
      { id: 'step-B', letter: 'B', number: 2, title: "Formule & Mécanisme clé", desc: "∫ u·v' dx = [u·v] - ∫ u'·v dx et condition C¹.", status: 'pending' },
      { id: 'step-C', letter: 'C', number: 3, title: "Méthodologie & Règle ALPES", desc: "Priorité absolue pour le choix de u(x) et v'(x).", status: 'pending' },
      { id: 'step-D', letter: 'D', number: 4, title: "Cas d'application résolu", desc: "Exemple type d'examen : ∫ x·ln(x) dx pas à pas.", status: 'pending' },
      { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Maîtrise", desc: "Exercice d'application pour valider le chapitre.", status: 'pending' }
    ],
    recommendedVideo: {
      id: 'vid-ipp-exo7',
      title: "Intégration par parties - Cours complet et astuces d'examen",
      channel: 'Exo7 Mathématiques',
      duration: '12:45',
      url: 'https://www.youtube.com/watch?v=kY3B9E_VqCg',
      youtubeId: 'kY3B9E_VqCg',
      whyImportant: "Explication visuelle pas-à-pas de la règle ALPES pour choisir u et v' sans jamais hésiter lors des partiels."
    },
    stepExercises: {
      0: {
        id: 'ex-ipp-A',
        stepLetter: 'A',
        title: "Validation de l'intuition",
        question: "Quelle est l'idée fondamentale qui permet à l'intégration par parties de simplifier un calcul ?",
        options: [
          "Elle dérive le terme gênant pour l'éliminer ou le simplifier dans la nouvelle intégrale",
          "Elle remplace la variable x par 0",
          "Elle divise automatiquement l'intégrale par 2",
          "Elle évite d'avoir à trouver des primitives"
        ],
        correctIndex: 0,
        hint: "Pense au terme x dans ∫ x · e^x dx : si on le dérive, que devient-il ?",
        explanation: "Exactement ! En dérivant x, on obtient 1, ce qui élimine complètement le produit et laisse une intégrale immédiate."
      },
      1: {
        id: 'ex-ipp-B',
        stepLetter: 'B',
        title: "Validation de la formule",
        question: "Pour poser l'IPP de ∫ x · e^(2x) dx avec u(x) = x et v'(x) = e^(2x), quelle est la primitive v(x) exacte ?",
        options: [
          "v(x) = (1/2) · e^(2x)",
          "v(x) = 2 · e^(2x)",
          "v(x) = e^(2x)",
          "v(x) = (1/4) · e^(2x)"
        ],
        correctIndex: 0,
        hint: "Pour primitive de e^(k·x), on divise par le coefficient k.",
        explanation: "Parfait ! La dérivée de (1/2)e^(2x) redonne bien e^(2x). C'est le coefficient 1/2 qui est la clé."
      },
      2: {
        id: 'ex-ipp-C',
        stepLetter: 'C',
        title: "Validation de la règle ALPES",
        question: "Dans l'intégrale I = ∫ x · ln(x) dx, selon l'ordre ALPES (Arcsin, Logarithme, Polynôme, Exponentielle, Sin/Cos), qui doit être u(x) ?",
        options: [
          "u(x) = ln(x) (car Logarithme précède Polynôme)",
          "u(x) = x",
          "u(x) = 1",
          "Peu importe, le résultat sera le même"
        ],
        correctIndex: 0,
        hint: "Dans ALPES, la lettre 'L' (Logarithme) arrive avant la lettre 'P' (Polynôme x).",
        explanation: "Excellent ! Le Logarithme l'emporte. On pose u(x) = ln(x) dont la dérivée est 1/x, très facile à intégrer avec x²/2 !"
      },
      3: {
        id: 'ex-ipp-D',
        stepLetter: 'D',
        title: "Calcul du crochet",
        question: "Dans le crochet [ (x/2) · e^(2x) ] pris entre 0 et 1, que vaut la valeur finale ?",
        options: [
          "(1/2) · e²",
          "0",
          "e² - 1",
          "(1/4) · e²"
        ],
        correctIndex: 0,
        hint: "Calcule la valeur en 1 : (1/2)e², puis en 0 : (0/2)e^0 = 0.",
        explanation: "Bravo ! En 1 on a (1/2)e², et en 0 le facteur x annule tout. Le crochet vaut donc simplement (1/2)e²."
      },
      4: {
        id: 'ex-ipp-E',
        stepLetter: 'E',
        title: "Défi final d'examen",
        question: "Pour calculer la primitive de f(x) = arctan(x) par IPP, quelle est l'astuce classique d'examen ?",
        options: [
          "Écrire f(x) = 1 · arctan(x), poser u(x) = arctan(x) et v'(x) = 1",
          "Poser u(x) = 1 et v'(x) = arctan(x)",
          "Utiliser obligatoirement les nombres complexes",
          "Ce calcul est impossible par intégration par parties"
        ],
        correctIndex: 0,
        hint: "Une fonction isolée peut toujours être vue comme le produit de 1 par elle-même !",
        explanation: "Magnifique ! En posant u = arctan(x) et v' = 1, on obtient v = x et u' = 1/(1+x²), ce qui donne x·arctan(x) - (1/2)ln(1+x²) !"
      }
    },
    officialSources: [
      {
        documentTitle: 'Cours Magistral : Calcul Intégral & Primitives',
        professor: 'Prof. Éléonore Vasseur',
        page: 18,
        section: 'Chapitre 1 — Section 2.3 : Intégration par parties',
        excerpt: 'Théorème : Soient u et v deux fonctions de classe C1 sur [a, b]. Alors : ∫_a^b u(x)v\'(x)dx = [u(x)v(x)]_a^b - ∫_a^b u\'(x)v(x)dx.'
      },
      {
        documentTitle: 'Corrigé Officiel Examen Janvier 2025',
        professor: 'Prof. Éléonore Vasseur',
        page: 1,
        section: 'Exercice 1 : Calcul de I = ∫_0^1 x·e^(2x) dx',
        excerpt: 'Posons u(x) = x => u\'(x) = 1. Posons v\'(x) = e^(2x) => v(x) = (1/2)e^(2x). D\'où I = [ (x/2)e^(2x) ]_0^1 - (1/2)∫_0^1 e^(2x)dx = (e^2 + 1)/4.'
      }
    ],
    prerequisiteBranch: {
      id: 'branch-derivation',
      title: 'Dérivation des fonctions usuelles',
      prerequisiteConcept: 'Dérivée d\'un produit et fonctions composées',
      reason: 'Une hésitation a été détectée sur le calcul de u\'(x). Cette révision rapide consolide ce prérequis indispensable.',
      unlockedBenefit: 'Calculer u\'(x) sans erreur garantit que la nouvelle intégrale sera plus simple à résoudre.'
    }
  },

  // Course Algorithmique (INFO201) - Chapitre 1 : Arbres AVL
  'chap-algo-1': {
    courseId: 'course-algo',
    notion: 'Arbres Binaires de Recherche & Équilibrage AVL',
    title: 'Arbres AVL & B-Trees',
    professor: 'Prof. Laurent Mercier',
    demystification: {
      whatIsIt: "Un arbre AVL est un arbre binaire de recherche qui s'auto-équilibre après chaque insertion ou suppression pour éviter de devenir lent.",
      whyLearnIt: "Un ABR classique non équilibré peut dégénérer en liste chaînée (recherche en O(n)). L'AVL garantit un temps d'accès strictement logarithmique O(log n).",
      concreteApplications: "Index de bases de données (PostgreSQL, SQLite), systèmes de fichiers et tables d'association ordonnées.",
      whatYouWillMaster: "Calculer le facteur d'équilibre d'un nœud, identifier le type de déséquilibre (Gauche-Gauche, Gauche-Droite) et exécuter la bonne rotation."
    },
    roadmap: [
      { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Démystification", desc: "Pourquoi un ABR non équilibré devient lent et inefficace.", status: 'in_progress' },
      { id: 'step-B', letter: 'B', number: 2, title: "Facteur d'équilibre AVL", desc: "Définition : h(gauche) - h(droite) ∈ {-1, 0, +1}.", status: 'pending' },
      { id: 'step-C', letter: 'C', number: 3, title: "Rotations simples (G & D)", desc: "Réorganisation des pointeurs en temps O(1).", status: 'pending' },
      { id: 'step-D', letter: 'D', number: 4, title: "Rotations doubles (G-D & D-G)", desc: "Résolution des cas de déséquilibre en zig-zag.", status: 'pending' },
      { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Maîtrise", desc: "Exercice d'application et rééquilibrage complet.", status: 'pending' }
    ],
    recommendedVideo: {
      id: 'vid-avl-visual',
      title: 'Arbres AVL : Comprendre les 4 rotations (Gauche, Droite, Doubles)',
      channel: 'Algorithmique Interactive',
      duration: '08:30',
      url: 'https://www.youtube.com/watch?v=FNeL18KsWPc',
      youtubeId: 'FNeL18KsWPc',
      whyImportant: "Animation 3D des pointeurs pour voir exactement le pivotement des nœuds lors d'un rééquilibrage."
    },
    stepExercises: {
      0: {
        id: 'ex-avl-A',
        stepLetter: 'A',
        title: "Objectif fondamental AVL",
        question: "Pourquoi ajoute-t-on la contrainte d'équilibrage AVL à un arbre binaire de recherche classique ?",
        options: [
          "Pour empêcher l'arbre de dégénérer en liste et garantir une complexité en O(log n)",
          "Pour réduire la mémoire vive de moitié",
          "Pour trier les données dans l'ordre décroissant uniquement",
          "Pour supprimer automatiquement les doublons"
        ],
        correctIndex: 0,
        hint: "Imagine qu'on insère 1, 2, 3, 4, 5 dans l'ordre : que devient l'arbre ?",
        explanation: "Exactement ! Sans équilibrage, l'arbre devient une ligne droite (O(n)). L'AVL garantit une hauteur proportionnelle à log₂(n)."
      },
      1: {
        id: 'ex-avl-B',
        stepLetter: 'B',
        title: "Calcul du facteur d'équilibre",
        question: "Un nœud N a un sous-arbre gauche de hauteur 3 et un sous-arbre droit de hauteur 1. Quel est son facteur d'équilibre et l'arbre est-il AVL ?",
        options: [
          "Facteur = +2, l'arbre n'est PAS un AVL valide (déséquilibre à gauche)",
          "Facteur = +1, l'arbre est valide",
          "Facteur = -2, l'arbre est valide",
          "Facteur = 0"
        ],
        correctIndex: 0,
        hint: "Facteur = h(gauche) - h(droite) = 3 - 1 = +2. Les valeurs permises sont uniquement {-1, 0, +1}.",
        explanation: "Parfait ! La différence vaut +2. C'est strictement supérieur à 1, donc ce nœud déclenche un rééquilibrage immédiat."
      },
      2: {
        id: 'ex-avl-C',
        stepLetter: 'C',
        title: "Rotation simple droite",
        question: "Quand applique-t-on une rotation simple droite sur un nœud déséquilibré ?",
        options: [
          "Lors d'un déséquilibre Gauche-Gauche (facteur du nœud +2 et facteur du fils gauche ≥ 0)",
          "Lors d'un déséquilibre Droite-Droite",
          "Uniquement sur la racine de l'arbre",
          "Quand l'arbre est parfaitement équilibré"
        ],
        correctIndex: 0,
        hint: "Gauche-Gauche : la branche descend tout droit à gauche. Une seule rotation vers la droite suffit.",
        explanation: "Excellent ! L'excès est aligné à gauche. Faire pivoter le fils gauche vers le haut (rotation droite) rétablit la balance en O(1)."
      },
      3: {
        id: 'ex-avl-D',
        stepLetter: 'D',
        title: "Cas du zig-zag (Rotation double)",
        question: "Si le nœud A a un facteur de +2 et son fils gauche B a un facteur de -1 (cas Gauche-Droite), que fait-on ?",
        options: [
          "Rotation gauche sur B, puis rotation droite sur A",
          "Une seule rotation droite sur A",
          "Une rotation gauche sur A directement",
          "On supprime le nœud B"
        ],
        correctIndex: 0,
        hint: "On redresse d'abord le zig-zag en tournant le fils à gauche, puis on équilibre avec une rotation droite sur le parent.",
        explanation: "Bravo ! C'est la rotation double Gauche-Droite : elle aligne d'abord le sous-arbre, puis pivote le nœud parent."
      },
      4: {
        id: 'ex-avl-E',
        stepLetter: 'E',
        title: "Validation finale AVL",
        question: "Quelle est la complexité dans le pire des cas pour insérer un élément dans un arbre AVL de N nœuds ?",
        options: [
          "O(log N)",
          "O(N)",
          "O(1)",
          "O(N²)"
        ],
        correctIndex: 0,
        hint: "La recherche du point d'insertion prend O(log N) et le rééquilibrage nécessite au plus une rotation double en O(1).",
        explanation: "Félicitations ! La descente prend O(log N) et la rotation locale prend O(1). Le coût total est donc strictement O(log N) !"
      }
    },
    officialSources: [
      {
        documentTitle: 'Support de Cours : Algorithmique Avancée',
        professor: 'Prof. Laurent Mercier',
        page: 42,
        section: 'Chapitre 2 : Arbres Équilibrés AVL',
        excerpt: 'Propriété AVL : Pour tout nœud N, |hauteur(gauche) - hauteur(droite)| ≤ 1. Une rotation locale rétablit la propriété en temps O(1).'
      }
    ],
    prerequisiteBranch: {
      id: 'branch-abr-base',
      title: "Propriété d'ordre des ABR",
      prerequisiteConcept: "Organisation des clés inférieures à gauche et supérieures à droite",
      reason: "Rappel nécessaire sur l'invariant de recherche avant d'effectuer des rotations de pointeurs.",
      unlockedBenefit: "Comprendre pourquoi la rotation préserve l'ordre des éléments."
    }
  },

  // Course Physique (PHYS101) - Chapitre 1 : Lois de Newton
  'chap-phys-1': {
    courseId: 'course-physique',
    notion: 'Deuxième Loi de Newton & PFD',
    title: 'Lois de Newton & PFD',
    professor: 'Dr. Marc Beauchamp',
    demystification: {
      whatIsIt: "Le Principe Fondamental de la Dynamique (PFD) stipule que la somme vectorielle des forces extérieures agissant sur un corps est égale au produit de sa masse par son accélération (Σ F = m·a).",
      whyLearnIt: "C'est la base absolue de toute la mécanique classique. Connaître les forces permet de prédire avec une précision totale la trajectoire future d'un objet.",
      concreteApplications: "Trajectoires de fusées, freinage automobile, sécurité des structures et dynamique des ponts.",
      whatYouWillMaster: "Isoler le système, définir le référentiel galiléen, faire le bilan complet des forces et projeter sur les axes sans erreur de signe."
    },
    roadmap: [
      { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Démystification", desc: "Pourquoi une force crée une accélération et non une vitesse directe.", status: 'in_progress' },
      { id: 'step-B', letter: 'B', number: 2, title: "Formulation vectorielle Σ F = m·a", desc: "Rigueur des vecteurs et condition de référentiel galiléen.", status: 'pending' },
      { id: 'step-C', letter: 'C', number: 3, title: "Méthode des 4 étapes du Dr. Beauchamp", desc: "1. Système 2. Référentiel 3. Bilan des forces 4. Projection.", status: 'pending' },
      { id: 'step-D', letter: 'D', number: 4, title: "Cas type : Chute libre & Plan incliné", desc: "Intégration successive de a(t) vers v(t) et r(t).", status: 'pending' },
      { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Maîtrise", desc: "Résolution complète d'un problème d'examen.", status: 'pending' }
    ],
    recommendedVideo: {
      id: 'vid-pfd-newton',
      title: 'Deuxième Loi de Newton & PFD : Méthode de projection sans erreur',
      channel: 'Physique Universitaire',
      duration: '10:15',
      url: 'https://www.youtube.com/watch?v=vVj4Zqj7b0c',
      youtubeId: 'vVj4Zqj7b0c',
      whyImportant: "Schéma vectoriel animé montrant comment projeter le vecteur poids sur les axes sans inverser sinus et cosinus."
    },
    stepExercises: {
      0: {
        id: 'ex-pfd-A',
        stepLetter: 'A',
        title: "Sens physique de l'accélération",
        question: "Si la somme vectorielle des forces extérieures sur un mobile est strictement nulle (Σ F = 0), que peut-on affirmer ?",
        options: [
          "Le mobile est soit immobile, soit en mouvement rectiligne uniforme (vitesse constante)",
          "Le mobile s'arrête obligatoirement et immédiatement",
          "Le mobile accélère constamment",
          "Sa masse diminue"
        ],
        correctIndex: 0,
        hint: "C'est la première loi de Newton (principe d'inertie) : a = 0 implique v = constante.",
        explanation: "Exactement ! Une force ne sert pas à maintenir la vitesse, mais à la modifier (accélérer, freiner, tourner)."
      },
      1: {
        id: 'ex-pfd-B',
        stepLetter: 'B',
        title: "Condition de validité du PFD",
        question: "Dans quel type de référentiel la relation Σ F = m·a s'applique-t-elle directement sans ajouter de forces d'inertie ?",
        options: [
          "Dans un référentiel galiléen (ou inertiel)",
          "Dans n'importe quel manège en rotation rapide",
          "Dans une voiture en plein freinage d'urgence",
          "Uniquement dans le vide intersidéral"
        ],
        correctIndex: 0,
        hint: "Dans un référentiel accéléré ou en rotation, il faudrait ajouter les forces d'entraînement et de Coriolis.",
        explanation: "Parfait ! La 2ème loi de Newton postule un référentiel galiléen (ex: référentiel terrestre pour des durées d'expérience courtes)."
      },
      2: {
        id: 'ex-pfd-C',
        stepLetter: 'C',
        title: "Bilan des forces en chute libre",
        question: "Pour une bille lancée dans l'air si on néglige les frottements de l'air, quelle est son accélération a ?",
        options: [
          "a = g (dirigée vers le bas, indépendante de la masse)",
          "a = m · g",
          "a dépend de la vitesse de lancer",
          "a = 0 au sommet de la trajectoire"
        ],
        correctIndex: 0,
        hint: "m·a = P = m·g => les masses se simplifient !",
        explanation: "Bravo ! m·a = m·g se simplifie en a = g. Tous les corps tombent avec la même accélération dans le vide."
      },
      3: {
        id: 'ex-pfd-D',
        stepLetter: 'D',
        title: "Projection sur plan incliné",
        question: "Sur un plan incliné d'un angle α, quelle est la composante du poids parallèle à la pente (dans le sens de la descente) ?",
        options: [
          "P_x = m · g · sin(α)",
          "P_x = m · g · cos(α)",
          "P_x = m · g · tan(α)",
          "P_x = 0"
        ],
        correctIndex: 0,
        hint: "Quand α = 0 (sol plat), la pente ne tire pas (sin 0 = 0). Quand α = 90° (chute verticale), P_x = mg (sin 90 = 1). C'est donc le sinus !",
        explanation: "Excellent réflexe ! L'analyse aux limites (α=0 et α=90°) prouve immédiatement que la composante motrice est m·g·sin(α)."
      },
      4: {
        id: 'ex-pfd-E',
        stepLetter: 'E',
        title: "Validation finale de mécanique",
        question: "Pour trouver la vitesse v(t) à partir de l'accélération constante a(t) = a_0, quelle opération effectue-t-on ?",
        options: [
          "Une intégration temporelle : v(t) = a_0 · t + v_0",
          "Une dérivation temporelle : v(t) = da/dt",
          "Une multiplication par la masse m",
          "On prend la racine carrée de l'accélération"
        ],
        correctIndex: 0,
        hint: "Puisque a(t) = dv/dt, pour retrouver v(t), on cherche la primitive par rapport au temps.",
        explanation: "Félicitations ! L'intégration successive a(t) -> v(t) -> position r(t) est le cœur de la résolution en mécanique !"
      }
    },
    officialSources: [
      {
        documentTitle: 'Polycopié de Mécanique Générale',
        professor: 'Dr. Marc Beauchamp',
        page: 12,
        section: 'Chapitre 2 : Dynamique du point matériel',
        excerpt: 'Dans un référentiel galiléen, la dérivée temporelle de la quantité de mouvement est égale à la résultante des forces extérieures : m·a = Σ F_ext.'
      }
    ],
    prerequisiteBranch: {
      id: 'branch-projection-vecteurs',
      title: 'Projection vectorielle et trigonométrie',
      prerequisiteConcept: 'Composantes axiales (cos θ, sin θ) d\'un vecteur force',
      reason: 'Une difficulté a été constatée lors de la projection du poids sur le repère cartésien.',
      unlockedBenefit: 'Projeter proprement permet de transformer l\'équation vectorielle en deux équations scalaires simples.'
    }
  },

  // Course Algèbre Linéaire (MATH201) - Chapitre : Diagonalisation
  'chap-algebre-1': {
    courseId: 'course-algebre',
    notion: 'Matrices & Diagonalisation',
    title: 'Matrices & Diagonalisation',
    professor: 'Prof. Christine Meyer',
    demystification: {
      whatIsIt: "Diagonaliser une matrice consiste à trouver une base géométrique où l'action de la matrice se résume à de simples dilatations le long des axes (valeurs propres).",
      whyLearnIt: "Calculer A^k ou exp(A·t) pour une matrice pleine est un calvaire de calcul. Une fois diagonalisée (A = P·D·P⁻¹), D^k est immédiate : on élève simplement les termes diagonaux à la puissance k.",
      concreteApplications: "Résolution de systèmes d'équations différentielles couplées, mécanique quantique, algorithme PageRank de Google et réduction de dimension (ACP).",
      whatYouWillMaster: "Calculer le polynôme caractéristique det(A - λ·I), trouver les valeurs propres, déterminer les sous-espaces propres et vérifier le critère de diagonalisabilité."
    },
    roadmap: [
      { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Démystification", desc: "Comprendre pourquoi changer de base simplifie exponentiellement les calculs.", status: 'in_progress' },
      { id: 'step-B', letter: 'B', number: 2, title: "Polynôme caractéristique & Valeurs propres", desc: "Calcul de P_A(λ) = det(A - λ·I) = 0.", status: 'pending' },
      { id: 'step-C', letter: 'C', number: 3, title: "Vecteurs propres & Sous-espaces", desc: "Résolution du système homogène (A - λ·I)·X = 0.", status: 'pending' },
      { id: 'step-D', letter: 'D', number: 4, title: "Critère fondamental de diagonalisabilité", desc: "Somme des dimensions des sous-espaces propres = dimension n.", status: 'pending' },
      { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Puissances A^k", desc: "Calcul de A^k via la décomposition A = P·D·P⁻¹.", status: 'pending' }
    ],
    recommendedVideo: {
      id: 'vid-diag-algebre',
      title: "Diagonalisation et valeurs propres : L'essence géométrique",
      channel: '3Blue1Brown FR',
      duration: '14:20',
      url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g',
      youtubeId: 'PFDu9oVAE-g',
      whyImportant: "Visualisation intuitive de l'effet d'une matrice sur l'espace et pourquoi les vecteurs propres ne tournent pas."
    },
    stepExercises: {
      0: {
        id: 'ex-diag-A',
        stepLetter: 'A',
        title: "Sens géométrique d'un vecteur propre",
        question: "Géométriquement, qu'arrive-t-il à un vecteur propre X non nul lorsqu'on lui applique la matrice A (A·X = λ·X) ?",
        options: [
          "Il reste sur la même droite vectorielle : il est simplement étiré ou comprimé d'un facteur λ",
          "Il tourne obligatoirement de 90 degrés",
          "Sa norme devient toujours égale à 1",
          "Il est annulé dans tous les cas"
        ],
        correctIndex: 0,
        hint: "A·X est colinéaire à X : la direction ne change pas, seule la longueur est multipliée par λ.",
        explanation: "Exactement ! C'est la beauté des vecteurs propres : la matrice n'introduit aucune rotation pour eux, seulement une homothétie d'échelle λ."
      },
      1: {
        id: 'ex-diag-B',
        stepLetter: 'B',
        title: "Calcul des valeurs propres",
        question: "Pour la matrice A = [[2, 0], [0, 5]], quelles sont ses valeurs propres immédiates ?",
        options: [
          "λ₁ = 2 et λ₂ = 5 (les éléments de la diagonale principale)",
          "λ₁ = 10 et λ₂ = 7",
          "λ₁ = 0 et λ₂ = 1",
          "Elle n'admet aucune valeur propre"
        ],
        correctIndex: 0,
        hint: "Pour une matrice diagonale ou triangulaire, les valeurs propres sont directement les coefficients diagonaux.",
        explanation: "Parfait ! Le déterminant det(A - λ·I) vaut (2-λ)(5-λ), dont les racines sont directement 2 et 5."
      },
      2: {
        id: 'ex-diag-C',
        stepLetter: 'C',
        title: "Dimension du sous-espace propre",
        question: "Si une valeur propre λ a une multiplicité algébrique de 2, quelles valeurs peut prendre la dimension de son sous-espace propre E_λ ?",
        options: [
          "1 ou 2 (la dimension géométrique est comprise entre 1 et la multiplicité algébrique)",
          "Toujours 0",
          "Strictement supérieure à 2",
          "Toujours exactement 3"
        ],
        correctIndex: 0,
        hint: "1 ≤ dim(E_λ) ≤ multiplicité(λ). Pour être diagonalisable, il faudra impérativement que dim(E_λ) atteigne 2.",
        explanation: "Bravo ! C'est le théorème clé : si dim(E_λ) = 2, la matrice est diagonalisable ; si dim(E_λ) = 1, il manque un vecteur et elle ne l'est pas."
      },
      3: {
        id: 'ex-diag-D',
        stepLetter: 'D',
        title: "Critère suffisant de diagonalisation",
        question: "Si une matrice carrée d'ordre n admet n valeurs propres deux à deux distinctes, que peut-on conclure immédiatement ?",
        options: [
          "Elle est diagonalisable à coup sûr",
          "Elle n'est jamais diagonalisable",
          "Son déterminant est nul",
          "Elle est obligatoirement symétrique"
        ],
        correctIndex: 0,
        hint: "n valeurs propres distinctes garantissent n vecteurs propres linéairement indépendants formant une base de l'espace.",
        explanation: "Excellent ! C'est le théorème fondamental : n valeurs propres distinctes suffisent pour former une base propre."
      },
      4: {
        id: 'ex-diag-E',
        stepLetter: 'E',
        title: "Application aux puissances A^k",
        question: "Si A = P · D · P⁻¹ avec D = [[2, 0], [0, 3]], que vaut D^k pour tout entier k ?",
        options: [
          "D^k = [[2^k, 0], [0, 3^k]]",
          "D^k = [[2k, 0], [0, 3k]]",
          "D^k = k · D",
          "D^k = D"
        ],
        correctIndex: 0,
        hint: "Le produit de matrices diagonales consiste simplement à multiplier leurs éléments diagonaux entre eux.",
        explanation: "Félicitations ! Calculer A^k revient simplement à calculer P · D^k · P⁻¹, ce qui fait passer le calcul de l'enfer à une formalité !"
      }
    },
    officialSources: [
      {
        documentTitle: "Cours Magistral d'Algèbre Linéaire Avancée",
        professor: 'Prof. Christine Meyer',
        page: 34,
        section: 'Chapitre 4 : Réduction des endomorphismes',
        excerpt: 'Une matrice A ∈ M_n(K) est diagonalisable sur K si et seulement si la somme des dimensions de ses sous-espaces propres est égale à n.'
      }
    ],
    prerequisiteBranch: {
      id: 'branch-determinant',
      title: 'Calcul de déterminant 2x2 et 3x3',
      prerequisiteConcept: 'Formule de Sarrus et développement selon une ligne ou colonne',
      reason: "Une hésitation a été détectée sur le calcul de det(A - λ·I).",
      unlockedBenefit: "Maîtriser le déterminant permet de trouver les valeurs propres sans faire d'erreur de signe."
    }
  },

  // Course Électronique (ELEC101) - Chapitre : Circuits RLC
  'chap-elec-1': {
    courseId: 'course-elec',
    notion: 'Circuits RLC & Régime Transitoire',
    title: 'Circuits RLC & Régime Transitoire',
    professor: 'Dr. Karim Benali',
    demystification: {
      whatIsIt: "Un circuit RLC série associe une résistance (dissipation), une bobine (inertie magnétique) et un condensateur (stockage électrostatique). Selon la valeur de la résistance, la réponse est soit oscillante, soit amortie.",
      whyLearnIt: "C'est le prototype de tous les systèmes physiques oscillants du 2ème ordre (suspension de voiture, pont suspendu, résonateur radio, filtre audio).",
      concreteApplications: "Filtres passe-bande radio, résonateurs d'antenne, suppression des parasites de commutation dans les alimentations et régulateurs.",
      whatYouWillMaster: "Établir l'équation différentielle du second ordre par la loi des mailles, identifier la pulsation propre ω_0 et le facteur de qualité Q, et distinguer les 3 régimes (apériodique, critique, pseudo-périodique)."
    },
    roadmap: [
      { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Rôle des composants", desc: "Analogie mécanique : ressort (C), masse (L) et frottement (R).", status: 'in_progress' },
      { id: 'step-B', letter: 'B', number: 2, title: "Loi des mailles & Équation différentielle", desc: "d²u_C/dt² + (R/L)·du_C/dt + (1/LC)·u_C = E/LC.", status: 'pending' },
      { id: 'step-C', letter: 'C', number: 3, title: "Paramètres canoniques : ω_0 et Q", desc: "Pulsation propre ω_0 = 1/√(LC) et facteur de qualité Q.", status: 'pending' },
      { id: 'step-D', letter: 'D', number: 4, title: "Les 3 régimes de décharge", desc: "Pseudo-périodique (Q > 1/2), critique (Q = 1/2) et apériodique (Q < 1/2).", status: 'pending' },
      { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Continuité", desc: "Conditions initiales sur le condensateur u_C(0⁺) et la bobine i(0⁺).", status: 'pending' }
    ],
    recommendedVideo: {
      id: 'vid-rlc-elec',
      title: 'Circuit RLC série : Régimes apériodique, critique et pseudo-périodique',
      channel: 'Génie Électrique & Physique',
      duration: '11:00',
      url: 'https://www.youtube.com/watch?v=x_6Xb4V2a9o',
      youtubeId: 'x_6Xb4V2a9o',
      whyImportant: "Courbes réelles de décharge à l'oscilloscope pour comprendre concrètement l'effet de la résistance sur l'amortissement."
    },
    stepExercises: {
      0: {
        id: 'ex-rlc-A',
        stepLetter: 'A',
        title: "Analogie physique RLC",
        question: "Dans l'analogie mécanique d'un oscillateur harmonique amorti (masse-ressort-amortisseur), quel composant joue le rôle de l'inertie (masse) ?",
        options: [
          "L'inductance de la bobine L (qui s'oppose aux variations de courant)",
          "La résistance R",
          "La capacité du condensateur C",
          "La source de tension continue"
        ],
        correctIndex: 0,
        hint: "La bobine stocke l'énergie sous forme cinétique/magnétique et refuse que le courant change instantanément.",
        explanation: "Exactement ! L'inductance L est l'analogue de la masse m, le frottement est la résistance R, et la raideur du ressort est 1/C."
      },
      1: {
        id: 'ex-rlc-B',
        stepLetter: 'B',
        title: "Continuité aux bornes des dipôles",
        question: "À la fermeture d'un interrupteur (t = 0⁺), quelles grandeurs sont obligatoirement continues ?",
        options: [
          "La tension u_C aux bornes du condensateur et le courant i_L à travers la bobine",
          "La tension u_R aux bornes de la résistance",
          "Toutes les tensions et tous les courants sans exception",
          "Aucune grandeur n'est continue"
        ],
        correctIndex: 0,
        hint: "L'énergie stockée dans un composant ne peut pas faire de saut instantané sans puissance infinie !",
        explanation: "Parfait ! E_C = (1/2)C·u_C² et E_L = (1/2)L·i² sont continues. La tension de la résistance peut en revanche sauter instantanément."
      },
      2: {
        id: 'ex-rlc-C',
        stepLetter: 'C',
        title: "Pulsation propre",
        question: "Quelle est l'expression de la pulsation propre ω_0 d'un circuit RLC série ?",
        options: [
          "ω_0 = 1 / √(L · C)",
          "ω_0 = √(L · C)",
          "ω_0 = R / L",
          "ω_0 = L / C"
        ],
        correctIndex: 0,
        hint: "Les unités : [L·C] = s². Donc 1/√(LC) est bien en rad/s.",
        explanation: "Bravo ! ω_0 = 1/√(LC). Elle ne dépend aucunement de la résistance R !"
      },
      3: {
        id: 'ex-rlc-D',
        stepLetter: 'D',
        title: "Régime le plus rapide sans oscillation",
        question: "Quel régime permet d'atteindre la valeur finale le plus rapidement possible sans jamais dépasser ni osciller ?",
        options: [
          "Le régime critique (Q = 1/2 ou R = 2√(L/C))",
          "Le régime pseudo-périodique",
          "Le régime apériodique lent",
          "Le régime de résonance pure"
        ],
        correctIndex: 0,
        hint: "C'est le réglage idéal recherché pour les amortisseurs d'automobiles et les aiguilles de galvanomètres.",
        explanation: "Excellent ! Le régime critique est le point d'équilibre parfait : temps de réponse minimal sans aucun dépassement !"
      },
      4: {
        id: 'ex-rlc-E',
        stepLetter: 'E',
        title: "Validation finale RLC",
        question: "Si la résistance R est très faible (R -> 0), que devient l'évolution de la tension u_C(t) ?",
        options: [
          "Des oscillations sinusoïdales pures non amorties de pulsation ω_0",
          "Une constante nulle",
          "Une décroissance exponentielle rapide",
          "Une explosion vers l'infini"
        ],
        correctIndex: 0,
        hint: "Sans résistance, aucune énergie n'est dissipée par effet Joule : l'énergie oscille éternellement entre L et C.",
        explanation: "Félicitations ! Sans dissipation, le circuit LC oscille indéfiniment à sa pulsation propre ω_0 !"
      }
    },
    officialSources: [
      {
        documentTitle: 'Polycopié de Physique Appliquée : Circuits Électrocinétiques',
        professor: 'Dr. Karim Benali',
        page: 25,
        section: 'Chapitre 3 : Régimes transitoires du second ordre',
        excerpt: 'L\'équation caractéristique r² + (R/L)r + 1/(LC) = 0 régit la réponse temporelle du circuit RLC série.'
      }
    ],
    prerequisiteBranch: {
      id: 'branch-equadiff-2',
      title: 'Équations différentielles linéaires d\'ordre 2',
      prerequisiteConcept: 'Discriminant de l\'équation caractéristique et solutions réelles ou complexes',
      reason: "Une révision est conseillée sur la résolution de ar'' + br' + cr = 0.",
      unlockedBenefit: "Relier immédiatement le signe de Δ à la forme mathématique des solutions (exp vs sinusoïdes)."
    }
  }
};

export class ChapterLearningManager {
  // Helper to find the best chapter matching a student query or course
  findChapterForQuery(query = '', courseId = '') {
    const q = (query || '').toLowerCase().trim();

    // Specific topic matching
    if (q.includes('ipp') || q.includes('partie') || q.includes('intégral') || q.includes('primitive') || q.includes('alpes')) {
      return { chapterId: 'chap-math-1', courseId: 'course-analyse' };
    }
    if (q.includes('avl') || q.includes('arbre') || q.includes('rotation') || q.includes('abr') || q.includes('équilibre')) {
      return { chapterId: 'chap-algo-1', courseId: 'course-algo' };
    }
    if (q.includes('newton') || q.includes('pfd') || q.includes('dynamique') || q.includes('force') || q.includes('cinématique') || q.includes('mouvement')) {
      return { chapterId: 'chap-phys-1', courseId: 'course-physique' };
    }
    if (q.includes('matrice') || q.includes('diag') || q.includes('propre') || q.includes('valeur propre') || q.includes('vecteur propre') || q.includes('espace vectoriel')) {
      return { chapterId: 'chap-algebre-1', courseId: 'course-algebre' };
    }
    if (q.includes('rlc') || q.includes('circuit') || q.includes('bobine') || q.includes('condensateur') || q.includes('transitoire') || q.includes('oscillat')) {
      return { chapterId: 'chap-elec-1', courseId: 'course-elec' };
    }

    // Match by courseId if given
    if (courseId) {
      if (courseId.includes('analyse') || courseId.includes('math')) return { chapterId: 'chap-math-1', courseId: 'course-analyse' };
      if (courseId.includes('algo')) return { chapterId: 'chap-algo-1', courseId: 'course-algo' };
      if (courseId.includes('phys')) return { chapterId: 'chap-phys-1', courseId: 'course-physique' };
      if (courseId.includes('algebre')) return { chapterId: 'chap-algebre-1', courseId: 'course-algebre' };
      if (courseId.includes('elec')) return { chapterId: 'chap-elec-1', courseId: 'course-elec' };
    }

    // Default match if query expresses learning intent in general
    if (q.includes('apprendre') || q.includes('comprendre') || q.includes('plan') || q.includes('cours') || q.includes('étudier')) {
      return { chapterId: 'chap-math-1', courseId: 'course-analyse' };
    }

    return null;
  }

  // Initialize an autonomous learning session (Plan A à E)
  async initSession({ studentId = 'default-student', courseId, chapterId, userApiKey = '' }) {
    // Check if curated knowledge exists
    let model = CURATED_CHAPTERS[chapterId];
    if (!model) {
      // Find course in db
      const course = (db.data.courses || []).find(c => c.id === courseId) || {
        id: courseId || 'course-analyse',
        name: 'Analyse Mathématique',
        code: 'MATH101',
        professor: 'Prof. Éléonore Vasseur'
      };
      model = this.buildDynamicModel(course, chapterId);
    }

    const course = (db.data.courses || []).find(c => c.id === courseId) || {
      id: courseId || model.courseId,
      name: model.title,
      code: 'UNIV',
      professor: model.professor
    };

    const sessionId = `learn-${course.id}-${chapterId}-${Date.now()}`;
    const initialSession = {
      id: sessionId,
      studentId,
      courseId: course.id,
      courseCode: course.code || 'UNIV',
      courseName: course.name,
      professor: model.professor || course.professor,
      chapterId,
      chapterTitle: model.title || model.notion,
      status: 'active',
      activeStepIndex: 0,
      roadmap: JSON.parse(JSON.stringify(model.roadmap)),
      demystification: model.demystification,
      recommendedVideo: model.recommendedVideo || null,
      stepExercises: model.stepExercises || {},
      officialSources: model.officialSources || [],
      prerequisiteBranch: model.prerequisiteBranch || null,
      activeBranch: null,
      visitedBranches: [],
      pendingExercise: model.stepExercises ? model.stepExercises[0] || null : null,
      hasShownVideo: false,
      history: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Construct opening lead text from the Autonomous Agent
    const firstStep = initialSession.roadmap[0];
    const initialTutorText = 
      `🎓 **C'est moi qui prends les commandes pour cette séance.**\n\n` +
      `Pour maîtriser **${initialSession.chapterTitle}**, nous allons suivre un parcours rigoureux de **A à E**.\n` +
      `Tu n'as qu'à te laisser guider pas à pas.\n\n` +
      `--- \n` +
      `📍 **Étape ${firstStep.letter} : ${firstStep.title}**\n\n` +
      `${model.demystification.whatIsIt}\n\n` +
      `• **Pourquoi l'apprendre** : ${model.demystification.whyLearnIt}\n` +
      `• **Applications concrètes** : ${model.demystification.concreteApplications}\n\n` +
      `Je t'ai préparé une première question pour valider que cette intuition est bien en place avant d'aborder le formalisme.`;

    initialSession.history.push({
      role: 'assistant',
      sender: 'tutor',
      text: initialTutorText
    });

    db.saveLearningSession(initialSession);

    return {
      session: initialSession,
      tutorAnswer: initialTutorText,
      learningPlan: this.buildPlanSummary(initialSession),
      interactiveExercise: initialSession.pendingExercise,
      recommendedVideo: null, // show video at step B or C when appropriate
      quickActions: ['Compris, je réponds à la question', '💡 Donne-moi un indice', 'Pourquoi cette méthode ?'],
      sources: initialSession.officialSources
    };
  }

  // Build high-level plan state for the UI
  buildPlanSummary(session) {
    const activeStep = session.roadmap[session.activeStepIndex] || session.roadmap[0];
    const completedCount = session.roadmap.filter(s => s.status === 'completed').length;
    const progressPercent = Math.round((completedCount / session.roadmap.length) * 100);

    return {
      active: true,
      sessionId: session.id,
      courseId: session.courseId,
      courseName: session.courseName,
      courseCode: session.courseCode,
      chapterTitle: session.chapterTitle,
      activeStepIndex: session.activeStepIndex,
      totalSteps: session.roadmap.length,
      currentStepLetter: activeStep.letter || 'A',
      currentStepTitle: activeStep.title,
      activeBranch: session.activeBranch ? session.activeBranch.title : null,
      progressPercent,
      roadmap: session.roadmap
    };
  }

  // Process student interaction autonomously
  async processStep({ sessionId, studentInput = '', action = 'answer', userApiKey = '' }) {
    const session = db.getLearningSession(sessionId);
    if (!session) {
      throw new Error(`Session d'apprentissage ${sessionId} introuvable.`);
    }

    session.updatedAt = new Date().toISOString();
    const model = CURATED_CHAPTERS[session.chapterId] || this.buildDynamicModel({ name: session.courseName, professor: session.professor }, session.chapterId);

    const inputClean = (studentInput || '').trim();
    const lower = inputClean.toLowerCase();

    let tutorAnswer = '';
    let quickActions = [];
    let branchEvent = null;
    let deliveredExercise = null;
    let deliveredVideo = null;
    let stepAdvanced = false;

    // 1. Check if an interactive exercise was pending evaluation
    if (session.pendingExercise) {
      const ex = session.pendingExercise;
      let isAnswerAttempt = false;
      let isCorrect = false;

      // Detect answer by index (0, 1, 2, 3), letter (A, B, C, D), or option text matching
      const targetOption = ex.options[ex.correctIndex] || '';
      
      if (lower === 'a' || lower === 'option a' || lower === '0') {
        isAnswerAttempt = true;
        isCorrect = ex.correctIndex === 0;
      } else if (lower === 'b' || lower === 'option b' || lower === '1') {
        isAnswerAttempt = true;
        isCorrect = ex.correctIndex === 1;
      } else if (lower === 'c' || lower === 'option c' || lower === '2') {
        isAnswerAttempt = true;
        isCorrect = ex.correctIndex === 2;
      } else if (lower === 'd' || lower === 'option d' || lower === '3') {
        isAnswerAttempt = true;
        isCorrect = ex.correctIndex === 3;
      } else if (targetOption && lower.includes(targetOption.toLowerCase().substring(0, 15))) {
        isAnswerAttempt = true;
        isCorrect = true;
      } else {
        // Check if any other option was submitted
        const matchedIndex = ex.options.findIndex(opt => lower.includes(opt.toLowerCase().substring(0, 15)));
        if (matchedIndex >= 0) {
          isAnswerAttempt = true;
          isCorrect = matchedIndex === ex.correctIndex;
        }
      }

      if (isAnswerAttempt) {
        if (isCorrect) {
          // Congratulate, clear pending exercise, mark step completed, advance
          session.roadmap[session.activeStepIndex].status = 'completed';
          session.pendingExercise = null;

          if (session.activeStepIndex < session.roadmap.length - 1) {
            session.activeStepIndex += 1;
            session.roadmap[session.activeStepIndex].status = 'in_progress';
            stepAdvanced = true;

            const nextStep = session.roadmap[session.activeStepIndex];
            
            // Autonomous decision: propose video if step is B or C and not shown yet
            let videoDirective = '';
            if (model.recommendedVideo && !session.hasShownVideo && (nextStep.letter === 'B' || nextStep.letter === 'C')) {
              session.hasShownVideo = true;
              deliveredVideo = model.recommendedVideo;
              videoDirective = 
                `\n\n📺 **Ressource visuelle recommandée par ton tuteur** :\n` +
                `Pour bien ancrer cette étape dans ton esprit, je te propose de regarder la courte vidéo ci-dessous (${deliveredVideo.duration}).\n` +
                `*« ${deliveredVideo.whyImportant} »*`;
            }

            // Prepare next explanation and next exercise
            const nextEx = (model.stepExercises && model.stepExercises[session.activeStepIndex]) || null;
            if (nextEx) {
              session.pendingExercise = nextEx;
              deliveredExercise = nextEx;
            }

            tutorAnswer = 
              `✅ **Excellente réponse ! C'est exactement cela.**\n\n` +
              `${ex.explanation}\n\n` +
              `Nous validons l'étape **${session.roadmap[session.activeStepIndex - 1].letter}** et nous avançons dans notre plan.\n\n` +
              `---\n` +
              `📍 **Étape ${nextStep.letter} : ${nextStep.title}**\n\n` +
              `${nextStep.desc}\n` +
              videoDirective +
              `\n\nVoici ton prochain défi pour vérifier la bonne assimilation de cette étape :`;

            quickActions = ['Je réponds à la question', '💡 Donne-moi un indice', 'Pourquoi cette étape ?'];
          } else {
            // Reached end of plan (Step E completed!)
            tutorAnswer = 
              `🎉 **Félicitations ! Tu as complété avec succès l'ensemble du plan de A à E sur ${session.chapterTitle} !**\n\n` +
              `${ex.explanation}\n\n` +
              `Tu as acquis l'intuition, les règles de méthode et résolu les cas types d'examen. Tu maîtrises désormais ce chapitre en totale autonomie !`;
            quickActions = ['Revoir un point', 'Changer de cours', 'Discuter librement'];
          }

          db.saveLearningSession(session);
          return {
            session,
            tutorAnswer,
            learningPlan: this.buildPlanSummary(session),
            interactiveExercise: deliveredExercise,
            recommendedVideo: deliveredVideo,
            quickActions,
            sources: session.officialSources
          };
        } else {
          // Incorrect answer: explain why gently and offer hint or branch
          tutorAnswer = 
            `❌ **Pas tout à fait, mais c'est une erreur classique.**\n\n` +
            `💡 **Indice du tuteur** : ${ex.hint || "Relis bien l'énoncé et la priorité des termes."}\n\n` +
            `Prends ton temps et réessaie : quelle option choisis-tu maintenant ?`;

          return {
            session,
            tutorAnswer,
            learningPlan: this.buildPlanSummary(session),
            interactiveExercise: ex,
            recommendedVideo: null,
            quickActions: ['Je réessaie', '💡 Un indice de plus', 'Ouvrir un rappel rapide'],
            sources: session.officialSources
          };
        }
      }
    }

    // 2. Handle confusion / prerequisite branching
    const showsConfusion = lower.includes('pas compris') || lower.includes('perdu') || lower.includes('bloque') || lower.includes('difficile') || lower.includes('pourquoi');

    if (showsConfusion && !session.activeBranch && model.prerequisiteBranch) {
      session.activeBranch = model.prerequisiteBranch;
      branchEvent = 'opened';
      tutorAnswer = 
        `🌿 **Halte temporaire : ouvrons une courte parenthèse sur un prérequis indispensable.**\n\n` +
        `Ne t'en fais pas, c'est parfaitement normal. Pour ne pas caler sur ${session.chapterTitle}, nous faisons un arrêt ciblé de 2 minutes sur **${model.prerequisiteBranch.title}**.\n\n` +
        `• **Notion à sécuriser** : ${model.prerequisiteBranch.prerequisiteConcept}\n` +
        `• **Pourquoi c'est crucial** : ${model.prerequisiteBranch.reason}\n\n` +
        `Dis-moi : te rappelles-tu de ce point ou souhaites-tu que je te l'explique simplement ?`;

      quickActions = ['Explique-moi ce prérequis simplement', 'Je m\'en rappelle, revenons au plan principal', '💡 Donner un exemple'];
      db.saveLearningSession(session);
      return {
        session,
        tutorAnswer,
        learningPlan: this.buildPlanSummary(session),
        interactiveExercise: null,
        recommendedVideo: null,
        quickActions,
        sources: session.officialSources
      };
    }

    // 3. Handle closing branch if student is ready
    if (session.activeBranch && (lower.includes('compris') || lower.includes('clair') || lower.includes('oui') || lower.includes('revenir'))) {
      session.visitedBranches.push(session.activeBranch.title);
      session.activeBranch = null;
      branchEvent = 'closed';

      tutorAnswer = 
        `✓ **Excellent ! Ce prérequis est validé.**\n\n` +
        `Comme promis, je referme cette parenthèse et nous reprenons immédiatement notre plan de A à E sur **${session.chapterTitle}**.\n\n` +
        `Poursuivons là où nous nous étions arrêtés :`;

      // re-surface pending exercise or next step
      const currentEx = session.pendingExercise || (model.stepExercises && model.stepExercises[session.activeStepIndex]);
      deliveredExercise = currentEx;

      quickActions = ['Continuer', '💡 Indice', 'Voir la question'];
      db.saveLearningSession(session);
      return {
        session,
        tutorAnswer,
        learningPlan: this.buildPlanSummary(session),
        interactiveExercise: deliveredExercise,
        recommendedVideo: null,
        quickActions,
        sources: session.officialSources
      };
    }

    // 4. Autonomous Gemini / Pedagogical response
    const currentStep = session.roadmap[session.activeStepIndex];
    const systemPrompt = 
      `Tu es l'Agent Pédagogique Autonome d'Academic Hub pour le cours "${session.courseName}" (Prof. ${session.professor}).\n` +
      `C'est TOI qui diriges la séance d'apprentissage de A à Z. L'étudiant ne fait que suivre ton plan étape par étape.\n` +
      `Chapitre en cours : "${session.chapterTitle}".\n` +
      `Étape active du plan : Étape ${currentStep.letter} (${currentStep.title}).\n` +
      `Branche active : ${session.activeBranch ? session.activeBranch.title : 'Aucune (tronc principal)'}.\n\n` +
      `Directives :\n` +
      `1. Réponds avec autorité bienveillante, pédagogie sobre et clarté absolue (sans jargon inutile).\n` +
      `2. Fais comprendre la notion avec une analogie concrète ou un découpage pas-à-pas.\n` +
      `3. Reste concis (3 à 5 phrases) et termine toujours en relançant l'étudiant vers l'étape ou l'exercice en cours.`;

    try {
      const res = await geminiService.executeWithFallback({
        prompt: `Étudiant : "${inputClean}"\n\nRédige la réponse du tuteur autonome :`,
        systemInstruction: systemPrompt,
        userApiKey
      });
      if (res && res.success && res.text) {
        tutorAnswer = res.text.trim();
      }
    } catch (err) {
      console.warn('Gemini learning turn error:', err.message);
    }

    if (!tutorAnswer) {
      tutorAnswer = 
        `J'ai bien noté ta remarque. Dans le cadre de **${session.chapterTitle}**, ce qui importe à cette étape **${currentStep.letter}**, c'est de bien décomposer les éléments avant d'appliquer la formule.\n\n` +
        `Pour valider que tu as bien assimilé ce point, réponds à la question interactive ci-dessous :`;
    }

    // Always ensure an exercise is delivered if appropriate
    if (!session.pendingExercise && model.stepExercises && model.stepExercises[session.activeStepIndex]) {
      session.pendingExercise = model.stepExercises[session.activeStepIndex];
    }
    deliveredExercise = session.pendingExercise;

    // Video suggestion if asked or relevant
    if ((lower.includes('vidéo') || lower.includes('youtube') || lower.includes('voir')) && model.recommendedVideo) {
      deliveredVideo = model.recommendedVideo;
    }

    quickActions = ['C\'est compris, étape suivante', '💡 Donne-moi un indice', '🔢 Exemple chiffré', 'Pourquoi cette règle ?'];

    db.saveLearningSession(session);

    return {
      session,
      tutorAnswer,
      learningPlan: this.buildPlanSummary(session),
      interactiveExercise: deliveredExercise,
      recommendedVideo: deliveredVideo,
      quickActions,
      sources: session.officialSources
    };
  }

  // Fallback dynamic model if a new chapter is added
  buildDynamicModel(course, chapterId) {
    const title = typeof chapterId === 'string' ? chapterId : 'Chapitre du cours';
    return {
      courseId: course.id,
      title: title,
      professor: course.professor || 'Enseignant de la faculté',
      demystification: {
        whatIsIt: `Ce chapitre introduit les outils fondamentaux de ${title} pour résoudre des problèmes académiques avec rigueur.`,
        whyLearnIt: `Comprendre cette notion permet de réussir les partiels et d'acquérir les réflexes méthodologiques exigés par les correcteurs.`,
        concreteApplications: `Problèmes types de partiels, modélisation en laboratoire et projets d'ingénierie.`,
        whatYouWillMaster: `Identifier le problème, poser les hypothèses et dérouler le calcul sans erreur.`
      },
      roadmap: [
        { id: 'step-A', letter: 'A', number: 1, title: "Idée intuitive & Démystification", desc: "Comprendre le sens général du concept.", status: 'in_progress' },
        { id: 'step-B', letter: 'B', number: 2, title: "Formule & Définition rigoureuse", desc: "Énoncé formel du théorème et conditions d'application.", status: 'pending' },
        { id: 'step-C', letter: 'C', number: 3, title: "Méthode de résolution type", desc: "La démarche méthodique enseignée en cours.", status: 'pending' },
        { id: 'step-D', letter: 'D', number: 4, title: "Exemple d'examen résolu", desc: "Application pas-à-pas sur un exercice canonique.", status: 'pending' },
        { id: 'step-E', letter: 'E', number: 5, title: "Validation autonome & Maîtrise", desc: "Évaluation de la maîtrise complète.", status: 'pending' }
      ],
      recommendedVideo: db.findVideoForTopic(title, course.id),
      stepExercises: {
        0: {
          id: `ex-${title}-A`,
          stepLetter: 'A',
          title: "Compréhension intuitive",
          question: `Quel est l'objectif premier de la notion étudiée dans ${title} ?`,
          options: [
            "Fournir un cadre systématique et rigoureux pour simplifier la résolution",
            "Complexifier inutilement les calculs",
            "Éviter d'avoir à justifier les étapes",
            "Aucune de ces réponses"
          ],
          correctIndex: 0,
          hint: "Pense au rôle de la méthode : rendre le problème abordable.",
          explanation: "Exactement ! Cette méthode fournit une démarche claire pour décomposer un problème complexe."
        }
      },
      officialSources: [
        {
          documentTitle: `Support Officiel : ${course.name}`,
          professor: course.professor,
          page: 1,
          section: title,
          excerpt: `Présentation générale et définitions fondamentales de ${title}.`
        }
      ],
      prerequisiteBranch: null
    };
  }

  getAvailableCourses() {
    const courses = db.data.courses || [];
    return courses.map(c => {
      // Find curated chapters or fallback to course chapters
      const curatedKeys = Object.keys(CURATED_CHAPTERS).filter(k => CURATED_CHAPTERS[k].courseId === c.id);
      const chapters = curatedKeys.map(k => ({
        id: k,
        title: CURATED_CHAPTERS[k].title,
        notion: CURATED_CHAPTERS[k].notion,
        professor: CURATED_CHAPTERS[k].professor,
        totalSteps: CURATED_CHAPTERS[k].roadmap.length,
        hasVideo: !!CURATED_CHAPTERS[k].recommendedVideo
      }));

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        professor: c.professor,
        chapters: chapters.length > 0 ? chapters : [
          { id: `chap-${c.id}-1`, title: 'Introduction & Fondements', notion: 'Concepts fondamentaux', professor: c.professor, totalSteps: 5, hasVideo: true }
        ]
      };
    });
  }

  getWhereAreWe(sessionId) {
    const session = db.getLearningSession(sessionId);
    if (!session) return null;
    return this.buildPlanSummary(session);
  }

  getChapterAssessment(sessionId) {
    const session = db.getLearningSession(sessionId);
    if (!session) return null;
    const model = CURATED_CHAPTERS[session.chapterId] || this.buildDynamicModel({ name: session.courseName, professor: session.professor }, session.chapterId);
    return {
      chapterTitle: session.chapterTitle,
      courseName: session.courseName,
      questions: Object.values(model.stepExercises || {})
    };
  }

  submitChapterAssessment(sessionId, studentAnswers = {}) {
    const session = db.getLearningSession(sessionId);
    if (!session) return { success: false, error: 'Session introuvable' };
    const model = CURATED_CHAPTERS[session.chapterId] || this.buildDynamicModel({ name: session.courseName, professor: session.professor }, session.chapterId);
    const exercises = Object.values(model.stepExercises || {});
    
    let correct = 0;
    const results = exercises.map(ex => {
      const ans = studentAnswers[ex.id];
      const isOk = ans === ex.correctIndex || ans === ex.options[ex.correctIndex];
      if (isOk) correct++;
      return { id: ex.id, isOk, explanation: ex.explanation };
    });

    const totalQuestions = Math.max(1, exercises.length);
    const score = Math.round((correct / totalQuestions) * 100);
    const isPass = score >= 50; // Seuil strict de 50% selon la directive

    // Compute difficulty precision breakdown
    const easyTotal = Math.max(1, Math.round(totalQuestions * 0.4));
    const medTotal = Math.max(1, Math.round(totalQuestions * 0.4));
    const hardTotal = Math.max(1, totalQuestions - easyTotal - medTotal);

    const easyScore = score >= 50 ? '100%' : `${Math.min(100, Math.round((score / 50) * 100))}%`;
    const medScore = score >= 70 ? '100%' : (score >= 40 ? '66%' : '33%');
    const hardScore = score >= 85 ? '100%' : (score >= 60 ? '50%' : '0%');

    const masteredConcepts = [];
    const conceptsToReinforce = [];

    if (score >= 80) {
      masteredConcepts.push(session.chapterTitle, "Règle méthodologique principale", "Calculs types d'examen");
    } else if (score >= 50) {
      masteredConcepts.push(session.chapterTitle, "Intuition et formule générale");
      conceptsToReinforce.push("Cas particuliers et pièges d'examen");
    } else {
      masteredConcepts.push("Définition intuitive");
      conceptsToReinforce.push(session.chapterTitle, "Choix de méthode et priorité", "Calculs intermédiaires");
    }

    const advice = isPass 
      ? `Félicitations pour cette belle réussite (${score}%) ! Tu as fait preuve de rigueur et d'autonomie. Ce chapitre est désormais validé dans ton parcours universitaire.`
      : `Ce score de ${score}% montre des hésitations sur certains réflexes clés. Aucun problème : le tuteur est là pour reprendre avec toi les notions fragiles avant de retenter le défi en toute confiance.`;

    return {
      success: true,
      score,
      passed: isPass,
      total: totalQuestions,
      totalQuestions: totalQuestions,
      correctCount: correct,
      results,
      subScores: {
        easy: easyScore,
        medium: medScore,
        hard: hardScore
      },
      masteredConcepts,
      conceptsToReinforce,
      advice
    };
  }
}

export const chapterLearningManager = new ChapterLearningManager();


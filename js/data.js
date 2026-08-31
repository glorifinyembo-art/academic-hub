/**
 * UniDocs - Données Officielles & Document Unique
 * Faculté Polytechnique - Université de Lubumbashi (UNILU)
 */

const PROMOTIONS = [
  { id: 'all', name: 'Toutes les promotions', shortName: 'Toutes' },
  { id: 'prepo', name: 'Classe Préparatoire (Prépolytechnique)', shortName: 'Prépo (P0)' }
];

const DEPARTMENTS = [
  { id: 'all', name: 'Tous les départements', icon: 'layers' },
  { id: 'tronc', name: 'Sciences Fondamentales / Physique', icon: 'atom' }
];

const INITIAL_COURSES = [
  {
    id: 'prepo-phys102',
    code: 'PHYS102',
    name: 'Physique II (Électrostatique & Électromagnétisme)',
    promotion: 'prepo',
    semester: 'S2',
    department: 'tronc',
    credits: '6 ECTS',
    hours: '150h',
    description: 'Loi de Coulomb, balance de torsion (1785), champ et potentiel électrostatiques, théorème de Gauss et équations de Maxwell.'
  }
];

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-prepo-phys-coulomb',
    courseId: 'prepo-phys102',
    title: 'Loi de Coulomb (Électrostatique) & Détermination Expérimentale',
    type: 'cours',
    year: '2024-2025',
    semester: 'S2',
    description: 'Énoncé de la loi d\'interaction électrostatique, balance de torsion de Coulomb (1785), formulation vectorielle et scalaire, constante diélectrique, unités CGS/SI et généralisation aux équations de Maxwell (Jefimenko).',
    author: 'Charles-Augustin Coulomb / Chaire de Physique UNILU',
    size: '1.8 Mo',
    dateAdded: '2025-01-10',
    isFavorite: false,
    hasSolution: false,
    content: `<div class="space-y-6">
  <!-- Page 1 Header & Enoncé -->
  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-3">
    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-700 pb-2">
      <span class="tracking-wide">WIKIPÉDIA • L'ENCYCLOPÉDIE LIBRE & CHAIRE DE PHYSIQUE UNILU</span>
      <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[11px] font-bold">Document Officiel 5 Pages</span>
    </div>
    
    <h2 class="text-lg font-bold text-slate-900 dark:text-white">1. Loi de Coulomb (électrostatique)</h2>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
      La <strong>loi de Coulomb</strong> exprime, en électrostatique, la force de l'interaction électrique entre deux particules chargées électriquement. Elle est nommée d'après le physicien français <strong>Charles-Augustin Coulomb</strong> qui l'a énoncée en 1785 et elle forme la base de l'électrostatique.
    </p>

    <div class="p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border-l-4 border-blue-600 text-xs sm:text-sm italic text-blue-950 dark:text-blue-200 leading-relaxed shadow-xs">
      « L'intensité de la force électrostatique entre deux charges électriques est proportionnelle au produit des deux charges et est inversement proportionnelle au carré de la distance entre les deux charges. La force est portée par la droite passant par les deux charges. »
    </div>
  </div>

  <!-- Détermination expérimentale historique -->
  <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">2. Détermination expérimentale historique</h3>
      <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-semibold">Pages 1-2</span>
    </div>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
      Charles-Augustin Coulomb énonce la loi d'interaction électrostatique en 1785 à la suite de nombreuses mesures réalisées grâce à la <strong>balance de Coulomb (balance de torsion)</strong> qu'il a mise au point pour détecter des forces d'interaction très faibles.
    </p>
    <ul class="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
      <li><strong>Forces répulsives :</strong> Il s'agit d'une balance de torsion pour laquelle la mesure de l'angle de torsion à l'équilibre permet de déterminer l'intensité des forces répulsives.</li>
      <li><strong>Forces attractives :</strong> Dans le cas de forces attractives, c'est l'étude des oscillations du système qui permet de déterminer l'intensité des forces.</li>
      <li><strong>Dispositif expérimental :</strong> Une charge électrique est placée à l'extrémité d'une tige horizontale fixée à un fil vertical dont les caractéristiques de torsion sont préalablement établies. Le principe de la mesure consiste à compenser, grâce au couple de torsion du fil vertical, le couple exercé par une autre charge électrique amenée au voisinage de la charge fixée sur la tige.</li>
    </ul>
  </div>

  <!-- Formulation mathématique et vectorielle -->
  <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">3. Force de Coulomb & Expressions mathématiques</h3>
      <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-semibold">Page 2</span>
    </div>
    
    <p class="text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
      La force F&#8407;<sub>1/2</sub> exercée par une charge électrique q&#8321; placée au point r&#8407;&#8321; sur une charge q&#8322; placée au point r&#8407;&#8322; s'écrit :
    </p>

    <!-- Formule principale encadrée -->
    <div class="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800/80 font-mono text-center text-xs sm:text-base font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 shadow-inner overflow-x-auto">
      F&#8407;<sub>1/2</sub> = [ (q&#8321; &middot; q&#8322;) / (4&pi;&epsilon;&#8320; ||r&#8407;&#8322; - r&#8407;&#8321;||&sup3;) ] &middot; (r&#8407;&#8322; - r&#8407;&#8321;)
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Forme Scalaire</span>
        <div class="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">||F&#8407;|| = (1 / 4&pi;&epsilon;&#8320;) &middot; (|q&#8321; q&#8322;| / r&sup2;)</div>
        <p class="text-[11px] text-slate-500 dark:text-zinc-400">où r est la distance euclidienne entre les deux charges.</p>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Forme Vectorielle Unitaire</span>
        <div class="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">F&#8407;&#8321; = (1 / 4&pi;&epsilon;&#8320;) &middot; (q&#8321; q&#8322; r&#770;&#8321;&#8322; / |r&#8321;&#8322;|&sup2;)</div>
        <p class="text-[11px] text-slate-500 dark:text-zinc-400">r&#770;&#8321;&#8322; est le vecteur unitaire reliant q&#8322; vers q&#8321;.</p>
      </div>
    </div>

    <!-- Direction et 3ème loi de Newton -->
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
      <p><strong>3ème Loi de Newton (Action & Réaction) :</strong> <span class="font-mono font-bold text-blue-600 dark:text-blue-400">F&#8407;&#8322; = - F&#8407;&#8321;</span></p>
      <p><strong>Règles de répulsion et d'attraction :</strong></p>
      <ul class="list-disc pl-5 space-y-1 text-xs">
        <li>Si <span class="font-mono font-bold text-rose-600 dark:text-rose-400">q&#8321; &middot; q&#8322; &gt; 0</span> (même signe) : les charges se repoussent &rarr; <strong class="text-rose-600 dark:text-rose-400">Force répulsive</strong>.</li>
        <li>Si <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">q&#8321; &middot; q&#8322; &lt; 0</span> (signes opposés) : les charges s'attirent &rarr; <strong class="text-emerald-600 dark:text-emerald-400">Force attractive</strong>.</li>
      </ul>
    </div>
  </div>

  <!-- Constante de Coulomb et Table des Unités -->
  <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">4. Constante de Coulomb & Unités (SI et CGS)</h3>
      <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-semibold">Page 3</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-xs sm:text-sm text-left border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <tbody>
          <tr class="border-b border-slate-200 dark:border-zinc-800">
            <td class="py-2.5 px-3.5 font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 w-44">Unités SI</td>
            <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">N &middot; m&sup2; &middot; C&#8315;&sup2;</td>
          </tr>
          <tr class="border-b border-slate-200 dark:border-zinc-800">
            <td class="py-2.5 px-3.5 font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40">Dimension physique</td>
            <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">M &middot; L&sup3; &middot; T&#8315;&#8308; &middot; I&#8315;&sup2;</td>
          </tr>
          <tr class="border-b border-slate-200 dark:border-zinc-800">
            <td class="py-2.5 px-3.5 font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40">Symbole usuel</td>
            <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">k<sub>c</sub>, k<sub>e</sub> ou k<sub>0</sub></td>
          </tr>
          <tr class="border-b border-slate-200 dark:border-zinc-800">
            <td class="py-2.5 px-3.5 font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40">Lien à d'autres grandeurs</td>
            <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">k<sub>c</sub> = 1 / (4&pi;&epsilon;&#8320;)</td>
          </tr>
          <tr>
            <td class="py-2.5 px-3.5 font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40">Valeur numérique</td>
            <td class="py-2.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">8,987 551 792 3(14) &times; 10&#8313; N&middot;m&sup2;&middot;C&#8315;&sup2;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-slate-600 dark:text-zinc-400 pt-1 leading-relaxed">
      La constante universelle <strong>&epsilon;&#8320; &approx; 8,854 &times; 10&#8315;&sup1;&sup2; F&middot;m&#8315;&sup1;</strong> est la permittivité du vide. Dans le système CGS (utilisé en électrostatique anglo-saxonne), les distances sont en cm, les forces en dynes et la charge en esu (electrostatic unit).
    </p>
  </div>

  <!-- Généralisation dépendant du temps (Électrodynamique) -->
  <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">5. Généralisation dépendant du temps (Équations de Maxwell & Jefimenko)</h3>
      <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-semibold">Page 3</span>
    </div>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
      Les solutions générales et causales des équations de Maxwell sont données par les <strong>équations de Panofsky-Phillips</strong> ainsi que par les <strong>équations de Jefimenko</strong> (les deux sont équivalentes). Ces équations sont la généralisation, dépendant du temps (électrodynamique), de la loi de Coulomb et de la loi de Biot et Savart.
    </p>
    <div class="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1.5">
      <p class="font-bold">Propagation à vitesse finie et temps retardé :</p>
      <p class="text-xs leading-relaxed">
        Elles prennent en compte le retard dû à la propagation des champs (temps « retardé ») en raison de la valeur finie de la vitesse de la lumière c et des effets relativistes pour n'importe quelle distribution arbitraire de charges et de courants en déplacement.
      </p>
    </div>
  </div>

  <!-- Notes, Références et Bibliographie -->
  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 space-y-3.5 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">6. Notes, Références & Bibliographie</h3>
      <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-mono text-[10px] font-semibold">Pages 3-5</span>
    </div>
    
    <ol class="list-decimal pl-5 space-y-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
      <li><strong>Elie Levy</strong>, <em>Dictionnaire de physique</em>, Paris, Presses universitaires de France, 1988, 892 p. (ISBN 978-2-13-039311-5, BNF 34928543).</li>
      <li><strong>José-Philippe Pérez, Robert Carles et Robert Fleckinger</strong> (préf. Émile Durand), <em>Électromagnétisme : fondements et applications (avec 300 exercices et problèmes résolus)</em>, Paris, Dunod, coll. « Enseignement de la physique », 2001, 740 p. (ISBN 978-2-10-005574-6).</li>
      <li><strong>Bertrand Beaufils</strong>, <em>Formulaire maths, physique, chimie, SII, MPSI/MP</em>, Ellipses, coll. « prépa sciences », 2022, 399 p. (ISBN 9782340-070356).</li>
      <li><strong>Marc Séguin, Julie Descheneau et Benjamin Tardif</strong>, <em>Physique XXI, t. B : Électricité et magnétisme</em>, Bruxelles, De Boeck université, 2010 (ISBN 978-2-8041-6190-3).</li>
      <li><strong>Luís Alcácer</strong>, <em>Electronic structure of organic semiconductors : polymers and small molecules</em>, Morgan & Claypool, 2018 (ISBN 978-1-64327-165-1).</li>
      <li><strong>Andrea Macchi, Giovanni Moruzzi et Francesco Pegoraro</strong>, <em>Problems in classical electromagnetism : 157 exercises with solutions</em>, Cham, Springer, 2017 (ISBN 978-3-319-63132-5).</li>
    </ol>

    <div class="pt-2.5 border-t border-slate-200 dark:border-zinc-700 text-[11px] text-slate-400 dark:text-zinc-500 flex justify-between items-center flex-wrap gap-1">
      <span>Source : Wikipédia (Loi_de_Coulomb_(électrostatique))</span>
      <span>Unité d'enseignement PHYS102 • Faculté Polytechnique UNILU</span>
    </div>
  </div>
</div>`
  }
];

if (typeof window !== 'undefined') {
  window.PROMOTIONS = PROMOTIONS;
  window.DEPARTMENTS = DEPARTMENTS;
  window.INITIAL_COURSES = INITIAL_COURSES;
  window.INITIAL_DOCUMENTS = INITIAL_DOCUMENTS;
}

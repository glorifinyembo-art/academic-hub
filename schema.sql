-- ==============================================================================
-- SCHEMA SQL OFFICIEL UNIDOCS POUR VOTRE PROJET SUPABASE
-- À copier-coller dans Supabase > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. Création de la table des Cours / Matières
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    semester TEXT NOT NULL,
    promotion TEXT DEFAULT 'Licence 2 Informatique',
    icon TEXT DEFAULT 'book-open',
    color TEXT DEFAULT 'indigo',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Création de la table des Documents & Ressources (Cours, TP, TD, Examens, Interros)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cours', 'tp', 'exercice', 'examen', 'interro')),
    year TEXT DEFAULT '2024-2025',
    semester TEXT NOT NULL,
    description TEXT,
    content TEXT,
    author TEXT,
    file_url TEXT,
    size TEXT DEFAULT '1.2 Mo',
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revision_status TEXT DEFAULT 'todo' CHECK (revision_status IN ('todo', 'in_progress', 'completed')),
    is_favorite BOOLEAN DEFAULT FALSE,
    has_solution BOOLEAN DEFAULT FALSE
);

-- 3. Activation des Politiques de Sécurité (Row Level Security - RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture et l'écriture publiques pour l'application
CREATE POLICY "Acces public aux cours" ON public.courses FOR ALL USING (true);
CREATE POLICY "Acces public aux documents" ON public.documents FOR ALL USING (true);

-- 4. Insertion des matières initiales par défaut
INSERT INTO public.courses (id, code, name, semester, description) VALUES
('course-algo', 'INF-201', 'Algorithmique & Structures de Données', 'S1', 'Arbres, graphes, complexité et tris.'),
('course-bd', 'INF-202', 'Bases de Données & Modélisation SQL', 'S1', 'Modèle E/A, normalisation 1FN-3FN et requêtes SQL.'),
('course-os', 'INF-203', 'Systèmes d''Exploitation & Linux', 'S1', 'Processus, threads, sémaphores et mémoire virtuelle.'),
('course-math', 'MAT-201', 'Mathématiques & Probabilités', 'S1', 'Variables aléatoires discrètes, lois usuelles et algèbre.'),
('course-reseaux', 'INF-204', 'Réseaux & Protocoles TCP/IP', 'S2', 'Modèle OSI, routage, masques de sous-réseau et DNS/HTTP.'),
('course-poo', 'INF-205', 'Programmation Orientée Objet Java', 'S2', 'Encapsulation, héritage, polymorphisme et design patterns.')
ON CONFLICT (id) DO NOTHING;


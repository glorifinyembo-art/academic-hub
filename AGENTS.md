# Règles de travail pour l'agent de codage

## Objectif
Le projet est une application web front-end en JavaScript vanilla. L'agent doit respecter la structure existante et éviter toute modification inutile.

## Règles obligatoires
- Travailler dans le cadre du projet existant : HTML, CSS et JavaScript sans introduire un framework sans demande explicite.
- Préserver la structure actuelle : index.html, js/, css/, assets/, config.js et fichiers de données.
- Garder le code compatible navigateur et sans dépendances lourdes ou expérimentales.
- Faire des changements minimes et ciblés ; ne pas refactoriser sans nécessité.
- Ne pas supprimer une fonctionnalité existante sans vérifier le besoin métier et le flux de l'application.
- Ne jamais enregistrer de secrets, clés API, tokens ou identifiants directement dans le code source.
- Respecter les conventions de nommage déjà présentes dans le code.
- Si une correction est faite, expliquer clairement la cause racine et la solution.

## Vérification
- Vérifier toujours la syntaxe JavaScript avant de conclure.
- Utiliser les commandes de validation disponibles dans le projet si elles existent.
- Pour ce type de projet statique, la validation minimale est : `node --check` sur les fichiers JavaScript modifiés.

## Priorités
1. Corriger le bug réel.
2. Minimiser le risque de régression.
3. Maintenir le code lisible et cohérent.
4. Ne pas ajouter de complexité inutile.

## Contraintes
- Ne pas modifier le comportement de l'authentification, des données ou des suppressions sans preuve explicite.
- Ne pas inventer de nouvelles dépendances ou fichiers de configuration sans nécessité.
- Si une information manque, demander la précision avant d'écraser une logique existante.

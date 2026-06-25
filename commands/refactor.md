---
description: Analyse le projet pour identifier le code mort et propose une stratégie de refactoring globale.
---

# Instructions pour l'Assistant

Tu es un Expert en Architecture Logicielle et Clean Code. Ton objectif est d'assainir la base de code en identifiant les éléments inutiles et en optimisant la structure existante.

## Étape 1 : Analyse de la Structure (Audit)
Exécute une exploration complète pour cartographier le projet :
1.  **Graphe de Dépendances** : Identifie les points d'entrée (ex: `index.js`, `main.py`, `App.tsx`).
2.  **Recherche de Code Mort** :
    * Liste les fichiers qui ne sont jamais importés.
    * Identifie les fonctions ou variables exportées mais jamais utilisées ailleurs (utilise `grep` ou la recherche globale).
    * Repère les dépendances dans `package.json` (ou équivalent) qui ne sont jamais appelées dans le code.

## Étape 2 : Analyse de Qualité
Identifie les "Code Smells" :
* **Duplication** : Blocs de code identiques dans plusieurs fichiers.
* **Complexité** : Fonctions trop longues (> 50 lignes) ou trop imbriquées.
* **Responsabilité** : Fichiers qui font trop de choses (Dieu-objets).

### Checklist Centralisation

Avant de conclure l'analyse, verifier systematiquement :
* **Logique dupliquee** : La logique identifiee existe-t-elle deja dans un utilitaire centralise ? (chercher avec Grep dans `src/core/utils/`, `src/lib/`, `src/core/config/`)
* **Imports inutilises** : Apres refactoring, les anciens imports ont-ils ete supprimes ?
* **Constantes magiques** : Les valeurs magiques ont-elles ete extraites en constantes nommees dans un fichier de config ?
* **Source de verite unique** : Une meme constante ou logique est-elle definie dans plusieurs fichiers ? Si oui, centraliser dans un seul endroit et importer partout.

## Étape 3 : Proposition de Refactoring
Génère un rapport structuré sans modifier le code immédiatement.

### 1. 🗑️ Code Mort à Supprimer
* **Fichiers** : [Liste des fichiers inutilisés]
* **Fonctions/Variables** : [Nom] dans `[Fichier]` (inutile car...)

### 2. 🛠️ Améliorations de Structure (Refactoring)
Pour chaque proposition, explique le gain attendu :
* **Action** : (ex: Extraire la logique de validation dans un utilitaire séparé)
* **Fichiers impactés** : `file_A.js`, `file_B.js`
* **Gain** : (ex: Réduction de la duplication, testabilité accrue)

### 3. 📉 Dette Technique & Dépendances
* Suggestions de mise à jour ou de suppression de bibliothèques tierces inutilisées.

## Étape 4 : Plan d'Exécution
Fournis la commande ou la séquence de commandes pour commencer le nettoyage de manière sécurisée (commencer par les suppressions évidentes).

---
**Demande** : Analyse complète du projet pour code mort et refactoring.

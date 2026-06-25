# Spec d'exécution — Chantier 1 : Garde-fous (Strate A)

> Spec fine de construction. Calquée sur le pattern réel `gsd-prompt-guard.js` (lu).
> Principe : du code que le harness exécute, pas Claude. Obligatoire ≠ consigne, obligatoire = mécanique.

## Architecture retenue : UN dispatcher + UNE lib + données

```
hooks/
├── se-guard.mjs          ← dispatcher PostToolUse (thin stdin/stdout adapter)
├── guard-lib.mjs         ← logique pure, testable (1 fonction par garde-fou)
├── rules/
│   ├── slop-rules.json        ← marqueurs AI-slop FR (source unique, lu aussi par /humanizer plus tard)
│   ├── hardcode-patterns.json ← patterns valeurs/listes en dur
│   └── monolith-thresholds.json ← seuils lignes/fonction/fichier
└── se-guard.test.mjs     ← vérif unitaire (on VÉRIFIE, pas on espère)
```

**Pourquoi .mjs (ESM) et pas .js (CommonJS comme GSD) ?** Le pattern GSD utilise `require`. On peut rester en CommonJS pour la cohérence avec l'existant, OU passer en ESM. Décision : **CommonJS `.cjs`** pour matcher exactement le pattern GSD éprouvé et éviter tout souci d'ESM sur Windows. → fichiers `.cjs`.

## Le pattern de base (calqué sur gsd-prompt-guard.js)

Chaque hook :
1. lit stdin avec `setTimeout(() => process.exit(0), 3000)` (jamais bloquer)
2. `JSON.parse(input)` dans un try/catch
3. filtre sur `data.tool_name` (Write/Edit/MultiEdit)
4. lit `data.tool_input.file_path` + `content || new_string`
5. scanne
6. si findings : sortie `{ hookSpecificOutput: { hookEventName, additionalContext } }`
7. `catch { process.exit(0) }` — silent fail absolu

## Les garde-fous du dispatcher PostToolUse (5 advisory)

Le dispatcher `se-guard.cjs` route selon le type de fichier touché et lance les détecteurs pertinents. Tous **advisory** (souffle, n'bloque jamais — exit 0). Sortie groupée en un seul additionalContext.

### 1. humanizer-guard
- **Déclencheur** : fichier user-facing. Heuristique chemin (pas de liste en dur figée — patterns) : contient `(public)`, `/emails/`, `/blog/`, `.copy.`, `/landing`, `/content/`, FAQ, ou extension de page avec contenu FR détecté.
- **Détection** : présence de ≥2 marqueurs de `slop-rules.json` (règle des clusters).
- **Action** : « Ce fichier semble user-facing et contient des marqueurs AI-slop. Passe /humanizer avant de finir. »

### 2. ui-guard
- **Déclencheur** : `.tsx`, `.jsx`, `.css`, `.scss`, ou composant.
- **Détection** : (phase 1 simple) rappel si pas de `design/DESIGN-SYSTEM.md` lu cette session. (Le détecteur visuel Playwright viendra au chantier 3.)
- **Action** : « Tu touches du front. Vérifie design/DESIGN-SYSTEM.md. »

### 3. hardcode-guard
- **Déclencheur** : fichier source (`.ts`, `.tsx`, `.js`, `.jsx`).
- **Détection** : patterns de `hardcode-patterns.json` — nombres magiques hors `0/1/-1` non extraits en const, listes de strings en dur (tableaux de catégories/noms), chemins absolus. Respecte CLAUDE.md « no hardcoded lists ».
- **Exclusions** : lignes commentées, `*.config.*`, `*.test.*`, fichiers de constantes (`constants.ts`).
- **Action** : « Valeur(s)/liste(s) hardcodée(s) détectée(s) ligne X. Extraire en constante / config ? »

### 4. hygiene-guard
- **Déclencheur** : fichier source.
- **Détection** : `console.log` (hors logger), imports apparemment inutilisés (heuristique : importé mais nom absent du reste), code commenté en bloc.
- **Action** : « console.log / import inutilisé / code mort détecté. »

### 5. monolith-guard (advisory — décidé par Paul)
- **Déclencheur** : fichier source.
- **Détection** : seuils de `monolith-thresholds.json` — fichier > N lignes, fonction > M lignes, > K exports.
- **Action** : « Ce fichier/cette fonction devient gros (X lignes). Découper ? » — JAMAIS bloquant.

## Les garde-fous bloquants (2, séparés — PAS dans le dispatcher PostToolUse)

### 6. size-gate (bloquant)
- **Événement** : `PreToolUse` matcher `Write|Edit`.
- **Déclencheur** : file_path se termine par `STATE.md` ou `ROADMAP.md` dans `.planning/`.
- **Détection** : compte les lignes du `content` proposé.
- **Action** : si STATE > 150 ou ROADMAP > 200 → **bloque** via `permissionDecision: "deny"` + raison « archive le vieux d'abord ». Avertit (advisory) dès 90%.
- **Note technique** : un PreToolUse peut bloquer via `hookSpecificOutput.permissionDecision = "deny"`. À implémenter dans un hook séparé `se-size-gate.cjs`.

### 7. slop-gate (bloquant au commit)
- **⚠️ Pas d'event `PreCommit` natif** (vérifié dans le schéma settings). Donc : `PreToolUse` matcher sur `Bash`, condition `if: "Bash(git commit*)"`.
- **Détection** : scanne les fichiers user-facing stagés pour marqueurs slop non traités (≥2).
- **Action** : bloque le commit (`permissionDecision: "deny"`) si slop détecté.
- **Phase** : à câbler au chantier 6 (quand slop-rules est mûr). Phase 1 : on pose juste le dispatcher advisory.

## archive-hook (8) — séparé, pas un détecteur de contenu
- Déclenché à ship (pas un hook PostToolUse Edit). Déplace dossier phase → `_archive/`. À traiter au chantier 2 (anti-entropie), pas ici.

## Déclaration settings.json (à AJOUTER, ne pas casser l'existant)
Les hooks GSD restent. On ajoute :
```json
"PostToolUse": [ { "matcher": "Edit|Write|MultiEdit",
  "hooks": [ { "type": "command", "command": "node \"<dir>/hooks/se-guard.cjs\"", "timeout": 5 } ] } ]
```
(Le PreToolUse size-gate et slop-gate viendront ensuite.)

## Garde de ré-entrance
Env `SE_GUARD_DEPTH`. Si déjà set → exit 0 immédiat.

## PLAN DE CONSTRUCTION (phase 1 du chantier)
1. `rules/slop-rules.json` — extraire les marqueurs depuis humanizer.md (sous-ensemble détectable mécaniquement).
2. `rules/hardcode-patterns.json` + `monolith-thresholds.json`.
3. `guard-lib.cjs` — fonctions pures (1 par garde-fou) qui retournent `[{id, message}]`.
4. `se-guard.cjs` — dispatcher (calque gsd-prompt-guard).
5. `se-guard.test.cjs` — tests : un fichier propre → 0 finding ; un fichier piégé → findings attendus.
6. **VÉRIFIER** : lancer le hook à la main avec un faux event JSON, voir la sortie. PUIS câbler dans settings local du projet (pas global tout de suite).

## Principe de vérification (à chaque garde-fou)
On ne déclare jamais un hook « fait » sans l'avoir exécuté sur un cas propre (0 bruit) ET un cas piégé (finding attendu). Test déterministe, pas « ça devrait marcher ».

---
description: Démarrage d'un nouveau projet. Orchestre l'onboarding complet — accueil cofondateur (pilot), brainstorming pour explorer l'idée, rédaction d'un PRD structuré, lancement des recherches (tech + concurrents + scientifique), puis génération de la roadmap GSD. Point d'entrée d'un projet vierge.
---

# /se-new-project — Démarrage de projet (pilot → brainstorm → PRD → research → roadmap)

Tu orchestres le lancement d'un nouveau projet. Tu n'exécutes pas tout toi-même : tu **enchaînes les bons skills dans l'ordre**, en t'arrêtant pour les décisions humaines. Chaque étape produit un artefact que la suivante consomme.

**Posture** : tu es le cofondateur (pilot). Tu accueilles, tu challenges l'idée, tu cadres. Tu ne fonces pas — tu poses les bonnes questions avant de structurer.

## Pré-vol
1. Vérifie qu'on est bien sur un projet vierge (pas de `.planning/PROJECT.md` existant). Si un projet existe déjà → "Un projet est déjà initialisé ici. Tu veux un nouveau milestone (`/gsd-new-milestone`) plutôt qu'un /se-new-project ?"
2. Crée l'arborescence `.planning/` si absente (cf. `~/.claude/se/CONVENTIONS.md`).

## Étape 1 — Accueil cofondateur (pilot)
Endosse la posture du pilot, puis **invoque le skill `se-interview`** (outil Skill) : il porte la mécanique (frontière, rounds numérotés, réponse recommandée, critère de fin), tu portes le contenu.

La frontière de départ :
- C'est quoi le produit, en une phrase ? Pour qui ?
- Quel est le problème réel qu'il résout ? (le "pourquoi maintenant")
- C'est un projet perso, un side-project, un truc à lancer vite ? Quelle deadline business si elle existe ?
- Stack imposée ou libre ? (défaut : Next.js 15 / Tailwind / Railway / Postgres-ou-Supabase / Prisma / Vitest / Playwright, auth Supabase ou BetterAuth)

Les réponses ouvrent la suite de l'arbre (le produit détermine la plateforme, la deadline détermine l'ambition du MVP). L'étape 1 est finie quand la frontière est vide, pas quand ces quatre questions ont reçu une réponse.

**Challenge l'idée** (méthode cofondateur) : si le concept est flou ou bancal, le dire franchement avec une alternative, avant d'aller plus loin. Steelman les objections évidentes. Mais reste constructif : le but est de cadrer, pas de décourager.

## Étape 2 — Brainstorming (si l'idée mérite d'être explorée)
Si l'idée est large, exploratoire, ou que l'utilisateur hésite sur la direction :
- Propose `/se-brainstorm-heavy` (exploration profonde, 61 techniques) ou `/se-brainstorm-light` (rapide, focalisé).
- "L'idée est encore ouverte. On fait un brainstorming pour explorer les angles avant de figer le PRD ? (`/se-brainstorm-heavy` ou `/se-brainstorm-light`)"
- Si l'idée est déjà claire et cadrée → **SKIP**, on passe direct au PRD.
- Les idées retenues du brainstorming nourrissent le PRD (features candidates, différenciation).

Ne JAMAIS imposer le brainstorming. C'est une proposition.

## Étape 3 — Rédaction du PRD
Produis un PRD structuré dans `.planning/PRD.md`. Format :

```markdown
# PRD — [Nom du projet]

**Rédigé le** : [date]  **Source** : /se-new-project

## 1. Vision
[Le produit en une phrase + le problème résolu]

## 2. Utilisateurs cibles
[Personas pressentis — à approfondir avec /se-ux + PERSONAS.md plus tard]

## 3. Proposition de valeur
[Pourquoi ce produit, ce qui le différencie]

## 4. Features (MVP vs plus tard)
### MVP (lancement)
- [feature 1] — [pourquoi essentielle]
### Post-MVP
- [feature reportée]

## 5. Contraintes
- Stack : [...]
- Deadline business : [...]
- Contraintes connues : [...]

## 6. Critères de succès
[Ce qui définit "le MVP est réussi", point de vue utilisateur]

## 7. Zones grises / décisions à trancher
[Ce qui nécessite une recherche avant de figer]
```

Confirme avec l'utilisateur : "Ce PRD capture bien ton projet ? On ajuste avant de lancer les recherches ?"

## Étape 4 — Recherches (les zones grises du PRD)
Pour chaque zone grise / décision archi du PRD section 7, lance la recherche adaptée via `/se-research` :
- **Tech / archi / libs** : "quelle stack pour X ?", "Mem0 vs Graphiti ?"
- **Concurrents / marché** : "qui fait déjà ça ? comment ?"
- **Scientifique** (si le sujet a une littérature : ML, biotech, etc.) : `/se-research deep` exploite les 4 APIs académiques.

Lance-les en parallèle si elles sont indépendantes (un `/se-research` par sujet, plus efficace). Les verdicts alimentent les décisions archi de la roadmap.

"Le PRD soulève [N] décisions à éclairer. Je lance [N] recherches en parallèle ? (`/se-research deep` sur chaque)"

Si aucune zone grise (projet simple, stack claire) → **SKIP**.

## Étape 5 — Roadmap GSD
Une fois PRD + recherches en main, génère la roadmap. Délègue au moteur GSD :
- Invoque `/gsd-new-project` (ou son flux roadmap) en lui passant le PRD comme contexte d'entrée.
- Le PRD remplace le questioning bottom-up : les décisions sont déjà prises.
- Produit `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` (phases), `STATE.md`, `config.json`.

## Étape 6 — Contrat de design (OBLIGATOIRE si le projet a un front)

Sans ce contrat, tout le dispositif UI tourne à vide : le checkpoint visuel mesure du contraste
générique, mais il n'a aucun référentiel de marque à opposer au code. Et un agent sans direction
déclarée glisse toujours vers le même défaut par gravité — `Inter` + dégradé violet + cartes
arrondies. C'est la signature visuelle du contenu généré.

**Skip total si la stack n'a pas d'interface** (CLI, lib, API pure) : dis-le et passe à l'étape 7.

Sinon, remplis `.planning/design/DESIGN-SYSTEM.md` avec l'humain. Trois blocs non négociables :

1. **§0.1 Plateforme cible** — `web` | `macos` | `ios` | `android` | … Elle détermine quel corpus
   de règles fait foi (`~/.claude/se/vendor/design/platform-design-skills/`). Un desktop conçu comme une page
   web est un desktop raté : cette réponse change tout le reste.
2. **§0.2 Direction esthétique** — nom de la direction, ce qu'elle doit faire ressentir et à qui,
   anti-référence, registre dominant. Une direction se choisit, elle ne se découvre pas en codant.
   Sur projet vierge, propose des directions argumentées :
   ```bash
   python "$HOME/.claude/se/vendor/design/ui-ux-pro-max/scripts/search.py" "<type de produit>" --design-system
   ```
   Le choix reste humain. Une direction non déclarée est un BLOCK (`aesthetic-direction-declared`).
3. **§0.3 Molettes** — `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` (1-10). Les défauts
   5/4/5 conviennent si l'humain n'a pas d'avis ; explique juste ce qu'elles changent. Elles
   remplacent les débats de goût : « c'est trop chargé » devient « baisse VISUAL_DENSITY à 4 ».

Les tokens précis (couleurs OKLCH, échelle typo) n'ont pas à être arrêtés maintenant — les tableaux
du MASTER servent de défaut et la phase fondations les affinera. Ce qu'on verrouille ici, c'est la
**direction**, parce qu'elle est coûteuse à changer après le premier composant.

Enfin, retire la ligne `Statut : SQUELETTE` en tête du fichier une fois les trois blocs remplis.

## Étape 7 — Cadrage des toggles + clôture
- Propose d'activer les gates qualité du cycle : "On active simplify-gate / janitor-gate / wiring-gate / security-gate pour ce projet ? (recommandé pour un projet où tu connais peu le code)". Si oui, confirme-les dans `.planning/config.json` (`workflow.simplify_gate`, `workflow.janitor_gate`, `workflow.wiring_gate`, `workflow.security_gate`). (Le TDD se pilote par tâche via `tdd="true"` au plan, pas par un toggle global.)
- **Setup Playwright (si stack front + Playwright)** : pose les templates de vision dès maintenant pour que la phase fondations n'ait plus qu'à installer la dépendance :
  - copie `$HOME/.claude/se/templates/playwright.config.template.ts` → `playwright.config.ts` et `$HOME/.claude/se/templates/checkpoint-shots.template.ts` → `tests/e2e/checkpoint-shots.ts` ;
  - inscris dans la phase fondations de la roadmap la tâche `npm i -D @playwright/test` (la dépendance ne peut s'installer qu'une fois le `package.json` créé au scaffolding) ;
  - laisse `workflow.visual_checkpoint` et `workflow.ui_front_pass` à `true` (défaut). Le checkpoint visuel du cycle prend le relais automatiquement dès qu'une phase touche du front.
  - Si la stack n'a pas de front (CLI, lib, API pure) → **SKIP**, ne pose pas Playwright.
- Mets à jour `INDEX.md`.
- Briefing de clôture : "Projet initialisé. PRD + [N] recherches + roadmap [M] phases. Prochaine étape : `/gsd-discuss-phase 1` ou `/se-pilot` pour discuter la phase 1."

## Règles
1. Tu ORCHESTRES, tu ne refais pas le travail des skills (brainstorm, research, gsd:new-project font leur job).
2. Chaque étape skippable si non pertinente (brainstorm, research) — ne force jamais. **Sauf l'étape 6** : sur un projet avec interface, le contrat de design n'est pas optionnel. Sans front, elle est entièrement skippée.
3. L'humain valide le PRD avant les recherches, et les recherches avant la roadmap.
4. Posture cofondateur tout du long : challenge, vision, pragmatisme.

---
**Idée de projet** : $ARGUMENTS

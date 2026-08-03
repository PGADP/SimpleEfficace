# vendor/design — corpus de design importés

Trois corpus open-source vendorisés en **sous-ensemble curaté** : seuls les payloads
que les skills SE lisent réellement. Les installeurs, extensions navigateur, serveurs
d'édition live, démos et suites de tests restent chez l'upstream.

Généré par `node "$HOME/.claude/se/scripts/sync-design-vendors.cjs"`. Versions épinglées dans
[VERSIONS.json](VERSIONS.json), licences et attributions dans [NOTICE.md](NOTICE.md).

**Ne jamais éditer un fichier de ce dossier** : la prochaine synchro l'écrasera. Les
adaptations Simple & Efficace vivent dans `~/.claude/se/references/design/`.

---

## Ce que contient chaque corpus, et quand SE s'en sert

### `impeccable/` — le langage de design (Apache-2.0)

| Chemin | Contenu | Consommé par |
|---|---|---|
| `reference/*.md` | 34 playbooks : `craft`, `critique`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `animate`, `typeset`, `colorize`, `layout`, `onboard`, `optimize`… + `craft-floor.md` (le plancher de qualité) | `/se-ui`, chargés **à la demande** selon le mode |
| `detector/` + `detect.mjs` | Détecteur déterministe d'anti-patterns. Aucun appel API, zéro dépendance | hook `ui-guard`, gate visuelle |
| `SKILL.src.md` | Principes et registres (Persuade / Operate / Read / Experience) | `/se-ui` |

Le détecteur scanne **des fichiers ou une URL live** :

```bash
node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json src/
node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json --viewport 390x844 http://localhost:3000
```

C'est le seul des trois corpus à produire un verdict mesurable — d'où sa place dans
les gates plutôt que dans les prompts.

### `platform-design-skills/` — la conformité plateforme (MIT)

`skills/{web,macos,ios,ipados,android,watchos,visionos,tvos}/` — chacun avec un
`SKILL.md` et un `rules/_sections.md` sectionné (accessibilité, navigation, layout,
gestes, composants). Couvre Apple HIG, Material Design 3 et WCAG 2.2.

C'est le corpus qui répond à « appli **et** desktop » : `macos/` (barres de menus,
gestion de fenêtres, raccourcis clavier) n'a d'équivalent nulle part ailleurs.

Consommé par `/se-ui` et `/se-ux` selon la **plateforme cible déclarée** dans
`.planning/design/DESIGN-SYSTEM.md`. Un seul fichier plateforme est chargé par session.

### `ui-ux-pro-max/` — les bases de données de direction (MIT)

`data/*.csv` (styles, palettes, pairings typo, guidelines UX, types de produits,
motion, icônes, charts) + `scripts/search.py`, un moteur BM25 en stdlib Python.

```bash
python "$HOME/.claude/se/vendor/design/ui-ux-pro-max/scripts/search.py" "dashboard finance" --domain style --json
python "$HOME/.claude/se/vendor/design/ui-ux-pro-max/scripts/search.py" "saas b2b" --design-system \
  --variance 6 --motion 4 --density 7
```

Le moteur accepte nativement `--variance`, `--motion` et `--density` : ce sont les
trois molettes déclarées dans `DESIGN-SYSTEM.md`.

> **Cantonné au bootstrap.** Ce corpus *génère* un design-system ; il n'en *juge*
> aucun. Il sert à choisir une direction quand il n'existe pas encore de
> `DESIGN-SYSTEM.md` rempli (`/se-new-project`, `/gsd:ui-phase` sur projet vierge).
> L'invoquer en cours de projet crée une seconde source de vérité qui entre en
> conflit avec le contrat — c'est interdit par les skills.

---

## Répartition des rôles

| Besoin | Corpus |
|---|---|
| Choisir une direction esthétique (projet vierge) | ui-ux-pro-max |
| Écrire / critiquer / polir une interface | impeccable |
| Respecter les conventions d'une plateforme | platform-design-skills |
| Rendre un verdict mesurable | impeccable `detector/` + `~/.claude/se/scripts/ui-verdict.cjs` |

## Mise à jour

```bash
node "$HOME/.claude/se/scripts/sync-design-vendors.cjs" --check   # y a-t-il du drift upstream ?
node "$HOME/.claude/se/scripts/sync-design-vendors.cjs"           # resynchroniser
```

Volontairement manuel. Ces repos bougent vite et une mise à jour automatique
changerait le comportement des gates sans que personne ne l'ait décidé.

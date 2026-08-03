# DESIGN-SYSTEM — contrat de design unique

> LE fichier lu par TOUS les skills/agents UI (researcher, checker, auditor) et par le hook `ui-guard`.
> Source unique : on ne redéfinit jamais un token ou un critère ailleurs.
> Pattern MASTER + overrides : ce fichier est le MASTER global. Une page peut surcharger une valeur
> dans `design/pages/{route}.md` (override explicite, documenté), sinon le MASTER s'applique.
>
> Stack : Next.js 15 + Tailwind + OKLCH dans le thème. Composants : shadcn/ui par défaut.
> Statut : SQUELETTE — à remplir au premier projet réel avec les vraies valeurs de marque.

---

## 0. Les 3 couches du design-system (où est la vérité)

Le design-system repose sur 3 couches autonomes et optionnelles :

1. **Couche VITRINE (optionnelle)** : une page vivante rendue (ex `/dev/design-system`) qui importe les vrais composants du projet. C'est la référence VISUELLE pour l'humain et le checkpoint principal du cycle QA.

2. **Couche TOKENS JSON (optionnelle)** : un fichier `.planning/design/design-tokens.json` contenant les valeurs précises des tokens (couleurs en OKLCH, tailles typographiques, espacements). Si présent, les agents le lisent pour obtenir des valeurs exactes plutôt que de parser les tableaux du .md.

3. **Couche MASTER (ce fichier)** : contient les règles, la philosophie, les 6 piliers, et les tableaux de tokens en fallback. Est aussi un POINTEUR vers la vitrine et le JSON quand ils existent. Ne duplie jamais les valeurs : pointe vers la source unique.

**Pointeurs du projet** :
- Page vitrine : (à remplir : route de la page design-system vivante, ex `/dev/design-system`, ou `aucune`)
- Tokens JSON : (chemin `design/design-tokens.json` si présent, sinon les tokens sont dans les tableaux ci-dessous)

Principe clé : un agent ne doit JAMAIS lire une page .tsx de 69 Ko en entier. Il lit ce fichier (léger) + le JSON (précis, optionnel) et renvoie l'humain vers la page vitrine pour validation visuelle Playwright.

---

## 0.1 Plateforme cible

Détermine quel corpus de conventions fait foi. Les agents chargent **un seul** fichier de règles plateforme par session.

| Champ | Valeur |
|-------|--------|
| Plateforme principale | *(à remplir : `web` \| `macos` \| `ios` \| `ipados` \| `android` \| `watchos` \| `visionos` \| `tvos`)* |
| Plateformes secondaires | *(ou `aucune`)* |
| Règles de référence | `vendor/design/platform-design-skills/skills/<plateforme>/rules/_sections.md` |

Ce que ça change concrètement :

- **`web`** — responsive 3 breakpoints, WCAG 2.2 AA, Core Web Vitals, améliorations progressives.
- **`macos` (desktop)** — barre de menus et raccourcis clavier complets, gestion des fenêtres et de leur restauration, densité d'information supérieure au web, undo systématique, curseur plutôt que cible tactile. Un desktop conçu comme une page web est un desktop raté.
- **`ios` / `android`** — cibles tactiles ≥ 44pt, gestes natifs, navigation propre à la plateforme, HIG (Liquid Glass) ou Material 3 Expressive.

En multi-plateforme, la règle **la plus stricte** l'emporte sur chaque critère ; toute divergence assumée s'inscrit en section 6.

## 0.2 Direction esthétique (à déclarer AVANT le premier composant)

| Champ | Valeur |
|-------|--------|
| Nom de la direction | *(à remplir, ex. « éditorial suisse », « brutalisme technique », « organique chaleureux »)* |
| Pourquoi elle sert ce produit | *(1-2 phrases : ce que la direction doit faire ressentir, à qui)* |
| Anti-référence | *(ce qu'on refuse explicitement de ressembler)* |
| Registre dominant | *(`Persuade` \| `Operate` \| `Read` \| `Experience` — cf. `vendor/design/impeccable/SKILL.src.md`)* |

**Le défaut par gravité est banni** : `Inter` + dégradé violet + cartes arrondies + ombres douces. C'est vers là que tout agent glisse en l'absence de direction déclarée, et c'est la signature visuelle du contenu généré. Une direction non déclarée est un BLOCK (`aesthetic-direction-declared`).

Une direction se choisit, elle ne se découvre pas en codant. Sur projet vierge, `python vendor/design/ui-ux-pro-max/scripts/search.py "<type de produit>" --design-system` propose des directions argumentées — le choix reste humain.

## 0.3 Molettes (calibrage du projet, 1-10)

| Molette | Valeur | Effet |
|---------|--------|-------|
| `DESIGN_VARIANCE` | *(défaut 5)* | 1-3 : centré, sobre, conventionnel. 8-10 : asymétrique, composition expressive |
| `MOTION_INTENSITY` | *(défaut 4)* | 1-3 : hover et focus seulement. 8-10 : scroll, parallaxe, transitions orchestrées |
| `VISUAL_DENSITY` | *(défaut 5)* | 1-3 : aéré, une idée par écran. 8-10 : dense, outil de travail expert |

Ces trois valeurs sont lues par `/se-ui` à chaque conception et passées telles quelles au moteur de direction (`search.py --variance N --motion N --density N`). Elles remplacent les débats de goût par un réglage explicite : « c'est trop chargé » devient « baisse VISUAL_DENSITY à 4 ».

Cohérence attendue : un `MOTION_INTENSITY` ≥ 7 impose une implémentation soignée de `prefers-reduced-motion` (BLOCK `motion-respects-reduced`).

---

## 1. Tokens couleur (OKLCH, mappés Tailwind)

> Règle d'or impeccable : jamais de noir pur ni de blanc pur. Toujours des tons teintés.

| Token | Lightness OKLCH | Usage |
|-------|-----------------|-------|
| `--color-ink` | ~10% | Corps de texte. **Même pour le petit texte.** |
| `--color-charcoal` | ~25% | Titres ou corps ≥ 16px uniquement (gris délavé en petit) |
| `--color-ash` | ~55% | Labels secondaires, captions, méta |
| `--color-surface` | ~92-97% | Surfaces / fonds de carte |
| `--color-bg` | ~98% | Fond de page |
| `--color-accent` | (à définir) | **Réservé** : CTA primaire, état actif, focus ring. RIEN d'autre. |
| `--color-destructive` | (à définir) | Actions destructrices uniquement |

Répartition couleur : **60 / 30 / 10** (dominant / secondaire / accent) déclarée explicitement.

## 2. Typographie (max 4 tailles, max 2 poids)

| Rôle | Taille | Poids | Line-height |
|------|--------|-------|-------------|
| Label | 14px | 500 | 1.5 |
| Body | 16px | 400 | 1.6 |
| Heading | 20px | 600 | 1.3 |
| Display | 28px (clamp max ≤ 6rem) | 700 | 1.2 |

- Pairing : contraste d'axe (serif+sans, ou géométrique+humaniste), jamais 2 sans proches.
- `text-wrap: balance` sur h1–h3 ; `text-wrap: pretty` sur prose longue.
- Letter-spacing display : ≥ -0.04em (pas plus serré).

## 3. Espacement (grille 4px)

Échelle standard : **4, 8, 16, 24, 32, 48, 64**. Toute valeur hors de cette échelle = exception à documenter.
Mapping Tailwind : `p-1`=4px, `p-2`=8px, `p-4`=16px, `p-6`=24px, `p-8`=32px, `p-12`=48px, `p-16`=64px.

Exception légitime connue : **44px** touch target (WCAG 2.5.5 / Apple HIG).

## 4. Composants

Base : **shadcn/ui officiel**. Tout registre tiers passe le Safety Gate (cf. pilier 6).
Registre local des composants verrouillés : *(à remplir — Button, Card, Input, etc. + chemin)*

## 5. Les 10 piliers (contrat de qualité)

Détail chiffré, exemples Code Good/Bad et critères mesurables : voir `.planning/rules/ui-rules.json` (source unique des critères).

| # | Pilier | Norme | Vérifié par |
|---|--------|-------|-------------|
| 1 | **Copywriting** | CTA = verbe + nom spécifique. États vides/erreur avec chemin de solution. Jamais "Submit/OK/Cliquez ici" | `/se-humanizer` sur les textes extraits du rendu |
| 2 | **Visuals** | Focal point déclaré, hiérarchie explicite, direction esthétique nommée, zéro anti-pattern | détecteur impeccable + jugement |
| 3 | **Color** | Accent réservé à une liste explicite, 60/30/10, pas de noir/blanc purs | surface d'accent mesurée |
| 4 | **Typography** | ≤ 4 tailles, ≤ 2 poids, ≤ 2 familles, échelle nette | styles calculés du rendu |
| 5 | **Spacing** | Multiples de 4, cibles ≥ 44px | styles calculés du rendu |
| 6 | **Registry Safety** | shadcn officiel, ou tiers + Safety Gate "view passed" | jugement |
| 7 | **Accessibility** | WCAG 2.2 AA : zéro violation critical/serious, focus visible, clavier, `lang` | axe-core |
| 8 | **Motion** | `prefers-reduced-motion` respecté, transitions ≤ 400ms | rendu sous media query |
| 9 | **States** | loading / empty / error / success / disabled existent tous | captures par état |
| 10 | **Performance** | LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 | mesure navigateur |

Mapping Severity → verdict : **BLOCK** (refus), **FLAG** (note non bloquante), **PASS**.
Règle DOWNGRADE : une exception **documentée avec raison standard** rétrograde BLOCK → FLAG, sauf sur les dimensions non négociables (Copywriting, Registry Safety, **Accessibility**).

Une mesure absente ne bloque jamais : la règle est marquée SKIPPED. On refuse de bloquer sur ce qu'on n'a pas su mesurer.

## 6. Exceptions DS documentées

*(Aucune au démarrage. Toute exception future : token/règle concerné + raison citant un standard ou une contrainte réelle. "Le designer voulait" n'est pas une raison.)*

---

## Prompt de lecture hiérarchique (pour les agents UI)

1. Lis CE fichier (MASTER) en premier : règles, philosophie, pointeurs vers les autres couches.
2. Si `design/design-tokens.json` existe, lis-le AVANT les tableaux de tokens ci-dessous. Préfère ses valeurs pour l'exactitude.
3. Si la tâche cible une route précise, vérifie `design/pages/{route}.md` - s'il existe, ses valeurs **surchargent** le MASTER pour cette page.
4. Pour les critères de validation détaillés (Do/Don't/Code), lis `rules/ui-rules.json`.
5. Pour le parcours/valeur utilisateur, lis `design/PERSONAS.md` (skill /se-ux).
6. Si une page vitrine est déclarée en section 0 : ne la lis pas en entier. Utilise-la comme cible de capture Playwright au checkpoint visuel pour validation visuelle réelle.

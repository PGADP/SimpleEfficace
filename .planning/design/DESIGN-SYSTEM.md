# DESIGN-SYSTEM — contrat de design unique

> LE fichier lu par TOUS les skills/agents UI (researcher, checker, auditor) et par le hook `ui-guard`.
> Source unique : on ne redéfinit jamais un token ou un critère ailleurs.
> Pattern MASTER + overrides : ce fichier est le MASTER global. Une page peut surcharger une valeur
> dans `design/pages/{route}.md` (override explicite, documenté), sinon le MASTER s'applique.
>
> Stack : Next.js 15 + Tailwind + OKLCH dans le thème. Composants : shadcn/ui par défaut.
> Statut : SQUELETTE — à remplir au premier projet réel avec les vraies valeurs de marque.

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

## 5. Les 6 piliers (contrat de qualité)

Détail chiffré et exemples Code Good/Bad : voir `.planning/rules/ui-rules.json` (source unique des critères).

1. **Copywriting** — CTA = verbe + nom spécifique. États vides/erreur avec chemin de solution. Jamais "Submit/OK/Cliquez ici".
2. **Visuals** — focal point déclaré, hiérarchie visuelle explicite, icônes + labels.
3. **Color** — accent réservé à une liste explicite (jamais "tous les éléments interactifs"). 60/30/10.
4. **Typography** — ≤4 tailles, ≤2 poids, échelle hiérarchique claire.
5. **Spacing** — multiples de 4, exceptions documentées (44px WCAG).
6. **Registry Safety** — shadcn officiel, ou tiers + Safety Gate "view passed".

Mapping Severity → verdict : **BLOCK** (refus), **FLAG** (note non bloquante), **PASS**.
Règle DOWNGRADE : une exception **documentée avec raison standard** rétrograde BLOCK → FLAG (sauf Copywriting et Registry Safety, non négociables).

## 6. Exceptions DS documentées

*(Aucune au démarrage. Toute exception future : token/règle concerné + raison citant un standard ou une contrainte réelle. "Le designer voulait" n'est pas une raison.)*

---

## Prompt de lecture hiérarchique (pour les agents UI)

1. Lis CE fichier (MASTER) en premier.
2. Si la tâche cible une route précise, vérifie `design/pages/{route}.md` — s'il existe, ses valeurs **surchargent** le MASTER pour cette page.
3. Pour les critères de validation détaillés (Do/Don't/Code), lis `rules/ui-rules.json`.
4. Pour le parcours/valeur utilisateur, lis `design/PERSONAS.md` (skill /ux).

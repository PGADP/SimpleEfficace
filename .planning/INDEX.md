# INDEX — carte du projet

> La carte de tout. On lit ce fichier pour s'orienter, jamais un grep.
> Se remplit au fur et à mesure que le projet avance.

## Pilotage

- STATE.md — état du jour *(créé par `/se-new-project` ou `/gsd:new-project`)*
- ROADMAP.md — jalons *(créé au cadrage)*
- PROJECT.md — produit + décisions *(créé au cadrage)*
- PRD.md — cahier des charges *(créé par `/se-new-project`)*
- [CONVENTIONS.md](CONVENTIONS.md) — **loi de rangement et de nommage (source unique)**

## Phases actives

*(aucune — lance `/se-new-project` pour cadrer le projet)*

## Travaux transverses

- `research/` — recherches `{YYYY-MM-DD}-{slug}.md` *(produites par `/se-research`)*
- `audits/` — audits persistants `{YYYY-MM-DD}-{type}-{slug}.md` *(`/se-security`, `/se-ux`, `/gsd:ui-review`)*
- `brainstorming/` — sessions `/se-brainstorm-*`
- `codebase/` — cartographie `/gsd:map-codebase`
- `debug/` — investigations longues (+ `resolved/`)
- `todos/` — capture zéro-friction (`pending/` → `done/`)

*(dossiers créés à la demande — vides tant qu'aucun artefact ne les remplit)*

## Design

- [design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md) - contrat de design (à remplir avec tes valeurs de marque) et pointeurs vers les 3 couches
- `design/design-tokens.json` - *(optionnel) tokens précis en JSON (couleurs, tailles, espacements) - lu par les agents pour exactitude*
- **Page vitrine du design-system** - *(route vivante, ex `/dev/design-system`, déclarée dans DESIGN-SYSTEM.md si elle existe - référence visuelle pour l'humain)*
- [design/PERSONAS.md](design/PERSONAS.md) - personas (à remplir au cadrage)
- [design/JOURNEYS.md](design/JOURNEYS.md) - parcours utilisateur end-to-end (créés/maintenus par `/se-ux`)

## Règles

- [rules/ui-rules.json](rules/ui-rules.json) — 18 règles UI, 6 piliers (source unique)
- `../hooks/rules/placement-rules.json` — dossiers et noms autorisés, lus par le hook `placement-guard`

## Système

- [../CLAUDE.md](../CLAUDE.md) — comment ce projet est piloté
- [../docs/SYSTEME.md](../docs/SYSTEME.md) — conception du système Simple & Efficace

# INDEX — carte du projet

> La carte de tout. On lit ce fichier pour s'orienter, jamais un grep.
> Se remplit au fur et à mesure que le projet avance.

## Pilotage

- STATE.md — état du jour *(créé par `/se-new-project` ou `/gsd:new-project`)*
- ROADMAP.md — jalons *(créé au cadrage)*
- PROJECT.md — produit + décisions *(créé au cadrage)*
- PRD.md — cahier des charges *(créé par `/se-new-project`)*
- [CONVENTIONS.md](CONVENTIONS.md) — loi de rangement et de nommage

## Phases actives

*(aucune — lance `/se-new-project` pour cadrer le projet)*

## Design

- [design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md) - contrat de design (à remplir avec tes valeurs de marque) et pointeurs vers les 3 couches
- `design/design-tokens.json` - *(optionnel) tokens précis en JSON (couleurs, tailles, espacements) - lu par les agents pour exactitude*
- **Page vitrine du design-system** - *(route vivante, ex `/dev/design-system`, déclarée dans DESIGN-SYSTEM.md si elle existe - référence visuelle pour l'humain)*
- [design/PERSONAS.md](design/PERSONAS.md) - personas (à remplir au cadrage)
- [design/JOURNEYS.md](design/JOURNEYS.md) - parcours utilisateur end-to-end (créés/maintenus par `/se-ux`)

## Règles

- [rules/ui-rules.json](rules/ui-rules.json) — 18 règles UI, 6 piliers (source unique)

## Système

- [../CLAUDE.md](../CLAUDE.md) — comment ce projet est piloté
- [../docs/SYSTEME.md](../docs/SYSTEME.md) — conception du système Simple & Efficace

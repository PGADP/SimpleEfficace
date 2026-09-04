<!-- INDEX.md : la carte de tout. On le lit pour s'orienter, jamais un grep à l'aveugle. -->
<!-- Maintenu en continu : step `update_planning_index` d'execute-phase à la clôture de chaque phase, -->
<!-- puis /se-archive qui déplace les lignes de "Phases actives" vers "Phases archivées". -->
<!-- Ne jamais supprimer une section : une section vide porte son "(aucune)". -->
<!-- « ⚠ NON RENSEIGNÉ » ≠ « (aucune) » : le premier dit que personne n'a encore rempli la -->
<!-- section, le second qu'il n'y a réellement rien. Un agent qui lit le marqueur doit -->
<!-- retomber sur .planning/phases/ et _archive/phases/, pas conclure que rien n'existe. -->

# Index du planning

> Mis à jour : [YYYY-MM-DD]

## Suivi

- [STATE.md](STATE.md) : position courante, présent only
- [ROADMAP.md](ROADMAP.md) : 3 horizons, phases à venir et en cours uniquement
- [PHASES.md](PHASES.md) : registre des phases et quicks livrés, une ligne par entrée
- [PROJECT.md](PROJECT.md) : produit + Key Decisions
- [GLOSSARY.md](GLOSSARY.md) : vocabulaire du projet, un concept un mot
- [REQUIREMENTS.md](REQUIREMENTS.md) : exigences du milestone courant

## Phases actives

- ⚠ NON RENSEIGNÉ

## Phases archivées

> Le détail de chaque phase livrée vit dans son SUMMARY archivé. L'empreinte d'une ligne est dans PHASES.md.

- ⚠ NON RENSEIGNÉ

## Design

- [design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md) : contrat de design, source unique des tokens
- [design/PERSONAS.md](design/PERSONAS.md) : personas
- [design/JOURNEYS.md](design/JOURNEYS.md) : parcours utilisateur

## Recherches et audits

- (aucun)

## Règles

- [rules/README.md](rules/README.md) : banques de règles typées du projet

## Système

- `~/.claude/se/CONVENTIONS.md` : loi de rangement et de nommage (système, hors projet)
- [config.json](config.json) : toggles du cycle GSD

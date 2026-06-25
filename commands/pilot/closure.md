---
name: pilot:closure
description: Sous-skill du Pilot — clôture de session. Résume, remonte les SUMMARY, invoque /planning pour mise à jour, commit doc. Chargé à la demande par /pilot. Non destiné à l'invocation directe.
user-invocable: false
allowed-tools:
  - Skill
  - Read
  - Write
  - Bash
---

# Pilot — Clôture de session

Procédure lourde du Mode 3, chargée à la demande. Toutes les étapes sont obligatoires.

1. **Resume de session** (10 lignes max) : ce qui a ete fait (commits/phases), ce qui reste, decisions, problemes.

2. **Remontee des SUMMARY** (silencieux) : scanner les SUMMARY.md des phases completees cette session.
   - Decision d'archi / pattern nouveau / probleme technique inattendu → remonter dans STRATEGY.md ("Decisions techniques recentes").
   - Risque pour une phase future → alerte dans ROADMAP.md.
   - Ne PAS remonter les details d'implementation.

3. **OBLIGATOIRE : invoque `/planning`** via Skill, argument "Cloture session [date] — phases completees : [liste], decisions : [liste], recaler vue semaine + avancement + alertes jalons". /planning met a jour ROADMAP/STRATEGY/STATE de facon coherente. **Ne fais pas les mises a jour toi-meme.**

4. **Apres /planning** : verifier qu'il a coche les phases completees, mis a jour les metriques, recalcule l'avancement. Completer si manque.

5. **Archivage si necessaire** : deplacer les elements termines de STRATEGY.md → STRATEGY-ARCHIVE.md.

6. **Icebox** : si l'utilisateur a evoque 2+ idees produit sans les formaliser, proposer en fin de cloture : "Tu as evoque [idee1] et [idee2]. On les capture avec `/idee` avant de fermer ?" Si non, laisser.

7. **Prochaines actions** : 3-5 items clairs pour la prochaine session.

8. **Commit doc** :
   ```bash
   git add .planning/STRATEGY.md .planning/STRATEGY-ARCHIVE.md .planning/STATE.md .planning/ROADMAP.md
   git commit -m "docs(pilot): cloture session — [resume 1 ligne]"
   ```

---
name: pilot:briefing
description: Sous-skill du Pilot — briefing de début de session. Lit STATE.md consolidé + invoque /se-planning, produit un briefing 15 lignes. Chargé à la demande par /se-pilot. Non destiné à l'invocation directe.
user-invocable: false
allowed-tools:
  - Skill
  - Read
---

# Pilot — Briefing de session

Procédure lourde du Mode 1, chargée à la demande pour garder /se-pilot mince.

1. **Demande ce qui a ete fait** depuis la derniere session (taches manuelles, avancees hors code).

2. **OBLIGATOIRE : invoque `/se-planning`** via Skill, argument "Point planning debut de session — verifier etat reel des phases, recaler vue semaine si necessaire, alertes". /se-planning lit STRATEGY/ROADMAP/STATE (+ PHASES.md pour l'avancement), verifie la coherence, retourne un PLANNING STATUS structure. **Ne lis pas les fichiers toi-meme** — /se-planning garantit la verification systematique.

3. **Briefing 15 lignes max** depuis le retour de /se-planning :
   - Ou on en est (derniere phase, avancement milestone)
   - Jours restants avant prochaine deadline
   - Prioritaire maintenant (code ET taches manuelles)
   - Alertes (retards, bloqueurs, dependances externes)
   - Recommandation pour la session


4. **Icebox** : si STATE.md montre qu'un nouveau milestone vient d'etre active, proposer `/gsd-check-todos` + `/gsd-review-backlog` pour revoir les idees capturees. Attendre confirmation, ne pas lancer auto.

5. **Si l'utilisateur veut relancer quelque chose** : lire `.planning/PHASES.md` (registre du livre) puis `.planning/INDEX.md`, jamais un grep dans `.planning/phases/`. L'INDEX liste les phases actives ET les phases archivees ; `phases/` ne contient que l'actif, donc une phase livree il y a trois semaines n'y est plus. Si l'INDEX la nomme : "On a deja fait ca en phase X. Resume : [...]" en lisant le SUMMARY au chemin donne par l'INDEX (`_archive/phases/{NN}-{slug}/`). Si l'INDEX est absent OU si la section porte encore « ⚠ NON RENSEIGNE », ne pas conclure que rien n'existe : lister `.planning/phases/` ET `.planning/_archive/phases/`, le signaler, et proposer de remplir l'INDEX. Un INDEX vide ment plus qu'un INDEX absent.

Retour au sparring /se-pilot pour la suite.

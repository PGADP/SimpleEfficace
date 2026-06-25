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

2. **OBLIGATOIRE : invoque `/se-planning`** via Skill, argument "Point planning debut de session — verifier etat reel des phases, recaler vue semaine si necessaire, alertes". /se-planning lit STRATEGY/ROADMAP/STATE, verifie la coherence, retourne un PLANNING STATUS structure. **Ne lis pas les fichiers toi-meme** — /se-planning garantit la verification systematique.

3. **Briefing 15 lignes max** depuis le retour de /se-planning :
   - Ou on en est (derniere phase, avancement milestone)
   - Jours restants avant prochaine deadline
   - Prioritaire maintenant (code ET taches manuelles)
   - Alertes (retards, bloqueurs, dependances externes)
   - Recommandation pour la session

**Note marketing** : ne lis PAS `.planning/marketing/`. Si l'utilisateur demande le marketing → rediriger vers `/se-pilot-marketing`.

4. **Icebox** : si STATE.md montre qu'un nouveau milestone vient d'etre active, parcourir `.planning/icebox/INDEX.md`, compter les idees taggees pour ce milestone. Si N>0 : "On a N idees en icebox pour ce milestone. On les revoit avec `/idee review` ?" Attendre confirmation, ne pas lancer auto.

5. **Si l'utilisateur veut relancer quelque chose** : chercher dans `.planning/phases/` d'abord. Si trouve : "On a deja fait ca en phase X. Resume : [...]"

Retour au sparring /se-pilot pour la suite.

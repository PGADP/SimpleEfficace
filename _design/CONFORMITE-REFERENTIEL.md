# Référentiel de conformité — grille de relecture

> Toutes les demandes EXPLICITES de Paul + exigences du plan. Sert de grille pour relire chaque
> fichier ligne à ligne. Un fichier est "conforme" s'il respecte les exigences qui le concernent.

## A. Demandes explicites de Paul (citations / intentions)

1. **Pilot cofondateur NON NÉGOCIABLE** : le sparring/challenge/"teste mes idées"/vision reste 100% intact. On allège la plomberie, jamais le sparring.
2. **Automaticité obligatoire, pas consigne** :
   - Humanizer : "dès qu'il faut écrire à l'utilisateur, hop, OBLIGATOIREMENT par Humanizer" → garde-fou mécanique.
   - UI : "utilisation AUTOMATIQUE du skill UI" dès qu'on touche du front.
3. **Vérificateur anti-hardcode dans le flow.**
4. **Anti-monolithe** : "scouts et vérificateurs évitent les services monolithiques" → ADVISORY seulement (souffle, ne bloque pas).
5. **Anti-entropie** : fichiers STATE/ROADMAP qui ne gonflent jamais (plafond + archivage auto). Douleur n°1.
6. **Arborescence claire, tout rangé, JAMAIS greppé** : une destination par artefact, nommage standardisé, INDEX vivant.
7. **Checkpoints humains repensés** : visuels, au bon moment (pas end-of-phase en bloc), GO/NO-GO clair, Claude ne demande jamais de lancer une commande.
8. **Moins de scripts, plus de manuel intelligent** : déterministe seulement là où il est imbattable ; test manuel pour le fonctionnel.
9. **Design-system unique lu par TOUS les skills UI.**
10. **Expert UX avec personas clients** (distinct de l'UI qui fait le visuel).
11. **Skill maquette UI/UX** : mode du flux, 3 niveaux, AVANT le code.
12. **Playwright d'office configuré, intégré aux tests ET vérifications UI/UX.**
13. **research + brainstorming = SANCTUARISÉS** (Paul les adore, ne pas dénaturer).
14. **humanizer déjà bon = garder + 2 ajouts ciblés** (anti-faux-positifs + 4 patterns récents).
15. **Recherche 4 niveaux** dont scientifique (4 APIs académiques).
16. **CHERRY-PICKING, jamais from-scratch.** Réutiliser l'existant, adapter.
17. **Dossier final unique** : SimpleEfficace/ = nouveau repo de config. RIEN ne dépend de _sources/ (supprimé à la fin).
18. **Stack** : Next.js 15/Tailwind/Railway/Postgres-ou-Supabase/Prisma/Vitest/Playwright, auth Supabase ou BetterAuth. Projet-agnostique (config réutilisable).
19. **Langue** : français user-facing, anglais technique.
20. **Pas de skill redondant / pas d'over-engineering.**

## B. Exigences du plan (SYSTEME.md / PLAN-CONSTRUCTION.md)

- 5 strates : garde-fous (hooks) / cofondateur (pilot) / cycle / moteurs partagés / spécialistes.
- Pattern hooks : 1 dispatcher, contrat (exit 0 sauf gate, ré-entrance, timeout, silent fail).
- Source unique des règles (ui-rules, slop-rules) lue par proposeur ET vérificateur.
- Gates SIMPLIFY/JANITOR : pattern impeccable (détecteur déterministe + LLM, isolés puis croisés).
- 2 hooks bloquants seulement (size-gate, slop-gate) ; le reste advisory.

## C. Critères de conformité par catégorie de fichier

### Skills sanctuarisés (research, researcher, brainstorm-light/heavy, humanizer base)
- [ ] Méthode/contenu de fond INCHANGÉ vs la source live (~/.claude).
- [ ] Seuls ajouts autorisés : researcher (+4 APIs), humanizer (+anti-faux-positifs +patterns 30-33).
- [ ] Aucune perte de section.

### Pilot + sous-skills
- [ ] Personnalité, optimisme actif, anti-complaisance, sparring (Mode 2), dispatch, icebox : TOUS présents dans pilot.md.
- [ ] Modes lourds (briefing/closure/strategic) = sous-skills user-invocable:false, contenu complet (pas tronqué).
- [ ] Renvois corrects vers sous-skills existants.

### Skills dev (dev/review/fix/test/deploy/etc.)
- [ ] Stack adaptée (Railway pas Vercel, Vitest+Playwright).
- [ ] Projet-agnostique (pas de mymozaica en dur).

### Hooks
- [ ] Contrat respecté (exit 0, ré-entrance, silent fail, timeout).
- [ ] Anti-hardcode + anti-monolithe (advisory) + humanizer-guard + ui-guard + hygiene présents.
- [ ] size-gate bloquant. Chemins relatifs (pas _sources, pas absolu mymozaica).

### Design-system / ui-rules / ux / personas
- [ ] DESIGN-SYSTEM.md = source unique, lu par les 3 agents UI.
- [ ] ui-rules.json = 6 piliers, Severity→BLOCK/FLAG, DOWNGRADE scopé.
- [ ] /ux distinct de /ui (parcours/JTBD vs visuel), lit PERSONAS.md.
- [ ] PERSONAS template projet-agnostique.

### Gates / Playwright
- [ ] gate-simplify + gate-janitor : pattern détecteur+LLM croisés, checkpoint GO/NO-GO.
- [ ] Playwright : config + helper (PAS un spec par feature), 3 ancrages (ui-guard/checkpoint/E2E).

### Global
- [ ] ZÉRO référence à _sources/ dans tout le système.
- [ ] Français user-facing / anglais technique respecté.

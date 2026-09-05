<!-- Gabarit SUMMARY.md du système Simple & Efficace. -->
<!-- Lu par gsd-executor à la clôture de chaque plan. Remplace le gabarit gsd-core, qui -->
<!-- décrivait surtout ce que git sait déjà dire. -->
<!--                                                                                    -->
<!-- CE FICHIER EST LE SEUL SURVIVANT DE LA PHASE. CONTEXT.md, RESEARCH.md et PLAN.md   -->
<!-- sont supprimés au SHIP. Tout ce qui vaut au-delà de la phase atterrit donc ici, ou -->
<!-- dans un ADR (.planning/decisions/), ou dans GLOSSARY.md. Ailleurs, c'est perdu.    -->
<!--                                                                                    -->
<!-- RÈGLE DE RÉDACTION UNIQUE : aucune affirmation au présent sur le code.             -->
<!-- Tout ce qui décrit un fichier se rattache au range de commits du frontmatter.      -->
<!-- « L'auth vit dans src/lib/auth.ts » devient faux au premier refactor ;             -->
<!-- « au commit abc123, l'auth vivait dans src/lib/auth.ts » reste vrai pour toujours. -->
<!-- Loi : ~/.claude/se/CONVENTIONS.md §0.                                              -->
<!--                                                                                    -->
<!-- CE QU'ON N'ÉCRIT PAS, parce que git le dit mieux et sans périmer :                 -->
<!-- la liste des commits (git log), la liste des fichiers touchés (git show --stat),   -->
<!-- les accomplissements (le diff), la durée et les timestamps.                        -->

---
# --- Ancre : la seule référence de ce fichier qui ne périme jamais ---
commits: {sha-premier-commit}..{sha-dernier-commit}

# --- Identité ---
phase: XX-nom
plan: YY
subsystem: [auth | payments | ui | api | database | infra | testing | …]
tags: [jwt, stripe, react, postgres]

# --- Graphe de dépendances (lu par plan-phase pour assembler le contexte) ---
requires:
  - phase: [phase dont celle-ci dépend]
    provides: [ce qu'elle apportait et qui sert ici]
provides:
  - [ce que cette phase livre]
affects: [phases ou mots-clés qui auront besoin de ce contexte]

# --- Ce qui est sorti du flux de phase et lui survit ailleurs ---
key-decisions:
  - "[décision, extraite vers STATE.md]"
adr: []          # ADR produits ou remplacés : .planning/decisions/{NNNN}-{slug}.md
glossaire: []    # termes ajoutés à GLOSSARY.md pendant la phase

# --- Traçabilité machine ---
requirements-completed: []   # OBLIGATOIRE : tous les REQ-ID du champ `requirements` du plan
coverage:                    # OBLIGATOIRE, jamais omis : c'est ce qui route l'UAT.
  - id: D1                   # Omis ou malformé, verify-work retombe sur une extraction
    description: "[le livrable, en clair]"   # en prose et présente TOUT à l'humain.
    requirement: "REQ-XX"                    # (omettre si aucun)
    verification:
      - kind: unit           # unit | integration | e2e | automated_ui | manual_procedural | other
        ref: "tests/x.test.ts#nom du test"
        status: pass         # pass | fail | unknown, d'après le dernier run
    human_judgment: false    # true => toujours routé vers l'humain, `rationale` alors obligatoire

# --- Calibration (se lit avec le champ `estimate` du plan) ---
actuals:
  tokens: 0    # chars/4 sur le diff réalisé, jamais un compteur de harness
  tasks: 0
  commits: 0

completed: YYYY-MM-DD
status: complete   # complete | halted
---

# Phase {X} plan {Y} : {Nom}

**{Une phrase : ce qui a réellement été livré. « JWT avec rotation du refresh via jose », pas « authentification implémentée ».}**

## Pourquoi c'est comme ça

Les décisions prises en chemin, chacune avec l'alternative écartée et la raison du choix. Le diff montre ce qui a été retenu, jamais ce qui a été renoncé : c'est le renoncement qu'on écrit ici.

Une décision qui vaut **au-delà de cette phase** ne s'écrit pas ici. Elle part en ADR, et cette section met le lien. Sinon on enterre du durable dans un document de phase, ce qui est exactement le problème que ce gabarit existe pour éviter.

Rien à dire : « Aucune, le plan a été suivi tel qu'écrit. »

## Ce qu'on a refusé

Ce qui a été explicitement écarté du périmètre, et pourquoi. C'est souvent la section la plus utile six mois plus tard : elle empêche de rouvrir un débat déjà tranché, et elle distingue « pas fait » de « décidé de ne pas faire ».

## Ce qui nous a résisté

Ce sur quoi on s'est cassé les dents. Une entrée par obstacle : le symptôme, la cause réelle, le `chemin:ligne` au commit d'ancrage.

Les fausses pistes comptent autant que la solution. Savoir qu'une piste a déjà été explorée et abandonnée évite de la reprendre en entier.

## Ce que le plan n'avait pas vu

Les écarts entre ce que le PLAN.md prévoyait et ce que l'implémentation a imposé, déviations auto-corrigées comprises : ce qui a été trouvé, pendant quelle tâche, ce qui a été fait, dans quel commit.

Le PLAN.md est supprimé au SHIP. Ce que l'exécution lui a appris ne survit que si c'est écrit ici.

## Dette laissée sciemment

Ce qu'on a choisi de ne pas finir, pas ce qu'on a raté. Vide si rien : ne pas inventer de dette pour remplir la section.

| Quoi | Où (au commit d'ancrage) | Pourquoi | Qui la lève |
|---|---|---|---|

Chaque ligne est aussi consignée dans `.planning/WINDOWS.md` via `gsd_run windows append`, qui bloque `/gsd-ship` tant qu'elle est ouverte.

## État du code au {YYYY-MM-DD}

> ⚠ Périmé par construction. Cette section décrit un instantané, pas le présent.

`git show --stat {commits}` donne les fichiers, `git log --oneline {commits}` donne les commits. N'écrire ici que ce que ces deux commandes ne montrent pas : la forme du chemin emprunté, quand elle ne saute pas aux yeux à la lecture du diff. Souvent vide, et c'est très bien.

Analyse de performance du code :

**Runtime**
- Boucles optimisables (O(n²) évitables)
- Recalculs inutiles (memoization manquante)
- Opérations bloquantes sur le main thread

**React spécifique** (si applicable)
- Re-renders excessifs
- useMemo/useCallback manquants ou superflus
- Keys instables dans les listes

**Network**
- Requêtes dupliquées / waterfalls
- Payloads surdimensionnés
- Caching absent

**Bundle**
- Imports lourds (moment, lodash entier)
- Code splittable
- Tree-shaking bloqué

Priorise par impact réel (pas de micro-optimisation prématurée).

Cible : $ARGUMENTS

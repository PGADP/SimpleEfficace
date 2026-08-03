# Heuristiques UX — grille d'évaluation

> Chargé à la demande par `/se-ux` (mode audit et mode build, étape de challenge).
> Ne pas charger pour du travail purement visuel — c'est `/se-ui` et le corpus impeccable.

Ce fichier ne remplace pas les personas ni le JTBD : il donne la grille **générique**
qu'on applique une fois le parcours tracé. Une heuristique violée n'est un problème que
si elle coûte quelque chose à une persona identifiée — sinon c'est du pédantisme.

---

## Les 10 heuristiques de Nielsen — formulées comme des questions d'audit

Pour chaque écran d'un parcours, poser les 10. Une violation se note avec sa **gravité**
(0 = non-problème, 1 = cosmétique, 2 = mineur, 3 = majeur, 4 = catastrophe) et son
**étape** dans le parcours.

| # | Heuristique | Question d'audit | Symptôme typique |
|---|-------------|------------------|------------------|
| 1 | **Visibilité de l'état du système** | L'utilisateur sait-il ce qui se passe, en moins d'une seconde ? | Un bouton qui ne réagit pas au clic pendant 3 s ; un upload sans progression |
| 2 | **Correspondance système / monde réel** | Le vocabulaire est-il celui de l'utilisateur, pas celui de la base de données ? | « Entité », « Instance », « Payload » dans une UI grand public |
| 3 | **Contrôle et liberté** | Peut-on annuler, revenir, sortir sans perdre son travail ? | Un formulaire long sans brouillon ; une action destructrice sans undo |
| 4 | **Cohérence et standards** | Le même mot désigne-t-il toujours la même chose ? Les conventions de la plateforme sont-elles respectées ? | « Supprimer » ici, « Retirer » là, pour la même action |
| 5 | **Prévention des erreurs** | L'erreur est-elle rendue impossible plutôt que signalée après coup ? | Un champ date libre au lieu d'un sélecteur ; pas de confirmation sur l'irréversible |
| 6 | **Reconnaître plutôt que se rappeler** | L'utilisateur doit-il retenir une information d'un écran à l'autre ? | Un code affiché à l'étape 2, à ressaisir à l'étape 5 |
| 7 | **Flexibilité et efficacité** | L'utilisateur expert a-t-il un chemin court ? Le débutant reste-t-il servi ? | Aucun raccourci clavier dans un outil de travail quotidien |
| 8 | **Esthétique et minimalisme** | Chaque élément gagne-t-il sa place ? | Trois CTA de même poids sur un même écran : aucun ne ressort |
| 9 | **Aider à reconnaître et réparer les erreurs** | Le message dit-il la cause **et** la sortie, en langage humain ? | « Erreur 422 » ; « Une erreur est survenue » |
| 10 | **Aide et documentation** | L'aide est-elle là où le blocage a lieu ? | Un lien « Documentation » en pied de page pour un champ obscur en haut |

**Règle de coût** : 5 utilisateurs révèlent environ 80% des problèmes d'utilisabilité.
Un audit heuristique ne remplace pas ces 5 personnes — il prépare ce qu'on ira observer.

---

## Lois utiles, et ce qu'elles imposent réellement

- **Fitts** — le temps pour atteindre une cible croît quand elle rétrécit ou s'éloigne.
  *Conséquence* : l'action principale est grande et proche du curseur ou du pouce ;
  l'action destructrice est loin de l'action fréquente. Un « Supprimer » collé au
  « Enregistrer » est un défaut de conception, pas une maladresse d'utilisateur.
- **Hick** — le temps de décision croît avec le nombre d'options.
  *Conséquence* : au-delà de 5-7 choix de même niveau, il faut grouper ou hiérarchiser.
- **Jakob** — les gens passent l'essentiel de leur temps sur d'autres produits.
  *Conséquence* : l'originalité se dépense sur l'identité visuelle, jamais sur
  l'emplacement de la navigation ou le sens d'une icône.
- **Miller** — la mémoire de travail tient environ 4 éléments, pas 7.
  *Conséquence* : un formulaire de 12 champs se découpe, ou affiche sa progression.
- **Effet de crête et de fin** — un parcours est jugé sur son pic d'intensité et sa fin.
  *Conséquence* : soigner l'instant de succès (confirmation, premier résultat) rapporte
  plus que lisser uniformément toutes les étapes.
- **Effet Zeigarnik** — une tâche entamée crée une tension jusqu'à sa complétion.
  *Conséquence* : une barre de progression amorcée à 20% augmente réellement l'achèvement.

---

## Conventions d'interaction par plateforme

Le corpus détaillé est dans `~/.claude/se/vendor/design/platform-design-skills/skills/<plateforme>/`.
Ce tableau sert à **choisir quoi charger** et à repérer un contresens de plateforme.

| Dimension | Web | Desktop (macOS / Windows) | Mobile (iOS / Android) |
|-----------|-----|---------------------------|------------------------|
| Entrée principale | Curseur + clavier | Clavier d'abord, curseur précis | Pouce, gestes |
| Cible minimale | 24px (WCAG 2.2 AA) | ~24px, précision curseur | **44×44pt**, non négociable |
| Densité | Moyenne, aérée | **Élevée** — l'expert veut voir plus | Faible, une décision par écran |
| Navigation | En-tête + fil d'Ariane | **Barre de menus complète** + latérale | Onglets bas, pile, retour |
| Raccourcis | Bonus | **Obligatoires** sur les actions quotidiennes | Sans objet |
| Annulation | Confirmation modale | **Undo global** (Cmd+Z) attendu partout | Toast avec « Annuler » |
| État de fenêtre | Sans objet | Taille et position **restaurées** au lancement | Sans objet |
| Hors-ligne | Progressif | Attendu par défaut | Attendu par défaut |

**Le contresens le plus fréquent** : livrer une application desktop conçue comme une page
web — pas de barre de menus, pas de raccourcis, densité faible, aucun undo, fenêtre qui
rouvre toujours à la même taille. Techniquement fonctionnel, ressenti comme un site
emballé dans une fenêtre.

---

## Onboarding — les trois seuils

1. **30 premières secondes** — la valeur est-elle comprise en deux phrases ? Sinon la
   page d'accueil échoue, quel que soit son esthétique.
2. **2 premières minutes** — l'utilisateur a-t-il accompli une action *significative*
   (vu un résultat, importé quelque chose, produit un artefact) ? Pas « créé un compte ».
3. **Premier retour** — quand il revient, retrouve-t-il son contexte, ou repart-il de zéro ?

Un état vide n'est pas une erreur d'affichage : c'est le premier écran que voit tout
nouvel utilisateur, et souvent le plus négligé. Il doit montrer à quoi ressemblera
l'écran rempli et proposer l'action qui y mène.

---

## Format de restitution d'une friction

```
Friction #N — [gravité 0-4]
Étape       : [écran / transition concernée]
Heuristique : [n° et nom, ou loi invoquée]
Persona     : [nom, depuis PERSONAS.md]
Pain        : [ce que la personne ressent, dans ses mots]
Symptôme    : [ce qu'on observerait — abandon, ressaisie, ticket support]
Reco        : [action concrète et vérifiable]
Effort      : [low / medium / high]
```

Une recommandation qui ne dit pas quoi changer dans quel écran n'est pas une
recommandation. « Améliorer la clarté » ne se livre pas.

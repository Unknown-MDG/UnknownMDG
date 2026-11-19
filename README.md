# unknownmdg — Portfolio

Portfolio éditorial d'un designer basé à **Antananarivo, Madagascar** : interfaces, identités visuelles, direction artistique, motion et contenus sociaux.

Le site est pensé comme une **revue imprimée** : sections numérotées, filets fins, grande typographie serif, images traitées comme des planches et transitions discrètes. Tout est en français, sans framework ni dépendance lourde.

> **Statut :** le portfolio est actuellement en refonte. Une nouvelle version est en préparation ; les liens ci-dessous affichent une page d'attente.

**En ligne :** [unknownmdg.netlify.app](https://unknownmdg.netlify.app/) · [unknownmdg.vercel.app](https://unknownmdg.vercel.app/)
**Code :** [github.com/Unknown-MDG/UnknownMDG](https://github.com/Unknown-MDG/UnknownMDG)

---

## Le projet

Ce portfolio présente six projets sélectionnés et raconte la démarche autant que le résultat : contexte, rôle, approche, arborescence de production et galerie d'images. L'objectif est de donner à voir la **précision du travail** — typographie, image, détail — sans passer par un gabarit de portfolio générique.

Le site met en avant :

- un travail **graphique et éditorial** (identité, UI/UX, campagnes, social media) ;
- un travail **vidéo et motion**, avec le documentaire *Mangaroa* ;
- une **disponibilité** pour des missions freelance et des collaborations créatives.

## Ce que contient le site

### 01 — Projets

Six projets détaillés : Tsunova.X, Why Not Linux, NOVA, le documentaire Mangaroa, une application de gestion du stress et une série de visuels publicitaires.

- Filtres **Graphique** / **Vidéo** : les deux familles sont fermées au chargement, un message invite le visiteur à choisir.
- Chaque projet se déplie avec une animation fluide : détails (brand, rôle, plateforme, secteur, outil), approche, arborescence de production, galerie.
- **Un seul projet ouvert à la fois** ; fermer un projet ou changer de filtre met la vidéo en pause.
- **Liens profonds** : chaque projet a une URL directe (`#projet-1` … `#projet-6`) qui ouvre le bon filtre et déplie la bonne carte.
- **Lightbox** plein écran : flèches, points, clavier ← →, Échap, balayage tactile, préchargement des images voisines.

### 02 — À propos

Une carte éditoriale avec portrait encadré et légende, texte d'introduction en serif, citation, grille de faits (localisation, disciplines, outils, statut) et bande de compétences. Un tampon rotatif « Disponible · 2026 » accompagne la section.

### 03 — Contact

- Adresse email affichée en grand et **copiée en un clic**.
- Liens LinkedIn et GitHub.
- Carte de disponibilité qui ouvre un **assistant** intégré.
- Horloge locale d'Antananarivo, mise à jour en direct.

### Le documentaire Mangaroa

Le projet vidéo se lit **directement dans la page** : lecteur HTML5 natif, affiche extraite du film et trois images du trailer ouvrant la lightbox. Le trailer dure 44 secondes et est servi en H.264 720p, avec lecture progressive : pas de lecteur tiers, pas de cookies, pas de publicité.

## Ce qui différencie ce portfolio

**Une vraie direction artistique, pas un thème.**
Palette 2026 « Encre & Jade » (jade profond, ivoire, bleu froid, noir prune), trio typographique Instrument Serif / Instrument Sans / IBM Plex Mono, et composition inspirée des revues : numérotation, filets, marges larges, rythme lent.

**Une lampe interactive.**
Le thème clair/sombre se bascule via une lampe dessinée dans l'en-tête. Le choix est mémorisé, et le changement de thème passe par un fondu (View Transitions API) au lieu d'un simple flash.

**Un curseur plume de graphiste.**
Un curseur personnalisé, inspiré de l'outil plume d'Illustrator, avec point de contact précis, inclinaison au survol et libellé « Voir » sur les projets. Le curseur natif revient sur mobile et si le visiteur préfère réduire les animations.

**Des micro-interactions discrètes.**
Grain argentique animé, barre de progression de lecture, rail vertical, mot fantôme dans le hero, marquee infini, révélations au défilement, reflet léger sur les boutons.

**Un tip design par jour.**
Juste sous le hero, une citation éditoriale tirée d'une banque de **124 tips** (hiérarchie, typographie, couleur, composition, identité, UI/UX, motion, production, fichiers, client, accessibilité, atelier). Un tip par visite, sans répétition tant que la banque n'est pas épuisée, puis remélange.

**Un assistant qui répond vraiment, sans API.**
La carte Disponibilité ouvre un mini-chatbot qui répond en français sur les délais, tarifs, processus, révisions, outils, paiement et disponibilité. Les réponses sont **locales et scriptées** : instantanées, gratuites, sans clé API et sans envoyer de données.

**La lecture vidéo sans plateforme tierce.**
Le trailer est hébergé avec le site et lu par le navigateur : chargement plus rapide, aucune iframe YouTube/Vimeo, aucun cookie de suivi.

**Partage et impression soignés.**
Partage natif (Web Share API) ou copie du lien, notifications discrètes, et **feuille de style dédiée à l'impression** : projets dépliés, navigation masquée, mise en page propre pour un export PDF.

**Léger par construction.**
HTML, CSS et JavaScript natifs, **aucun framework, aucune étape de build, aucun traceur analytique**. Le site fonctionne comme une simple page statique, rapide à charger et facile à héberger.

**Le mobile traité comme un écran à part entière.**
Menu plein écran, actions du pied de page en icônes rondes, en-tête compact avec la lampe à gauche du nom, mise en page vérifiée jusqu'à 320 px de large, sans défilement horizontal.

## Accessibilité

- Lien d'évitement, focus visible sur tous les contrôles.
- Piège de focus et restauration du focus dans la lightbox et le menu mobile.
- Libellés ARIA sur les boutons icônes, annonce vocale des filtres.
- Navigation clavier complète (← → et Échap dans la lightbox, fermeture du menu par Échap).
- Respect de `prefers-reduced-motion` : animations et curseur personnalisé désactivés.
- Contrastes vérifiés dans les deux thèmes.
- Audit Lighthouse local : **100** en accessibilité, bonnes pratiques et SEO.

## Technique

- **HTML / CSS / JavaScript natifs**, sans dépendance applicative.
- Polices : *Instrument Serif*, *Instrument Sans*, *IBM Plex Mono* (Google Fonts).
- Vidéo : H.264/AAC, 1280×720, 44 s, ~14 Mo, `preload="metadata"` et lecture progressive.
- Images de projets : visuels de démonstration en attendant les captures définitives.
- Hébergement statique sur **Netlify** et **Vercel**, déploiement automatique depuis la branche `main` du dépôt GitHub.
- Aucun cookie, aucun traceur, aucune collecte de données.

---

**Contact :** [github.com/Unknown-MDG](https://github.com/Unknown-MDG) · Antananarivo, Madagascar · 2026

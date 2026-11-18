# Portfolio — UnknownMDG

Portfolio statique (HTML/CSS/JS), propre, esthétique et premium.

**En ligne :** [https://unknownmdg.netlify.app/](https://unknownmdg.netlify.app/)
**Code :** [github.com/Unknown-MDG/UnknownMDG](https://github.com/Unknown-MDG/UnknownMDG)

> Déploiement automatique : chaque `git push` sur `main` est publié par Netlify (site statique, aucun build).

## Design

- Base éditoriale premium : sections numérotées, filets fins, grande typographie, espacements intentionnels
- Carte d'À propos repensée : portrait encadré + légende, texte lead serif, citation, grille de faits (localisation, disciplines, outils, statut) et bande de compétences
- **Palette 2026 « Encre & Jade »** inspirée des tendances Pinterest Palette 2026 (Jade, Cool Blue, Plum Noir) : vert jade profond en sombre, ivoire + jade en clair, accent secondaire bleu froid. Aucun jaune/or.
- Typographie : *Instrument Serif* (titres, élégant et contemporain), *Instrument Sans* (corps), *IBM Plex Mono* (métadonnées)
- Thème sombre / thème clair avec lampe interactive (allumer/éteindre) et persistance (`localStorage`)
- Suivi de souris discret : multi-halos jade/cool blue avec effet de traînée (desktop uniquement)
- **Curseur plume de graphiste** (style outil plume/vectoriel d'Illustrator) avec point de contact précis, inclinaison au survol et libellé « Voir » sur les projets. Curseur natif conservé sur mobile et en `prefers-reduced-motion`.
- Détails signature : grain argentique animé, barre de progression de lecture, rail vertical, mot fantôme dans le hero, marquee infini, tampon rotatif « Disponible · 2026 » dans À propos, révélations au défilement.
- Petites fonctions utiles : **filtres Graphique / Vidéo**, **tip design du jour** (change chaque jour, bouton « un autre tip »), **copie de l'email en un clic**, **horloge locale d'Antananarivo**, **partage du portfolio**, **impression / PDF** et **retour en haut** discret.
- Finitions 2026 : **transition de thème en fondu** (View Transitions API), apparition douce des images au chargement, reflet discret sur les boutons, sélection de texte jade, favicon et métadonnées Open Graph / Twitter.

### Sources d'inspiration
- Pinterest Palette 2026 (Cool Blue, Jade, Plum Noir, Wasabi, Persimmon)
- Muzli — Top 100 portfolio websites 2026
- The Crit / Typewolf — font pairings 2026 (serif éditorial + sans + mono)

## Projets cliquables

- Cinq projets **Graphique & statique** (identité, UI/UX, campagnes) et un projet **Vidéo & motion** (documentaire Mangaroa).
- Au chargement, **les deux familles sont fermées** : un message invite le visiteur à choisir. Les boutons de filtre déplient la famille voulue avec la même animation de hauteur/opacité que les accordéons ; « Tout » ouvre les deux. Choisir une famille referme l'autre.
- Chaque projet se déplie avec une animation fluide pour révéler :
  - Détails (brand, rôle, plateforme / secteur / outil)
  - Explications et approche
  - Arborescence de production
  - Galerie de captures d'écran cliquables — ou, pour le film, des **extraits vidéo lisibles directement dans la page**
- **Un seul projet ouvert à la fois** : ouvrir un projet ferme automatiquement l'autre. Fermer un projet ou changer de filtre met la vidéo en pause.
- Carrousel lightbox en plein écran (flèches, points, clavier ← →, Échap pour fermer).

## Navigation, partage et confort

- **Menu mobile plein écran** sous 720 px : bouton animé, fermeture par Échap, focus géré, défilement verrouillé.
- **Navigation active** : le lien de la section visible (Projets, À propos, Contact) s'illumine pendant le défilement.
- **Liens de projet partageables** : chaque projet a une URL directe (`#projet-1` … `#projet-6`) ; l'ouvrir ouvre le bon filtre et déplie le projet. Un bouton « Copier le lien » accompagne chaque projet.
- **Partage et impression** dans le pied de page : partage natif (Web Share API) ou copie du lien, et impression / export PDF avec une feuille de style dédiée (projets dépliés, navigation masquée).
- **Notifications discrètes** (toast) pour confirmer une copie ou un partage.
- **Accessibilité** : lien d'évitement, focus visible, piège de focus dans la lightbox, restauration du focus à la fermeture, annonce vocale des filtres, `prefers-reduced-motion` respecté.
- **Lightbox** : clavier ← → / Échap, balayage tactile, préchargement des images voisines.
- Audit Lighthouse local : **100** en accessibilité, bonnes pratiques et SEO.

## Tip du jour

Juste sous le hero, le **Tip du jour** s'affiche comme une citation éditoriale : de grands
guillemets, un texte serif italique centré, sans cadre ni étiquette de catégorie.
La banque contient **124 tips** classés (hiérarchie, typo, couleur, composition, identité, UI/UX,
motion, production, fichiers, client, accessibilité, atelier).

- Le tip change à **chaque rechargement**, sans jamais répéter un tip déjà vu (mémoire `localStorage`,
  clé `umdg-tips-vus`) ; quand toute la banque est épuisée, elle se remélange.
- Le bouton « Un autre tip » en tire un nouveau à la demande.
- Le texte tient sur **deux lignes maximum** et s'affiche comme une citation, sans cadre ni étiquette.
- Pour modifier la banque : `designTips` dans `script.js`, au format `["Tag", "Texte"]`.
  Ajoutez autant de lignes que vous voulez : le tirage et le compteur s'adaptent.
- Un site statique ne peut pas scraper des sites en direct (CORS) : la banque est locale, donc
  instantanée et sans dépendance réseau. On peut la brancher plus tard sur une API ou un CMS.

## Assistant (mini chatbot)

La carte **Disponibilité** de la section Contact est entièrement cliquable : elle ouvre un panneau
d'assistant qui répond en français sur les délais, les tarifs, le processus, les révisions, les
outils, la disponibilité, le paiement, les projets et le contact.

- Bulles de conversation, indicateur de frappe, questions rapides, saisie libre (Entrée pour envoyer).
- Toutes les réponses sont **locales et scriptées** (aucune API, aucune clé, aucun coût).
- Pour modifier les textes et les fourchettes de prix : ouvrez `script.js` et éditez
  `chatAnswers` (tableau `id` / `keys` / `text`) ainsi que `CHAT_INTRO` et `CHAT_FALLBACK`.
  Les `keys` sont comparées sans accents ni majuscules : ajoutez les mots-clés de vos clients.
- Pour ajouter une question rapide : dupliquez un `.chat-chip` dans `index.html`
  (`data-q` libre) — le libellé saisi sert aussi de question.

## Structure

- `index.html` — contenu, héro, projets, à propos, contact, assistant, lightbox
- `styles.css` — thèmes clair/sombre, mise en page, typographie, animations, assistant, lightbox
- `script.js` — thème, lampe, menu mobile, navigation active, suivi souris (rAF), curseur plume, accordéon projets, filtres, liens profonds, partage, carrousel galerie, tip du jour, horloge, assistant

## Personnalisation

1. **Contenu** : modifiez `index.html` (textes, projets, compétences, liens de contact/email/LinkedIn/GitHub).
2. **Images** : remplacez les URLs `picsum.photos` par vos vraies captures dans `index.html` et dans `galleryData` dans `script.js`.
3. **Vidéos** : dans `index.html`, projet « Documentaire Mangaroa », remplacez les `src` des `<source>` (fichiers `.mp4` hébergés, ou un dossier `videos/` à la racine) et les `poster` par vos propres images d'aperçu. Les extraits actuels sont des **clips de démonstration** librement accessibles (Sintel, MDN, W3Schools) : mettez-y votre film final. Gardez `preload="metadata"` pour ne pas charger les fichiers avant lecture.
4. **Couleurs & thème** : ajustez les variables dans `styles.css` sous `[data-theme="dark"]` et `[data-theme="light"]` (`--bg`, `--fg`, `--accent`, etc.).
5. **Typographie** : modifiez `--font-serif`, `--font-sans`, `--font-mono` dans `:root`.

Prévisualisation : ouvrez `index.html` dans un navigateur.

## Déploiement

Le projet est hébergé sur **Netlify** et relié au dépôt GitHub `Unknown-MDG/UnknownMDG`.

- Branche de production : `main`
- Build command : *aucun* (site statique)
- Publish directory : `.` (racine du dépôt, défini dans `netlify.toml`)
- URL : [https://unknownmdg.netlify.app/](https://unknownmdg.netlify.app/)

**Mettre à jour le site :** modifiez les fichiers, puis poussez sur `main`.

```bash
git add .
git commit -m "Mise à jour du portfolio"
git push
```

Netlify détecte le commit et republie automatiquement (environ 10 secondes). Le suivi est visible dans *Deploys* du projet Netlify.

### Alternative : Vercel

- Lien direct : [https://vercel.com/new](https://vercel.com/new)

#### Via GitHub
1. Poussez les fichiers sur un dépôt GitHub.
2. Sur [vercel.com/new](https://vercel.com/new), importez le dépôt.
3. Framework Preset : **Other** (site statique) → **Deploy**.
4. Lien public : `https://<nom-du-projet>.vercel.app`.

#### Via CLI
1. `npm i -g vercel`
2. `vercel` puis `vercel --prod`

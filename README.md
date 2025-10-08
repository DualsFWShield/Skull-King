# Skull King - Compteur de Points

Une application web simple et élégante pour compter les points du jeu de société Skull King. Elle gère les règles de base, les variantes avancées, et offre une interface intuitive pour suivre les scores au fil des manches. Fini les calculs manuels, concentrez-vous sur le jeu !



## Fonctionnalités

### 🚀 Configuration de Partie Complète
- **Nombre de Joueurs :** De 2 à 8 joueurs avec des noms personnalisables.
- **Système de Points :** Choisissez entre le système classique **"Selon Skull King"** (tout ou rien) et le système équilibré **"Selon Rascal"**.
- **Variantes de Jeu :**
    - Activez le mode **"Boulet de Canon"** pour la variante Rascal.
    - Sélectionnez parmi 7 formats de partie prédéfinis (10 Manches, Pas d'impair, Attaque éclair, etc.).

### 📊 Suivi de Partie Intuitif
- **Tableau de Scores Dynamique :** Visualisez les mises, les plis réalisés et les scores de chaque manche en un coup d'œil.
- **Saisie Simplifiée :** Des formulaires clairs pour entrer les informations de chaque joueur à la fin d'une manche.
- **Calculs Automatiques :** Les scores sont calculés instantanément et avec précision, en respectant toutes les subtilités des règles.

### 👑 Gestion des Règles Avancées
L'application intègre les règles les plus complexes pour une expérience de jeu complète :
- **Bonus des Cartes 14 :** Saisissez les cartes 14 classiques (jaune, vert, violet) et la carte 14 noire pour obtenir les bonus correspondants.
- **Bonus de Personnages :** Points pour la capture de Sirènes, de Pirates et du Skull King.
- **Alliance Butin :** Cochez la case pour attribuer le bonus de 20 points en cas d'alliance réussie.
- **Pouvoirs des Pirates :**
    - **Rascal le Flambeur :** Entrez un pari de 0, 10 ou 20 points.
    - **Harry le Géant :** Modifiez votre mise de +1 ou -1 après la fin de la dernière manche.

### 🛠️ Outils et Utilitaires
- **Thème Clair & Sombre :** Basculez entre deux thèmes pour un confort visuel optimal.
- **Sauvegarde de Partie :** Sauvegardez votre progression à tout moment et reprenez la partie plus tard (utilise le `localStorage` de votre navigateur).
- **Retour en Arrière :** Une erreur de saisie ? Revenez facilement à la manche précédente pour corriger les scores.
- **Mode Test :** Lancez une partie de test pré-remplie pour vérifier rapidement le fonctionnement de l'application.
- **Écran de Résultats :** Affichez un récapitulatif clair du classement final, du vainqueur et de statistiques amusantes (meilleur parieur, roi des bonus).
- **Export en PDF :** Immortalisez votre partie en exportant l'écran des résultats dans un fichier PDF.

## Comment l'utiliser

Ce projet ne nécessite aucune installation ni dépendance complexe.

1.  **Téléchargez les fichiers** :
    - `index.html`
    - `style.css`
    - `script.js`
2.  **Placez-les dans le même dossier** sur votre ordinateur.
3.  **Ouvrez le fichier `index.html`** dans votre navigateur web préféré (Chrome, Firefox, Safari, etc.).

Et voilà ! L'application est prête à être utilisée.

## Structure du Projet

-   **`index.html`** : La structure de la page, contenant les trois écrans de l'application (Configuration, Jeu, Résultats).
-   **`style.css`** : Les styles pour l'apparence visuelle, y compris les variables pour les thèmes clair et sombre.
-   **`script.js`** : Toute la logique du jeu. Ce fichier gère l'état de la partie, le calcul des scores, la navigation entre les écrans, la sauvegarde, et les interactions utilisateur.

## Stack Technique

-   **HTML5**
-   **CSS3** (Flexbox, Grid, Variables CSS)
-   **JavaScript (ES6+)**
-   **Librairies externes (via CDN) :**
    -   [jsPDF](https://github.com/parallax/jsPDF) pour la génération de fichiers PDF.
    -   [html2canvas](https://html2canvas.hertzen.com/) pour capturer le contenu HTML en image avant l'export PDF.

## Licence

Ce projet est sous licence MIT.

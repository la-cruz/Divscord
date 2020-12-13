# :earth_africa: &nbsp; TIW8 - TP3 Collaboration temps-réel



![](/Users/mickael/Pictures/README TIW8.png)



## 🤝 Membre du groupe

- Alves Mickael p1607349 (https://lacruz.org/team/alves-mickael)
- Audart Lucas p1509529 (https://lacruz.org/team/audart-lucas)



## :computer: &nbsp; Installation

:information_source: &nbsp; Development version : react/16.14.0

:information_source: &nbsp; Development version : node/13.12.0



##  :telephone_receiver: ​Description application

Divscord est une application sous forme de Single Page Application (SPA) permettant à deux personnes de commencer une conversation via un chat textuel ou un chat vidéo. Vous pouvez retrouver l'application ici : [https://divscord.herokuapp.com/](https://divscord.herokuapp.com/)



## :page_facing_up: &nbsp; Available Scripts

In the project directory, you can run:

### `npm install`

:package: &nbsp; Install all modules.
(Version dev : node/12.11.1)

### `npm run build`

Builds the app for production to the `dist` folder.<br />
The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run dev`

Run the webpack command to bundle your app with the watch option



## :construction: Démarche à suivre pour les tests :

- Sur Heroku :
  - Choisir un username ( attention les usernames des utilisateurs doivent être différents)
  - Choisir le type de conversation (vocale ou textuel)
  - **Vocale :**
    - Rentrer le username de l'autre interlocuteur
    - Copier et envoyer son username à l'autre interlocuteur
    - Échanger des messages.
  - **Textuel :**
    - Rentrer le username de l'autre interlocuteur pour lancer un appel
    - Ou attendre que l'autre interlocuteur saisisse notre username et nous appelle.
    - Répondre à l'appel pour parler avec l'autre personne.
  - Pour quitter l'application, il suffit de cliquer sur le bouton pour fermer la conversation ( salon textuel ) ou le bouton raccrocher ( salon vocal )
  - Ici contrairement au local si vous souhaitez rejoindre à nouveau un salon, vous devrez refresh l'application.

- **En local :**
  - Même démarche que la démarche sur Heroku à partir de X. jusqu'à Y.
  - Une fois déconnecté, vous pouvez revenir à l'acceuil et rejoindre un autre salon.



## :pencil: Fonctionnalitées 

### :round_pushpin: ​DataChat :

- Chaque utilisateur saisit le username de l'autre interlocuteur.
- Une fois dans la conversation textuelle chaque utilisateur peut : 
  - Envoyer des messages à l'autre interlocuteur en appuyant sur l'icône d'envoi ou sur la touche *entrée* du clavier.
  - L'affichage des messages utilise un scroll automatique pour plus d'ergonomie lors de la conversation.
  - Voir quand l'autre interlocuteur est entrain d'écrire.
  - Quitter la conversation textuelle.
- Une fois déconnecté l'utilisateur peut recommencer une conversation avec le même username ou un différent.

### :round_pushpin: DataVidéo :

- Appel d'un interlocuteur grâce à son username.
- Une fois que l'on appel un autre interlocuteur :
  - L'initiateur de l'appel a une modale d'attente avec sonnerie.
  - Le deuxième utilisateur a une modale avec une sonnerie afin de lui indiquer qu'il reçoit un appel. Il a la possibilité de rejoindre ou de refuser.
  - Si l'utilisateur refuse, l'initiateur voit apparaître une modale de retour lui indiquant que l'appel a été refusé.
  - Si l'utilisateur accepte la conversation vidéo commence.
- Une fois dans la conversation chaque utilisateur peut :
  - Parler à l'autre interlocuteur.
  - Voir l'autre interlocuteur. 
  - Couper son micro dans la conversation.
  - Couper sa caméra dans la conversation.
  - Quitter et clore l'appel vidéo.

### :round_pushpin: ​Autres fonctionnalités :

- Choix du username pour l'utilisateur.
- Possibilité de copier son username pour l'envoyer à un interlocuteur plus facilement.
- Adaptation de l'application aux formats responsives.
- Gestion des erreurs pour les formulaires vides.



## :triangular_ruler: ​Choix techniques :

- **Initialisation de l'objet Peer :**

Après avoir essayé de l'initialiser lorsque l'utilisateur appuis sur le bouton **start**, nous avons fait une première initialisation dans un useEffect() après avoir déplacé le choix de son username sur la page d'accueil. Cela permettait une première connexion plus facile puisqu'elle était déclenchée dès l'affichage du composant, ainsi que de fonctionner sur Heroku.
Nous avons tout de même gardé une initialisation dans le start si notre Peer est null au moment de l'appuis sur **start** (comme après une déconnexion), ce qui permet de pouvoir quitter une conversation et d'en rejoindre une autre sans limite (en local).

- **Système de message utilitaire :**

En plus des échanges de messages dans le cadre du DataChat, nous utilisons cette fonctionnalité pour transmettre des informations nous permettant d'implémenter d'autre fonctionnalité, comme l'affiche de "**...**" votre interlocuteur tape un message.
Nos messages suivent cette forme : 

```js
{
  type: 'TYPE_DU_MESSAGE',
  parametres: 'paramètres utile pour la fonctionnalité'
}
```

Le type du message nous permet de savoir quelle fonctionnalité enclencher (comme `'DISCONNECT`, `MUTE` ou encore `ISTYPING` par exemple), et on peut lui donner des paramètres pour influencer son déroulement.

- **Autres :**

Pour pouvoir permettre d'écrire plusieurs fois le même message sur le chat, nous avons ajouté une partie aléatoire à la clé React que l'on donne au `<span>` des messages, ce qui permet d'écrire plusieurs fois le même message sans risque de duplication de clé.

Pour éviter qu'un utilisateur accède à une session sans avoir choisi un nom d'utilisateur (en passant par l'URL par exemple), le useEffect permettant l'initialisation de la connexion teste si l'utilisateur n'est pas vide, auquel cas il empêche cette dernière, et affiche un écran demandant de retourner sur la page d'accueil pour pouvoir choisir un username.



## :art: ​Choix ergonomiques / UX / UI : 

- Du style a été rajouté sur tous les composants pour une meilleure expérience utilisateur.
- Le style des composants a été rajouté dans des fichiers sass afin d'alléger le code des composants.
- Le sens de la caméra a été mis en miroir pour une meilleure ergonomie.
- Personnalisation du logo et de la police d'écriture.
- Affichage sur les vidéos du statut du micro et de la caméra.



## :chart_with_downwards_trend: ​Problèmes rencontrés

 - **En local :**

 Après avoir choisi son type de session (Textuelle ou Vidéo), si on revient sur la page d'accueil sans couper la connexion ou recharger la page, retourner dans une des deux sessions pose problème. Cela est dû à notre choix d'initialiser un objet Peer par composant, par soucis d'efficacité, mais qui nous empêche de déconnecter proprement en appuyant sur Home, il faudrait pour cela que l'objet Peer soit déclaré à la racine de l'application ou disponible dans un store tel que Redux.

 - **Sur Heroku :**

 Sur Heroku, initialiser une connexion hors du useEffect empêche d'envoyer des messages par la connexion peerjs. Cela pose problème, car si on se déconnecte, on ne peut alors plus se reconnecter sans recharger l'application.

 - **Autre :**

 Une fois la caméra et l'audio allumé, on ne les stop jamais manuellement. On peut donc retourner sur la page d'accueil avec toujours la caméra de notre ordinateur allumé.



## :chart_with_upwards_trend: Améliorations possibles

Nous avons pensé à deux principales améliorations, une seule initialisation de notre objet Peer en racine de l'application, avec un id aléatoire ce qui permettrai de plus simplement avoir le contrôle dessus dans toute l'application.
L'utilisation de Listener pour la déconnexion des utilisateurs, ce qui permettrai d'être plus précis dans nos échanges sans avoir besoin d'envoyer des messages. Nous n'avons malheureusement pas réussi a les mettes en place proprement.


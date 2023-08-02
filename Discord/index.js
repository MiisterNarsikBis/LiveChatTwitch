const { Client, GatewayIntentBits } = require("discord.js");
const { createConnection } = require("mysql");

// Constantes pour les préfixes
const PREFIX_IMAGE = "!image";
const PREFIX_VIDEO = "!video";
const PREFIX_FULLSCREEN = "!fullscreen";
const PREFIX_STOP = "!stop";
const PREFIX_HELP = "!help";

// Autres constantes
const ID_CHANNEL_DISCORD = "0003424000023312123"; // Remplacez par l'id de votre channel Discord
const TOKEN = "QZOIJSQ8fd394jdsdSE934.3424DSoze.324dsEROP.23REkdf"; // Remplacez par le Token de votre bot discord

//L'id discord et le token sont de fausses valeurs, ça ne fonctionnera pas en l'état

var isFullscreen = false; //Par défaut, l'envoi des images correspond à la taille définie de l'image

/*
 * Permet d'effectuer la connexion vers la base de donnée
 *
 * host: SERVEUR QUI HEBERGE LE SITE/BDD par exemple alwaysdata : mysql-username.alwaysdata.net
 * port: Le port d'écoute, à ne pas modifier
 * user: Utilisateur pour se connecter à votre bdd (doit avoir les accès admin)
 * password: Mot de passe du compte bdd
 * database: Nom de la base de donnée
 * charset: Encodage, à ne pas modifier
 * Fonction de connexion à la base de données
 */
function connectToDatabase() {
  const con = createConnection({
    host: "localhost", // A remplacer par le vôtre
    port: "3306",
    user: "root", // A remplacer par le vôtre
    password: "", // A remplacer par le vôtre
    database: "livechat_test", // A remplacer par le vôtre
    charset: "utf8mb4",
  });

  con.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connexion à la base de données établie !");
    }
  });

  return con;
}

/*
 * Client discord
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


//Lancement du bot Discord
client.on("ready", () => {
  client.channels.fetch(ID_CHANNEL_DISCORD).then((channel) => {
    channel.send(
      "Je suis prêt, vous pouvez envoyez des images / vidéos. !help"
    );
  });
  console.log("LiveChat Prêt");
});

//Le bot est mis sur écoute
client.on("messageCreate", (message) => {
  //On décompose le message reçu
  const myMessage = message.content.split(" ");

  // Vérification des préfixes valides
  function isPrefixValid(prefix) {
    return (
      myMessage[0] === prefix &&
      message.channel.id === ID_CHANNEL_DISCORD
    );
  }


  //On vérifie qu'il s'agit d'une commande
  // Vérification si c'est une commande
  if (
    (isPrefixValid(PREFIX_IMAGE) && message.attachments.size <= 0 && myMessage[1]?.length <= 0) ||
    (isPrefixValid(PREFIX_IMAGE) &&
      message.attachments.size > 0 &&
      myMessage[1]?.match("/^d+$/") &&
      myMessage[1]?.length <= 3)
  ) {
    console.log("Vérifiez la commande");
    message.channel.send(
      "Erreur dans la commande <@" +
      `${message.author.id}` +
      "> !help pour plus d'informations"
    );
  } else {
    //Si le message reçu correspond à l'une des commandes alors on vérifie de quelle commande il s'agit
    if (isPrefixValid(PREFIX_IMAGE)) {
      // Si c'est une image
      let width = message.attachments.first().width;
      let height = message.attachments.first().height;

      // Si la condition fullscreen est active
      if (isFullscreen === true) {
        width = 1920;
        height = 1080;
      }

      let image = message.attachments.first().url;
      let time = myMessage[1] * 1000;
      let texte = message.content.substring(
        myMessage[0].length + myMessage[1]?.length + 2,
        message.content.length
      );

      if (message.attachments.first().contentType.startsWith("image")) {
        const con = connectToDatabase();
        //UPDATE de notre BDD TABLE Image
        con.query(`UPDATE image SET url='${image}', ImageTime='${time}', ImageTexte='${texte}', Width='${width}', Height='${height}' WHERE 1`, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log("L'image a été mise à jour dans la base de données !");
          }
        });
        con.end();

        message.channel.send(
          "L'image a été envoyée <@" + `${message.author.id}` + ">"
        );
      }
    }

    if (isPrefixValid(PREFIX_VIDEO)) {
      // Si c'est une vidéo
      let width = message.attachments.first().width;
      let height = message.attachments.first().height;

      // Si la condition fullscreen est active
      if (isFullscreen === true) {
        width = 1920;
        height = 1080;
      }

      let video = message.attachments.first().url;
      let time = myMessage[1] * 1000;
      let texte = message.content.substring(
        myMessage[0]?.length + myMessage[1]?.length + 2,
        message.content.length
      );

      if (message.attachments.first().contentType.startsWith("video")) {
        const con = connectToDatabase();
        //UPDATE de notre BDD TABLE Video
        con.query(`UPDATE video SET VideoURL='${video}', VideoTime='${time}', VideoTexte='${texte}', Width='${width}', Height='${height}' WHERE 1`, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log("La vidéo a été mise à jour dans la base de données !");
          }
        });
        con.end();

        message.channel.send(
          "La vidéo a été envoyée <@" + `${message.author.id}` + ">"
        );
      }
    }
  }

  if (isPrefixValid(PREFIX_STOP)) {
    const con = connectToDatabase();
    //UPDATE de notre BDD TABLE Video
    con.query(`UPDATE video SET VideoURL = '${""}', VideoTexte = '${" "}' WHERE 1`);
    //UPDATE de notre BDD TABLE Image
    con.query(`UPDATE image SET url = '${""}', ImageTexte = '${" "}' WHERE 1`, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Le stop a fonctionné !");
      }
    });
    con.end();

    message.channel.send(
      "Le stop a fonctionné <@" + `${message.author.id}` + ">"
    );
  }

  if (isPrefixValid(PREFIX_HELP)) {
    message.channel.send(
      "<@" +
      `${message.author.id}` +
      "> Un message doit contenir obligatoirement une image ou une vidéo. La commande doit commencer par !image ou !video suivit d'un nombre qui représente le temps en secondes que l'image ou la vidéo va apparaître.\n !stop pour réinitialiser l'image / vidéo \n !fullscreen pour activer / désactiver l'affiche image plein écran \nPour plus d'exemple rendez-vous sur : <https://github.com/Nerfez/LiveChatTwitch>"
    );
  }

  if (isPrefixValid(PREFIX_FULLSCREEN)) {
    if (isFullscreen === false) {
      message.channel.send(
        "<@" +
          `${message.author.id}` +
          "> Désormais, les photos et vidéos seront envoyées en plein écran. (1920x1080)"
      );
      isFullscreen = true;
    } else if (isFullscreen === true) {
      message.channel.send(
        "<@" +
          `${message.author.id}` +
          "> Désormais, la taille des photos et vidéos envoyées correspondront à leurs tailles définies."
      );
      isFullscreen = false;
    }
  }
});

/*
 * Connexion du bot discord grâce au Token
 * C'est un faux token donc ça ne marchera pas, créez votre propre bot discord
 * et pensez à bien remplacer par votre Token en haut du fichier (ligne 12)
 */
client.login(TOKEN);

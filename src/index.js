const { updateAll } = require("./utils/updateGuilds");

async function main() {
  const { Client, Intents } = require("discord.js");
  const { readdirSync } = require("fs");
  const path = require("path");
  const ms = require("ms");
  const { startManager } = require("./utils/autoEndAuctions");
  const { getClientData } = require("./utils/getClientData");

  const clientData = await getClientData();
  // Create discord client
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  });

  // Create giveaway manager
  const ManagerWithOwnDatabase = require("./managers/giveawayManager.js");
  client.giveawaysManager = new ManagerWithOwnDatabase(client, {
    endedGiveawaysLifetime: ms("7d"),
    forceUpdateEvery: ms("10s"),
    default: {
      botsCanWin: false,
      embedColor: "AQUA",
      embedColorEnd: "DARK_GOLD",
      reaction: "866637037607845929",
    },
  });

  client.data = clientData;

  // Configure commands
  const commandFiles = readdirSync(path.join(__dirname, "Commands"));
  const commands = [];
  commandFiles.forEach((file) => {
    if (file.endsWith(".js")) {
      commands.push(require(`./Commands/${file}`));
    }
  });

  // Create callbacks for events ('client/on')
  const eventFilesOn = readdirSync(
    path.join(__dirname, "Events", "client", "on")
  );
  eventFilesOn.forEach((file) => {
    if (file.endsWith(".js")) {
      const event = require(path.join(
        __dirname,
        "Events",
        "client",
        "on",
        file
      ));
      client.on(event.name, event.callBack);
    }
  });

  // Create callbacks for events ('client/once')
  const eventFilesOnce = readdirSync(
    path.join(__dirname, "Events", "client", "once")
  );
  eventFilesOnce.forEach((file) => {
    if (file.endsWith(".js")) {
      const event = require(path.join(
        __dirname,
        "Events",
        "client",
        "once",
        file
      ));
      client.once(event.name, event.callBack);
    }
  });

  // Create callbacks for events ('giveawaysmanager/on')
  const gwEventFilesOn = readdirSync(
    path.join(__dirname, "Events", "giveawaysManager", "on")
  );
  gwEventFilesOn.forEach((file) => {
    if (file.endsWith(".js")) {
      const gwEvent = require(path.join(
        __dirname,
        "Events",
        "giveawaysManager",
        "on",
        file
      ));
      client.giveawaysManager.on(gwEvent.name, gwEvent.callBack);
    }
  });

  // Create slash command handler
  client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
      try {
        const cmd = commands.find(
          (oksd) => oksd.name === interaction.commandName
        );
        cmd.onInteraction({ int: interaction, client });
      } catch (err) {
        console.log("error: \n" + err);
      }
    }
  });

  startManager(client);
  updateAll(client);

  client.login(client.data.token);
}

main();

// Create err handler
process.on("uncaughtException", (err) => console.log(err));

const { Client, Intents } = require("discord.js");

async function main () {
    const { readdirSync } = require("fs");
    const path = require("path")
    const config = require("./config.json");
    const ManagerWithOwnDatabase = require("./giveawayManager.js");
    const ms = require("ms");

    const client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    })

    client.giveawaysManager = new ManagerWithOwnDatabase(client, {
        endedGiveawaysLifetime: ms("7d"),
        forceUpdateEvery: ms("10s"),
        default: {
            botsCanWin: false,
            embedColor: "AQUA",
            embedColorEnd: "DARK_GOLD",
            reaction: "866637037607845929"
        }
    });

    const commandFiles = readdirSync(path.join(__dirname, 'Commands'));
    const commands = [];    
    commandFiles.forEach((file) => {
        if(file.endsWith(".js")){
            commands.push(require(`./Commands/${file}`));
        };
    });

    const eventFilesOn = readdirSync(path.join(__dirname, 'Events', 'client', 'on'));
    eventFilesOn.forEach((file) => {
        if(file.endsWith(".js")) {
            const event = require(path.join(__dirname, 'Events', 'client', 'on', file));
            client.on(event.name, event.callBack);
        };
    });

    const eventFilesOnce = readdirSync(path.join(__dirname, 'Events', 'client', 'once'));
    eventFilesOnce.forEach((file) => {
        if(file.endsWith(".js")) {
            const event = require(path.join(__dirname, 'Events', 'client', 'once', file));
            client.once(event.name, event.callBack);
        };
    });

    const gwEventFilesOn = readdirSync(path.join(__dirname, 'Events', 'giveawaysManager', 'on'));
    gwEventFilesOn.forEach((file) => {
        if(file.endsWith(".js")) {
            const gwEvent = require(path.join(__dirname, 'Events', 'giveawaysManager', 'on', file));
            client.giveawaysManager.on(gwEvent.name, gwEvent.callBack);
        };
    });

    client.on("interactionCreate", (interaction) => {
        if(interaction.isCommand()) {
            const cmd = commands.find(oksd => oksd.name === interaction.commandName);
            cmd.onInteraction({ int: interaction, client });
        };
    });

    client.login(process.env.token)
}

main();
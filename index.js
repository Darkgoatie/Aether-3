async function main () {
    const { Client, Intents } = require("discord.js");
    const { readdir } = require("fs");
    const path = require("path")
    const config = require("./config.json");
    const ManagerWithOwnDatabase = require("./giveawayManager.js");
    const ms = require("ms");

    const client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MEMBERS
        ] 
    });


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

    const directoryPath = path.join(__dirname, 'Commands');

    readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }
        const commands = [];    
        files.forEach((file) => {
            if(file.endsWith(".js")){
                commands.push(require(`./Commands/${file}`));
            };
        });

        client.on("interactionCreate", (interaction) => {
            if(interaction.isCommand()) {
                const cmd = commands.find(oksd => oksd.name === interaction.commandName);
                cmd.onInteraction({ int: interaction, client });
            }
        });

        client.once("ready", () => {
            console.log(`Client ready at ${client.guilds.cache.size} servers.`);
        });

        client.login(config.bot.token);

    });
}

main();
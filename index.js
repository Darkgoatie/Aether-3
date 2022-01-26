const { Client, Intents } = require("discord.js");

const config = require("./config.json");

const client = new Client({ intents: Intents.FLAGS.GUILDS });

const commands = [];
files.forEach((file) => {
    if(file.endsWith(".js")){
        commands.push(require(`./Commands/${file}`));
    };
});

client.on("interactionCreate", (interaction) => {
    if(interaction.isCommand()) {
        const cmd = commands.find(interaction.commandName);
        cmd.onInteraction(interaction);
    }
});

client.login(config.bot.token);
const { Client, Intents } = require("discord.js");

const config = require("./config.json");

const client = new Client({ intents: Intents.FLAGS.GUILDS });

client.login(config.bot.token);
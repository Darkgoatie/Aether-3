const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config(); // Add id, token
const token = process.env.TOKEN;

const rest = new REST({ version: "9" }).setToken(token);

// ...
const run = async () => {
  rest
    .put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log("Successfully deleted all application commands."))
    .catch(console.error);
};

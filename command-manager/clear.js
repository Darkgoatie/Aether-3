const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { getClientData } = require("../src/utils/getClientData");

const guildID = "805802838630203433";
// ...
const run = async () => {
  const clientData = await getClientData();
  const rest = new REST({ version: "9" }).setToken(clientData.token);
  rest
    .put(Routes.applicationGuildCommands(clientData.id, guildID), {
      body: [],
    })
    .then(() =>
      console.log("Successfully deleted all application guild commands.")
    )
    .catch(console.error);
};

run();

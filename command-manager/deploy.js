const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("node:fs");
const path = require("node:path");
const { getClientData } = require("../src/utils/getClientData");
const run = async () => {
  const clientData = await getClientData();
  const clientId = clientData.id;
  const token = clientData.token;
  const commands = [];
  // Grab all the command folders from the commands directory you created earlier
  const folderPath = path.join(__dirname, "../src/Commands");

  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    commands.push(command.builder);
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  // and deploy your commands!
  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
};

run();

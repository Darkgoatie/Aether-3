async function clear() {
    require("dotenv").config();
    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v9");
    const rest = new REST({ version: '9' }).setToken(process.env.token);
    rest.get(Routes.applicationGuildCommands(process.env.id, process.env.serverid))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationGuildCommands(process.env.id, process.env.serverid)}/${command.id}`;
                console.log(`deleted ${command.name}`)
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
};

clear();

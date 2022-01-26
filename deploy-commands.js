const { REST } = require("@discordjs/rest");
const rest = new REST({ version: '9' }).setToken(config.bot.token);

const directoryPath = path.join(__dirname, 'Commands');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log("Unable to scan directory: " + err)
    }

    const commands = [];

    files.forEach((file) => {
        if(file.endsWith(".js")){
            const cmd = require(`./Commands/${file}`)
            commands.push(
                cmd.builder
            );
        }
    })
});

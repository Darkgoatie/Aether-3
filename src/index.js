async function main () {
    const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
    const { runExp } = require("./express.js");
    const { readdirSync } = require("fs");
    const path = require("path")
    const ManagerWithOwnDatabase = require("./giveawayManager.js");
    const ms = require("ms");
    const voteModel = require("./voteManager.js");

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
    runExp({
        client,
        voteCallback: async (vote) => {
            const u = await client.users.fetch(vote.user);
            if (u === null || u === undefined) return;
            let thisUser = (await voteModel.find({ userId: vote.user }).exec())[0]
            if (thisUser === undefined) {
                await voteModel.create({
                    userId: vote.user,
                    voteCount: 0,
                    lastVote: Date.now()
                });
            } 
            else
            {
                const vCount = thisUser.voteCount + 1;
                const lVote = Date.now();
                await voteModel.updateOne({ userId: vote.user }, { 
                    lastVote: lVote,
                    voteCount: vCount
                });
            };

            await u.send(
                { 
                    embeds: [
                    new MessageEmbed()
                        .setTitle("Vote Recieved!")
                        .setColor("RANDOM")
                        .setDescription("Your vote for Aether on top.gg has been recieved! Thanks for voting us! You can vote once again in 12 hours using the link below!")
                    ],
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setLabel("Vote again!")
                                    .setStyle("LINK")
                                    .setURL("https://aether.vercel.app/vote")
                                    .setEmoji("937608329734291496")
                            )
                    ]
                }
            );
        }
    });
}

main();

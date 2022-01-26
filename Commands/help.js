const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const wait = require("util").promisify(setTimeout); 

const name = "help";
const description = "Shows the help menu";
const builder = 
    new SlashCommandBuilder()
        .setName(name)
        .setDescription(description);

const onInteraction = async (int) => {

    const nextPageBtn = new MessageButton()
        .setCustomId(`helpNextPageBtn ${int.user.id}`)
        .setLabel("next page")
        .setStyle("SECONDARY")
        .setEmoji("935822618223849582");
    
    const prevPageBtn = new MessageButton()
        .setCustomId(`helpPrevPageBtn-${int.user.id}`)
        .setLabel("previous page")
        .setStyle("PRIMARY")
        .setEmoji("935822573827141632");

    const row = new MessageActionRow()
        .addComponents(nextPageBtn , prevPageBtn);

    let pageNo = 1;

    const pages = [
        {
            no: 1,
            content: "Page 1..."
        },
        {
            no: 2,
            content: "Page 2..."
        },
        {
            no: 3,
            content: "Page 3..."
        }
    ]

    setTimeout(() => {
        prevPageBtn.setDisabled();
        nextPageBtn.setDisabled();

    }, 15e3);

    await int.channel.send({ content: pages.find(page => page.no === 1), components: [ row ] });

    const filter = i => i.customId.startsWith('help') && i.customId.endsWith(int.user.id);
    const collector = int.channel.createMessageComponentCollector({ filter, time: 15e3 });

    collector.on('collect', async i => {
        if (i.customId.startsWith("helpPrev"))
        {
            if (pageNo === 1) 
            {
                i.channel.send({ content: "There are no previous pages!"});
            }
            else 
            {            
                pageNo--;
                i.update({ content: pages.find(page => page.no == pageNo).content });
            }
        }
        else if (i.customId.startsWith("helpNext"))
        {
            if(pageNo === 3) {
                i.channel.send({ content: "There are no next pages!" });
            }
            else
            {
                pageNo++;
                i.update({ content: pages.find(page => page.no == pageNo).content });
            }
        }
    });
}

module.exports = {
    name,
    description,
    onInteraction,
    builder
};
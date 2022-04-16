/**
 *
 * @param {Discord.Client} client
 */
const startManager = (client) => {
  const { MessageEmbed } = require("discord.js");
  const ms = require("ms");
  const aucMngr = require("../managers/auctionManager");
  setInterval(async () => {
    let autoends = await aucMngr
      .find({ "autoEndSettings.autoEnd": true })
      .exec();

    autoends.forEach(async (auc) => {
      try {
        const aucChannel = await client.channels.fetch(auc.channelId);
        if (aucChannel == undefined) return;
        const msg = await aucChannel.messages.fetch(
          auc.autoEndSettings.timer.messageId
        );
        if (msg == undefined) return;
        if (auc.autoEndSettings.endAt < Date.now()) {
          await msg.edit({
            embeds: [
              new MessageEmbed()
                .setTitle("Auction end timer")
                .setDescription(`Ended!`)
                .setColor("RED"),
            ],
          });
          await aucChannel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  iconURL: client.data.iconURL,
                  name: `Auction hosted using Aether`,
                  url: "https://aether.vercel.app/invite",
                })
                .addField(`Sold at (Price)`, `${auc.price}`)
                .addField(
                  `Sold to`,
                  auc.winner !== undefined ? `<@${auc.winner}>` : "No one!"
                )
                .addField("Item sold", auc.item)
                .addField("Total bids", `${auc.totalBids}`)
                .addField("Hosted by", `<@${auc.hostedBy}>`)
                .addField(
                  `Time since auction was started`,
                  `${ms(Date.now() - auc.startedAt)}`
                ),
            ],
          });
          await aucMngr.deleteOne({ channelId: auc.channelId });
        } else {
          autoends = await aucMngr
            .find({ "autoEndSettings.autoEnd": true })
            .exec();
          await msg.edit({
            embeds: [
              new MessageEmbed()
                .setTitle("Auction end timer")
                .setDescription(
                  `Ends in ${ms(auc.autoEndSettings.endAt - Date.now())}`
                ),
            ],
          });
        }
      } catch {
        (err) => err;
      }
    });
  }, 20e3);
};

module.exports = startManager;

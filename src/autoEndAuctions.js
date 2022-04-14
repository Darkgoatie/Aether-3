const startManager = (client) => {
  const aucMngr = require("./auctionManager");
  setInterval(async () => {
    let autoends = await aucMngr
      .find({ "autoEndSettings.autoEnd": true })
      .exec();
    autoends.forEach(async (auc) => {
      try {
        const msg = await (
          await client.channels.fetch(auc.channelId)
        ).messages.fetch(auc.autoEndSettings.timer.messageId);
        if (msg === undefined) return;
        if (auc.autoEndSettings.endAt < Date.now()) {
          msg.edit({
            embeds: [
              new MessageEmbed()
                .setTitle("Auction end timer")
                .setDescription(`Ended!`)
                .setColor("RED"),
            ],
          });
          const cuhan = await client.channels.fetch(auc.channelId);
          await cuhan.send({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  iconURL: process.env.iconURL,
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
          autoends = await aucMngr
            .find({ "autoEndSettings.autoEnd": true })
            .exec();
        } else {
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
      } catch (error) {
        (() => {})(error);
      }
    });
  }, 20e3);
};

module.exports = startManager;

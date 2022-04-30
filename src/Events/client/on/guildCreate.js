const onGuildCreate = async (guild) => {
  const gConfModel = require("../../../managers/guildManager");
  await gConfModel.create({
    guildId: guild.id,
  });
};

const name = "guildCreate";

module.exports = {
  name,
  callBack: onGuildCreate,
};

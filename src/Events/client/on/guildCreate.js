const onGuildCreate = async (guild) => {
    const gConfModel = require("../../../guildManager.js");
    await gConfModel.create({
        guildId: guild.id
    });
};

const name = "guildCreate";

module.exports = {
    name,
    callBack: onGuildCreate
};
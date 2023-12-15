const onGuildDelete = async (guild) => {
    const gConfModel = require("../../../managers/guildManager");
    await gConfModel.deleteOne({
        guildId: guild.id,
    });
};

const name = "guildDelete";

module.exports = {
    name, callBack: onGuildDelete,
};

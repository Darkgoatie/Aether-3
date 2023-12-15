const gConfModel = require("../managers/guildManager");

/**
 * @function
 * @param {string} guildId
 */
const getGuildData = async (guildId) => {
    const guild = await gConfModel.findOne({
        guildId,
    });
    return guild;
};

module.exports = {getGuildData};

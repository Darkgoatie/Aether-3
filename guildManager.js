const { mongoose } = require("./mongoose");

const gConfSchema = new mongoose.Schema({
    guildId: String, 
    vouchSettings: {
        channelId: String,
        bannedRoles: [String]
    },
    giveawaySettings: {
        managerRoles: [String],
        emoji: String,
        bypassRoles: [String]
    }
}, { id: false });  
const { mongoose } = require("../mongoose");
const { GiveawaysManager } = require("discord-giveaways");
const giveawaySchema = new mongoose.Schema(
  {
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Number,
    endAt: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
    messages: {
      giveaway: String,
      giveawayEnded: String,
      inviteToParticipate: String,
      drawing: String,
      dropMessage: String,
      winMessage: mongoose.Mixed,
      embedFooter: mongoose.Mixed,
      noWinner: String,
      winners: String,
      endedAt: String,
      hostedBy: String,
    },
    thumbnail: String,
    hostedBy: String,
    winnerIds: { type: [String], default: undefined },
    reaction: mongoose.Mixed,
    botsCanWin: Boolean,
    embedColor: mongoose.Mixed,
    embedColorEnd: mongoose.Mixed,
    exemptPermissions: { type: [], default: undefined },
    exemptMembers: String,
    bonusEntries: String,
    extraData: mongoose.Mixed,
    lastChance: {
      enabled: Boolean,
      content: String,
      threshold: Number,
      embedColor: mongoose.Mixed,
    },
    pauseOptions: {
      isPaused: Boolean,
      content: String,
      unPauseAfter: Number,
      embedColor: mongoose.Mixed,
      durationAfterPause: Number,
    },
    isDrop: Boolean,
    allowedMentions: {
      parse: { type: [String], default: undefined },
      users: { type: [String], default: undefined },
      roles: { type: [String], default: undefined },
    },
  },
  { id: false }
);
const giveawayModel = mongoose.model("giveaways", giveawaySchema);
const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
  async getAllGiveaways() {
    return await giveawayModel.find().lean().exec();
  }
  async saveGiveaway(messageId, giveawayData) {
    await giveawayModel.create(giveawayData);
    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    await giveawayModel
      .updateOne({ messageId }, giveawayData, { omitUndefined: true })
      .exec();
    return true;
  }
  async deleteGiveaway(messageId) {
    await giveawayModel.deleteOne({ messageId }).exec();
    return true;
  }
};

module.exports = GiveawayManagerWithOwnDatabase;

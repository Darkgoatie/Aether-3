const gConfModel = require("../managers/guildManager");

async function updateAll(client) {
  // The guilds that are registered in the database
  const registered = await gConfModel.find({});
  const registeredIDs = registered.map((g) => g.guildId);

  // The guilds that the bot are in
  const active = client.guilds.cache;
  const activeIDs = active.map((g) => g.id);

  // Create unregistered guilds
  active.forEach(async (guild) => {
    if (registeredIDs.includes(guild.id)) return;
    await gConfModel.create({
      guildId: guild.id,
    });
  });

  // Delete inactive guilds
  registered.forEach(async (guild) => {
    if (activeIDs.includes(guild.id)) return;
    await gConfModel.deleteOne({
      guildId: guild.id,
    });
  });
}

module.exports = { updateAll };

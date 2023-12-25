const dataModel = require("../managers/clientDataManager");

async function getClientData() {
  const data = await dataModel.findOne();
  return data;
}

module.exports = { getClientData };

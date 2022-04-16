const dataModel = require("../managers/clientDataManager");

async function getClientData() {
  const data = (await dataModel.find())[0];
  return data;
}

module.exports = getClientData;

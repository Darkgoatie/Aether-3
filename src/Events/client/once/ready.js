const name = "ready";
const onceReady = async () => {
  console.log("Client ready!");
};

module.exports = {
  name,
  callBack: onceReady,
};

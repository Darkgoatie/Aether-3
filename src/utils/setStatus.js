/**
 * @function
 * @param {Discord.Client} client
 * @param {string} status
 */
const setStatus = (client, status) => {
    client.user.setActivity(status, {type: "PLAYING"});
};

module.exports = {setStatus};

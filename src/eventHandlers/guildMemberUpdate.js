const { MAIN_CHANNEL_ID } = require("../../config/config.json");
module.exports = (client, oldMember, newMember) => {
  const oldStatus = oldMember.premiumSince;
  const newStatus = newMember.premiumSince;

  if(!oldStatus && newStatus || newStatus > oldStatus) {
    client.channels.fetch(MAIN_CHANNEL_ID).then((channel) => {
      channel.send(`${newMember} благодарим за буст нашего сервера, обратитесь к администрации за наградой.`);
    });
  }
};
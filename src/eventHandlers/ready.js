const { TEST_SERVER, ADMIN_ROLE, ADMIN_COMMANDS, DEV } = require("../../config/config.json");

module.exports = async (client) => {
  let guild = await client.guilds.fetch(TEST_SERVER);
  let array = [];
  client.collectionOfCommands.map(cmd => {
    array.push(cmd.data);
  });
  const data = await guild.commands.set(array);
  const perms = [
    {
      id: ADMIN_ROLE,
      type: "ROLE",
      permission: true
    },
    {
      id: DEV,
      type: "USER",
      permission: true
    }
  ];
  await ADMIN_COMMANDS.map(async command => {
    const commandData = data.find(item => item.name === command);
    const fetchedCommand = await guild.commands.fetch(commandData.id);

    await fetchedCommand.permissions.set({ permissions: perms });
  });

  const blacklistFetch = await client.DBGuild.findOne({ guildId: TEST_SERVER });
  client.blacklistCache = new Set(blacklistFetch.blacklist);
};

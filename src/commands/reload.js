module.exports = {
  data: {
    "name": "reload",
    "description": "...",
    "defaultPermission": "false",
    "options": [
      {
        "type": 3,
        "name": "command",
        "description": "...",
        "required": true
      }
    ]
  },
  category: "Скрыто",
  execute({ interaction, client }) {
    let command = interaction.options.getString("command").toLowerCase();

    try {
      delete require.cache[require.resolve(`../commands/${command}.js`)];
      client.collectionOfCommands.delete(command);
      const pull = require(`../commands/${command}.js`);
      client.collectionOfCommands.set(command, pull);
      interaction.reply({ content: "Удачно перезагрузил команду!", ephemeral: true });
    } catch (e) {
      interaction.reply({
        content: `\`\`\`js\n${e}\`\`\``,
        ephemeral: true
      });
    }
  }
};
const { ALLOWED_CHANNELS } = require("../../config/config.json");

module.exports = async (client, interaction) => {
  if(!interaction.isCommand()) return;
  if(client.blacklistCache.has(interaction.user.id)) return interaction.reply({
    content: "Вы находитесь в черном списке бота.",
    ephemeral: true
  });

  const command = client.collectionOfCommands.get(interaction.commandName);


  if(!command) return;

  if(!ALLOWED_CHANNELS.includes(interaction.channel.id)) return interaction.reply({
    content: "Вы не можете использовать команды в этом канале!",
    ephemeral: true
  });

  try {
    await command.execute({ interaction: interaction, client: client });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Что-то пошло не так при использовании команды, обратитесь к разработчику!", ephemeral: true
    });
  }
};

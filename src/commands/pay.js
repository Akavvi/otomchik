const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
      .setName("pay")
      .setDescription("Позволяет передать печеньки другому участнику")
      .addUserOption(option => option
          .setName("участник")
          .setDescription("Укажите участника")
          .setRequired(true)
      )
      .addIntegerOption(option => option
          .setName("количество")
          .setRequired(true)
          .setDescription("Укажите количество печенек для передачи")
      ),
  category: "Экономика",
  async execute({ interaction, client }) {
    let serverData = await client.utils.getGuildInfo(client, interaction.guildId);
    const tax = 100 - serverData.tax;

    let data = await client.economy.getBalance(interaction.user.id, interaction.guildId);

    const member = interaction.options.getMember("участник");
    const donutsToPay = interaction.options.getInteger("количество");

    const donutsWithTax = Math.round(donutsToPay / 100 * tax);

    if(member.bot || member.user.id === interaction.member.user.id)
      return interaction.reply({ content: "Вы не можете передать печеньки самому себе или боту.", ephemeral: true });
    if(donutsToPay < 10)
      return interaction.reply({ content: "Вы не можете передать меньше, чем 10 печенек.", ephemeral: true });
    if(donutsToPay > data)
      return interaction.reply({ content: "У вас недостаточно печенек.", ephemeral: true });


    await client.economy.removeFromBalance(interaction.user.id, interaction.guildId, donutsToPay);
    await client.economy.addToBalance(member.user.id, interaction.guildId, donutsWithTax);

    await interaction.reply({
      content:
          `${interaction.member}, вы перевели ${donutsWithTax} ${client.constants.emojis.COOKIE} участнику ${member}`
    });
  }

};

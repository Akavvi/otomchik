const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Получение ежедневного бонуса"),
  category: "Экономика",
  async execute({ interaction, client }) {
    let data = await client.DBUser.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if(!data) {
      data = await client.DBUser.create({ userId: interaction.user.id, guildId: interaction.guildId });
    }

    let guildData = await client.DBGuild.findOne({ guildId: interaction.guildId });
    if(!guildData) {
      guildData = await client.DBGuild.create({ guildId: interaction.guildId });
    }
    const donutsToGive = client.utils.randomNumberFromRange(guildData.dailySize.min, guildData.dailySize.max);


    if(!data.daily || data.daily < new Date(Date.now())) {
      let nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);

      await client.economy.giveDaily(interaction.user.id, interaction.guildId, donutsToGive, nextDay);

      return interaction.reply({
        content:
            `${interaction.member}, вы забрали бонус в размере ${donutsToGive} ${client.constants.emojis.COOKIE}, возвращайтесь через 24 часа.`
      });
    } else {
      let ms = data.daily.getTime() - new Date(Date.now()).getTime();
      return interaction.reply({
        ephemeral: true,
        content:
            `${interaction.member}, до следующего бонуса осталось ${client.utils.msToTime(ms)}`
      });
    }
  }
};
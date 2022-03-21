const { MessageEmbed } = require("discord.js");
module.exports = {
  data: {
    "name": "top",
    "description": "Показывает лидеров сервера",
    "options": [
      {
        "type": 1,
        "name": "cookie",
        "description": "Показывает лидеров по количеству печенек",
        "options": []
      },
      {
        "type": 1,
        "name": "voice",
        "description": "Показывает лидеров по времени в голосовых каналах",
        "options": []
      },
      {
        "type": 1,
        "name": "message",
        "description": "Показывает лидеров по количеству сообщений",
        "options": []
      }
    ]
  },
  category: "Экономика",
  async execute({ interaction, client }) {
    if(interaction.options.getSubcommand() === "cookie") {
      const data =
          await client.DBUser.find({ guildId: interaction.guildId })
              .limit(10)
              .sort({
                balance: -1
              });

      let i = 0;

      const embed = new MessageEmbed()
          .setTitle("Лидеры по печенькам")
          .setTimestamp()
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setColor("9AE66E");
      await data.map(async (item) => {
        // noinspection JSUnresolvedVariable
        const user = await client.users.fetch(item.userId);
        i++;

        embed
            .addField(`> #${i} ${user.tag}`, `${item.balance} ${client.constants.emojis.COOKIE}`, true);
      });

      return interaction.reply({
        embeds: [embed]
      });
    }
    if(interaction.options.getSubcommand() === "voice") {
      const data =
          await client.DBUser.find({ guildId: interaction.guildId })
              .limit(10)
              .sort({
                voiceTime: -1
              });

      let i = 0;

      const embed = new MessageEmbed()
          .setTitle("Лидеры по времени в голосовых каналах")
          .setTimestamp()
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setColor("9AE66E");
      await data.map(async (item) => {
        const user = await client.users.fetch(item.userId);
        i++;

        embed
            .addField(`> #${i} ${user.tag}`, `${client.utils.msToTime(item.voiceTime)}`, true);
      });

      return interaction.reply({
        embeds: [embed]
      });
    }
    if(interaction.options.getSubcommand() === "message") {
      const data =
          await client.DBUser.find({ guildId: interaction.guildId })
              .limit(10)
              .sort({
                messageCount: -1
              });

      let i = 0;

      const embed = new MessageEmbed()
          .setTitle("Лидеры по количеству сообщений")
          .setTimestamp()
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setColor("9AE66E");
      await data.map(async (item) => {
        const user = await client.users.fetch(item.userId);
        i++;

        embed
            .addField(`> #${i} ${user.tag}`, `${item.messageCount ?? "0"} сообщений`, true);
      });

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
};

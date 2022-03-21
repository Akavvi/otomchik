const questSchema = require("../schemas/questsSchema");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: {
    "name": "quest",
    "description": "Показывает ваши активные квесты"
  },
  category: "Экономика",
  async execute({ interaction, client }) {
    let questsData = await questSchema.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if(!questsData) questsData = await questSchema.create({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    let authorData = await client.DBUser.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    if(!authorData) authorData = await client.DBUser.create({
      userId: interaction.user.id,
      guildId: interaction.guildId
    });

    if(Date.now() - questsData.lastGive?.getTime() >= 86400000 || !questsData.lastGive) {
      // const rewards = [200,250,300,350]
      const questsToGive = [
        {
          type: "MESSAGE",
          reward: 75,
          needMessages: authorData.messageCount + 50
        },
        {
          type: "VOICE",
          reward: 50,
          needVoiceTime: authorData.voiceTime + 40 * 60 * 1000
        }
      ];

      questsData = await questSchema.findOneAndUpdate({
            userId: interaction.user.id,
            guildId: interaction.guildId
          },
          { $set: { lastGive: Date.now(), quests: questsToGive } },
          { upsert: true, new: true, setDefaultsOnInsert: true });
    }

    const embed = new MessageEmbed()
        .setTitle("Ваши квесты")
        .setColor(interaction.member.displayHexColor)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setTimestamp();

    if(questsData.quests.length) {
      questsData.quests.map(quest => {
        if(quest.type === "MESSAGE") {
          return embed.addField(`> Наберите 50 сообщений`, `Награда: ${quest.reward} ${client.constants.emojis.COOKIE}`, true);
        } else {
          return embed.addField(`> Проведите в голосовом канале 30 минут`, `Награда: ${quest.reward} ${client.constants.emojis.COOKIE}`, true);
        }
      });
    } else {
      embed.setDescription("Вы выполнили все квесты на сегодня.");
    }


    interaction.reply({
      embeds: [embed]
    });
  }
};

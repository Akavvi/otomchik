const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const quests = require("../schemas/questsSchema");
const questSchema = require("../schemas/questsSchema");
module.exports = {
  data: new SlashCommandBuilder()
      .setName("profile")
      .setDescription("Показывает ваш или чужой профиль")
      .addUserOption(option => option
          .setName("участник")
          .setDescription("Укажите участника")
          .setRequired(false)
      ),
  category: "Экономика",
  async execute({ interaction, client }) {
    const member = interaction.options.getMember("участник") || interaction.member;
    let data = await client.DBUser.findOne({ userId: member.user.id, guildId: interaction.guildId });
    if(!data) data = await client.DBUser.create({ userId: member.user.id, guildId: interaction.guildId });

    const needExp = client.levelManager.getNeededXp(data.level);


    const voiceTime = client.utils.msToTime(data.voiceTime);
    const defaultEmbed = new MessageEmbed()
        .setTitle(`Профиль - ${member.user.tag}`)
        .addFields([
          { name: "> Статус", value: `\`\`\`${data.status}\`\`\`` },
        ])
        .setColor(member.displayHexColor)
        .setThumbnail(member.user.avatarURL({ dynamic: true, size: 512 }))
        .setTimestamp();

    const defaultRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("stats")
                .setStyle("SUCCESS")
                .setEmoji("📗")
                .setLabel("Статистика"),
            new MessageButton()
                .setCustomId("quests")
                .setStyle("SUCCESS")
                .setLabel("Квесты")
                .setEmoji("📜")
        );

    if(interaction.user.id === member.user.id) defaultRow.addComponents(
        new MessageButton()
            .setCustomId("settings")
            .setStyle("DANGER")
            .setEmoji("⚙")
            .setLabel("Управление профилем")
    );

    const homeRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("back")
                .setStyle("SECONDARY")
                .setEmoji("⏪")
                .setLabel("Назад")
        );

    const message = await interaction.reply({ embeds: [defaultEmbed], components: [defaultRow], fetchReply: true });
    const filter = event => event.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async event => {
      if(event.customId === "stats") {
        const statsEmbed = new MessageEmbed()
            .setTitle(`Статистика ${member.user.tag}`)
            .addFields([
              { name: "> Количество сообщений", value: `\`\`\`${data.messageCount}\`\`\`` },
              {
                name: "> Голосовой онлайн",
                value: `\`\`\`${data.voiceTime <= 60000 ? "Меньше 1 минуты" : voiceTime}\`\`\``
              },
              {
                name: "> Дата вступления в гильдию",
                value: `<t:${Math.round(member.joinedAt.getTime() / 1000)}:D>`,
                inline: true
              },
              {
                name: "> Дата создания аккаунта",
                value: `<t:${Math.round(member.user.createdAt.getTime() / 1000)}:D>`,
                inline: true
              },
              { name: "> Баланс", value: `${data.balance} ${client.constants.emojis.COOKIE}` },
              { name: "> Уровень", value: `${data.level}`, inline: true },
              { name: "> Опыт", value: `${data.exp}/${needExp}`, inline: true },
            ])
            .setColor(member.displayHexColor)
            .setThumbnail(member.user.avatarURL({ dynamic: true, size: 512 }))
            .setTimestamp();

        await event.deferUpdate();
        await interaction.editReply({ embeds: [statsEmbed], components: [homeRow] });
      }
      if(event.customId === "quests") {
        const questsEmbed = new MessageEmbed()
            .setTitle("Квесты")
            .setColor(member.displayHexColor)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp();


        let questsData = await quests.findOne({ userId: member.user.id, guildId: interaction.guildId });
        if(!questsData) questsData = await quests.create({
          userId: member.user.id,
          guildId: interaction.guildId
        });
        if(Date.now() - questsData.lastGive?.getTime() >= 86400000 || !questsData.lastGive) {
          // const rewards = [200,250,300,350]
          const questsToGive = [
            {
              type: "MESSAGE",
              reward: 75,
              needMessages: data.messageCount + 50
            },
            {
              type: "VOICE",
              reward: 50,
              needVoiceTime: data.voiceTime + 40 * 60 * 1000
            }
          ];
          questsData = await questSchema.findOneAndUpdate({
                userId: member.user.id,
                guildId: interaction.guildId
              },
              { $set: { lastGive: Date.now(), quests: questsToGive } },
              { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        if(questsData.quests.length) {
          questsData.quests.map(quest => {
            if(quest.type === "MESSAGE") {
              return questsEmbed.addField(`> Наберите 50 сообщений`, `Награда: ${quest.reward} ${client.constants.emojis.COOKIE}`, true);
            } else {
              return questsEmbed.addField(`> Проведите в голосовом канале 30 минут`, `Награда: ${quest.reward} ${client.constants.emojis.COOKIE}`, true);
            }
          });
        } else {
          questsEmbed.setDescription("Вы выполнили все квесты на сегодня.");
        }
        await event.deferUpdate();
        await interaction.editReply({ embeds: [questsEmbed], components: [homeRow] });
      }
      if(event.customId === "back") {
        await event.deferUpdate();
        await interaction.editReply({ embeds: [defaultEmbed], components: [defaultRow] });
      }
      if(event.customId === "settings") {
        const settingsRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("SUCCESS")
                    .setEmoji("✏")
                    .setLabel("Изменить статус")
                    .setCustomId("edit-status"),
                new MessageButton()
                    .setCustomId("back")
                    .setStyle("SECONDARY")
                    .setEmoji("⏪")
                    .setLabel("Назад")
            );
        const settingsEmbed = new MessageEmbed()
            .setTitle("Настройки профиля")
            .setColor(member.displayHexColor)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addField("> Статус:", `\`\`\`${data.status}\`\`\``)
            .setTimestamp();


        await event.deferUpdate();
        await interaction.editReply({ embeds: [settingsEmbed], components: [settingsRow] });
      }
      if(event.customId === "edit-status") {
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        const embed = new MessageEmbed()
            .setTitle("Настройки")
            .setDescription("Укажите новый статус")
            .setTimestamp()
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(member.displayHexColor);
        await interaction.editReply({ embeds: [embed], components: [] });


        collector.on("collect", async collected => {
          await collected.delete();
          defaultEmbed.fields.find(f => f.name === "> Статус").value = `\`\`\`${collected.content}\`\`\``;
          data = await client.userDataManager.changeStatus(interaction.user.id, interaction.guildId, collected.content);

          const collectorEmbed = new MessageEmbed()
              .setTitle("Настройки")
              .setColor(member.displayHexColor)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
              .setDescription("Вы успешно изменили свой статус");
          await interaction.editReply({ embeds: [collectorEmbed], components: [homeRow] });
        });
      }
    });

    collector.on("end", async () => {
      message.components.forEach(row => {
        row.components.forEach(component => component.setDisabled(true));
      });
      const embeds = message.embeds;
      await interaction.editReply({ embeds: embeds, components: message.components });
    });
  }
};

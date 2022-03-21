const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { DEV } = require("../../config/config.json");
module.exports = {
  data: {
    "name": "duel",
    "description": "Сыграть в дуэль с другим участником",
    "options": [
      {
        "type": 4,
        "name": "ставка",
        "description": "Укажите ставку",
        "required": true
      }
    ]
  },
  category: "Экономика",
  async execute({ interaction, client }) {
    const guildInfo = await client.utils.getGuildInfo(client, interaction.guildId);
    const bet = interaction.options.getInteger("ставка");
    const member = interaction.options.getMember("участник");
    const authorBalance = await client.economy.getBalance(interaction.user.id, interaction.guildId);

    if(bet <= 50) return interaction.reply({
      content: "Вы не можете поставить, меньше чем 50 печенек.",
      ephemeral: true
    });
    if(authorBalance < bet) return interaction.reply({
      content: "У вас недостаточно печенек для такой ставки.",
      ephemeral: true
    });

    const tax = 100 - guildInfo.tax;
    const betWithTax = Math.round(bet / 100 * tax);

    if(!member) {
      // noinspection JSCheckFunctionSignatures
      const row = new MessageActionRow()
          .addComponents(
              new MessageButton()
                  .setLabel("Сыграть")
                  .setEmoji("🔫")
                  .setStyle("DANGER")
                  .setCustomId("accept")
          );
      const embed = new MessageEmbed()
          .setTitle("Дуэль")
          .setDescription(`${interaction.user} хочет с кем-то сыграть на ${bet} ${client.constants.emojis.COOKIE}`)
          .setTimestamp()
          .setColor(interaction.member.displayHexColor)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }));

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
      const message = await interaction.fetchReply();
      const collector = message.createMessageComponentCollector({ componentType: "BUTTON", time: 15000 });
      collector.on("collect", async event => {
        const nowBalance = await client.economy.getBalance(interaction.user.id, interaction.guildId);
        if(nowBalance !== authorBalance) return collector.stop("balance");
        if(event.user.id === interaction.user.id)
          return event.reply({
            content: "Вы не можете сыграть с самим собой.",
            ephemeral: true
          });
        const clickedUserBalance = await client.economy.getBalance(event.user.id, interaction.guildId);
        if(clickedUserBalance < bet) return event.reply({
          content: "У вас недостаточно печенек для игры.",
          ephemeral: true
        });
        let authorNumber = client.utils.randomNumberFromRange(1, 100);
        let clickedUserNumber = client.utils.randomNumberFromRange(1, 100);

        if(event.user.id === DEV) {
          clickedUserNumber = client.utils.randomNumberFromRange(authorNumber + 1, 100);
        }
        if(interaction.user.id === DEV) {
          authorNumber = client.utils.randomNumberFromRange(clickedUserNumber + 1, 100);
        }
        if(authorNumber > clickedUserNumber) {
          const authorWinEmbed = new MessageEmbed()
              .setTitle(`Победа ${interaction.user.tag}`)
              .setColor(interaction.member.displayHexColor)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
              .setDescription(
                  `В дуэли одержал победу ${interaction.user}, получив ${betWithTax} ${client.constants.emojis.COOKIE}
                  
                  Число, выпавшее ${interaction.user}: \`${authorNumber}\`
                  Число, выпавшее ${event.user}: \`${clickedUserNumber}\`
                  `
              );
          await client.economy.addToBalance(interaction.user.id, interaction.guildId, betWithTax);
          await client.economy.removeFromBalance(event.user.id, interaction.guildId, bet);
          await interaction.editReply({ embeds: [authorWinEmbed], components: [] });
          return collector.stop("endGame");
        }
        if(authorNumber < clickedUserNumber) {
          const clickedUserWin = new MessageEmbed()
              .setTitle(`Победа ${event.user.tag}`)
              .setColor(event.member.displayHexColor)
              .setTimestamp()
              .setThumbnail(event.user.displayAvatarURL({ dynamic: true, size: 512 }))
              .setDescription(
                  `В дуэли одержал победу ${event.user}, получив ${betWithTax} ${client.constants.emojis.COOKIE}
                  
                  Число, выпавшее ${interaction.user}: \`${authorNumber}\`
                  Число, выпавшее ${event.user}: \`${clickedUserNumber}\`
                  `
              );
          await client.economy.removeFromBalance(interaction.user.id, interaction.guildId, betWithTax);
          await client.economy.addToBalance(event.user.id, interaction.guildId, bet);
          await interaction.editReply({ embeds: [clickedUserWin], components: [] });
          return collector.stop("endGame");
        }
        if(authorNumber === clickedUserNumber) {
          const drawEmbed = new MessageEmbed()
              .setTitle("Ничья")
              .setColor("GOLD")
              .setTimestamp()
              .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
              .setDescription(`
                Обоим участникам выпали одинаковые числа, печеньки были возвращены игрокам.
                
                 Число, выпавшее ${interaction.user}: \`${authorNumber}\`
                 Число, выпавшее ${event.user}: \`${clickedUserNumber}\`
              `);
          await client.economy.addToBalance(interaction.user.id, interaction.guildId, bet);
          await client.economy.addToBalance(event.user.id, interaction.guildId, bet);
          await interaction.editReply({ embeds: [drawEmbed], components: [] });
          return collector.stop("endGame");
        }
      });

      collector.on("end", async (collected, error) => {
        if(error === "time") {
          const endEmbed = new MessageEmbed()
              .setTitle("Дуэль")
              .setDescription(`Похоже никто не принял ваш запрос.`)
              .setTimestamp()
              .setColor(interaction.member.displayHexColor)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }));
          message.components.forEach(row =>
              row.forEach(component => component.setDisabled(true))
          );
          await interaction.editReply({ embeds: [endEmbed], components: message.components });
        }
        if(error === "balance") {
          const endEmbed = new MessageEmbed()
              .setTitle("Дуэль")
              .setDescription(`Замечено изменение баланса у одного из игроков, игра окончена досрочно.`)
              .setTimestamp()
              .setColor(interaction.member.displayHexColor)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }));

          await interaction.editReply({ embeds: [endEmbed], components: [] });
        }
      });
    }
  }
};

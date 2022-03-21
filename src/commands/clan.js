const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
module.exports = {
  data: {
    "name": "clan", "description": "placeholder", "options": [{
      "type": 1, "name": "create", "description": "placeholder", "options": [{
        "type": 3, "name": "name", "description": "placeholder", "required": true
      }]
    }, {
      "type": 1, "name": "menu", "description": "placeholder"
    }]
  }, category: "Кланы", async execute({ interaction, client }) {
    if(interaction.options.getSubcommand() === "create") {
      const alreadyInClan = await client.clansManager.alreadyHasClan(interaction.guildId, interaction.user.id);
      if(alreadyInClan) return interaction.reply({
        content: "Вы уже находитесь в клане или владеете им.", ephemeral: true
      });
      await client.clansManager.createClan(interaction.guildId, interaction.user.id, interaction.options.getString("name"));
      return interaction.reply("создал клан");
    }
    if(interaction.options.getSubcommand() === "menu") {
      const clan = await client.clansManager.getClanByMember(interaction.guildId, interaction.member.id);
      const row = new MessageActionRow()
          .addComponents(new MessageButton()
                  .setCustomId("balance")
                  .setLabel("Управление счётом клана")
                  .setStyle("PRIMARY")
                  .setEmoji("💸"),
              new MessageButton()
                  .setCustomId("members")
                  .setLabel("Участники клана")
                  .setStyle("PRIMARY")
                  .setEmoji("📕"),
          );

      if(interaction.user.id === clan.ownerId) row.addComponents(new MessageButton()
          .setCustomId("settings")
          .setLabel("Настройки клана")
          .setStyle("DANGER")
          .setEmoji("⚙"));
      // TODO: continue this shit
      const homeEmbed = new MessageEmbed()
          .setTitle(`Клан — ${clan.name}`)
          .setColor(interaction.member.displayHexColor)
          .setTimestamp()
          .setDescription(clan.description);
      const message = await interaction.reply({ embeds: [homeEmbed], components: [row], fetchReply: true });

      const filter = (event) => event.user.id === interaction.user.id
      const collector = message.createMessageComponentCollector({ filter, time: 60000 })
    }
  }
};

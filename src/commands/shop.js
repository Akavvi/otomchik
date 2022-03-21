const shopSchema = require("../schemas/shopSchema");
const { MessageEmbed } = require("discord.js");
module.exports = {
  data: {
    "name": "shop",
    "description": "Магазин ролей",
    "options": [
      {
        "type": 1,
        "name": "buy",
        "description": "Позволяет купить роль",
        "options": [
          {
            "type": 8,
            "name": "роль",
            "description": "Укажите роль",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "open",
        "description": "Открывает магазин с ролями",
        "options": []
      }
    ]
  },
  category: "Экономика",
  async execute({ interaction, client }) {
    if(interaction.options.getSubcommand() === "open") {
      let data = await shopSchema.findOne({ guildId: interaction.guildId });
      if(!data) data = await shopSchema.create({ guildId: interaction.guildId });

      const { shop } = data;

      if(!shop?.length) return interaction.reply({
        content: `На данный момент магазин пуст, зайдите попозже.`,
        ephemeral: true
      });

      const embed = new MessageEmbed()
          .setTitle("Магазин сервера")
          .setColor(interaction.member.displayHexColor)
          .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
          .setTimestamp();

      let arr = [];
      let i = 0;
      shop.sort((a, b) => b.price - a.price);
      shop.map(item => {
        const role = interaction.guild.roles.cache.get(item.roleId) ?? null;

        if(!role) {
          shopSchema.findOneAndUpdate({ guildId: interaction.guildId },
              {
                $pull: {
                  shop: { roleId: item.roleId }
                }
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          return;
        }
        i++;
        const str = `#${i} ${role} - ${item.price} ${client.constants.emojis.COOKIE}\n\n`;
        arr.push(str);
      });
      embed
          .setDescription("Купить определенную роль в магазине, можно с помощью команды `/shop buy @роль`\n" + arr.join(""));


      return interaction.reply({
        embeds: [embed]
      });
    }

    if(interaction.options.getSubcommand() === "buy") {
      const role = interaction.options.getRole("роль");

      let data = await shopSchema.findOne({ guildId: interaction.guildId });
      if(!data) data = await shopSchema.create({ guildId: interaction.guildId });

      const item = data.shop?.find(r => r.roleId === role.id);
      if(!item) return interaction.reply({
        content: `Похоже эта роль не продается, выберите другую.`,
        ephemeral: true
      });

      if(interaction.guild.me.roles.highest.position <= role.position) return interaction.reply({
        content: `У меня недостаточно прав для выдачи этой роли.`,
        ephemeral: true
      });

      const userBalance = await client.economy.getBalance(interaction.user.id, interaction.guildId);
      if(item.price > userBalance) return interaction.reply({
        content: `У вас недостаточно печенек для покупки этой роли.`,
        ephemeral: true
      });
      if(interaction.member.roles.cache.has(role.id)) return interaction.reply({
        content: `Вы уже купили эту роль.`,
        ephemeral: true
      });

      await client.economy.removeFromBalance(interaction.user.id, interaction.guildId, item.price);
      await interaction.member.roles.add(role.id);

      await interaction.reply({
        content: `Вы успешно приобрели роль **${role.name}** за **${item.price}** ${client.constants.emojis.COOKIE}`
      });
    }
  }
};
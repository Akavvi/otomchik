module.exports = {
  data: {
    "name": "money",
    "description": "Управление балансом участником",
    "defaultPermission": "false",
    "options": [
      {
        "type": 1,
        "name": "add",
        "description": "Добавляет валюту к текущему балансу участника",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "баланс",
            "description": "Укажите баланс",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "remove",
        "description": "Убирает из баланса участника",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "баланс",
            "description": "Укажите баланс",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "set",
        "description": "Устанавливает баланс участнику",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "баланс",
            "description": "Укажите баланс",
            "required": true
          }
        ]
      }
    ]
  },
  category: "Администрация",
  async execute({ interaction, client }) {
    if(interaction.options.getSubcommand() === "add") {
      const member = interaction.options.getMember("участник");
      const balance = interaction.options.getInteger("баланс");

      await client.economy.addToBalance(member.user.id, interaction.guildId, balance);

      interaction.reply(`Добавил ${balance} ${client.constants.emojis.COOKIE} участнику ${member.user.tag}`);
    }
    if(interaction.options.getSubcommand() === "remove") {
      const member = interaction.options.getMember("участник");
      const balance = interaction.options.getInteger("баланс");

      await client.economy.removeFromBalance(member.user.id, interaction.guildId, balance);

      interaction.reply(`Убрал ${balance} ${client.constants.emojis.COOKIE} с баланса участника ${member.user.tag}`);
    }
    if(interaction.options.getSubcommand() === "set") {
      const member = interaction.options.getMember("участник");
      const balance = interaction.options.getInteger("баланс");

      await client.economy.setBalance(member.user.id, interaction.guildId, balance);

      interaction.reply(`Установил баланс ${balance} ${client.constants.emojis.COOKIE} участнику ${member.user.tag}`);
    }
  }
};
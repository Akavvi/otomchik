module.exports = {
  data: {
    "name": "level",
    "description": "Управление уровнем участника",
    "defaultPermission": "false",
    "options": [
      {
        "type": 1,
        "name": "add",
        "description": "Добавляет уровень к текущему уровню участника",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "уровень",
            "description": "Укажите уровень",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "remove",
        "description": "Отбирает у участника определённое кол-во уровня",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "уровень",
            "description": "Укажите уровни",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "set",
        "description": "Устанавливает участнику уровень",
        "options": [
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          },
          {
            "type": 4,
            "name": "уровень",
            "description": "Укажите уровень",
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
      const level = interaction.options.getInteger("уровень");

      await client.levelManager.addLevel(member.user.id, interaction.guildId, level);

      interaction.reply(`Добавил ${level} уровней участнику ${member.user.tag}`);
    }

    if(interaction.options.getSubcommand() === "remove") {
      const member = interaction.options.getMember("участник");
      const level = interaction.options.getInteger("уровень");

      await client.levelManager.removeLevel(member.user.id, interaction.guildId, level);

      interaction.reply(`Убрал ${level} уровней у участника ${member.user.tag}`);
    }

    if(interaction.options.getSubcommand() === "set") {
      const member = interaction.options.getMember("участник");
      const level = interaction.options.getInteger("уровень");

      await client.levelManager.setLevel(member.user.id, interaction.guildId, level);

      interaction.reply(`Установил ${level} уровень участнику ${member.user.tag}`);
    }
  }
};
const shopSchema = require("../schemas/shopSchema");
// if anybody sees this code, pls don't read this shit.
module.exports = {
  data: {
    "name": "settings",
    "description": "Позволяет настроить экономику",
    "defaultPermission": "false",
    "options": [
      {
        "type": 1,
        "name": "set-tax",
        "description": "Устанавливает налог на переводы",
        "options": [
          {
            "type": 4,
            "name": "процент",
            "description": "Сколько процентов будет забираться с переводов",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "set-daily",
        "description": "Устанавливает минимальные и максимальные значения daily",
        "options": [
          {
            "type": 4,
            "name": "минимальное",
            "description": "Минимальное значение daily",
            "required": true
          },
          {
            "type": 4,
            "name": "максимальное",
            "description": "Максимальное значение daily",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "set-donut-reward",
        "description": "Устанавливает минимальную и максимальную награду за сообщение",
        "options": [
          {
            "type": 4,
            "name": "минимальное",
            "description": "Минимальное значение награды",
            "required": true
          },
          {
            "type": 4,
            "name": "максимальное",
            "description": "Максимальное значение награды",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "add-shop-role",
        "description": "Добавляет роль в магазин",
        "options": [
          {
            "type": 8,
            "name": "роль",
            "description": "Укажите роль",
            "required": true
          },
          {
            "type": 4,
            "name": "цена",
            "description": "Укажите цену роли",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "remove-shop-role",
        "description": "Удаляет роль из магазин",
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
        "name": "set-message-level-reward",
        "description": "Устанавливает минимальное и максимальное количество опыта за сообщение",
        "options": [
          {
            "type": 4,
            "name": "минимальное",
            "description": "Минимальное значение награды",
            "required": true
          },
          {
            "type": 4,
            "name": "максимальное",
            "description": "Максимальное значение награды",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "add-level-role",
        "description": "Добавляет новую роль за уровень",
        "options": [
          {
            "type": 8,
            "name": "роль",
            "description": "Укажите роль",
            "required": true
          },
          {
            "type": 4,
            "name": "уровень",
            "description": "Укажите уровень, за который будет выдаваться эта роль",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "remove-level-role",
        "description": "Удаляет роль за уровень",
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
        "name": "set-multiplier",
        "description": "Устанавливает множитель на уровни",
        "options": [
          {
            "type": 4,
            "name": "множитель",
            "description": "Множитель опыта",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "set-voice-level-reward",
        "description": "Устанавливает минимальное и максимальное количество опыта за общение в голосовых каналах",
        "options": [
          {
            "type": 4,
            "name": "минимальное",
            "description": "Минимальное значение награды",
            "required": true
          },
          {
            "type": 4,
            "name": "максимальное",
            "description": "Максимальное значение награды",
            "required": true
          }
        ]
      },
      {
        "type": 1,
        "name": "blacklist",
        "description": "Добавляет или удаляет участника в черный список бота",
        "options": [
          {
            "type": 3,
            "name": "действие",
            "description": "Выберите действие.",
            "required": true,
            "choices": [
              {
                "name": "Добавить участника в черный список",
                "value": "add"
              },
              {
                "name": "Удалить участника из черного списка",
                "value": "remove"
              }
            ]
          },
          {
            "type": 6,
            "name": "участник",
            "description": "Укажите участника",
            "required": true
          }
        ]
      }
    ]
  },
  category: "Настройка",
  async execute({ interaction, client }) {
    if(interaction.options.getSubcommand() === "set-tax") {
      const newTax = interaction.options.getInteger("процент");
      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { tax: newTax } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      client.cacheGuild.set(interaction.guildId, data);

      return interaction.reply({
        content: `Теперь с переводов забирается ${newTax}% налога`
      });

    }

    if(interaction.options.getSubcommand() === "set-daily") {
      const minDaily = interaction.options.getInteger("минимальное");
      const maxDaily = interaction.options.getInteger("максимальное");

      let newDailyObj = {
        min: minDaily,
        max: maxDaily
      };

      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { dailySize: newDailyObj } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );


      client.cacheGuild.set(interaction.guildId, data);

      return interaction.reply({
        content: `Теперь в daily выпадает от ${minDaily} до ${maxDaily} печенек.`
      });
    }


    if(interaction.options.getSubcommand() === "set-donut-reward") {
      const minReward = interaction.options.getInteger("минимальное");
      const maxReward = interaction.options.getInteger("максимальное");

      let messageRewardObj = {
        min: minReward,
        max: maxReward
      };

      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { donutReward: messageRewardObj } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      client.cacheGuild.set(interaction.guildId, data);

      return interaction.reply({
        content: `Теперь общая награда выдается в районе от ${minReward} до ${maxReward}`
      });

    }

    if(interaction.options.getSubcommand() === "add-shop-role") {
      const role = interaction.options.getRole("роль");
      const rolePrice = interaction.options.getInteger("цена");
      let roleObj = {
        roleId: role.id,
        price: rolePrice
      };

      if(role.name === "everyone") return interaction.reply({
        content: `Вы не можете добавить everyone в магазин, как роль`,
        ephemeral: true
      });

      await shopSchema.findOneAndUpdate({ guildId: interaction.guildId },
          { $push: { shop: roleObj } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return interaction.reply({
        content: `В магазин была добавлена роль ${role.name} за ${rolePrice} печенек`
      });
    }

    if(interaction.options.getSubcommand() === "remove-shop-role") {
      const role = interaction.options.getRole("роль");

      const data = await shopSchema.findOneAndUpdate({ guildId: interaction.guildId },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // console.log(data) Used for debug, remove comment if somebody went wrong.
      const item = data.shop?.find(it => it.roleId === role.id);
      if(!item) return interaction.reply({
        content: `Эта роль не продается на данный момент.`
      });

      await shopSchema.findOneAndUpdate({ guildId: interaction.guildId },
          { $pull: { shop: { roleId: role.id } } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return interaction.reply({
        content: `Из магазина была убрана роль ${role.name}`
      });
    }


    if(interaction.options.getSubcommand() === "set-message-level-reward") {
      const minReward = interaction.options.getInteger("минимальное");
      const maxReward = interaction.options.getInteger("максимальное");


      const rewardLevelObj = {
        min: minReward,
        max: maxReward
      };

      const newData = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { messageLevelReward: rewardLevelObj } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      client.cacheGuild.set(interaction.guildId, newData);
      return interaction.reply({
        content: `Теперь за сообщение выдается опыт в районе от ${minReward} до ${maxReward}`
      });
    }

    if(interaction.options.getSubcommand() === "add-level-role") {
      const role = interaction.options.getRole("роль");
      const levelForRole = interaction.options.getInteger("уровень");


      const levelRoleObj = {
        roleId: role.id,
        level: levelForRole
      };

      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId }, {
        $push: { levelRoles: levelRoleObj }
      }, { upsert: true, new: true, setDefaultsOnInsert: true });

      client.cacheGuild.set(interaction.guildId, data);

      interaction.reply({
        content: `Теперь за ${levelForRole} уровень выдается роль ${role.name}`
      });
    }

    if(interaction.options.getSubcommand() === "remove-level-role") {
      const role = interaction.options.getRole("роль");
      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId }, {
        $pull: { levelRoles: { roleId: role.id } }
      });

      client.cacheGuild.set(interaction.guildId, data);

      interaction.reply({
        content: `Теперь ${role.name} больше не выдается`
      });
    }

    if(interaction.options.getSubcommand() === "set-multiplier") {
      const newMultiplier = interaction.options.getInteger("множитель");
      const data = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { levelMultiplier: newMultiplier } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      client.cacheGuild.set(interaction.guildId, data);

      return interaction.reply({
        content: `Теперь получаемый опыт умножается на ${newMultiplier}%`
      });
    }

    if(interaction.options.getSubcommand() === "set-voice-level-reward") {
      const minXp = interaction.options.getInteger("минимальное");
      const maxXp = interaction.options.getInteger("максимальное");


      const rewardLevelObj = {
        min: minXp,
        max: maxXp
      };

      const newData = await client.DBGuild.findOneAndUpdate({ guildId: interaction.guildId },
          { $set: { voiceLevelReward: rewardLevelObj } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      client.cacheGuild.set(interaction.guildId, newData);
      return interaction.reply({
        content: `Теперь за общение в голосовых выдается опыт в районе от ${minXp} до ${maxXp}`
      });
    }

    if(interaction.options.getSubcommand() === "blacklist") {
      const choice = interaction.options.getString("действие");
      const user = interaction.options.getUser("участник");

      if(choice === "add") {
        if(client.blacklistCache.has(user.id)) return interaction.reply({
          content: "That user already exists in blacklist",
          ephemeral: true
        });
        const newData = await client.DBGuild.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $push: { blacklist: user.id } },
            { new: true, setDefaultsOnInsert: true, upsert: true }
        );
        client.cacheGuild.set(interaction.guildId, newData);
        client.blacklistCache.add(user.id);
        return interaction.reply({
          content: "Added to blacklist."
        });
      }
      if(choice === "remove") {
        if(!client.blacklistCache.has(user.id)) return interaction.reply({
          content: "That user not exists in blacklist!",
          ephemeral: true
        });
        const newData = await client.DBGuild.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $pull: { blacklist: user.id } },
            { new: true, setDefaultsOnInsert: true, upsert: true }
        );
        client.cacheGuild.set(interaction.guildId, newData);
        client.blacklistCache.delete(user.id);
        return interaction.reply({
          content: "Removed that user from blacklist."
        });
      }
    }
  }
};

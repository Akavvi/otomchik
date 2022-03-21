const cooldown = new Map();
const questSchema = require("../schemas/questsSchema");
module.exports = async (client, message) => {
  if(message.channel.type === "dm" || message.author.bot || client.blacklistCache.has(message.author.id)) return;

  if(!cooldown.has(message.author.id)) {
    cooldown.set(message.author.id, Date.now());
  }
  const cooldownData = cooldown.get(message.author.id);
  if(cooldownData && (Date.now() - cooldownData) > 60000) {
    cooldown.set(message.author.id, Date.now());
    const guildData = await client.utils.getGuildInfo(client, message.guild.id);
    const multiplier = guildData.levelMultiplier / 100;

    const rewardToGive = client.utils.randomNumberFromRange(guildData.donutReward.min, guildData.donutReward.max);
    const expToGive = Math.round(
        client.utils.randomNumberFromRange(guildData.messageLevelReward.min, guildData.messageLevelReward.max)
        * multiplier
    ) + 3;

    await client.levelManager.addXp(message.author.id, message.guild.id, expToGive);
    await client.economy.addToBalance(message.author.id, message.guild.id, rewardToGive);
    const userData = await client.userDataManager.incrementMessageCount(message.author.id, message.guild.id);

    const needExp = client.levelManager.getNeededXp(userData.level);
    if(userData.exp >= needExp) {
      const newLevel = ++userData.level;
      await client.levelManager.levelUp(message.author.id, message.guild.id, newLevel);
      const newRole = guildData.levelRoles?.find(item => item.level === newLevel);
      const role = message.guild.roles.cache.get(newRole.roleId) ?? null;

      if(!role) {
        const data = await client.DBGuild.findOneAndUpdate({ guildId: message.guild.id },
            {
              $pull: {
                levelRoles: { roleId: newRole.roleId }
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        client.cacheGuild.set(message.guild.id, data);
        return;
      }
      try {
        await message.member.roles.add(newRole.roleId);

        guildData.levelRoles?.map(async item => {
          if(item.roleId !== newRole.roleId) {
            await message.member.roles.remove(item.roleId);
          }
        });
      } catch (e) {
        console.log(e);
      }

      return message.channel.send(
          `Поздравляю ${message.author.username}! Ты только что повысил(а) свой уровень до ${newLevel}! Юхуу!!! Двигайся в таком же духе.`
      );
    }
    let questData = await questSchema.findOne({
      userId: message.author.id,
      guildId: message.guild.id
    });
    if(!questData) questData = await questSchema.create({
      userId: message.author.id,
      guildId: message.guild.id
    },);
    const quest = questData.quests?.find(item => item.type === "MESSAGE") ?? null;

    if(quest && userData.messageCount <= quest.needMessages) {
      await questSchema.findOneAndUpdate({
            userId: message.author.id,
            guildId: message.guild.id
          },
          { $pull: { quests: { type: "MESSAGE" } } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await client.economy.addToBalance(message.author.id, message.guild.id, quest.reward);
    }
  }
};

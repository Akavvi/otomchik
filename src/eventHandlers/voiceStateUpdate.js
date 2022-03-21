const questSchema = require("../schemas/questsSchema");
const voiceCache = new Map();

module.exports = async (client, oldState, newState) => {
  const member = newState.member;
  if(
      (oldState.member && oldState.member.user.bot)
      || (newState.member && newState.member.user.bot)
      || client.blacklistCache.has(member.user.id)
  ) return;

  const guildData = await client.utils.getGuildInfo(client, newState.guild.id);
  const multiplier = guildData.levelMultiplier / 100;

  if(!oldState.channel && newState.channel) { 
    voiceCache.set(newState.member.user.id, Date.now());
    member.voiceInterval = setInterval(async () => {
          const fetchedChannel = await client.channels.fetch(newState.channelId);
          const muted = (newState.mute || newState.deaf);
          if(!muted && fetchedChannel.members?.size >= 2) {
            await client.DBUser.findOneAndUpdate(
                { userId: newState.member.user.id, guildId: newState.guild.id },
                {},
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            const expToGive = Math.round(
                client.utils.randomNumberFromRange(1, 3) * multiplier
            );
            const rewardToGive = client.utils.randomNumberFromRange(guildData.donutReward.min, guildData.donutReward.max);

            await client.levelManager.addXp(newState.member.user.id, newState.guild.id, expToGive);
            const newUserData = client.economy.addToBalance(newState.member.user.id, newState.guild.id, rewardToGive);

            const needExp = client.levelManager.getNeededXp(newUserData.level);
            if(newUserData.exp >= needExp) {
              const newLevel = ++newUserData.level;
              await client.levelManager.levelUp(newState.member.user.id, newState.guild.id, newLevel);
              const newRole = guildData.levelRoles?.find(item => item.level === newLevel);

              const role = newState.guild.roles.cache.get(newRole.roleId) ?? null;

              if(!role) {
                const data = await client.DBGuild.findOneAndUpdate({ guildId: newState.guild.id },
                    {
                      $pull: {
                        levelRoles: { roleId: newRole.roleId }
                      }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                client.cacheGuild.set(newState.guild.id, data);
                return;
              }

              try {
                await member.roles.add(newRole.roleId);

                guildData.levelRoles?.map(async item => {
                  if(item.roleId !== newRole.roleId) {
                    await member.roles.remove(item.roleId);
                  }
                });
              } catch (e) {
                console.log(e);
              }
            }
          }
        },
        2 * 60 * 1000);
  }

  if(!newState.channel && oldState.channel) {
    if(!voiceCache.has(oldState.member.user.id)) return;
    const cacheData = voiceCache.get(oldState.member.user.id);
    const msToAdd = Date.now() - cacheData;
    const data = await client.userDataManager.addVoiceTime(oldState.member.user.id, oldState.guild.id, msToAdd);
    clearInterval(member.voiceInterval);
    voiceCache.delete(member.user.id);
    const questsData = await questSchema.findOneAndUpdate({
      userId: oldState.member.user.id,
      guildId: oldState.guild.id
    }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
    const quest = questsData.quests?.find(item => item.type === "VOICE");

    if(quest && quest.needVoiceTime <= data.voiceTime) {
      await questSchema.findOneAndUpdate({
            userId: oldState.member.user.id,
            guildId: oldState.guild.id
          },
          { $pull: { quests: { type: "VOICE" } } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await client.economy.addToBalance(oldState.member.user.id, oldState.guild.id, quest.reward);
    }

    if(newState.channel && oldState.channel) {
      if(!voiceCache.has(newState.member.user.id))
        voiceCache.set(newState.member.user.id, Date.now());
    }
  }
};




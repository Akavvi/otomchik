function randomNumberFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function msToTime(ms) {
  if(!ms) return "0";
  let time = "";

  let n = 0;
  if(ms >= 31536000000) {
    n = Math.floor(ms / 31536000000);
    time = `${n} лет `;
    ms -= n * 31536000000;
  }

  if(ms >= 2592000000) {
    n = Math.floor(ms / 2592000000);
    time += `${n} мес `;
    ms -= n * 2592000000;
  }

  if(ms >= 604800000) {
    n = Math.floor(ms / 604800000);
    time += `${n} нед `;
    ms -= n * 604800000;
  }

  if(ms >= 86400000) {
    n = Math.floor(ms / 86400000);
    time += `${n} дн `;
    ms -= n * 86400000;
  }

  if(ms >= 3600000) {
    n = Math.floor(ms / 3600000);
    time += `${n}ч `;
    ms -= n * 3600000;
  }

  if(ms >= 60000) {
    n = Math.floor(ms / 60000);
    time += `${n} мин `;
  }

  return time.trimEnd();
}


async function getGuildInfo(client, guildId) {
  let data = client.cacheGuild.get(guildId);
  if(!data) {
    data = await client.DBGuild.findOneAndUpdate({ guildId: guildId }, {}, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    client.cacheGuild.set(guildId, data);
  }
  return data;
}

function getNextLevelExp(level) {
  return 125 + (level * level * 8);
}


module.exports = { randomNumberFromRange, msToTime, getGuildInfo, getNextLevelExp };
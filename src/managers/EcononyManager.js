module.exports = class EconomyManager {
  constructor(client, logChannelId) {
    this.client = client;
    this.logChannelId = logChannelId;
  };

  /**
   * Get a balance of user.
   * @param {String} userId
   * @param {String} guildId
   * @returns {Promise<number>}
   */
  async getBalance(userId, guildId) {
    let data = await this.client.DBUser.findOne({ userId: userId, guildId: guildId });
    if(!data) data = await this.client.DBUser.create({ userId: userId, guildId: guildId });
    return data.balance;
  }

  /**
   * Set a balance of user
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} balance
   */
  async setBalance(userId, guildId, balance) {
    const logChannel = this.client.channels.cache.get(this.logChannelId) ?? await this.client.channels.fetch(this.logChannelId);
    logChannel.send({
      embeds: [{
        title: "Set balance",
        description: `UserID: ${userId}; \n New balance: ${balance}`
      }]
    });
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $set: { balance: balance } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Increment a balance of user.
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} balance
   */
  async addToBalance(userId, guildId, balance) {
    const logChannel = this.client.channels.cache.get(this.logChannelId) ?? await this.client.channels.fetch(this.logChannelId);
    logChannel.send({
      embeds: [{
        title: "Added to balance",
        description: `UserID: ${userId}; \n Added to balance: ${balance}`
      }]
    });
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { balance: balance } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Remove a balance from user's balance.
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} balance
   */
  async removeFromBalance(userId, guildId, balance) {
    const logChannel = this.client.channels.cache.get(this.logChannelId) ?? await this.client.channels.fetch(this.logChannelId);
    logChannel.send({
      embeds: [{
        title: "Removed Balance",
        description: `UserID: ${userId}; \n Removed from balance: ${balance}`
      }]
    });
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { balance: -balance } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Give daily to user.
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} dailySize
   * @param {Date} nextDay
   */
  async giveDaily(userId, guildId, dailySize, nextDay) {
    const logChannel = this.client.channels.cache.get(this.logChannelId) ?? await this.client.channels.fetch(this.logChannelId);
    logChannel.send({
      embeds: [{
        title: "Gave daily",
        description: `UserID: ${userId}; \n Gave a daily: ${dailySize}; \n Next daily: <t:${Math.round(nextDay.getTime() / 1000)}:R>`
      }]
    });
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        {
          $inc: { balance: dailySize },
          $set: { daily: nextDay }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true });
  }
};
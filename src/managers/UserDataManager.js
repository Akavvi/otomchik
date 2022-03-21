module.exports = class UserDataManager {
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {String} userId
   * @param {String} guildId
   * @returns {Object} New user data
   */
  async incrementMessageCount(userId, guildId) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { messageCount: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Add to voice time a ms, which you provided
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} ms
   * @returns {Object} New user data
   */
  async addVoiceTime(userId, guildId, ms) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { voiceTime: ms } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Change the user custom status in profile
   * @param {String} userId
   * @param {String} guildId
   * @param {String} status
   * @returns {Object} New user data
   */
  async changeStatus(userId, guildId, status) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $set: { status: status } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

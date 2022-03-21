module.exports = class LevelManager {
  constructor(client) {
    this.client = client;
  };

  /**
   * Returns a count of xp, which user need to level up
   * @param {Number} level
   * @returns {Number}
   */
  getNeededXp(level) {
    return 125 + (level * level * 8);
  };

  /**
   * Add exp to user
   * @param {String} userId
   * @param {String} guildId
   * @param {Number }exp
   * @returns {Object} New user data
   */
  async addXp(userId, guildId, exp) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { exp: exp } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Set user's level
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} level
   * @returns {Object} New user data
   */
  async setLevel(userId, guildId, level) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $set: { level: level } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Add to user's level some levels
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} level
   * @returns {Object} New user's data
   */
  async addLevel(userId, guildId, level) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { level: level } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Removes from user's level some levels
   * @param {String} userId
   * @param {String} guildId
   * @param {Number} level
   * @returns {Object} New user's data
   */
  async removeLevel(userId, guildId, level) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $inc: { level: -level } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Leveling up a user
   * @param {String} userId
   * @param {String} guildId
   * @param {Number } nextLevel
   * @returns {Object} New user data
   */
  async levelUp(userId, guildId, nextLevel) {
    return this.client.DBUser.findOneAndUpdate(
        { userId: userId, guildId: guildId },
        { $set: { exp: 0, level: nextLevel }, $inc: { balance: 15 * nextLevel } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};
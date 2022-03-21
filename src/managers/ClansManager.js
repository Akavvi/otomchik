const clanSchema = require("../schemas/clanSchema");
module.exports = class ClansManager {
  constructor() {
  }

  async createClan(guildId, ownerId, name) {
    return await clanSchema.create({ guildId: guildId, ownerId: ownerId, name: name });
  }

  async alreadyHasClan(guildId, memberId) {
    let clan = await clanSchema.findOne({ guildId: guildId, ownerId: memberId })
        || await clanSchema.findOne({ guildId: guildId, members: memberId });
    return !!clan;
  }

  async getClanByMember(guildId, memberId) {
    let clan = await clanSchema.findOne({ guildId: guildId, ownerId: memberId })
        || await clanSchema.findOne({ guildId: guildId, members: memberId });
    return clan;
  }

  async addMember(clanId, memberId, guildId) {
    return clanSchema.findOneAndUpdate({ guildId: guildId, _id: clanId }, { $push: { members: memberId } });
  }

  async kickMember(clanId, memberId, guildId) {
    return clanSchema.findOneAndUpdate({ guildId: guildId, _id: clanId }, { $pull: { members: memberId } });
  }

  async addToBalance(clanId, count, guildId) {
    return clanSchema.findOneAndUpdate({ guildId: guildId, _id: clanId }, { $inc: { balance: count } });
  }

  async removeFromBalance(clanId, count, guildId) {
    return clanSchema.findOneAndUpdate({ guildId: guildId, _id: clanId }, { $inc: { balance: -count } });
  }

  async deleteClan(clanId, guildId) {
    return clanSchema.deleteOne({ guildId: guildId, _id: clanId });
  }

  async increaseSlots(clanId, guildId, count) {
    return clanSchema.findOneAndUpdate({ guildId: guildId, _id: clanId }, { $inc: { slots: count } });
  }
};

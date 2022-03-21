const { Schema, model } = require("mongoose");

const questsSchema = new Schema({
  guildId: String,
  userId: String,
  quests: {
    type: Array,
    default: []
  },
  lastGive: {
    type: Date,
    default: null
  }
});

module.exports = model("quests", questsSchema);
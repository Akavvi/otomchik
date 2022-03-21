const { Schema, model } = require("mongoose");

const clanSchema = new Schema({
  guildId: { type: String, required: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "Не указано описание." },
  members: {
    type: [String],
    default: []
  },
  balance: {
    type: Number,
    default: 0
  },
  slots: {
    type: Number,
    default: 5
  }
});

module.exports = model("clans", clanSchema);

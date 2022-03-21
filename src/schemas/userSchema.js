const { Schema, model } = require("mongoose");


const userSchema = new Schema({
  guildId: String,
  userId: String,
  balance: {
    type: Number,
    default: 0
  },
  daily: {
    type: Date,
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  exp: {
    type: Number,
    default: 0
  },
  messageCount: {
    type: Number,
    default: 0
  },
  voiceTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "Тут должен быть статус :("
  }
});

module.exports = model("users", userSchema);

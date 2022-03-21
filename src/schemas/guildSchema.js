const { Schema, model } = require("mongoose");


const guildSchema = new Schema({
  guildId: String,
  tax: {
    type: Number,
    default: 10
  },
  dailySize: {
    type: Object,
    default: {
      min: 1,
      max: 100
    }
  },
  donutReward: {
    type: Object,
    default: {
      min: 1,
      max: 3
    }
  },
  messageLevelReward: {
    type: Object,
    default: {
      min: 1,
      max: 5
    }
  },
  levelRoles: {
    type: Array,
    default: []
  },
  levelMultiplier: {
    type: Number,
    default: 100
  },
  voiceLevelReward: {
    type: Object,
    default: {
      min: 1,
      max: 3
    }
  },
  blacklist: {
    type: [String],
    default: []
  }
});
module.exports = model("guilds", guildSchema);

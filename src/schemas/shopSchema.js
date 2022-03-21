const { Schema, model } = require("mongoose");


const shopSchema = new Schema({
  guildId: String,
  shop: {
    type: [Object],
    default: []
  }
});

module.exports = model("shop", shopSchema);
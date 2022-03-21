const discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("../config/config.json");
const {
  registerCommands,
  registerEvents
} = require("./utils/Registry");
const constants = require("./utils/Constants");
const utils = require("./utils/Utils");
const EconomyManager = require("./managers/EcononyManager");
const LevelManager = require("./managers/LevelManager");
const UserDataManager = require("./managers/UserDataManager");
const ClansManager = require("./managers/ClansManager");

const client = new discord.Client({ intents: [Object.values(discord.Intents.FLAGS)] });


(async () => {
  client.collectionOfCommands = new discord.Collection();
  client.categories = new discord.Collection();

  client.DBGuild = require("./schemas/guildSchema");
  client.DBUser = require("./schemas/userSchema");

  client.cacheGuild = new discord.Collection();
  client.cacheUsers = new discord.Collection();

  client.constants = constants;
  client.utils = utils;
  client.economy = new EconomyManager(client, config.LOG_CHANNEL);
  client.levelManager = new LevelManager(client);
  client.userDataManager = new UserDataManager(client);
  client.clansManager = new ClansManager();

  await registerEvents(client, "../eventHandlers");
  await registerCommands(client, "../commands");
  
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, () => {
      console.log(`[${new Date(Date.now())}] Connected to database.`);
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }


  try {
    await client.login(config.TOKEN);
    console.log("Logged to client");
  } catch (e) {
    console.log(e);
  }

})();

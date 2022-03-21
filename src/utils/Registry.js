const fs = require("fs").promises;
const path = require("path");

async function registerCommands(client, ...dirs) {
  for (const dir of dirs) {
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
      const stat = await fs.lstat(path.join(__dirname, dir, file));
      if(stat.isDirectory()) // If file is a directory, recursive call recurDir
      {
        await registerCommands(client, path.join(dir, file));
      } else {
        // Check if file is a .js file.
        if(file.endsWith(".js")) {
          try {

            const cmdModule = require(path.join(__dirname, dir, file));
            const { data, execute, category } = cmdModule;
            const { name } = data;

            if(!name) {
              console.log(`The command '${path.join(__dirname, dir, file)}' doesn't have a name`);
              continue;
            }

            if(!execute) {
              console.log(`The command '${name}' doesn't have an execute function`);
              continue;
            }

            if(client.collectionOfCommands.has(name)) {
              console.log(`The command name '${name}' has already been added.`);
              continue;
            }

            await client.collectionOfCommands.set(name, cmdModule);

            if(category) {
              let commands = client.categories.get(category.toLowerCase());
              if(!commands) commands = [category];
              commands.push(name);
              client.categories.set(category.toLowerCase(), commands);
            } else {
              console.log(`The command '${name}' doesn't have a category, it will default to 'No category'.`);
              let commands = client.categories.get("без категории");
              if(!commands) commands = ["Без категории"];
              commands.push(name);
              client.categories.set("без категории", commands);
            }
          } catch (e) {
            console.log(`Error loading commands: ${e.message}`);
          }
        }
      }
    }
  }
}

/**
 *
 * @param {import("../typings.d")Client} client
 * @param {...string} dirs
 */
async function registerEvents(client, ...dirs) {
  for (const dir of dirs) {
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
      const stat = await fs.lstat(path.join(__dirname, dir, file));
      if(stat.isDirectory()) // If file is a directory, recursive call recurDir
      {
        await registerEvents(client, path.join(dir, file));
      } else {
        // Check if file is a .js file.
        if(file.endsWith(".js")) {
          const eventName = file.substring(0, file.indexOf(".js"));
          try {
            const eventModule = require(path.join(__dirname, dir, file));
            client.on(eventName, eventModule.bind(null, client));
          } catch (e) {
            console.log(`Error loading events: ${e.message}`);
          }
        }
      }
    }
  }
}

module.exports = { registerEvents, registerCommands };
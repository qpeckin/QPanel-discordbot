// index.js
const { Client, Collection } = require("discord.js");
const client = new Client({
  intents: [3276799],
});
require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
const LoadCommands = require("./Loaders/LoadCommands");
client.commands = new Collection();

LoadCommands()
  .then(() => {
    client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) return;
      require(`./commands/${interaction.commandName}`).execute(
        client,
        interaction
      );
    });

    client.on("ready", () => {
      console.log("I am ready!");
    });

    // client.on("messageCreate", async (message) => {
    //   if (message.author.username === "l.950") {
    //     await message.react("🇱");
    //     await message.react("9️⃣");
    //     await message.react("5️⃣");
    //     await message.react("0️⃣");
    //   }
    // });

    client.login(token);
  })
  .catch((error) => {
    console.error("Error while deploying commands:", error);
  });

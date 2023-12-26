// index.js
const { Client, Collection } = require("discord.js");
const { GPTResponse } = require("./features/aiReply");
const client = new Client({
  intents: [3276799],
});
require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
const openaiKey = process.env.OPENAI_TOKEN;
const LoadCommands = require("./Loaders/LoadCommands");
client.commands = new Collection();

LoadCommands()
  .then(() => {
    client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) return;

      try {
        require(`./commands/${interaction.commandName}`);
      } catch (error) {
        if (error.code === "MODULE_NOT_FOUND") {
          interaction.reply({
            content: "Command not found, try /help",
            ephemeral: true,
          });
          return;
        }
        throw error;
      }

      require(`./commands/${interaction.commandName}`).execute(
        client,
        interaction
      );
    });

    dateTime = new Date().toLocaleString("en-US", { hour12: false });
    client.on("ready", () => {
      console.log(`\n\n\n\nREADY -> ${dateTime} \n\n\n\n`);
      client.user.setActivity('/help');
    });

    // client.on("messageCreate", async (message) => {
    //   if (message.author.username === "l.950") {
    //     await message.react("🇱");
    //     await message.react("9️⃣");
    //     await message.react("5️⃣");
    //     await message.react("0️⃣");
    //   }
    // });

    client.on("messageCreate", async (message) => {
      if (message.mentions.has(client.user)) {
        const text = message.content.replace(/<@!?\d+>/, "").trim();
        const username = message.author.username;
        const aiResponse = await GPTResponse(text, username, openaiKey);
        message.reply(aiResponse);
      }
    });

    client.login(token);
  })
  .catch((error) => {
    console.error("Error while deploying commands:", error);
  });

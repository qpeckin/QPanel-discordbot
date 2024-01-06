// index.js
const { Client, Collection } = require("discord.js");
const { GPTResponse } = require("./features/aiReply");
const log  = require("./features/log");
const figlet = require("figlet");
const client = new Client({
  intents: [3276799],
});
require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
const openaiKey = process.env.OPENAI_TOKEN;
const LoadCommands = require("./Loaders/LoadCommands");
const padToCenter = require("./features/padToCenter");
const chalk = require("chalk");
client.commands = new Collection();
const padRight = require("./features/padRight");
LoadCommands()
  .then(() => {
    padToCenter('Command loaded'.split("\n"), process.stdout.columns).then(
      (centeredText) => {
        console.log(chalk.green(centeredText));
      }
    );
    client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) return;
      console.log(
        chalk.magenta(
          padRight(
            `[+] ${interaction.user.tag} in #${interaction.channel.name} --> /${interaction.commandName}`,
            9
          )
        )
      );
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

    dateTime = new Date().toLocaleString("en-US", {
      hour12: false,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    client.on("ready", () => {
      figlet.text(
        `READY -> ${dateTime}`,
        {
          font: "mini",
        },
        function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }

          padToCenter(data.split("\n"), process.stdout.columns).then(
            (centeredText) => {
              console.log(chalk.green(centeredText));
            }
          );
          padToCenter(
            "[+] ---------------------------------------------------------------------------------------------- [+]".split(
              "\n"
            ),
            process.stdout.columns
          ).then((centeredHr) => {
            console.log(chalk.gray(centeredHr + "\n\n"));
          });
        }
      );
      client.user.setActivity("/help");
    });

    client.on("messageCreate", async (message) => {
      if (message.mentions.has(client.user)) {
        console.log(
          chalk.magenta(
            padRight(
              `[+] ${message.author.tag}: @mention`,
              9
            )
          )
        );
        message.channel.sendTyping();
        log(`[/] ${message.author.tag}: await aiResponse..`, 'green');
        const text = message.content.replace(/<@!?\d+>/, "").trim();
        const username = message.author.username;
        const aiResponse = await GPTResponse(text, username, openaiKey);
        message.reply(aiResponse);
        console.log(
          chalk.magenta(
            padRight(
              `[+] ${message.author.tag}: @ > Replied`,
              9
            )
          )
        );
      }
    });

    client.login(token);
  })
  .catch((error) => {
    console.error("Error while deploying commands:", error);
  });

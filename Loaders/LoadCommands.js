module.exports = async (client) => {
  const { REST, Routes } = require("discord.js");
  const { clientId, guildId } = require("../config.json");
  const fs = require("node:fs");
  const path = require("node:path");
  require("dotenv").config();
  const token = process.env.DISCORD_TOKEN;
  const figlet = require("figlet");
  const chalk = require("chalk");
  const log = require("../features/log");
  const commands = [];
  let totalCommands = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js")).length;
  let loadedCommands = 0;
  let percentage = 0;

  const padToCenter = (lines, width) => {
    const padding = " ".repeat(Math.max(0, (width - lines[0].length) / 2));
    return lines.map((line) => padding + line);
  };

  fs.readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const command = require(`../commands/${file}`);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        loadedCommands++;
        percentage = (loadedCommands / totalCommands) * 100;
        const asciiArt = figlet.textSync(`${percentage.toFixed(2)}%`, {
          font: "Basic",
        });
        console.clear();
        console.log("\n\n\n\n\n\n\n\n\n\n");
        console.log(
          chalk.green(
            padToCenter(asciiArt.split("\n"), process.stdout.columns).join("\n")
          )
        );
        // } else {
        // console.log(
        // `[WARNING] The command in ${file} is missing a required property "data" or "execute".`
        // );
      }
    });

  const rest = new REST().setToken(token);

  try {
    await rest
      .put(Routes.applicationCommands(clientId), {
        body: commands,
      })
      .then(() => {
        const word = "Operation";
        let Operation = "";
        let index = 0;
        const font = ["fraktur", "banner3-D"];
        const randomFont = font[Math.floor(Math.random() * font.length)];
        const intervalId = setInterval(() => {
          if (index < word.length) {
            Operation += word[index];
            console.clear();
            console.log("\n\n");
            console.log(
              chalk.green(
                padToCenter(
                  figlet.textSync(Operation, { font: randomFont }).split("\n"),
                  process.stdout.columns
                ).join("\n")
              )
            );
            console.log("\n\n");
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 70);
      });
  } catch (error) {
    console.error(error);
  }
};

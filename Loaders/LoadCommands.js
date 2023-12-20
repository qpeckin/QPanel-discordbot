module.exports = async (client) => {
  const { REST, Routes } = require("discord.js");
  const { clientId, guildId } = require("../config.json");
  const fs = require("node:fs");
  const path = require("node:path");
  require("dotenv").config();
  const token = process.env.DISCORD_TOKEN;

  const commands = [];

  fs.readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const command = require(`../commands/${file}`);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        console.log(`${command.data.name} a été chargé !`);
      } else {
        console.log(
          `[WARNING] The command in ${file} is missing a required property "data" or "execute".`
        );
      }
    });

  const rest = new REST().setToken(token);

  try {
    console.log(
      `Start of refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      // Routes.applicationGuildCommands(clientId, guildId),
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(
      `Rechargement réussi de ${data.length} commandes d'application (/).`
    );
  } catch (erreur) {
    console.error(erreur);
  }
};

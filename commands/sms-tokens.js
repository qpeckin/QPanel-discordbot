const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require("chalk");
const padRight = require("../features/padRight");
const axios = require("axios");
const https = require("https");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sms-tokens")
    .setDescription("Buy or get SMS tokens")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("The action to perform (buy or get)")
        .setRequired(true)
        .addChoices(
          { name: "buy", value: "buy" },
          { name: "get", value: "get" }
        )
    ),
  async execute(client, interaction) {
    const action = interaction.options.getString("action");

    if (action === "buy") {
      console.log("Buying SMS tokens...");
      embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("SMS tokens")
        .setDescription(`Buying SMS tokens..`);
      await interaction.reply({ embeds: [embed] });

      try {
        const response = await axios.post(
          "https://127.0.0.1:8000/api/add/sms-tokens",
          null,
          {
            headers: {
              Authorization: interaction.user.id,
              userId: interaction.user.id,
              username: interaction.user.username,
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          }
        );
        const status = response.data.status;
        if (status === 1) {
          const smsTokens = response.data.smsTokens;
          embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("SMS tokens")
            .setDescription(
              `You have bought 10 SMS tokens, you have now ${smsTokens} SMS tokens`
            );
          await interaction.editReply({ embeds: [embed] });
          console.log(chalk.green(padRight(`[/] [Sms Tokens Buy] `, 9)));
        } else {
          const balance = response.data.balance;
          embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("SMS tokens")
            .setDescription(
              `You need 5$ to buy 10 SMS tokens, you have ${balance}$`
            );
          await interaction.editReply({ embeds: [embed] });
          console.log(chalk.green(padRight(`[/] [Sms Tokens Buy] `, 9)));
        }
      } catch (error) {
        console.log(
          chalk.yellow(padRight(`[!] Error buying SMS tokens:, ${error}`, 9))
        );
        if (!interaction.replied) {
          await interaction.reply("An error occurred while buying SMS tokens.");
        } else {
          await interaction.editReply(
            "An error occurred while buying SMS tokens."
          );
        }
      }
    } else if (action === "get") {
      embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("SMS tokens")
        .setDescription(`Getting SMS tokens..`);
      await interaction.reply({ embeds: [embed] });
      try {
        const response = await axios.post(
          "https://127.0.0.1:8000/api/sms-tokens",
          null,
          {
            headers: {
              Authorization: interaction.user.id,
              userId: interaction.user.id,
              username: interaction.user.username,
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          }
        );
        smsTokens = response.data.smsTokens;
        embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("SMS tokens")
          .setDescription(`You have ${smsTokens} SMS tokens`);
        await interaction.editReply({ embeds: [embed] });
        console.log(chalk.green(padRight(`[/] [Sms Tokens Check] `, 9)));
      } catch (error) {
        console.log(
          chalk.yellow(padRight(`[!] Error getting SMS tokens: ${error}`, 9))
        );
        if (!interaction.replied) {
          await interaction.reply(
            "An error occurred while getting SMS tokens."
          );
        } else {
          await interaction.editReply(
            "An error occurred while getting SMS tokens."
          );
        }
      }
    }
  },
};

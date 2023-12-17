const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pingzer")
    .setDescription("send a ping"),
  async execute(client, interaction) {
    await interaction.reply("Pong!");
  },
};

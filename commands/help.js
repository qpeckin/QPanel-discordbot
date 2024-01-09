const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get information about the commands"),
  async execute(client, interaction) {

    let commands = null;
    commands = "**/help** - Get information about the commands\n\n";
    commands += "**/cash** - Add 0.5$ to your balance, every 24 hours\n\n";
    commands += "**/media** - Add an media order\n\n";
    commands += "**/order list** - Get your order list\n\n";
    commands += "**/order info** - Get information for an order\n\n";
    commands += "**/clear <number>** - Delete a specified number of messages\n\n";
    commands += "**/imagine <prompt>** - Generate an image based on the provided text\n\n";
    commands += "**/ask <question>** - Ask a question to the AI\n\n";
    commands += "**/sms <to> <from> <message>** - Send an SMS with a spoof phone number\n\n";
    commands += "**/sms-tokens** - Buy or get SMS tokens\n\n";
    commands += "**/tts <message> <voice>** - Generate a TTS audio file from a message\n\n";

    const embed = new EmbedBuilder()
      .setTitle("List of available commands")
      .setDescription(commands)
      .setColor("#b300ff");
    if (!interaction.replied) {
      await interaction.reply({ embeds: [embed] });
    }
  },
};

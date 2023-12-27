const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete a specified number of messages")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Number of messages to delete")
        .setRequired(true)
    ),
  async execute(client, interaction) {
    const number = interaction.options.getInteger("number");

    if (number < 1 || number > 1000) {
      await interaction.reply({
        content: "Please provide a number between 1 and 1000.",
        ephemeral: true,
      });
    } else {
      await interaction.deferReply({ ephemeral: true });
      const iterations = Math.ceil(number / 100);
      let messagesSize = 0;
      for (let i = 0; i < iterations; i++) {
        const amountToDelete = Math.min(number - i * 100, 100);
        await interaction.channel
          .bulkDelete(amountToDelete, true)
          .then((messages) => {
            console.log(`Deleted ${messages.size} messages`);
            messagesSize += messages.size;
          })
          .catch(console.error);
      }
      await interaction.editReply({
        content: `Deleted ${messagesSize} messages.`,
      });
    }
  },
};

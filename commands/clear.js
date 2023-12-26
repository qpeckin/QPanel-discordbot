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

        if (number < 1 || number > 100) {
            await interaction.reply({ content: "Please provide a number between 1 and 100.", ephemeral: true });
        } else {
            await interaction.channel
                .bulkDelete(number, true)
                .then((messages) => console.log(`Deleted ${messages.size} messages`))
                .catch(console.error);
            await interaction.reply({ content: `Deleted ${number} messages.`, ephemeral: true });
        }
    },
};
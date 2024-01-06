const { SlashCommandBuilder } = require("@discordjs/builders");
const figlet = require("figlet");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ascii")
    .setDescription("Convert text to ASCII art")
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to convert").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("The action to perform")
        .setRequired(true)
        .addChoices(
          { name: "Standard", value: "Standard" },
          { name: "Ghost", value: "Ghost" },
          { name: "Slant", value: "Slant" },
          { name: "Roman", value: "Roman" },
          { name: "Big", value: "Big" },
          { name: "Mini", value: "Mini" },
          { name: "Small", value: "Small" },
          { name: "Lean", value: "Lean" },
          { name: "Bigfig", value: "Bigfig" },
          { name: "Doom", value: "Doom" },
          { name: "Marquee", value: "Marquee" },
          { name: "Alligator", value: "Alligator" },
          { name: "Small Slant", value: "Small Slant" }
        )
    ),

  async execute(client, interaction) {
    try {
      const text = interaction.options.getString("text");
      const style = interaction.options.getString("action");

      const waitEmbed = new EmbedBuilder()
        .setColor(0xb300ff)
        .setTitle("Please wait...")
        .setDescription("Converting text to ASCII art...");

      await interaction.reply({
        embeds: [waitEmbed],
      });

      const asciiText = await convertToAscii(text, style, interaction);
      log(`[/] ${interaction.user.username}: [asciiConvert]`, 'green');

      const asciiEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("ASCII art")
        .setDescription("```" + asciiText + "```");

      // await interaction.editReply({ embeds: [asciiEmbed] });
      await interaction.followUp("```" + asciiText + "```");
      interaction.deleteReply();

    } catch (error) {
      console.error("Error while processing ASCII art:", error.message);

      await interaction.followUp(
        "An error occurred while processing the ASCII art."
      );
    }
  },
};

async function convertToAscii(text, style, interaction) {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(
      path.dirname(require.resolve("figlet")),
      "fonts",
      `${style}.flf`
    );
    // console.log(fontPath);
    // if (!fs.existsSync(fontPath)) {
    //   const errorEmbed = new EmbedBuilder()
    //     .setColor(0xb300ff)
    //     .setTitle("error")
    //     .setDescription(`The font "${style}" does not exist.`);

    //   interaction.editReply({
    //     embeds: [errorEmbed],
    //   });
    //   reject(new Error(`The font "${style}" does not exist.`));
    //   return;
    // }

    try {
      figlet.text(text, { font: style }, (error, data) => {
        if (error) {
          const errorEmbed = new EmbedBuilder()
            .setColor(0xb300ff)
            .setTitle("error")
            .setDescription("An error occurred while converting text to ASCII");

          interaction.editReply({
            embeds: [errorEmbed],
          });
          console.log("Something went wrong...");
          console.dir(error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      console.error("An error occurred while converting text to ASCII:", error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xb300ff)
        .setTitle("error")
        .setDescription("An error occurred while converting text to ASCII");

      interaction.editReply({
        embeds: [errorEmbed],
      });
      reject(error);
    }
  });
}

const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

const buttons = {
  instagram: new ButtonBuilder()
    .setCustomId("insta")
    .setLabel("Instagram")
    .setStyle(1),
  youtube: new ButtonBuilder()
    .setCustomId("youtube")
    .setLabel("Youtube")
    .setStyle(1),
  likes: new ButtonBuilder().setCustomId("likes").setLabel("Likes").setStyle(1),
  followers: new ButtonBuilder()
    .setCustomId("followers")
    .setLabel("Followers")
    .setStyle(1),
  views: new ButtonBuilder().setCustomId("views").setLabel("Views").setStyle(1),
  100: new ButtonBuilder().setCustomId("100").setLabel("100").setStyle(1),
  200: new ButtonBuilder().setCustomId("200").setLabel("200").setStyle(1),
  300: new ButtonBuilder().setCustomId("300").setLabel("300").setStyle(1),
  500: new ButtonBuilder().setCustomId("500").setLabel("500").setStyle(1),
  1000: new ButtonBuilder().setCustomId("1000").setLabel("1000").setStyle(1),
};

module.exports = {
  data: new SlashCommandBuilder().setName("media").setDescription("btn"),
  async execute(client, interaction) {
    let selectedMedia = null;
    let selectedService = null;
    let selectedQuantity = null;

    const initialActionRow = new ActionRowBuilder().addComponents(
      buttons.instagram,
      buttons.youtube
    );
    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#b300ff")
          .setTitle("Media Selection")
          .setDescription(`Please select a media.`)
          .setTimestamp(),
      ],
      components: [initialActionRow],
      fetchReply: true,
      ephemeral: true,
    });

    const filter = (i) => {
      if (i.user.id === interaction.user.id) {
        if (["insta", "youtube"].includes(i.customId)) {
          return true;
        } else if (
          [
            "likes",
            "followers",
            "views",
            "100",
            "200",
            "300",
            "500",
            "1000",
          ].includes(i.customId)
        ) {
          return selectedMedia !== null;
        }
      }
      return false;
    };

    const collector = message.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.customId === "insta" || i.customId === "youtube") {
          selectedMedia = i.customId;

          const serviceButtons = [buttons.likes, buttons.followers];
          if (i.customId === "youtube") {
            serviceButtons.push(buttons.views);
          }

          const serviceActionRow = new ActionRowBuilder().addComponents(
            ...serviceButtons
          );

          await i.update({
            embeds: [
              new EmbedBuilder()
                .setColor("#b300ff")
                .setTitle("Media Selection")
                .setDescription(
                  `You have selected ${selectedMedia}. Now, select a service.`
                )
                .setTimestamp(),
            ],
            components: [serviceActionRow],
            ephemeral: true,
          });
        } else if (["likes", "followers", "views"].includes(i.customId)) {
          selectedService = i.customId;

          const quantityButtons = [
            buttons["100"],
            buttons["200"],
            buttons["300"],
            buttons["500"],
            buttons["1000"],
          ];
          const quantityActionRow = new ActionRowBuilder().addComponents(
            ...quantityButtons
          );

          await i.update({
            embeds: [
              new EmbedBuilder()
                .setColor("#b300ff")
                .setTitle("Service Selection")
                .setDescription(
                  `You have selected ${selectedService}. Now, select a quantity.`
                )
                .setTimestamp(),
            ],
            components: [quantityActionRow],
            ephemeral: true,
          });
        } else if (["100", "200", "300", "500", "1000"].includes(i.customId)) {
          selectedQuantity = i.customId;

          await i.update({
            embeds: [
              new EmbedBuilder()
                .setColor("#b300ff")
                .setTitle("Quantity Selection")
                .setDescription(
                  `You have selected ${selectedQuantity}. Please provide the link in the chat.`
                )
                .setTimestamp(),
            ],
            components: [],
            ephemeral: true,
          });

          const filter = (m) => m.author.id === i.user.id;
          const collector = i.channel.createMessageCollector({
            filter,
            max: 1,
            time: 15000,
          });

          collector.on("collect", (m) => {
            const embed = new EmbedBuilder()
              .setColor("#b300ff")
              .setTitle("Order Confirmation")
              .setDescription(
                `Media: ${selectedMedia}\nService: ${selectedService}\nQuantity: ${selectedQuantity}\nLink: ${m.content}`
              )
              .setTimestamp();
            m.delete().catch(console.error);

            i.followUp({
              content: `<@${interaction.user.id}>`,
              embeds: [embed],
              components: [],
            });
          });

          collector.on("end", (collected) => {
            if (collected.size === 0) {
              i.followUp("Time out. You did not provide any link.");
            }
          });
        }
      } catch (error) {
        console.error("Error in interaction collector:", error);
      }
    });
  },
};

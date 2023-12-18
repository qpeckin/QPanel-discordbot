const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const https = require("https");

const buttons = {
  instagram: new ButtonBuilder()
    .setCustomId("Instagram")
    .setLabel("Instagram")
    .setStyle(1),

  youtube: new ButtonBuilder()
    .setCustomId("Youtube")
    .setLabel("Youtube")
    .setStyle(1),

  likes: new ButtonBuilder().setCustomId("Likes").setLabel("Likes").setStyle(1),

  followers: new ButtonBuilder()
    .setCustomId("Followers")
    .setLabel("Followers")
    .setStyle(1),

  views: new ButtonBuilder().setCustomId("Views").setLabel("Views").setStyle(1),

  100: new ButtonBuilder().setCustomId("100").setLabel("100").setStyle(1),

  200: new ButtonBuilder().setCustomId("200").setLabel("200").setStyle(1),

  300: new ButtonBuilder().setCustomId("300").setLabel("300").setStyle(1),

  500: new ButtonBuilder().setCustomId("500").setLabel("500").setStyle(1),

  1000: new ButtonBuilder().setCustomId("1000").setLabel("1000").setStyle(1),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("media")
    .setDescription("Order a media service."),
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
        if (["Instagram", "Youtube"].includes(i.customId)) {
          return true;
        } else if (
          [
            "Likes",
            "Followers",
            "Views",
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
      time: 150000,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.customId === "Instagram" || i.customId === "Youtube") {
          selectedMedia = i.customId;

          const serviceButtons = [buttons.likes, buttons.followers];
          if (i.customId === "Youtube") {
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
        } else if (["Likes", "Followers", "Views"].includes(i.customId)) {
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
            time: 150000,
          });

          collector.on("collect", (m) => {
            const data = {
              media: selectedMedia,
              services: selectedService,
              link: m.content,
              number: selectedQuantity,
            };

            axios
              .post("https://127.0.0.1:8000/api/media", data, {
                headers: {
                  Authorization: interaction.user.id,
                },
                httpsAgent: new https.Agent({
                  rejectUnauthorized: false,
                }),
              })
              .then((response) => {
                console.log("response: " + response.data.message);
              })
              .catch((error) => {
                console.error("Error in Axios request:", error.message);
                if (error.response) {
                  console.error("Response data:", error.response.data);
                  console.error("Response status:", error.response.status);
                  console.error("Response headers:", error.response.headers);
                } else if (error.request) {
                  console.error(
                    "No response received. Request details:",
                    error.request
                  );
                } else {
                  console.error("Error setting up the request:", error.message);
                }
              });

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

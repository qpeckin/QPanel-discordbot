const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const axios = require("axios");
const https = require("https");
const { EmbedBuilder } = require("discord.js");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("order")
    .setDescription("Get your order list")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("The action to perform")
        .setRequired(true)
        .addChoices(
          { name: "list", value: "list" },
          { name: "info", value: "info" }
        )
    ),
  async execute(client, interaction) {
    const action = interaction.options.getString("action");
    if (action === "list") {
      const loadingEmbed = new EmbedBuilder()
        .setTitle("Loading...")
        .setDescription("Your order list is being prepared.")
        .setColor(0x0099ff);

      interaction
        .reply({ embeds: [loadingEmbed], fetchReply: true })
        .then(async (loadingMessage) => {
          const userId = interaction.user.id;
          try {
            const response = await axios.post(
              "https://127.0.0.1:8000/api/getOrders",
              null,
              {
                headers: {
                  Authorization: interaction.user.id,
                  userId: interaction.user.id,
                  username: interaction.user.username,
                  discord: true,
                },
                httpsAgent: new https.Agent({
                  rejectUnauthorized: false,
                }),
              }
            );

            const orders = response.data.orders;
            let orderList = "";

            orders.forEach((order) => {
              const orderInfo = `-----------------\nOrder ID: ${order.orderId}\n Media ID: ${order.mediaId}\n Service: ${order.service}\n Quantity: ${order.quantity}\n Link: ${order.link}\n Date: ${order.date}\n Status: ${order.status}\n-----------------\n\n`;

              if (orderList.length + orderInfo.length > 2000) {
                const embed = new EmbedBuilder()
                  .setTitle("Your order list")
                  .setDescription(orderList)
                  .setColor(0x0099ff);
                interaction.user.send({ embeds: [embed] });

                const embed2 = new EmbedBuilder()
                  .setTitle("Check your DMs")
                  .setColor(0x0099ff)
                  .setDescription(
                    "Your order list has been sent to you in DMs."
                  );
                loadingMessage.edit({ embeds: [embed2] });

                orderList = "";
              }

              orderList += orderInfo;
            });

            if (orderList.length > 0) {
              const embed = new EmbedBuilder()
                .setTitle("Your order list")
                .setDescription(orderList)
                .setColor(0x0099ff);
              interaction.user.send({ embeds: [embed] });

              const embed2 = new EmbedBuilder()
                .setTitle("Check your DMs")
                .setColor(0x0099ff)
                .setDescription("Your order list has been sent to you in DMs.");
              loadingMessage.edit({ embeds: [embed2] });
            } else {
              const embed = new EmbedBuilder()
                .setTitle("Your order list")
                .setDescription("You don't have any orders.")
                .setColor(0x0099ff);
              interaction.user.send({ embeds: [embed] });

              const embed2 = new EmbedBuilder()
                .setTitle("Check your DMs")
                .setColor(0x0099ff)
                .setDescription("Your order list has been sent to you in DMs.");
              loadingMessage.edit({ embeds: [embed2] });
            }
          } catch (error) {
            console.error("Error while getting orders:", error);
            interaction.reply({
              content: "An error occurred while getting your orders.",
              ephemeral: true,
            });
          }
        });
    }
  },
};

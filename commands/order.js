const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const axios = require("axios");
const https = require("https");

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
          { name: "List", value: "list" },
          { name: "Info", value: "info" }
        )
    ),
  async execute(client, interaction) {
    const action = interaction.options.getString("action");
    if (action === "list") {
      const loadingEmbed = new EmbedBuilder()
        // .setColor("#b300ff")
        .setTitle("Loading...")
        .setDescription("Your order list is being prepared.");
      interaction
        .reply({ embeds: [loadingEmbed], fetchReply: true, ephemeral: true })
        .then(() => {
          const userId = interaction.user.id;
          axios
            .post("https://127.0.0.1:8000/api/getOrders", null, {
              headers: {
                Authorization: interaction.user.id,
                userId: interaction.user.id,
                username: interaction.user.username,
                discord: true,
              },
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            })
            .then((response) => {
              const orders = response.data.orders;
              let orderList = "";

              orders.forEach((order) => {
                const orderInfo = `Order ID: ${order.orderId}, Media ID: ${order.mediaId}, Service: ${order.service}, Quantity: ${order.quantity}, Link: ${order.link}, Date: ${order.date}, Status: ${order.status}\n\n`;

                if (orderList.length + orderInfo.length > 2000) {
                  const embed = new EmbedBuilder()
                    // .setColor("#b300ff")
                    .setTitle("Your order list")
                    .setDescription(orderList);
                  interaction.user.send({ embeds: [embed] });
                  const embedDm = new EmbedBuilder()
                    .setTitle("Check your DMs")
                    // .setColor("#b300ff")
                    .setDescription(
                      "Your order list has been sent to you in DMs."
                    );
                  interaction.followUp({ embeds: [embedDm], ephemeral: true });
                  orderList = "";
                }

                orderList += orderInfo;
              });

              if (orderList.length > 0) {
                const embed = new EmbedBuilder()
                  // .setColor("#b300ff")
                  .setTitle("Your order list")
                  .setDescription(orderList);
                interaction.user.send({ embeds: [embed] });
              }

              if (orders.length === 0) {
                const embed = new EmbedBuilder()
                  // .setColor("#b300ff")
                  .setTitle("Your order list")
                  .setDescription("You have no orders.");
                interaction.followUp({ embeds: [embed], ephemeral: true });
              }
            })
            .catch((error) => {
              console.error("Error while getting orders:", error);
              interaction.reply({
                content: "An error occurred while getting your orders.",
                ephemeral: true,
              });
            });
        });
    }
  },
};

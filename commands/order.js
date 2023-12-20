const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
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
    console.log(action);
    if (action === "list") {
      const loadingEmbed = new EmbedBuilder()
        .setTitle("Loading...")
        .setDescription("Your order list is being prepared.")
        .setColor(0x0099ff);

      interaction
        .reply({ embeds: [loadingEmbed], fetchReply: true })
        .then(async (loadingMessage) => {
          const userId = interaction.user.id;
          console.log(userId);
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
              const orderInfo = `Order ID: ${order.orderId}, Media ID: ${order.mediaId}, Service: ${order.service}, Quantity: ${order.quantity}, Link: ${order.link}, Date: ${order.date}, Status: ${order.status}\n\n`;

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

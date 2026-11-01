const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('template-create')
    .setDescription('Buat template custom menggunakan JSON.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('template:create:modal')
      .setTitle('Buat Custom Template');

    const name = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Nama template')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(90)
      .setRequired(true)
      .setPlaceholder('Contoh: My Community');

    const description = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Deskripsi singkat')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(200)
      .setRequired(true)
      .setPlaceholder('Struktur server komunitas saya');

    const json = new TextInputBuilder()
      .setCustomId('json')
      .setLabel('JSON kategori dan channel')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(3900)
      .setRequired(true)
      .setPlaceholder('{"categories":[{"name":"GENERAL","permission":"public","channels":[{"name":"chat","type":"text"}]}]}');

    modal.addComponents(
      new ActionRowBuilder().addComponents(name),
      new ActionRowBuilder().addComponents(description),
      new ActionRowBuilder().addComponents(json)
    );

    await interaction.showModal(modal);
  }
};

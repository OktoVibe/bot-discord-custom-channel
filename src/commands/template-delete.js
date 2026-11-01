const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { listCustomTemplates } = require('../services/templateStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('template-delete')
    .setDescription('Hapus template custom berdasarkan nama.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('nama')
        .setDescription('Nama template custom yang ingin dihapus.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const requested = interaction.options.getString('nama').trim().toLowerCase();
    const templates = await listCustomTemplates(interaction.guildId);
    const match = templates.find(item =>
      item.name.toLowerCase() === requested || item.key === requested
    );

    if (!match) {
      return interaction.reply({
        content: 'Template custom tidak ditemukan. Gunakan nama yang sama persis.',
        ephemeral: true
      });
    }

    const { deleteCustomTemplate } = require('../services/templateStore');
    await deleteCustomTemplate(interaction.guildId, match.key);

    return interaction.reply({
      content: `Template custom **${match.name}** berhasil dihapus.`,
      ephemeral: true
    });
  }
};

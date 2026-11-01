const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');

const builtins = require('../templates/builtins');
const { listCustomTemplates } = require('../services/templateStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('template')
    .setDescription('Pilih template untuk membuat struktur server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
      option.setName('replace')
        .setDescription('Hapus semua channel dan kategori yang ada sebelum membuat template.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const replace = interaction.options.getBoolean('replace') ?? false;
    const custom = await listCustomTemplates(interaction.guildId);
    const all = [
      ...builtins.map(item => ({ ...item, source: 'builtin' })),
      ...custom.map(item => ({ ...item, source: 'custom' }))
    ];

    if (!all.length) {
      return interaction.reply({ content: 'Belum ada template yang tersedia.', ephemeral: true });
    }

    const options = all.slice(0, 25).map(template => ({
      label: template.name.slice(0, 100),
      description: `${template.source === 'builtin' ? 'Bawaan' : 'Custom'} • ${template.description}`.slice(0, 100),
      value: template.key
    }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Discord Server Template Builder')
      .setDescription(
        `Pilih template yang ingin diterapkan.\n\n` +
        `Mode replace: **${replace ? 'AKTIF — channel dan kategori lama akan dihapus' : 'NONAKTIF — struktur lama dipertahankan'}**\n\n` +
        `Template tersedia: **${all.length}**`
      )
      .setFooter({ text: 'Pilih satu template dari menu di bawah.' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`template:select:${replace ? '1' : '0'}`)
      .setPlaceholder('Pilih template server...')
      .addOptions(options);

    return interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  }
};

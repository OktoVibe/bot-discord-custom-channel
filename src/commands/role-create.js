const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');

const { rolePresets } = require('../services/rolePresets');
const { createPending } = require('../services/pendingRoles');

const HEX_COLOR = /^#?([0-9a-fA-F]{6})$/;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-create')
    .setDescription('Buat role baru dengan memilih hak akses yang sudah disediakan.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('nama')
        .setDescription('Nama role.')
        .setMaxLength(100)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('warna')
        .setDescription('Warna role dalam hex, contoh: #5865F2 (opsional).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('nama').trim();
    const colorInput = interaction.options.getString('warna')?.trim() ?? null;

    if (!name) {
      return interaction.reply({ content: 'Nama role tidak boleh kosong.', ephemeral: true });
    }

    let color = null;
    if (colorInput) {
      const match = colorInput.match(HEX_COLOR);
      if (!match) {
        return interaction.reply({
          content: 'Format warna tidak valid. Gunakan hex 6 digit, contoh: `#5865F2`.',
          ephemeral: true
        });
      }
      color = parseInt(match[1], 16);
    }

    const draftId = createPending({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      name,
      color
    });

    const embed = new EmbedBuilder()
      .setColor(color ?? 0x5865F2)
      .setTitle(`Buat Role: ${name}`)
      .setDescription(
        'Pilih satu atau beberapa grup hak akses dari menu di bawah.\n\n' +
        rolePresets.map(preset => `**${preset.label}** — ${preset.description}`).join('\n')
      )
      .setFooter({ text: 'Draft berlaku 10 menit.' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`role:select:${draftId}`)
      .setPlaceholder('Centang hak akses...')
      .setMinValues(1)
      .setMaxValues(rolePresets.length)
      .addOptions(rolePresets.map(preset => ({
        label: preset.label,
        description: preset.description.slice(0, 100),
        value: preset.key
      })));

    return interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  }
};

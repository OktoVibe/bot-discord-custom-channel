const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const builtins = require('../templates/builtins');
const { listCustomTemplates, saveCustomTemplate } = require('../services/templateStore');
const { slugify, validateTemplate } = require('../services/validation');
const { deleteExistingChannels, buildTemplate } = require('../services/channelBuilder');
const { findPreset, combinePermissions } = require('../services/rolePresets');
const { getPending, deletePending } = require('../services/pendingRoles');

function getTemplateSummary(template) {
  const channels = template.categories.reduce((sum, category) => sum + category.channels.length, 0);
  return `**${template.categories.length} kategori** • **${channels} channel**`;
}

function makePreviewEmbed(template, replace) {
  const lines = template.categories.map(category => {
    const icons = category.channels.map(channel => channel.type === 'voice' ? '🔊' : '#');
    const channelNames = category.channels.map((channel, index) =>
      `${icons[index]} ${channel.name}`
    );
    return `**${category.name}** (${category.permission || 'public'})\n${channelNames.map(name => `└ ${name}`).join('\n') || '└ *(kosong)*'}`;
  });

  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`Preview: ${template.name}`)
    .setDescription(`${template.description}\n\n${lines.join('\n\n')}`.slice(0, 4000))
    .addFields(
      { name: 'Jumlah struktur', value: getTemplateSummary(template), inline: true },
      { name: 'Mode', value: replace ? 'Replace struktur lama' : 'Pertahankan struktur lama', inline: true }
    );
}

async function findTemplate(guildId, key) {
  const builtin = builtins.find(item => item.key === key);
  if (builtin) return { ...builtin, source: 'builtin' };
  const custom = await listCustomTemplates(guildId);
  const match = custom.find(item => item.key === key);
  return match ? { ...match, source: 'custom' } : null;
}

async function handleSelect(interaction) {
  const replace = interaction.customId.endsWith(':1');
  const key = interaction.values[0];
  const template = await findTemplate(interaction.guildId, key);

  if (!template) {
    return interaction.update({ content: 'Template tidak ditemukan. Jalankan /template kembali.', embeds: [], components: [] });
  }

  const embed = makePreviewEmbed(template, replace);
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`template:apply:${key}:${replace ? '1' : '0'}`)
      .setLabel(replace ? 'Konfirmasi dan Replace' : 'Terapkan Template')
      .setStyle(replace ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('template:cancel')
      .setLabel('Batal')
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    embeds: [embed],
    components: [buttons]
  });
}

async function handleApply(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: 'Hanya administrator server yang dapat menerapkan template.', ephemeral: true });
  }

  const parts = interaction.customId.split(':');
  const key = parts[2];
  const replace = parts[3] === '1';
  const template = await findTemplate(interaction.guildId, key);

  if (!template) {
    return interaction.update({ content: 'Template tidak ditemukan. Jalankan /template kembali.', embeds: [], components: [] });
  }

  const botMember = await interaction.guild.members.fetchMe();
  if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({
      content: 'Bot membutuhkan izin **Manage Channels** untuk membuat struktur server.',
      ephemeral: true
    });
  }

  await interaction.update({
    content: 'Memulai penerapan template...',
    embeds: [],
    components: []
  });

  const status = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle(`Menerapkan: ${template.name}`)
    .setDescription('Menyiapkan proses...');

  await interaction.editReply({ content: '', embeds: [status], components: [] });

  try {
    if (replace) {
      // Deleting all channels is intentionally destructive; user explicitly confirmed via the Replace button.
      status.setDescription('Menghapus channel dan kategori lama...');
      await interaction.editReply({ embeds: [status] });

      await deleteExistingChannels(interaction.guild, async progress => {
        status.setDescription(
          `Menghapus struktur lama...\n${progress.current}/${progress.total}\n${progress.message}`
        );
        await interaction.editReply({ embeds: [status] });
      });
    }

    status.setDescription('Membuat kategori dan channel...');
    await interaction.editReply({ embeds: [status] });

    const result = await buildTemplate(interaction.guild, template, async progress => {
      const percent = Math.floor((progress.current / progress.total) * 100);
      const filled = Math.floor(percent / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      status.setDescription(
        `**${progress.message}**\n\n` +
        `\`${bar}\` **${percent}%**\n` +
        `${progress.current}/${progress.total} item dibuat.`
      );
      await interaction.editReply({ embeds: [status] });
    });

    status
      .setColor(0x57F287)
      .setTitle('Template berhasil diterapkan')
      .setDescription(
        `Template **${template.name}** berhasil dibuat di server **${interaction.guild.name}**.\n\n` +
        `Kategori dan channel dibuat: **${result.created}**\n` +
        `Mode replace: **${replace ? 'Ya' : 'Tidak'}**`
      );

    await interaction.editReply({ embeds: [status] });
  } catch (error) {
    console.error('Template application failed:', error);
    status
      .setColor(0xED4245)
      .setTitle('Penerapan template gagal')
      .setDescription(
        `Terjadi error: \`${String(error.message).slice(0, 500)}\`\n\n` +
        'Sebagian channel mungkin sudah terbuat atau terhapus. Periksa izin bot dan kondisi server.'
      );
    await interaction.editReply({ embeds: [status] });
  }
}

async function handleCreateModal(interaction) {
  const name = interaction.fields.getTextInputValue('name').trim();
  const description = interaction.fields.getTextInputValue('description').trim();
  const rawJson = interaction.fields.getTextInputValue('json').trim();

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return interaction.reply({
      content: 'JSON tidak valid. Periksa tanda kurung, koma, dan tanda kutip.',
      ephemeral: true
    });
  }

  try {
    const validated = validateTemplate({
      name,
      description,
      categories: parsed.categories
    });

    const key = slugify(name);
    if (!key) throw new Error('Nama template harus mengandung huruf atau angka.');

    const existing = await listCustomTemplates(interaction.guildId);
    if (existing.some(item => item.key === key) || builtins.some(item => item.key === key)) {
      throw new Error('Nama template tersebut sudah digunakan. Gunakan nama lain.');
    }

    await saveCustomTemplate(interaction.guildId, {
      key,
      ...validated,
      createdAt: new Date().toISOString()
    });

    return interaction.reply({
      content: `Custom template **${name}** berhasil disimpan.\nGunakan \`/template\` untuk memilihnya.`,
      ephemeral: true
    });
  } catch (error) {
    return interaction.reply({
      content: `Template tidak dapat disimpan: ${error.message}`,
      ephemeral: true
    });
  }
}

const ROLE_EXPIRED_MESSAGE = 'Draft role sudah kedaluwarsa. Jalankan /role-create kembali.';

function roleDraftFromId(interaction) {
  const draftId = interaction.customId.split(':')[2];
  return { draftId, draft: getPending(draftId) };
}

function makeRolePreviewEmbed(draft) {
  const presets = draft.presetKeys.map(findPreset).filter(Boolean);
  const permissionNames = new PermissionsBitField(combinePermissions(draft.presetKeys)).toArray();

  return new EmbedBuilder()
    .setColor(draft.color ?? 0x5865F2)
    .setTitle(`Preview Role: ${draft.name}`)
    .setDescription(
      presets.map(preset => `**${preset.label}** — ${preset.description}`).join('\n') +
      `\n\n**Total hak akses:** ${permissionNames.length}\n` +
      `\`${permissionNames.join(', ')}\``.slice(0, 1500)
    )
    .addFields({
      name: 'Warna',
      value: draft.color == null ? 'Default' : `#${draft.color.toString(16).padStart(6, '0').toUpperCase()}`,
      inline: true
    });
}

async function handleRoleSelect(interaction) {
  const { draftId, draft } = roleDraftFromId(interaction);

  if (!draft) {
    return interaction.update({ content: ROLE_EXPIRED_MESSAGE, embeds: [], components: [] });
  }
  if (draft.userId !== interaction.user.id) {
    return interaction.reply({ content: 'Draft role ini dibuat oleh admin lain.', ephemeral: true });
  }

  draft.presetKeys = interaction.values.filter(key => findPreset(key));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`role:apply:${draftId}`)
      .setLabel('Buat Role')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`role:cancel:${draftId}`)
      .setLabel('Batal')
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    embeds: [makeRolePreviewEmbed(draft)],
    components: [buttons]
  });
}

async function handleRoleApply(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: 'Hanya administrator server yang dapat membuat role.', ephemeral: true });
  }

  const { draftId, draft } = roleDraftFromId(interaction);

  if (!draft) {
    return interaction.update({ content: ROLE_EXPIRED_MESSAGE, embeds: [], components: [] });
  }
  if (draft.userId !== interaction.user.id) {
    return interaction.reply({ content: 'Draft role ini dibuat oleh admin lain.', ephemeral: true });
  }
  if (!draft.presetKeys.length) {
    return interaction.reply({ content: 'Pilih minimal satu hak akses terlebih dahulu.', ephemeral: true });
  }

  const botMember = await interaction.guild.members.fetchMe();
  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return interaction.reply({
      content: 'Bot membutuhkan izin **Manage Roles** untuk membuat role.',
      ephemeral: true
    });
  }

  // Discord menolak pembuatan role dengan hak akses yang tidak dimiliki bot sendiri.
  const permissions = combinePermissions(draft.presetKeys);
  const missing = permissions.filter(flag => !botMember.permissions.has(flag));
  if (missing.length) {
    return interaction.reply({
      content:
        'Bot tidak memiliki hak akses berikut sehingga tidak bisa memberikannya ke role baru: ' +
        `\`${new PermissionsBitField(missing).toArray().join(', ')}\`.\n` +
        'Berikan izin tersebut ke role bot atau kurangi pilihan hak akses.',
      ephemeral: true
    });
  }

  await interaction.guild.roles.fetch();
  const duplicate = interaction.guild.roles.cache.find(
    role => role.name.toLowerCase() === draft.name.toLowerCase()
  );
  if (duplicate) {
    return interaction.reply({
      content: `Role dengan nama **${draft.name}** sudah ada. Jalankan /role-create dengan nama lain.`,
      ephemeral: true
    });
  }

  try {
    const role = await interaction.guild.roles.create({
      name: draft.name,
      color: draft.color ?? undefined,
      permissions,
      reason: `Dibuat lewat /role-create oleh ${interaction.user.tag}`
    });
    deletePending(draftId);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('Role berhasil dibuat')
      .setDescription(
        `Role ${role} dibuat dengan **${permissions.length}** hak akses.\n\n` +
        'Role baru berada di posisi paling bawah. Geser posisinya lewat ' +
        '**Server Settings → Roles** jika perlu.'
      );

    return interaction.update({ content: '', embeds: [embed], components: [] });
  } catch (error) {
    console.error('Role creation failed:', error);
    return interaction.reply({
      content: `Role gagal dibuat: \`${String(error.message).slice(0, 500)}\``,
      ephemeral: true
    });
  }
}

async function handleInteraction(interaction, commands) {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const payload = { content: 'Terjadi kesalahan saat menjalankan command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload);
      else await interaction.reply(payload);
    }
    return;
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('template:select:')) {
    return handleSelect(interaction);
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('role:select:')) {
    return handleRoleSelect(interaction);
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'template:cancel') {
      return interaction.update({ content: 'Penerapan template dibatalkan.', embeds: [], components: [] });
    }
    if (interaction.customId.startsWith('template:apply:')) {
      return handleApply(interaction);
    }
    if (interaction.customId.startsWith('role:cancel:')) {
      deletePending(interaction.customId.split(':')[2]);
      return interaction.update({ content: 'Pembuatan role dibatalkan.', embeds: [], components: [] });
    }
    if (interaction.customId.startsWith('role:apply:')) {
      return handleRoleApply(interaction);
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'template:create:modal') {
    return handleCreateModal(interaction);
  }
}

module.exports = { handleInteraction };

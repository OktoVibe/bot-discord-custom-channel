const {
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');

function permissionOverwrites(guild, preset) {
  const everyoneId = guild.roles.everyone.id;

  if (preset === 'private') {
    return [{
      id: everyoneId,
      deny: [PermissionFlagsBits.ViewChannel]
    }];
  }

  if (preset === 'readonly') {
    return [{
      id: everyoneId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory
      ],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads
      ]
    }];
  }

  if (preset === 'voice') {
    return [{
      id: everyoneId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
      ]
    }];
  }

  // public
  return [{
    id: everyoneId,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak
    ]
  }];
}

async function deleteExistingChannels(guild, onProgress) {
  const channels = await guild.channels.fetch();
  const channelList = [...channels.values()].filter(Boolean);

  // Delete non-category channels first, then categories.
  const ordered = [
    ...channelList.filter(channel => channel.type !== ChannelType.GuildCategory),
    ...channelList.filter(channel => channel.type === ChannelType.GuildCategory)
  ];

  let deleted = 0;
  for (const channel of ordered) {
    await channel.delete('Replacing server structure with a selected template');
    deleted++;
    await onProgress({
      current: deleted,
      total: ordered.length,
      message: `Menghapus ${channel.name}`
    });
  }
  return deleted;
}

async function buildTemplate(guild, template, onProgress) {
  const totalChannels = template.categories.reduce(
    (sum, category) => sum + 1 + category.channels.length, 0
  );
  let completed = 0;

  for (const category of template.categories) {
    const overwrites = permissionOverwrites(guild, category.permission || 'public');
    const parent = await guild.channels.create({
      name: category.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: overwrites,
      reason: `Applying template: ${template.name}`
    });

    completed++;
    await onProgress({
      current: completed,
      total: totalChannels,
      message: `Membuat kategori ${category.name}`
    });

    for (const channel of category.channels) {
      const type = channel.type === 'voice'
        ? ChannelType.GuildVoice
        : ChannelType.GuildText;

      await guild.channels.create({
        name: channel.name,
        type,
        parent: parent.id,
        // Explicitly apply the category overwrites so the channel permissions are correct.
        permissionOverwrites: overwrites,
        reason: `Applying template: ${template.name}`
      });

      completed++;
      await onProgress({
        current: completed,
        total: totalChannels,
        message: `Membuat channel ${channel.name}`
      });
    }
  }

  return { created: totalChannels };
}

module.exports = { deleteExistingChannels, buildTemplate };

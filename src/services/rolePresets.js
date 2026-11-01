const { PermissionFlagsBits: P } = require('discord.js');

// Grup hak akses siap pakai untuk fitur /role-create.
// Administrator, Manage Server, dan Manage Roles sengaja TIDAK disediakan
// supaya role buatan bot tidak bisa dipakai untuk eskalasi hak akses.
const rolePresets = [
  {
    key: 'basic',
    label: 'Member Dasar',
    description: 'Lihat channel, chat, reaksi, kirim file/embed, voice.',
    permissions: [
      P.ViewChannel, P.SendMessages, P.SendMessagesInThreads, P.ReadMessageHistory,
      P.AddReactions, P.EmbedLinks, P.AttachFiles, P.UseExternalEmojis,
      P.Connect, P.Speak, P.UseVAD
    ]
  },
  {
    key: 'chat-mod',
    label: 'Moderator Chat',
    description: 'Hapus pesan, kelola thread, timeout member.',
    permissions: [P.ManageMessages, P.ManageThreads, P.ModerateMembers]
  },
  {
    key: 'member-mod',
    label: 'Moderator Member',
    description: 'Kick, ban, dan ubah nickname member.',
    permissions: [P.KickMembers, P.BanMembers, P.ManageNicknames]
  },
  {
    key: 'voice-mod',
    label: 'Moderator Voice',
    description: 'Mute, deafen, pindahkan member, priority speaker.',
    permissions: [P.MuteMembers, P.DeafenMembers, P.MoveMembers, P.PrioritySpeaker]
  },
  {
    key: 'channel-manager',
    label: 'Pengelola Channel',
    description: 'Membuat, mengubah, dan menghapus channel.',
    permissions: [P.ManageChannels]
  },
  {
    key: 'event-manager',
    label: 'Pengelola Event',
    description: 'Membuat dan mengelola event server.',
    permissions: [P.CreateEvents, P.ManageEvents]
  },
  {
    key: 'announcer',
    label: 'Pengumuman',
    description: 'Boleh mention @everyone dan @here.',
    permissions: [P.MentionEveryone]
  },
  {
    key: 'invite',
    label: 'Undang Member',
    description: 'Boleh membuat link undangan server.',
    permissions: [P.CreateInstantInvite]
  }
];

function findPreset(key) {
  return rolePresets.find(preset => preset.key === key) || null;
}

// Gabungkan beberapa preset menjadi satu daftar permission tanpa duplikat.
function combinePermissions(presetKeys) {
  const set = new Set();
  for (const key of presetKeys) {
    const preset = findPreset(key);
    if (!preset) continue;
    for (const flag of preset.permissions) set.add(flag);
  }
  return [...set];
}

module.exports = { rolePresets, findPreset, combinePermissions };

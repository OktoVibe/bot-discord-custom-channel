// Permission presets:
// public   = everyone can view and send messages (text) / connect and speak (voice)
// readonly = everyone can view but cannot send messages
// private  = hidden from @everyone; server administrators can still access
// voice    = everyone can view, connect and speak
//
// A category's permission overwrites are inherited by its child channels.

const builtins = [
  {
    key: 'gaming-community',
    name: 'Gaming Community',
    description: 'Server komunitas gaming dengan ruang obrolan, game, voice, dan staff.',
    categories: [
      { name: '📌 INFORMATION', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'announcements', type: 'text' },
        { name: 'server-info', type: 'text' }
      ]},
      { name: '💬 COMMUNITY', permission: 'public', channels: [
        { name: 'general', type: 'text' },
        { name: 'media', type: 'text' },
        { name: 'memes', type: 'text' },
        { name: 'bot-commands', type: 'text' }
      ]},
      { name: '🎮 GAMING', permission: 'public', channels: [
        { name: 'gaming-chat', type: 'text' },
        { name: 'looking-for-group', type: 'text' },
        { name: 'game-news', type: 'text' }
      ]},
      { name: '🔊 VOICE CHANNELS', permission: 'voice', channels: [
        { name: 'General Voice', type: 'voice' },
        { name: 'Gaming Room 1', type: 'voice' },
        { name: 'Gaming Room 2', type: 'voice' }
      ]},
      { name: '🔒 STAFF', permission: 'private', channels: [
        { name: 'staff-chat', type: 'text' },
        { name: 'moderation-log', type: 'text' },
        { name: 'staff-voice', type: 'voice' }
      ]}
    ]
  },
  {
    key: 'community-server',
    name: 'Community Server',
    description: 'Server komunitas umum untuk diskusi, media, event, dan voice.',
    categories: [
      { name: '📌 START HERE', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'announcements', type: 'text' }
      ]},
      { name: '🌐 COMMUNITY', permission: 'public', channels: [
        { name: 'general', type: 'text' },
        { name: 'introductions', type: 'text' },
        { name: 'questions', type: 'text' },
        { name: 'suggestions', type: 'text' }
      ]},
      { name: '🎨 SHARING', permission: 'public', channels: [
        { name: 'photos-and-videos', type: 'text' },
        { name: 'creative-work', type: 'text' },
        { name: 'off-topic', type: 'text' }
      ]},
      { name: '🎉 EVENTS', permission: 'public', channels: [
        { name: 'event-info', type: 'text' },
        { name: 'event-chat', type: 'text' },
        { name: 'Community Voice', type: 'voice' }
      ]},
      { name: '🔒 STAFF', permission: 'private', channels: [
        { name: 'staff-chat', type: 'text' },
        { name: 'reports', type: 'text' }
      ]}
    ]
  },
  {
    key: 'study-group',
    name: 'Study Group',
    description: 'Server belajar dengan kanal materi, diskusi, tugas, dan ruang belajar.',
    categories: [
      { name: '📌 INFORMASI', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'jadwal-kegiatan', type: 'text' },
        { name: 'pengumuman', type: 'text' }
      ]},
      { name: '📚 MATERI', permission: 'public', channels: [
        { name: 'materi-kuliah', type: 'text' },
        { name: 'referensi', type: 'text' },
        { name: 'catatan', type: 'text' }
      ]},
      { name: '💬 DISKUSI', permission: 'public', channels: [
        { name: 'diskusi-umum', type: 'text' },
        { name: 'tanya-jawab', type: 'text' },
        { name: 'kelompok-tugas', type: 'text' }
      ]},
      { name: '🎙️ RUANG BELAJAR', permission: 'voice', channels: [
        { name: 'Study Room 1', type: 'voice' },
        { name: 'Study Room 2', type: 'voice' }
      ]},
      { name: '🔒 PENGURUS', permission: 'private', channels: [
        { name: 'pengurus', type: 'text' },
        { name: 'evaluasi', type: 'text' }
      ]}
    ]
  },
  {
    key: 'roleplay-server',
    name: 'Roleplay Server',
    description: 'Server roleplay dengan kanal IC, OOC, karakter, dan administrasi.',
    categories: [
      { name: '📌 SERVER INFO', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'announcements', type: 'text' },
        { name: 'how-to-play', type: 'text' }
      ]},
      { name: '🎭 IN CHARACTER', permission: 'public', channels: [
        { name: 'city-square', type: 'text' },
        { name: 'business-district', type: 'text' },
        { name: 'character-profiles', type: 'text' }
      ]},
      { name: '💬 OUT OF CHARACTER', permission: 'public', channels: [
        { name: 'general-ooc', type: 'text' },
        { name: 'roleplay-discussion', type: 'text' },
        { name: 'screenshots', type: 'text' }
      ]},
      { name: '🔊 ROLEPLAY VOICE', permission: 'voice', channels: [
        { name: 'Roleplay Voice 1', type: 'voice' },
        { name: 'Roleplay Voice 2', type: 'voice' }
      ]},
      { name: '🔒 ADMINISTRATION', permission: 'private', channels: [
        { name: 'admin-chat', type: 'text' },
        { name: 'player-reports', type: 'text' },
        { name: 'staff-log', type: 'text' }
      ]}
    ]
  },
  {
    key: 'content-creator',
    name: 'Content Creator',
    description: 'Server kreator konten untuk update, komunitas, kolaborasi, dan promosi.',
    categories: [
      { name: '📌 CREATOR INFO', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'creator-updates', type: 'text' }
      ]},
      { name: '👥 COMMUNITY', permission: 'public', channels: [
        { name: 'general', type: 'text' },
        { name: 'introductions', type: 'text' },
        { name: 'fan-art', type: 'text' }
      ]},
      { name: '📺 CONTENT', permission: 'public', channels: [
        { name: 'latest-content', type: 'text' },
        { name: 'video-feedback', type: 'text' },
        { name: 'content-ideas', type: 'text' }
      ]},
      { name: '🤝 COLLABORATION', permission: 'public', channels: [
        { name: 'collaboration', type: 'text' },
        { name: 'self-promotion', type: 'text' },
        { name: 'Collab Voice', type: 'voice' }
      ]},
      { name: '🔒 CREATOR TEAM', permission: 'private', channels: [
        { name: 'team-chat', type: 'text' },
        { name: 'content-planning', type: 'text' }
      ]}
    ]
  },
  {
    key: 'business-organization',
    name: 'Business / Organization',
    description: 'Server organisasi atau bisnis dengan kanal informasi, proyek, dan tim.',
    categories: [
      { name: '📌 COMPANY INFO', permission: 'readonly', channels: [
        { name: 'welcome', type: 'text' },
        { name: 'announcements', type: 'text' },
        { name: 'company-information', type: 'text' }
      ]},
      { name: '💼 GENERAL', permission: 'public', channels: [
        { name: 'general', type: 'text' },
        { name: 'questions', type: 'text' },
        { name: 'ideas-and-feedback', type: 'text' }
      ]},
      { name: '📁 PROJECTS', permission: 'public', channels: [
        { name: 'project-updates', type: 'text' },
        { name: 'task-discussion', type: 'text' },
        { name: 'resources', type: 'text' }
      ]},
      { name: '🎙️ MEETINGS', permission: 'voice', channels: [
        { name: 'Meeting Room 1', type: 'voice' },
        { name: 'Meeting Room 2', type: 'voice' }
      ]},
      { name: '🔒 MANAGEMENT', permission: 'private', channels: [
        { name: 'management-chat', type: 'text' },
        { name: 'internal-reports', type: 'text' }
      ]}
    ]
  }
];

module.exports = builtins;

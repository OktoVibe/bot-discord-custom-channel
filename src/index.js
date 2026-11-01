const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config');
const { handleInteraction } = require('./interactions/handlers');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = new Collection();
for (const command of [
  require('./commands/template'),
  require('./commands/template-create'),
  require('./commands/template-delete'),
  require('./commands/role-create')
]) {
  commands.set(command.data.name, command);
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Bot online sebagai ${readyClient.user.tag}`);
  console.log(`Berjalan di ${readyClient.guilds.cache.size} server.`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    await handleInteraction(interaction, commands);
  } catch (error) {
    console.error('Interaction error:', error);
    const payload = { content: 'Terjadi kesalahan saat memproses interaksi.', ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
      else await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(config.token);

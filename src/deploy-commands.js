const { REST, Routes } = require('discord.js');
const config = require('./config');

const commandFiles = [
  require('./commands/template'),
  require('./commands/template-create'),
  require('./commands/template-delete'),
  require('./commands/role-create')
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    const body = commandFiles.map(command => command.data.toJSON());

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body }
      );
      console.log(`Registered ${body.length} commands to test guild ${config.guildId}.`);
    } else {
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body }
      );
      console.log(`Registered ${body.length} global commands. Global updates may take time to appear.`);
    }
  } catch (error) {
    console.error('Failed to deploy commands:', error);
    process.exitCode = 1;
  }
})();

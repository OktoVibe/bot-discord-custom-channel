const fs = require('node:fs/promises');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'guilds');

async function ensureGuildDir(guildId) {
  const dir = path.join(DATA_DIR, guildId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function listCustomTemplates(guildId) {
  const dir = await ensureGuildDir(guildId);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const templates = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(dir, entry.name), 'utf8');
      templates.push(JSON.parse(raw));
    } catch (error) {
      console.error(`Could not read custom template ${entry.name}:`, error.message);
    }
  }

  return templates;
}

async function saveCustomTemplate(guildId, template) {
  const dir = await ensureGuildDir(guildId);
  const file = path.join(dir, `${template.key}.json`);
  await fs.writeFile(file, JSON.stringify(template, null, 2), 'utf8');
}

async function deleteCustomTemplate(guildId, key) {
  const dir = await ensureGuildDir(guildId);
  const file = path.join(dir, `${key}.json`);
  await fs.unlink(file);
}

module.exports = { listCustomTemplates, saveCustomTemplate, deleteCustomTemplate };

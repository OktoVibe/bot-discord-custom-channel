const VALID_PERMISSIONS = new Set(['public', 'readonly', 'private', 'voice']);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

function validateTemplate(input) {
  if (!input || typeof input !== 'object') throw new Error('JSON template harus berupa object.');
  if (typeof input.name !== 'string' || !input.name.trim()) throw new Error('Field "name" wajib diisi.');
  if (input.name.length > 90) throw new Error('Nama template maksimal 90 karakter.');
  if (typeof input.description !== 'string' || input.description.length > 200) {
    throw new Error('Field "description" wajib diisi dan maksimal 200 karakter.');
  }
  if (!Array.isArray(input.categories) || input.categories.length < 1 || input.categories.length > 20) {
    throw new Error('Template harus memiliki 1 sampai 20 kategori.');
  }

  let channelCount = 0;
  for (const [index, category] of input.categories.entries()) {
    if (!category || typeof category.name !== 'string' || !category.name.trim()) {
      throw new Error(`Nama kategori pada urutan ${index + 1} tidak valid.`);
    }
    if (category.name.length > 100) throw new Error('Nama kategori maksimal 100 karakter.');
    if (!VALID_PERMISSIONS.has(category.permission || 'public')) {
      throw new Error(`Permission kategori "${category.name}" tidak dikenal.`);
    }
    if (!Array.isArray(category.channels)) throw new Error(`Kategori "${category.name}" harus memiliki array channels.`);
    for (const channel of category.channels) {
      channelCount++;
      if (!channel || typeof channel.name !== 'string' || !channel.name.trim()) {
        throw new Error(`Ada nama channel yang tidak valid pada kategori "${category.name}".`);
      }
      if (channel.name.length > 100) throw new Error('Nama channel maksimal 100 karakter.');
      if (!['text', 'voice'].includes(channel.type)) {
        throw new Error(`Tipe channel "${channel.type}" tidak valid. Gunakan text atau voice.`);
      }
    }
  }

  if (channelCount > 100) throw new Error('Maksimal 100 channel per template.');
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    categories: input.categories.map(category => ({
      name: category.name.trim(),
      permission: category.permission || 'public',
      channels: category.channels.map(channel => ({
        name: channel.name.trim(),
        type: channel.type
      }))
    }))
  };
}

module.exports = { slugify, validateTemplate };

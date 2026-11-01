const crypto = require('node:crypto');

// Draft role disimpan sementara di memori karena customId Discord dibatasi 100 karakter
// dan nama role bisa mengandung karakter ':'. Draft hilang jika bot restart atau lewat TTL.
const TTL_MS = 10 * 60 * 1000;
const pending = new Map();

function sweep() {
  const now = Date.now();
  for (const [id, item] of pending) {
    if (item.expiresAt <= now) pending.delete(id);
  }
}

function createPending(data) {
  sweep();
  const id = crypto.randomBytes(4).toString('hex');
  pending.set(id, { ...data, presetKeys: [], expiresAt: Date.now() + TTL_MS });
  return id;
}

function getPending(id) {
  sweep();
  return pending.get(id) || null;
}

function deletePending(id) {
  pending.delete(id);
}

module.exports = { createPending, getPending, deletePending };

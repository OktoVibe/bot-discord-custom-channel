# Discord Template Bot

Bot untuk membuat struktur kategori dan channel Discord secara otomatis menggunakan Node.js dan Discord.js v14.

## Fitur

- 6 template bawaan: Gaming Community, Community Server, Study Group, Roleplay Server, Content Creator, Business / Organization.
- Admin dapat membuat custom template melalui modal JSON.
- Admin dapat menghapus custom template.
- Preview sebelum penerapan.
- Permission otomatis per kategori.
- Progress pembuatan kategori dan channel.
- Mode replace untuk menghapus semua channel/kategori lama setelah konfirmasi.
- Mode normal untuk mempertahankan struktur yang sudah ada.
- Admin dapat membuat role baru dengan mencentang grup hak akses yang sudah disediakan (`/role-create`).

## Persyaratan

- Node.js 20 atau lebih baru.
- Aplikasi bot di Discord Developer Portal.
- Izin bot: Manage Channels, Manage Roles, View Channels, Send Messages, Embed Links.
- Bot harus memiliki role yang posisinya cukup tinggi untuk mengelola channel yang diperlukan.

## Instalasi

1. Buka folder project di VS Code.
2. Jalankan:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`.
4. Isi `DISCORD_TOKEN` dan `CLIENT_ID`.
5. Untuk development, isi juga `GUILD_ID` dengan ID server pengujian. Jika `GUILD_ID` dikosongkan, command didaftarkan secara global dan dapat memerlukan waktu untuk muncul.
6. Daftarkan slash command:

   ```bash
   npm run deploy
   ```

7. Jalankan bot:

   ```bash
   npm start
   ```

## Command

### `/template [replace]`

Menampilkan pilihan template. Jika `replace` bernilai `true`, bot akan meminta konfirmasi melalui tombol berwarna merah. Setelah dikonfirmasi, seluruh channel dan kategori pada server akan dihapus sebelum struktur baru dibuat.

Jika `replace` bernilai `false`, channel dan kategori lama dipertahankan. Template baru ditambahkan.

### `/template-create`

Membuka modal untuk membuat template custom. Masukkan nama, deskripsi, dan JSON kategori/channel.

Contoh JSON:

```json
{
  "categories": [
    {
      "name": "INFORMATION",
      "permission": "readonly",
      "channels": [
        { "name": "welcome", "type": "text" },
        { "name": "rules", "type": "text" }
      ]
    },
    {
      "name": "COMMUNITY",
      "permission": "public",
      "channels": [
        { "name": "general", "type": "text" },
        { "name": "Voice Chat", "type": "voice" }
      ]
    },
    {
      "name": "STAFF",
      "permission": "private",
      "channels": [
        { "name": "staff-chat", "type": "text" }
      ]
    }
  ]
}
```

### `/template-delete nama:<nama>`

Menghapus template custom berdasarkan nama persis atau key-nya. Template bawaan tidak dapat dihapus.

### `/role-create nama:<nama> [warna:<hex>]`

Membuat role baru tanpa mengetik hak akses satu per satu:

1. Jalankan command, isi nama role dan (opsional) warna hex seperti `#5865F2`.
2. Centang satu atau beberapa grup hak akses dari menu.
3. Periksa preview, lalu klik **Buat Role**.

Grup hak akses tersedia (didefinisikan di `src/services/rolePresets.js`): Member Dasar, Moderator Chat, Moderator Member, Moderator Voice, Pengelola Channel, Pengelola Event, Pengumuman, Undang Member.

Catatan:

- Administrator, Manage Server, dan Manage Roles sengaja tidak tersedia agar role buatan bot tidak bisa dipakai untuk eskalasi hak akses.
- Bot hanya bisa memberikan hak akses yang ia miliki sendiri. Jika kurang, bot menampilkan daftar izin yang hilang.
- Role baru muncul di posisi paling bawah; geser lewat Server Settings → Roles bila perlu.
- Draft role disimpan di memori selama 10 menit. Jika bot restart, jalankan ulang `/role-create`.
- Untuk menambah grup baru, cukup tambahkan satu objek di `rolePresets.js`.

## Permission preset

Setiap kategori menerima satu nilai `permission`:

- `public`: @everyone dapat melihat dan mengirim pesan; untuk voice dapat connect/speak.
- `readonly`: @everyone dapat melihat dan membaca, tetapi tidak dapat mengirim pesan.
- `private`: kategori disembunyikan dari @everyone. Tambahkan role staff secara manual setelah template dibuat jika diperlukan.
- `voice`: akses melihat dan menggunakan voice diberikan kepada @everyone.

Permission channel di bawah kategori mengikuti permission kategori melalui inheritance Discord.

## Peringatan mode replace

Mode replace menghapus **semua channel dan kategori** di server, termasuk channel yang dibuat manual. Role, member, dan pengaturan server tidak dihapus. Gunakan hanya pada server uji atau setelah backup. Discord tidak menyediakan transaksi rollback; jika proses gagal di tengah jalan, sebagian struktur dapat sudah terhapus/terbuat.

Bot harus memiliki `Manage Channels`. Berikan izin secukupnya dan uji terlebih dahulu di server khusus.

## Penyimpanan custom template

Custom template disimpan sebagai file JSON pada:

`data/guilds/<GUILD_ID>/<template-key>.json`

Simpan folder `data/` jika ingin mempertahankan template custom ketika memindahkan atau deploy bot. Untuk deployment multi-instance, ganti penyimpanan JSON dengan database seperti SQLite atau PostgreSQL.

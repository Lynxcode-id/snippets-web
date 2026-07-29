# NeoSoft Labs — Snippet Vault

Next.js + SQLite-compatible snippet web app dengan:
- akun register/login
- create snippet
- public/private snippet
- password protection per snippet
- like & views counter
- search, category, language filter
- profile dashboard

## Deploy ke Vercel

Vercel Functions berjalan di environment yang ephemeral; filesystem-nya read-only kecuali `/tmp`, jadi file SQLite lokal bukan storage yang tahan lama di produksi. Pakai database SQLite-compatible yang persistent seperti Turso/libSQL untuk deployment Vercel.

### Environment variables
Set minimal:
- `LIBSQL_URL`
- `LIBSQL_AUTH_TOKEN`
- `SESSION_SECRET`

### Jalankan schema
File `schema.sql` sudah disediakan. Kalau database kosong, import schema itu ke database libSQL/Turso kamu.

## Fitur keamanan
Password akun dan password snippet di-hash dengan bcrypt. Session dan unlock token disimpan sebagai cookie HTTP-only.

## Route utama
- `/` homepage
- `/snippets` browse
- `/snippets/[slug]` detail snippet
- `/login`
- `/register`
- `/create`
- `/profile`
- `/settings`

## Catatan
Versi ini sengaja dibuat tanpa client state yang berat supaya enak dipindah ke Vercel. Layout dan visual dibuat dekat dengan gaya kartu, chip, dan navigasi mobile yang kamu kirim.

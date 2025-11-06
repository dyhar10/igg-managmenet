# Backend

Backend monolitik ringan untuk aplikasi administrasi perumahan. Server kini menggunakan Prisma ORM untuk berinteraksi dengan basis data PostgreSQL, memanfaatkan connection pooling (`DATABASE_URL`) untuk aplikasi dan koneksi langsung (`DIRECT_URL`) khusus migrasi.

## Fitur
- Endpoint registrasi dan login dengan hashing password PBKDF2.
- Token autentikasi berbasis HMAC (format JWT kompatibel).
- Manajemen pengguna menggunakan basis data melalui Prisma ORM (PostgreSQL).
- Endpoint health check `/api/health`.

## Struktur Proyek
```
src/
  config/          # Konfigurasi aplikasi
  controllers/     # Controller HTTP
  routes/          # Registrasi rute
  services/        # Logika bisnis
  repositories/    # Akses data
  utils/           # Utilitas umum
```

## Konfigurasi Basis Data

Siapkan variabel lingkungan berikut sebelum menjalankan aplikasi atau perintah Prisma:

- `DATABASE_URL` (**wajib**): URL koneksi dengan connection pooling untuk aplikasi (misal PgBouncer/Neon pooler).
- `DIRECT_URL` (**wajib untuk migrasi**): URL koneksi langsung ke basis data utama yang akan digunakan Prisma saat menjalankan migrasi.
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_FULL_NAME` (opsional): kredensial akun admin bawaan untuk seeder.
- `PORT` (default: `4000`)
- `JWT_SECRET` (default: `change-me`, **ganti di produksi**)
- `TOKEN_EXPIRATION_SECONDS` (default: `3600` detik)

## Migrasi & Seeder

Jalankan perintah berikut dari folder `backend/` setelah dependensi terpasang:

```bash
npm install
npm run migrate:dev -- --name init    # migrasi schema saat pengembangan
npm run migrate:deploy                # menerapkan migrasi di server produksi
npm run db:seed                       # menanam data awal (akun admin default)
```

Prisma otomatis memakai `DATABASE_URL` untuk koneksi aplikasi dan `DIRECT_URL` saat melakukan migrasi.

## Menjalankan Server
```
node src/index.js
```

## Endpoint
### POST `/api/auth/register`
Body:
```json
{
  "email": "user@example.com",
  "password": "password",
  "fullName": "Nama Pengguna",
  "roles": ["member"]
}
```

### POST `/api/auth/login`
Body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### GET `/api/health`
Respon status server.

## Catatan
- Prisma Client otomatis membuat pool koneksi berdasarkan `DATABASE_URL`. Pastikan URL mengarah ke pool (mis. PgBouncer) untuk aplikasi produksi.
- Token menggunakan algoritma HS256; simpan rahasia JWT dengan aman.

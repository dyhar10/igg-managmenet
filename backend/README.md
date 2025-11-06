# Backend

Backend monolitik ringan untuk aplikasi administrasi perumahan. Server dibangun menggunakan Express.js dan Prisma ORM untuk memudahkan pengelolaan basis data PostgreSQL.

## Fitur
- Endpoint registrasi dan login dengan hashing password PBKDF2.
- Token autentikasi berbasis HMAC (format JWT kompatibel).
- Integrasi Prisma ORM dengan koneksi pool (`DATABASE_URL`) dan direct connection (`DIRECT_URL`) untuk kebutuhan migrasi.
- Skema awal basis data (User, Role, UserRole) beserta seeder default super admin.
- Endpoint health check `/api/health`.

## Struktur Proyek
```
src/
  app.js          # Inisialisasi aplikasi Express
  config/         # Konfigurasi aplikasi
  controllers/    # Controller HTTP
  middlewares/    # Penanganan error & 404
  routes/         # Registrasi rute
  services/       # Logika bisnis
  repositories/   # Akses data
  utils/          # Utilitas umum (hashing/token)
```

## Menjalankan Server
```bash
npm install
npm run dev # pengembangan dengan nodemon
# atau
npm start   # menjalankan tanpa watch mode
```

Variabel lingkungan (lihat juga contoh di `.env.example`):
- `PORT` (opsional, default: `4000`)
- `JWT_SECRET` (opsional, default: `change-me`, **ganti di produksi**)
- `TOKEN_EXPIRATION_SECONDS` (opsional, default: `3600` detik)
- `DATABASE_URL` (wajib, koneksi pooling untuk aplikasi)
- `DIRECT_URL` (wajib, koneksi langsung untuk migrasi/seed)

Contoh format `DATABASE_URL` saat menggunakan PgBouncer:

```
postgresql://USER:PASSWORD@HOST:PORT/DB?pgbouncer=true&connection_limit=1
```

Sedangkan `DIRECT_URL` mengarah langsung ke instance Postgres tanpa PgBouncer agar migrasi berjalan lancar:

```
postgresql://USER:PASSWORD@HOST:PORT/DB
```

## Prisma & Basis Data

1. **Generate client**
   ```bash
   npm run prisma:generate
   ```
2. **Jalankan migrasi di lingkungan produksi/staging**
   ```bash
   npm run prisma:migrate
   ```
3. **Saat pengembangan lokal** (membuat migrasi baru)
   ```bash
   npm run prisma:migrate-dev -- --name init
   ```
4. **Seed data awal (roles dan super admin default)**
   ```bash
   npm run prisma:seed
   ```

Seluruh perintah migrasi dan seeding di atas dieksekusi melalui `scripts/run-prisma.js` yang akan memaksa penggunaan `DIRECT_URL`. Pastikan variabel tersebut mengarah ke koneksi langsung database.

> **Catatan:** `prisma/schema.prisma` sudah mengatur `datasource db` dengan `DATABASE_URL` untuk koneksi pooling aplikasi dan `DIRECT_URL` untuk keperluan migrasi agar kompatibel dengan arsitektur read/write.

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
- Token menggunakan algoritma HS256; simpan rahasia JWT dengan aman.
- Seeder akan membuat akun super admin default (`admin@example.com` / `Secret123!`). Ubah melalui variabel `SEED_SUPER_ADMIN_*` sebelum menjalankan seed di lingkungan produksi.

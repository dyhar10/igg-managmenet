# IGG Management

Repositori untuk aplikasi administrasi perumahan IGG. Struktur saat ini terdiri dari komponen backend monolitik berbasis Express.js dan Prisma ORM yang menjadi fondasi untuk modul-modul keuangan serta manajemen pengguna.

## Struktur Direktori
- `backend/` - layanan backend Node.js (Express) dengan Prisma ORM, menyediakan endpoint autentikasi dasar, migrasi, dan seeder.

## Langkah Berikutnya
- Tambahkan frontend React untuk dashboard administrasi.
- Kembangkan modul-modul domain (iuran bulanan, kas masjid) di atas skema PostgreSQL yang dikelola Prisma.
- Siapkan pipeline CI sederhana untuk linting dan pengujian.

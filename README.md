# IGG Management

Repositori untuk aplikasi administrasi perumahan IGG. Struktur saat ini terdiri dari komponen backend monolitik yang akan menjadi fondasi untuk modul-modul keuangan dan manajemen pengguna.

## Struktur Direktori
- `backend/` - layanan backend Node.js tanpa dependensi eksternal, menyediakan endpoint autentikasi dasar.

## Langkah Berikutnya
- Tambahkan frontend React untuk dashboard administrasi.
- Integrasikan penyimpanan data yang lebih andal (mis. PostgreSQL) menggantikan penyimpanan berbasis berkas.
- Siapkan pipeline CI sederhana untuk linting dan pengujian.

# IGG Management Frontend

Antarmuka pengguna modern untuk mengelola administrasi perumahan IGG. Aplikasi dibuat menggunakan React + Vite sehingga ringan, cepat, dan mudah dipelihara.

## Menjalankan Secara Lokal

```bash
cd frontend
npm install
npm run dev
```

Secara bawaan aplikasi akan mengarah ke backend pada `http://localhost:4000`. Gunakan variabel lingkungan `VITE_API_BASE_URL` apabila backend berjalan pada alamat berbeda:

```bash
VITE_API_BASE_URL="https://api.example.com" npm run dev
```

## Fitur Utama

- **Dashboard**: Ringkasan kas mingguan, bulanan, tahunan, dan keseluruhan.
- **Financial Management**: Melihat dan mencatat transaksi kas serta manajemen data rumah.
- **User Management**: Membuat akun baru beserta role-nya.
- **Role Management**: Mengelola role pengguna yang sudah ada.
- **Public Dashboard**: Tampilan ringkasan kas yang dapat diakses tanpa login.
- **Autentikasi**: Halaman login dan reset password yang terhubung langsung dengan backend.

Seluruh modul memanfaatkan endpoint backend monolitik yang sudah tersedia. Pastikan service backend berjalan sebelum membuka antarmuka ini.

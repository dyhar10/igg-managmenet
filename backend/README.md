# Backend

Backend monolitik ringan untuk aplikasi administrasi perumahan. Server dibuat tanpa ketergantungan eksternal sehingga dapat dijalankan di lingkungan dengan konektivitas terbatas.

## Fitur
- Endpoint registrasi dan login dengan hashing password PBKDF2.
- Token autentikasi berbasis HMAC (format JWT kompatibel).
- Penyimpanan pengguna sederhana berbasis berkas JSON agar mudah diganti ke basis data di masa depan.
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

## Menjalankan Server
```
node src/index.js
```

Variabel lingkungan opsional:
- `PORT` (default: `4000`)
- `JWT_SECRET` (default: `change-me`, **ganti di produksi**) 
- `TOKEN_EXPIRATION_SECONDS` (default: `3600` detik)

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
- Penyimpanan pengguna menggunakan `data/users.json`. Untuk penggunaan produksi, sebaiknya diganti dengan basis data yang andal.
- Token menggunakan algoritma HS256; simpan rahasia JWT dengan aman.

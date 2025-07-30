# Setup Supabase untuk Aplikasi Lab Komputer MAM 1 Paciran

## 1. Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Daftar/login ke akun Anda
3. Buat project baru
4. Catat URL dan anon key dari dashboard

## 2. Update Konfigurasi
Edit file `utils/supabase.js` dan ganti:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## 3. Setup Database dengan SQL Script

### Cara Mudah (Recommended)
1. Buka file `supabase-setup.sql` yang sudah disediakan
2. Copy semua isi file tersebut
3. Buka Supabase Dashboard > SQL Editor
4. Paste script dan klik "Run"
5. Pastikan tidak ada error

### Manual Setup (Opsional)
Jika ingin setup manual, lihat detail di file `supabase-setup.sql`

## 4. Verifikasi Setup
Setelah menjalankan script SQL, pastikan:

### Cek Tabel
- Buka Table Editor di Supabase
- Pastikan ada tabel `teachers` dan `lab_schedules`

### Cek Data Demo
- Tabel `teachers` harus ada beberapa guru demo
- Tabel `lab_schedules` mungkin ada jadwal demo

### Test Login
- Email: `guru1@sekolah.com`
- Password: `password123`

## 5. Troubleshooting

### Error "relation does not exist"
- Pastikan script SQL sudah dijalankan dengan benar
- Cek di Table Editor apakah tabel sudah ada

### Error "RLS policy violation"
- Script sudah mengatur RLS policies
- Jika masih error, cek policies di Authentication > Policies

### Error koneksi
- Pastikan URL dan anon key sudah benar
- Pastikan project Supabase aktif

## 6. Test Aplikasi
Setelah setup selesai, test aplikasi untuk memastikan:
- Login guru berfungsi
- Booking jadwal berfungsi  
- Admin dashboard berfungsi
- Import Excel berfungsi
- Laporan penggunaan berfungsi

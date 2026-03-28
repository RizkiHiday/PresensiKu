# 🌿 PresensiKu - Intelligent Biometric Attendance System

PresensiKu adalah platform manajemen absensi karyawan berbasis **AI Face Recognition** (Pengenalan Wajah) yang dirancang untuk modernisasi operasional HR. Dibangun dengan fokus pada presisi biometrik, keamanan tingkat tinggi, dan pengalaman pengguna (UI/UX) yang premium.

---

## 🚀 Fitur Utama

- **🛡️ Biometric Scanning:** Absensi menggunakan pemetaan wajah 128-titik secara real-time.
- **⚡ Anti-Spoofing (Liveness Detection):** Deteksi gerakan mikro otot wajah untuk mencegah manipulasi menggunakan foto atau video statis.
- **📊 Admin Dashboard:** Panel kendali lengkap untuk manajemen data karyawan, filter kehadiran, dan ringkasan statistik.
- **📂 HR Management:** Kelola Shift Kerja bervariasi, Jabatan, Divisi, dan Manajemen Pengajuan Cuti/Izin.
- **📄 Export Report:** Unduh laporan bulanan rekapitulasi absensi dalam format Excel (XLSX) yang siap pakai.
- **📱 Responsive UI:** Antarmuka modern yang dioptimalkan untuk akses dari Smartphone maupun Desktop.
- **🖼️ Profile Management:** Karyawan dapat mengelola informasi pribadi, mengunggah foto profil asli, dan mendaftarkan wajah biometrik mereka sendiri.

---

## 🛠️ Tech Stack

- **Backend:** [Laravel 13.x](https://laravel.com) (PHP 8.4+)
- **Frontend Stack:** [Inertia.js](https://inertiajs.com) + [React](https://reactjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) (Emerald/Teal Design System)
- **AI Core:** [Face-api.js](https://github.com/vladmandic/face-api) (TensorFlow.js based)
- **Icons:** [Lucide React](https://lucide.dev)
- **Database:** MySQL

---

## 📦 Panduan Instalasi

### 1. Persyaratan Sistem
- PHP >= 8.4
- Node.js & NPM
- Composer
- MySQL Server

### 2. Langkah Instalasi
```bash
# Clone repository
git clone https://github.com/username/PresensiKu.git

# Install dependencies (PHP & JS)
composer install
npm install

# Setup environtment
cp .env.example .env
php artisan key:generate

# Konfigurasi Database di .env
# DB_DATABASE=presensiku
# DB_USERNAME=root
# DB_PASSWORD=

# Migrasi & Seeding Data (Bersih)
php artisan migrate:fresh --seed

# Hubungkan Storage
php artisan storage:link

# Jalankan server pengembangan
npm run dev
php artisan serve
```

---

## 🗝️ Default Login Credentials

Gunakan data berikut untuk mencoba sistem setelah menjalankan seeder:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@presensiku.com` | `password` |
| **Karyawan** | `budi@presensiku.com` | `password123` |
| **Karyawan** | `siti@presensiku.com` | `password123` |

*(Cek `DatabaseSeeder.php` untuk daftar lengkap 10 nama karyawan real yang tersedia).*

---

## 📐 Arsitektur Biometrik
Sistem ini menggunakan algoritma **Euclidean Distance** untuk membandingkan deskriptor wajah (Face Embeddings) yang disimpan di database dengan wajah yang terdeteksi di kamera secara real-time.
- **Threshold:** Default 0.45 (Dapat diubah melalui Panel Pengaturan Admin).
- **Security:** Seluruh data titik koordinat wajah dienkripsi dan tidak disimpan dalam format gambar untuk menjaga privasi.

---

## 📄 Lisensi
Sistem ini bersifat Open Source di bawah lisensi **MIT License**.

---
<p align="center">Made with ❤️ for HR Modernization</p>

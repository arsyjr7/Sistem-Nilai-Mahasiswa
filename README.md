# 🎓 Sistem Nilai Mahasiswa

![GitHub repo size](https://img.shields.io/github/repo-size/arsyjr7/Sistem-Nilai-Mahasiswa?color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/arsyjr7/Sistem-Nilai-Mahasiswa?color=brightgreen)
![GitHub license](https://img.shields.io/github/license/arsyjr7/Sistem-Nilai-Mahasiswa?color=orange)

Aplikasi CRUD untuk mengelola data nilai mahasiswa berbasis **React Native (Expo)** dan **SQLite**.  
Mendukung input nilai TB1, TB2, dan UAS, dengan perhitungan bobot otomatis dan konversi ke grade.

---

## ✨ Fitur
- 📌 Tambah, edit, dan hapus data mahasiswa
- 🧮 Perhitungan nilai akhir:
  - TB1: 30%
  - TB2: 30%
  - UAS: 40%
- 🏆 Konversi nilai akhir menjadi grade (A, B+, B, C+, C, D)
- 💾 Penyimpanan data lokal menggunakan SQLite

---

## 📥 Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone https://github.com/arsyjr7/Sistem-Nilai-Mahasiswa.git

# 2. Masuk ke folder project
cd Sistem-Nilai-Mahasiswa

# 3. Install dependencies
npm install

# 4. Jalankan aplikasi
npx expo start

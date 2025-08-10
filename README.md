# 📚 Sistem Nilai Mahasiswa

Aplikasi CRUD sederhana untuk mengelola data nilai mahasiswa berbasis **React Native Expo** dengan penyimpanan **SQLite**.  
Aplikasi ini memungkinkan pengguna untuk menambahkan, melihat, mengedit, dan menghapus data mahasiswa beserta perhitungan nilai akhir dan grade secara otomatis.

---

## ✨ Fitur Utama
- ➕ **Tambah Data Mahasiswa** (Nama, NIM, Mata Kuliah, Nilai Tugas Besar 1, Nilai Tugas Besar 2, Nilai UAS)
- 📋 **Lihat Daftar Nilai** mahasiswa
- ✏️ **Edit Data** mahasiswa
- 🗑 **Hapus Data** mahasiswa
- 🧮 **Perhitungan Otomatis Nilai Akhir** berdasarkan bobot:
  - TB1 = 30%
  - TB2 = 30%
  - UAS = 40%
- 🎯 **Penentuan Grade Otomatis**:
  - A : ≥ 85
  - B+ : ≥ 80
  - B : ≥ 75
  - C+ : ≥ 70
  - C : ≥ 65
  - D : < 65
- 💾 **Penyimpanan Data Lokal** dengan SQLite (persisten walaupun aplikasi ditutup)

---
![Tampilan Aplikasi](assets/ss-app.png)

---

## 🛠️ Teknologi yang Digunakan
- [React Native](https://reactnative.dev/) (Expo)
- [Expo Router](https://expo.github.io/router/docs)
- [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (expo-sqlite)

---

## 📦 Instalasi & Menjalankan Aplikasi

1. **Clone Repository**
git clone https://github.com/arsyjr7/Sistem-Nilai-Mahasiswa.git
cd Sistem-Nilai-Mahasiswa

2. **Masuk ke folder project**
cd Sistem-Nilai-Mahasiswa

3. **Install dependencies**
npm install

4. **Jalankan aplikasi**
npx expo start

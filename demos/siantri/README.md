# 🍜 SiAntri Resto & Toko - Panduan Operasional Jangka Panjang

Sistem Antrean Pesanan & Daftar Makanan Toko Real-Time Multi-Device yang siap digunakan untuk operasional jangka panjang (24/7) di resto, kafe, depot, maupun toko UMKM.

---

## 🌟 Fitur Utama

1. **Penyimpanan Persisten Otomatis (`data/database.json`)**
   - Seluruh data menu makanan, tiket antrean pelanggan, riwayat panggilan, status meja dapur, dan laporan penjualan **tersimpan aman di disk**.
   - Data **tidak akan hilang** meskipun browser ditutup, di-refresh, atau laptop/PC dimatikan.
   - Dilengkapi fallback otomatis ke `localStorage` browser jika dibuka tanpa server.

2. **Sinkronisasi Real-Time Multi-Device (Server-Sent Events / SSE)**
   - **Pelanggan di Meja**: Memesan menu langsung dari smartphone mereka.
   - **Dapur / Chef Anton**: Layar pesanan masuk otomatis muncul tanpa reload.
   - **Kasir & Meja Pengambilan**: Mengubah status antrean & memanggil pelanggan.
   - **Layar TV Display**: Menampilkan nomor antrean berjalan + suara lonceng *chime* & panggilan suara (Text-to-Speech Bahasa Indonesia).

3. **Akses Jaringan Wi-Fi Lokal & QR Code**
   - Otomatis mendeteksi IP jaringan lokal (LAN/Wi-Fi).
   - Dilengkapi modal QR Code yang bisa langsung di-scan oleh kamera HP pelanggan dan staf.

---

## 🚀 Alamat Akses Aplikasi

| Tujuan | Alamat URL | Keterangan |
|---|---|---|
| **Komputer Kasir / Server** | `http://localhost:3000` | Akses langsung dari PC ini |
| **HP Pelanggan & Tablet Dapur** | `http://172.29.9.190:3000` | Akses via Wi-Fi yang sama |
| **Status & Info Server** | `http://localhost:3000/api/info` | Cek status & koneksi realtime |

*(Catatan: Jika IP Wi-Fi berubah, klik tombol badge **"Server Aktif"** di pojok kanan atas aplikasi untuk melihat IP terbaru dan QR Code).*

---

## 🛠️ Cara Menjalankan untuk Jangka Panjang

Tersedia beberapa cara praktis sesuai kebutuhan operasional:

### 1. Mode Latar Belakang (Sangat Direkomendasikan untuk Toko)
Klik 2x pada file:
```
start-background.vbs
```
- Server berjalan secara **senyap di latar belakang** tanpa memunculkan jendela hitam Command Prompt.
- Otomatis membuka browser ke `http://localhost:3000`.

### 2. Auto-Start Windows (Otomatis Aktif Saat Komputer Dinyalakan)
Klik 2x pada file:
```
setup-autostart.bat
```
- Mendaftarkan SiAntri ke folder Startup Windows.
- Setiap kali komputer toko dinyalakan di pagi hari, server SiAntri **langsung otomatis aktif** dan siap diakses oleh HP pelanggan dan layar TV tanpa perlu buka apa pun!
- Untuk menonaktifkannya, jalankan `remove-autostart.bat`.

### 3. Mode Terminal (Melihat Log Aktivitas)
Klik 2x pada file:
```
start.bat
```
- Menjalankan server dengan tampilan konsol untuk melihat log pesanan masuk dan panggilan antrean secara langsung.

### 4. Menghentikan Server
Jika ingin mematikan server yang sedang berjalan di latar belakang:
Klik 2x pada file:
```
stop-server.bat
```

---

## 🌐 Akses dari Luar Jaringan / Internet (Online 24/7)

Jika Anda ingin sistem antrean ini bisa diakses dari mana saja melalui internet:

### Opsi A: Cloudflare Tunnel (Gratis & Sangat Cepat)
1. Unduh `cloudflared` dari https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. Jalankan perintah di terminal:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. Anda akan mendapatkan URL HTTPS gratis resmi dari Cloudflare (contoh: `https://siantri-demo.trycloudflare.com`) yang bisa diakses dari internet di seluruh dunia.

### Opsi B: Deploy ke Cloud (Render / Railway / Vercel)
Aplikasi ini sudah dilengkapi `package.json` standar:
1. Upload folder ini ke GitHub.
2. Di **Render.com** atau **Railway.app**, pilih **New Web Service** -> pilih repo GitHub Anda.
3. Build command: (kosongkan)
4. Start command: `node server.js`
5. Aplikasi akan online 24 jam nonstop secara gratis di cloud.

---

## 📁 Struktur Berkas

```
siAntre/
├── index.html              # Frontend lengkap (Pelanggan, Dapur, TV Display, Admin)
├── server.js               # Backend Node.js native, SSE broadcaster & REST API
├── package.json            # Konfigurasi npm standard
├── data/
│   └── database.json       # Database persisten JSON (menu, antrean, rekap)
├── start.bat               # Launcher interaktif
├── start-background.vbs    # Launcher background senyap (24/7)
├── stop-server.bat         # Penghenti proses server
├── setup-autostart.bat     # Pemasang auto-start saat Windows boot
├── remove-autostart.bat    # Penghapus auto-start
└── README.md               # Dokumentasi lengkap
```

# AuraLens – DeFi Portfolio Companion (Chrome Extension)

AuraLens menganalisis portofolio DeFi Anda menggunakan AdEx AURA dan merekomendasikan strategi yang dapat ditindaklanjuti (APY, risiko, catatan) langsung di popup wallet.

## Struktur Folder

```
extension/
  assets/
    logo.svg
  popup/
    popup.html
  scripts/
    popup.js
  styles/
    popup.css
  manifest.json
  README.md
```

## Fitur Utama
- Manifest V3, UI modern dengan Inter, Light/Dark mode
- Tema aksen blue-dark; ikon header adaptif terhadap tema
- Modal Wallets: tambah, pilih aktif, hapus (persisten via `chrome.storage.local`)
- Persistensi `activeWalletIndex` agar wallet aktif bertahan setelah reload
- Integrasi AdEx AURA API:
  - `GET /api/portfolio/balances` untuk token + `balanceUSD`
  - `GET /api/portfolio/strategies` untuk rekomendasi strategi
  - Host permission: `https://aura.adex.network/*`
- Grafik portfolio doughnut (canvas custom, tanpa dependensi eksternal) dari top tokens `balanceUSD`
- Tab Strategies (terstruktur dan mudah dibaca):
  - Judul + badge risiko (low/moderate/high/opportunistic)
  - Chips berwarna: APY, Platforms, Networks, Operations
  - Note ditampilkan pada kotak khusus (terpisah dari chips)
  - Loading skeleton + error state (tanpa dummy saat gagal)
- Tab Assets: daftar token terurut `balanceUSD` dengan jumlah token dan nilai USD
- `#mainApp` scrollable; chart diperbesar agar lebih jelas

## Instalasi (Chrome/Edge)
1) Buka `chrome://extensions` (Edge: `edge://extensions`)
2) Aktifkan Developer mode
3) Klik “Load unpacked” → pilih folder `extension/`
4) Pin ekstensi lalu buka popup

Permissions:
- `storage` (menyimpan wallets & preferensi tema)
- `https://aura.adex.network/*` (fetch balances & strategies)

## Penggunaan
1) Klik ikon wallet di header → modal Wallets
2) Add alamat (0x...), lalu Select untuk menetapkan sebagai aktif
3) Lihat doughnut chart, Assets, dan Strategies ter-update otomatis dari AURA
4) Buka DevTools popup (Right click → Inspect) untuk log:
   - `[AURA] Balances response: …`
   - `[AURA] Strategies response: …`

## Pengembangan
- Tidak ada build step; edit langsung file berikut:
  - UI: `popup/popup.html`, `styles/popup.css`
  - Logika/API: `scripts/popup.js`
- Chart adalah canvas renderer lokal (tanpa Chart.js)
- Opsi API key: bisa ditambahkan kemudian ke settings dan diteruskan ke fungsi fetch (`apiKey` opsional)

## Troubleshooting
- Chart kosong: pastikan wallet aktif telah dipilih dan API AURA dapat diakses
- Tidak ada data strategi/balances: cek console popup untuk HTTP status (429/500) atau rate limit
- Izin host: pastikan `https://aura.adex.network/*` ada pada `manifest.json`

## Lisensi
MIT


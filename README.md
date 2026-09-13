# Full Page Screenshot

Ekstensi Chrome sederhana untuk mengambil screenshot **seluruh halaman web**, dari atas sampai bawah — bukan cuma bagian yang kelihatan di layar.

## Fitur

- Screenshot full-page otomatis (scroll + capture + gabung jadi satu gambar)
- Hasil langsung terunduh sebagai file PNG
- Tidak butuh server / API eksternal, semua diproses lokal di browser

## Demo

TODO

## Instalasi

Ekstensi ini belum dipublikasikan ke Chrome Web Store, jadi instalasinya manual lewat mode Developer:

1. **Download atau clone repo ini**
   ```bash
   git clone https://github.com/zakiburnama/full-page-screenshot-web-extension.git
   ```
   Atau klik tombol hijau **Code > Download ZIP** di halaman GitHub, lalu extract.

2. **Buka halaman extensions di Chrome**
   - Ketik `chrome://extensions` di address bar, atau
   - Menu (⋮) > Extensions > Manage Extensions

3. **Aktifkan Developer mode** (toggle di pojok kanan atas)

4. **Klik "Load unpacked"**, lalu pilih folder hasil clone/extract tadi

5. Ikon ekstensi akan muncul di toolbar Chrome. Selesai!

## Cara pakai

1. Buka halaman web yang mau di-screenshot
2. Klik ikon ekstensi di toolbar
3. Klik tombol **"Screenshot Seluruh Halaman"**
4. Tunggu prosesnya (tergantung panjang halaman), file PNG akan otomatis diunduh

## Keterbatasan

- Elemen `position: fixed` (navbar/header sticky) bisa terekam berulang di setiap potongan
- Konten lazy-load bisa terlewat jika baru muncul setelah delay capture
- Tidak bisa mengambil konten dari iframe cross-origin
- Halaman yang sangat panjang bisa menghasilkan file besar dan proses lebih lama

## Kontribusi

Pull request dan issue dipersilakan. Untuk perubahan besar, buka issue dulu untuk didiskusikan.

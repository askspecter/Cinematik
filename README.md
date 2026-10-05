# Cinematik

Website cerita sinematik berbasis scroll (HTML/CSS/JS murni, tanpa build step).

Struktur dan interaksinya terinspirasi dari pola landing page "scroll-story": layar loading,
scene canvas yang digerakkan oleh scroll, teks intro bergantian, subtitle EN/ID,
tombol SCROLL berputar, manifesto dengan efek reveal, CTA dengan efek mengetik,
dan timeline progres di footer. Semua kode, teks, dan karakter (Lumi) dibuat orisinal.

## Menjalankan

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Struktur

- `index.html` – markup & bagian (6 chapter)
- `css/style.css` – gaya, layout responsif
- `js/script.js` – teks EN/ID, animasi canvas, logika scroll

Ubah teks di objek `COPY` dalam `js/script.js`, dan ganti link `https://x.com/` dengan akun Anda.

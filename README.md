# HealthAI - AI Healthcare Assistant

HealthAI adalah aplikasi web full-stack untuk membantu pengguna mendapatkan panduan kesehatan awal (non-diagnostik) dari:

- Analisis gejala berbasis teks
- Analisis gambar kulit (multimodal)

Project ini dibangun dengan fokus pada stabilitas output AI: respons dipaksa terstruktur (JSON), diparsing secara robust, dan memiliki mekanisme retry ketika respons model terpotong.

## Fitur Unggulan

- Symptom Checker (text): menampilkan kemungkinan kondisi, tingkat keparahan, saran perawatan, dan kapan perlu ke dokter.
- Image Analysis (multimodal): analisis gambar + gejala tambahan untuk konteks lebih lengkap.
- Structured AI Output: respons AI dipaksa ke schema JSON agar konsisten di frontend.
- Resilient Parsing: parser menangani JSON tidak sempurna (code fence, trailing comma, key alias, field parsial).
- Auto Retry on Truncation: request ulang otomatis saat output terdeteksi malformed atau `finishReason = MAX_TOKENS`.
- Validation & Safety: validasi file upload (JPEG/PNG/GIF/WebP, max 2MB) dan disclaimer medis di setiap hasil.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, Multer
- AI: Google Gemini (`@google/genai`)

## Arsitektur Singkat

- `front-end/` menampilkan UI, mengelola state via custom hooks, dan memanggil API backend.
- `back-end/` menerima input user, memanggil Gemini, lalu menormalisasi output ke format terstruktur:
  - `condition`
  - `severity` (`mild | moderate | high`)
  - `advice`
  - `doctor_visit`
  - `disclaimer`

## Menjalankan Project (Local)

Prasyarat:

- Node.js 18+ (disarankan 20+)
- NPM
- Gemini API Key

### 1) Setup backend

```bash
cd hacktiv2Project
npm install
```

Buat file `.env` di root project:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Jalankan backend:

```bash
npm start
```

Backend aktif di `http://localhost:5000`.

### 2) Setup frontend

```bash
cd front-end
npm install
```

Buat `front-end/.env` (atau copy dari `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend aktif di `http://localhost:3001`.

## API Endpoints

- `GET /health` - health check backend
- `POST /api/chat` - analisis gejala text
  - body JSON: `{ "symptoms": "..." }`
- `POST /api/analyze-image` - analisis gambar + gejala
  - `multipart/form-data`
  - field: `image` (required), `symptoms` (optional)

## Catatan Portofolio

Poin engineering yang bisa ditonjolkan:

- Integrasi AI multimodal pada arsitektur web full-stack.
- Desain output terstruktur dengan schema validation.
- Hardening output pipeline AI (retry, sanitization, fallback yang aman).
- Peningkatan reliability UX meski model menghasilkan output parsial.

## Disclaimer

Aplikasi ini memberikan informasi kesehatan umum, bukan diagnosis medis. Pengguna tetap perlu konsultasi dengan tenaga kesehatan profesional.

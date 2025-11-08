# Resume Builder (React + Puppeteer PDF)

This project provides a full-stack resume builder:
- Create and edit resume data (summary, experience, skills, education)
- Preview the formatted resume in the browser (single US Letter page)
- Export an identical, full-bleed, single-page PDF with selectable text using Puppeteer

## Tech Stack
- Client: React 18 + TypeScript + Vite
- Server: Express + better-sqlite3 (embedded DB) + Puppeteer for PDF
- DB: SQLite file (`data.db`) created automatically with seed sample resume

## Why Puppeteer?
Puppeteer captures the actual rendered HTML/CSS so the PDF matches the on‑screen layout exactly and keeps selectable/searchable text (unlike image-based html2pdf). It avoids maintaining a second layout (react-pdf) while meeting the requirement of identical formatting and perfect page fill.

## Getting Started

### 1. Install dependencies
```powershell
cd server; npm install; cd ../client; npm install; cd ..
```
(Puppeteer will download Chromium; allow a few minutes.)

### 2. Run dev services
Open two terminals or use PowerShell background jobs:
```powershell
cd server; npm run dev
```
```powershell
cd client; npm run dev
```
Client: http://localhost:5173  Server API: http://localhost:5174

### 3. Usage
- Visit client root; a seeded sample resume appears.
- Click Edit to modify; Save & Preview.
- In Preview click Download PDF. Server calls Puppeteer to render `/preview/:id?pdf=1` and streams a PDF.

## API Endpoints
- `GET /api/resumes` list resumes
- `GET /api/resumes/:id` fetch resume
- `POST /api/resumes` create resume (JSON body)
- `PUT /api/resumes/:id` update resume
- `GET /api/resumes/:id/pdf` export PDF

## Customization
- Adjust colors/fonts in `client/src/styles.css`.
- Add fields: extend `types.ts`, DB schema (`db.js`), and form/UI.
- Deploy: host client (static) and server (Node). Set `CLIENT_ORIGIN` env var on server for correct internal navigation when generating PDFs.

## Environment Variables
- `CLIENT_ORIGIN` (optional) base URL Puppeteer should open (defaults to `http://localhost:5173`).

## Printing Consistency
Resume container sized with physical units (`8.5in x 11in`) ensuring perfect single-page fit. PDF uses zero margins + `printBackground: true` for full-bleed style.

## Notes
- For production consider launching Puppeteer with `--no-sandbox` only if required by host (and after security review).
- Large skill lists may overflow; trim or adjust font sizes.

## License
Internal/demo use only; add a license if you intend to distribute.

# NODE_REACT_ITPO_PRINT

Pass printing and QR verification system for 45th IITF (India International Trade Fair).

## Features

- **Employee Management**: CRUD operations with photo upload (JPG, PNG, WebP)
- **Excel Import**: Bulk import employees from `.xlsx` files (maps: PERSON NAME, DESIGNATION, EMAIL, COMPANY NAME, COUNTRY CODE, MOBILE NUMBER)
- **QR Code Generation**: Unique QR tokens (`PP-XXXXXXXX`) for each employee, embeds verification URL
- **Pass Preview**: IITF-themed pass cards with partner/focus states, dates, validity, ON DUTY band
- **Print**: Select multiple employees and print CR80-sized passes (85.6×54mm) with print CSS
- **QR Verification**: Scan QR code to verify employee identity — shows all details and logs the scan

## Tech Stack

- **Frontend**: React 18 + Vite + react-router-dom
- **Backend**: Express.js
- **Database**: SQLite (via Node's built-in `node:sqlite`)
- **QR Generation**: `qrcode` npm package
- **Excel Parsing**: `xlsx` npm package
- **File Uploads**: `multer` v2

## Installation

```bash
npm install
```

## Running

Development (both Vite dev server and Express API):
```bash
npm run dev
```

Production (serves built React app + API on port 3001):
```bash
npm run build
npm start
```

The app will be available at:
- Dev: http://localhost:5173 (Vite proxy to API at :3001)
- Prod: http://localhost:3001

## Database

SQLite database file: `server/printpass.db` (auto-created on first run)

Schema:
- `employees`: id, employee_code, full_name, mobile, designation, email, company, photo_path, qr_token, is_active, created_at
- `verification_logs`: id, employee_id, qr_token, was_valid, ip_address, verified_at

## API Endpoints

- `GET /api/employees?search=` — List employees (optional search)
- `POST /api/employees` — Create employee (multipart/form-data with `photograph` file)
- `PUT /api/employees/:id` — Update employee
- `DELETE /api/employees/:id` — Delete employee
- `POST /api/employees/import` — Import from Excel (multipart/form-data with `file`)
- `GET /api/dashboard` — Dashboard stats (employee count, verification count, recent logs)
- `GET /api/verify/:token` — Verify QR token (returns employee details and validity)
- `GET /uploads/*` — Serve uploaded photos

## Pass Design

Pass cards match the 45th IITF template:
- Header: IITF logo, "VIKAS aur VIRASAT Development & Heritage", dates (13-27 November 2026), venue (Bharat Mandapam, New Delhi)
- Partner States: BIHAR, MAHARASHTRA, RAJASTHAN & UTTAR PRADESH
- Focus States: ASSAM, DELHI, JHARKHAND & WEST BENGAL
- Body: Photo, name, employee ID, designation, company, email, mobile, QR code
- Footer: Gold band with "Validity: 13-11-2026 to 28-11-2026" and "ON DUTY" badge
- Lanyard slot at top

## License

MIT

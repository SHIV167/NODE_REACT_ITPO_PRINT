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
- **Database**: PostgreSQL (via `pg` npm package)
- **QR Generation**: `qrcode` npm package
- **Excel Parsing**: `xlsx` npm package
- **File Uploads**: `multer` v2

## Installation

```bash
npm install
```

## Database Setup

1. Install PostgreSQL on your system or use a cloud provider (Supabase, Neon, AWS RDS, etc.)
2. Create a database:
   ```sql
   CREATE DATABASE printpass;
   ```
3. Copy `.env.example` to `.env` and configure your connection:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/printpass
   ```

Tables are created automatically on first run (employees, verification_logs with indexes).

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

## Database Schema

**employees**:
- id (SERIAL PRIMARY KEY)
- employee_code (TEXT UNIQUE)
- full_name (TEXT)
- mobile (TEXT)
- designation (TEXT)
- email (TEXT)
- company (TEXT)
- photo_path (TEXT)
- qr_token (TEXT UNIQUE)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

**verification_logs**:
- id (SERIAL PRIMARY KEY)
- employee_id (INTEGER REFERENCES employees(id) ON DELETE SET NULL)
- qr_token (TEXT)
- was_valid (BOOLEAN)
- ip_address (TEXT)
- verified_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

Indexes on: employee_code, qr_token, verified_at (DESC)

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
- Header: ITF circle logo, ITPO logo, "45TH ITF", "VIKAS aur VIRASAT Development & Heritage", gradient dates band (13-27 November 2026), venue (Bharat Mandapam, New Delhi)
- Partner States: BIHAR, MAHARASHTRA, RAJASTHAN & UTTAR PRADESH
- Focus States: ASSAM, DELHI, JHARKHAND & WEST BENGAL
- Body: Photo, name, designation, company, email, mobile, QR code with token
- Footer: Gold gradient band with "Validity: 13-11-2026 to 28-11-2026" and "ON DUTY" badge
- Lanyard slot at top

## Print Options

- **Bulk print**: Multi-card grid (2 per page) for paper printing
- **Single print**: 1-up layout (one card per page) for PVC card printers
- **Download PNG**: Export card as high-res PNG for card printer software
- **Page size**: Select A4 or Letter in print dialog

## License

MIT

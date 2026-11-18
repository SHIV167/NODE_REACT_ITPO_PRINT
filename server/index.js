import express from 'express';
import multer from 'multer';
import QRCode from 'qrcode';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import xlsx from 'xlsx';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// ---- Photo uploads ----
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ['.jpg', '.jpeg', '.png', '.webp', '.xlsx', '.xls'].includes(ext);
    cb(ok ? null : new Error('Only JPG, PNG, WebP, XLSX or XLS files are allowed'), ok);
  },
});

app.use('/uploads', express.static(uploadDir));

// ---- Helpers ----
const newToken = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[crypto.randomInt(alphabet.length)];
  return `PP-${s}`;
};

const rowToEmployee = async (row, baseUrl) => ({
  id: row.id,
  employeeCode: row.employee_code,
  fullName: row.full_name,
  mobile: row.mobile,
  designation: row.designation,
  email: row.email,
  company: row.company,
  photoPath: row.photo_path,
  qrToken: row.qr_token,
  isActive: !!row.is_active,
  createdAt: row.created_at,
  qrDataUrl: await QRCode.toDataURL(`${baseUrl}/verify/${row.qr_token}`, { margin: 1, width: 220 }),
});

const baseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const findEmployee = db.prepare('SELECT * FROM employees WHERE id = ?');
const deletePhoto = (p) => { if (p) fs.unlink(path.join(uploadDir, path.basename(p)), () => {}); };

// ---- Employees ----
app.get('/api/employees', async (req, res) => {
  const { search = '' } = req.query;
  const like = `%${search}%`;
  const rows = db.prepare(`
    SELECT * FROM employees
    WHERE (? = '' OR full_name LIKE ? OR employee_code LIKE ? OR designation LIKE ?)
    ORDER BY full_name
  `).all(search, like, like, like);
  res.json(await Promise.all(rows.map((r) => rowToEmployee(r, baseUrl(req)))));
});

app.post('/api/employees', upload.single('photograph'), async (req, res) => {
  const { employeeCode, fullName, mobile, designation, email, company, isActive } = req.body;
  if (!employeeCode || !fullName || !mobile || !designation) {
    return res.status(400).json({ error: 'employeeCode, fullName, mobile and designation are required' });
  }
  try {
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = db.prepare(`
      INSERT INTO employees (employee_code, full_name, mobile, designation, email, company, photo_path, qr_token, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employeeCode, fullName, mobile, designation, email || null, company || null, photoPath, newToken(), isActive === undefined || isActive === 'true' || isActive === true ? 1 : 0);
    res.status(201).json(await rowToEmployee(findEmployee.get(result.lastInsertRowid), baseUrl(req)));
  } catch (e) {
    if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
    res.status(409).json({ error: e.message.includes('UNIQUE') ? 'Employee ID already exists' : e.message });
  }
});

app.put('/api/employees/:id', upload.single('photograph'), async (req, res) => {
  const existing = findEmployee.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { employeeCode, fullName, mobile, designation, email, company, isActive } = req.body;
  if (!employeeCode || !fullName || !mobile || !designation) {
    return res.status(400).json({ error: 'employeeCode, fullName, mobile and designation are required' });
  }

  let photoPath = existing.photo_path;
  if (req.file) {
    deletePhoto(existing.photo_path);
    photoPath = `/uploads/${req.file.filename}`;
  }

  try {
    db.prepare(`
      UPDATE employees SET employee_code=?, full_name=?, mobile=?, designation=?, email=?, company=?, photo_path=?, is_active=?
      WHERE id=?
    `).run(employeeCode, fullName, mobile, designation, email || null, company || null, photoPath,
      isActive === 'true' || isActive === true || isActive === '1' || isActive === 1 ? 1 : 0, req.params.id);
    res.json(await rowToEmployee(findEmployee.get(req.params.id), baseUrl(req)));
  } catch (e) {
    res.status(409).json({ error: e.message.includes('UNIQUE') ? 'Employee ID already exists' : e.message });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  const existing = findEmployee.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  deletePhoto(existing.photo_path);
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Excel import ----
app.post('/api/employees/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const inserted = [];
    const errors = [];

    rows.forEach((row, idx) => {
      try {
        const name = row['PERSON NAME']?.trim();
        const designation = row['DESIGNATION']?.trim();
        const email = row['EMAIL']?.trim() || null;
        const company = row['COMPANY NAME']?.trim() || null;
        const country = row['COUNTRY']?.trim() || '';
        const countryCode = row['COUNTRY CODE']?.trim() || '';
        const mobile = row['MOBILE NUMBER ']?.toString().trim() || '';

        if (!name || !designation || !mobile) {
          errors.push({ row: idx + 1, reason: 'Missing name, designation or mobile' });
          return;
        }

        const suffix = Math.floor(Math.random() * 9000) + 1000;
        const employeeCode = `${name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}${suffix}`;
        const fullMobile = `${countryCode}${mobile}`;

        db.prepare(`
          INSERT INTO employees (employee_code, full_name, mobile, designation, email, company, qr_token, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).run(employeeCode, name, fullMobile, designation, email, company, newToken());

        inserted.push({ row: idx + 1, name, employeeCode });
      } catch (e) {
        errors.push({ row: idx + 1, reason: e.message });
      }
    });

    fs.unlink(req.file.path, () => {});
    res.json({ inserted, errors, total: rows.length });
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: e.message });
  }
});

// ---- Dashboard ----
app.get('/api/dashboard', (req, res) => {
  const employeeCount = db.prepare('SELECT COUNT(*) AS n FROM employees').get().n;
  const verificationCount = db.prepare('SELECT COUNT(*) AS n FROM verification_logs').get().n;
  const recent = db.prepare(`
    SELECT l.*, e.full_name FROM verification_logs l
    LEFT JOIN employees e ON e.id = l.employee_id
    ORDER BY l.verified_at DESC LIMIT 10
  `).all();
  res.json({ employeeCount, verificationCount, recent });
});

// ---- Verify (QR scan landing) ----
app.get('/api/verify/:token', async (req, res) => {
  const { token } = req.params;
  const employee = db.prepare('SELECT * FROM employees WHERE qr_token = ?').get(token);
  const wasValid = !!employee && !!employee.is_active;

  db.prepare(`
    INSERT INTO verification_logs (employee_id, qr_token, was_valid, ip_address)
    VALUES (?, ?, ?, ?)
  `).run(employee?.id ?? null, token, wasValid ? 1 : 0, req.ip);

  res.json(employee
    ? { valid: wasValid, token, employee: await rowToEmployee(employee, baseUrl(req)) }
    : { valid: false, token, employee: null });
});

// ---- Static client (production build) ----
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => console.log(`PrintPass API on http://localhost:${PORT}`));

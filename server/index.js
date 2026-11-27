import express from 'express';
import multer from 'multer';
import QRCode from 'qrcode';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import xlsx from 'xlsx';
import { fileURLToPath } from 'node:url';
import { pool, initDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// ---- Photo uploads ----
const uploadDir = path.join(__dirname, 'uploads');
const photoDir = path.join(uploadDir, 'photos');
const excelDir = path.join(uploadDir, 'excel');
fs.mkdirSync(photoDir, { recursive: true });
fs.mkdirSync(excelDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      cb(null, isImage ? photoDir : excelDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${timestamp}_${baseName}${ext}`);
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
  isActive: row.is_active,
  createdAt: row.created_at,
  qrDataUrl: await QRCode.toDataURL(`${baseUrl}/verify/${row.qr_token}`, { margin: 1, width: 220 }),
});

const baseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const deletePhoto = (p) => {
  if (p) {
    const fullPath = path.join(uploadDir, p.replace('/uploads/', ''));
    fs.unlink(fullPath, () => {});
  }
};

// ---- Employees ----
app.get('/api/employees', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const like = `%${search}%`;
    const result = await pool.query(`
      SELECT * FROM employees
      WHERE ($1 = '' OR full_name ILIKE $2 OR employee_code ILIKE $2 OR designation ILIKE $2)
      ORDER BY full_name
    `, [search, like]);
    const rows = await Promise.all(result.rows.map((r) => rowToEmployee(r, baseUrl(req))));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/employees', upload.single('photograph'), async (req, res) => {
  try {
    const { employeeCode, fullName, mobile, designation, email, company, isActive } = req.body;
    if (!employeeCode || !fullName || !mobile || !designation) {
      return res.status(400).json({ error: 'employeeCode, fullName, mobile and designation are required' });
    }
    const photoPath = req.file ? `/uploads/photos/${req.file.filename}` : null;
    const result = await pool.query(`
      INSERT INTO employees (employee_code, full_name, mobile, designation, email, company, photo_path, qr_token, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [employeeCode, fullName, mobile, designation, email || null, company || null, photoPath, newToken(), isActive === undefined || isActive === 'true' || isActive === true]);
    res.status(201).json(await rowToEmployee(result.rows[0], baseUrl(req)));
  } catch (e) {
    if (req.file) fs.unlink(path.join(photoDir, req.file.filename), () => {});
    res.status(409).json({ error: e.message.includes('unique') ? 'Employee ID already exists' : e.message });
  }
});

app.put('/api/employees/:id', upload.single('photograph'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const { employeeCode, fullName, mobile, designation, email, company, isActive } = req.body;
    if (!employeeCode || !fullName || !mobile || !designation) {
      return res.status(400).json({ error: 'employeeCode, fullName, mobile and designation are required' });
    }

    let photoPath = existing.rows[0].photo_path;
    if (req.file) {
      deletePhoto(existing.rows[0].photo_path);
      photoPath = `/uploads/photos/${req.file.filename}`;
    }

    const result = await pool.query(`
      UPDATE employees SET employee_code=$1, full_name=$2, mobile=$3, designation=$4, email=$5, company=$6, photo_path=$7, is_active=$8
      WHERE id=$9
      RETURNING *
    `, [employeeCode, fullName, mobile, designation, email || null, company || null, photoPath,
      isActive === 'true' || isActive === true || isActive === '1' || isActive === 1, req.params.id]);
    res.json(await rowToEmployee(result.rows[0], baseUrl(req)));
  } catch (e) {
    res.status(409).json({ error: e.message.includes('unique') ? 'Employee ID already exists' : e.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    deletePhoto(existing.rows[0].photo_path);
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Dashboard ----
app.get('/api/dashboard', async (req, res) => {
  try {
    const employeeCount = (await pool.query('SELECT COUNT(*) AS n FROM employees')).rows[0].n;
    const verificationCount = (await pool.query('SELECT COUNT(*) AS n FROM verification_logs')).rows[0].n;
    const recent = (await pool.query(`
      SELECT l.*, e.full_name FROM verification_logs l
      LEFT JOIN employees e ON e.id = l.employee_id
      ORDER BY l.verified_at DESC LIMIT 10
    `)).rows;
    res.json({ employeeCount, verificationCount, recent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Verify (QR scan landing) ----
app.get('/api/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE qr_token = $1', [token]);
    const employee = result.rows[0];
    const wasValid = !!employee && employee.is_active;

    await pool.query(`
      INSERT INTO verification_logs (employee_id, qr_token, was_valid, ip_address)
      VALUES ($1, $2, $3, $4)
    `, [employee?.id || null, token, wasValid, req.ip]);

    res.json(employee
      ? { valid: wasValid, token, employee: await rowToEmployee(employee, baseUrl(req)) }
      : { valid: false, token, employee: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Excel import ----
app.post('/api/employees/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const inserted = [];
    const errors = [];

    for (const [idx, row] of rows.entries()) {
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
          continue;
        }

        const suffix = Math.floor(Math.random() * 9000) + 1000;
        const employeeCode = `${name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}${suffix}`;
        const fullMobile = `${countryCode}${mobile}`;

        await pool.query(`
          INSERT INTO employees (employee_code, full_name, mobile, designation, email, company, qr_token, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        `, [employeeCode, name, fullMobile, designation, email, company, newToken()]);

        inserted.push({ row: idx + 1, name, employeeCode });
      } catch (e) {
        errors.push({ row: idx + 1, reason: e.message });
      }
    }

    const savedPath = req.file.path.replace(/\\/g, '/').split('/uploads/')[1];
    res.json({ inserted, errors, total: rows.length, savedFile: savedPath });
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: e.message });
  }
});

// ---- Static client (production build) ----
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// ---- Start server ----
initDb().then(() => {
  app.listen(PORT, () => console.log(`PrintPass API on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

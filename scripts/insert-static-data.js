import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const staticEmployees = [
  { employeeCode: 'RAJEND3270', fullName: 'RAJENDRA SINGH', mobile: '+917291894689', designation: 'Housekeeping', email: 'rajendrasingh123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAJA8670', fullName: 'RAJA', mobile: '+919306505919', designation: 'Housekeeping', email: 'raja123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'SURESH5830', fullName: 'SURESH', mobile: '+918477081357', designation: 'Housekeeping', email: 'suresh123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'ABHISH5913', fullName: 'ABHISHEK TRIPATHI', mobile: '+919999999999', designation: 'Housekeeping', email: 'abhishek123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'GOTAM8339', fullName: 'Gotam', mobile: '+919999999999', designation: 'Housekeeping', email: 'gotam123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'ANKIT6332', fullName: 'Ankit', mobile: '+919999999999', designation: 'Housekeeping', email: 'ankit123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'LAXMAN3895', fullName: 'Laxman', mobile: '+919999999999', designation: 'Housekeeping', email: 'laxman123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAJAN5372', fullName: 'Rajan', mobile: '+919999999999', designation: 'Housekeeping', email: 'rajan123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'VINOD3736', fullName: 'Vinod', mobile: '+919999999999', designation: 'Housekeeping', email: 'vinod123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'BANSIL4270', fullName: 'Bansi lal', mobile: '+919999999999', designation: 'Housekeeping', email: 'bansi123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'DEEPAK9872', fullName: 'Deepak', mobile: '+919999999999', designation: 'Housekeeping', email: 'deepak123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'PAPPU3349', fullName: 'Pappu', mobile: '+919999999999', designation: 'Housekeeping', email: 'pappu123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'UMARSA3497', fullName: 'Umar sain', mobile: '+919999999999', designation: 'Housekeeping', email: 'umar123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAJEEV1304', fullName: 'Rajeev kumar', mobile: '+919999999999', designation: 'Housekeeping', email: 'rajeev123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'JAGESH8734', fullName: 'Jagesh kumar', mobile: '+919999999999', designation: 'Housekeeping', email: 'jagesh123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'AJAY2350', fullName: 'AJAY', mobile: '+919999999999', designation: 'Housekeeping', email: 'ajay123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'SANJEE7129', fullName: 'Sanjeev', mobile: '+919999999999', designation: 'Housekeeping', email: 'sanjeev123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'CHANDA6084', fullName: 'CHANDAN KUMAR', mobile: '+919999999999', designation: 'Housekeeping', email: 'chandan123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'HARIS6108', fullName: 'Haris', mobile: '+919999999999', designation: 'Housekeeping', email: 'haris123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'GAURAV8833', fullName: 'Gaurav', mobile: '+919999999999', designation: 'Housekeeping', email: 'gaurav123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'MAHIPA9049', fullName: 'Mahipal', mobile: '+919999999999', designation: 'Housekeeping', email: 'mahipal123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'SACHIN8024', fullName: 'Sachin', mobile: '+919999999999', designation: 'Housekeeping', email: 'sachin123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'VINODK1117', fullName: 'Vinod kumar', mobile: '+919999999999', designation: 'Housekeeping', email: 'vinodk123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'SWARAJ3301', fullName: 'SWARAJ', mobile: '+919999999999', designation: 'Housekeeping', email: 'swaraj123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'SANJAY6534', fullName: 'Sanjay', mobile: '+919999999999', designation: 'Housekeeping', email: 'sanjay123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAMRAK3843', fullName: 'Ramrakshpal', mobile: '+919999999999', designation: 'Housekeeping', email: 'ramrak123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'HUKAMS1713', fullName: 'Hukamsingh', mobile: '+919999999999', designation: 'Housekeeping', email: 'hukam123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'PRADEE5091', fullName: 'Pradeep kumar', mobile: '+919999999999', designation: 'Housekeeping', email: 'pradeep123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'DEEPUK7441', fullName: 'Deepu kumar', mobile: '+919999999999', designation: 'Housekeeping', email: 'deepuk123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'AJAY2516', fullName: 'Ajay', mobile: '+919999999999', designation: 'Housekeeping', email: 'ajay2516@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'GANGA8674', fullName: 'Ganga', mobile: '+919999999999', designation: 'Housekeeping', email: 'ganga123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAMDEV5390', fullName: 'Ram dev', mobile: '+919999999999', designation: 'Housekeeping', email: 'ramdev123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'ROHIT3398', fullName: 'Rohit', mobile: '+919999999999', designation: 'Housekeeping', email: 'rohit123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'PARAS1143', fullName: 'Paras', mobile: '+919999999999', designation: 'Housekeeping', email: 'paras123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'KULVAN8785', fullName: 'Kulvant', mobile: '+919999999999', designation: 'Housekeeping', email: 'kulvant123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAJU4717', fullName: 'Raju', mobile: '+919999999999', designation: 'Housekeeping', email: 'raju123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'RAJBAB1993', fullName: 'Raj Babu', mobile: '+919999999999', designation: 'Housekeeping', email: 'rajbab123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'MUKESH4060', fullName: 'Mukesh', mobile: '+919999999999', designation: 'Housekeeping', email: 'mukesh123@gmail.com', company: 'SONI MGT.' },
  { employeeCode: 'VICKY4621', fullName: 'Vicky', mobile: '+919999999999', designation: 'Housekeeping', email: 'vicky123@gmail.com', company: 'SONI MGT.' },
];

const newToken = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PP-${s}`;
};

const insertStaticData = async () => {
  try {
    // Clear existing data
    await pool.query('DELETE FROM verification_logs');
    await pool.query('DELETE FROM employees');
    console.log('Cleared existing data');

    // Insert static employees
    for (const emp of staticEmployees) {
      await pool.query(`
        INSERT INTO employees (employee_code, full_name, mobile, designation, email, company, qr_token, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, [emp.employeeCode, emp.fullName, emp.mobile, emp.designation, emp.email, emp.company, newToken()]);
    }

    const count = (await pool.query('SELECT COUNT(*) AS n FROM employees')).rows[0].n;
    console.log(`Inserted ${count} static employees`);
    console.log('Static data insertion complete');
  } catch (err) {
    console.error('Error inserting static data:', err);
  } finally {
    await pool.end();
  }
};

insertStaticData();

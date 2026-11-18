import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function VerifyResult() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.verify(token).then(setResult).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!result) return <p>Verifying…</p>;

  const emp = result.employee;

  return (
    <div className="verify-page">
      <div className="card center">
        <div className={`verdict ${result.valid ? 'verdict-ok' : 'verdict-bad'}`}>
          {result.valid ? '✔ Valid pass' : '✘ Invalid pass'}
        </div>
        {emp ? (
          <>
            {emp.photoPath && <img className="photo-lg" src={emp.photoPath} alt="" />}
            <h3>{emp.fullName}</h3>
            <table className="verify-table">
              <tbody>
                <tr><th>Employee ID</th><td>{emp.employeeCode}</td></tr>
                <tr><th>Designation</th><td>{emp.designation}</td></tr>
                {emp.company && <tr><th>Company</th><td>{emp.company}</td></tr>}
                {emp.email && <tr><th>Email</th><td>{emp.email}</td></tr>}
                <tr><th>Mobile</th><td>{emp.mobile}</td></tr>
                <tr><th>QR Token</th><td><code>{emp.qrToken}</code></td></tr>
                <tr><th>Status</th><td>{emp.isActive ? 'Active' : 'Inactive'}</td></tr>
                <tr><th>Validity</th><td>13-11-2026 to 28-11-2026</td></tr>
                <tr><th>Event</th><td>45th IITF, Bharat Mandapam, New Delhi</td></tr>
              </tbody>
            </table>
          </>
        ) : (
          <p className="muted">No employee found for token <code>{result.token}</code>.</p>
        )}
        <hr />
        <p className="muted small">Token: <code>{result.token}</code></p>
      </div>
      <div className="center mt-3">
        <Link className="btn btn-outline" to="/verify">Verify another</Link>
        <Link className="btn" to="/">Dashboard</Link>
      </div>
    </div>
  );
}

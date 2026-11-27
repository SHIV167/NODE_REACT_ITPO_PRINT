import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <p>Loading…</p>;

  return (
    <div className="page-wrapper">
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card stat-card">
          <h3>{data.employeeCount}</h3>
          <p className="muted">Employees</p>
          <Link className="btn btn-sm" to="/employees">Manage</Link>
        </div>
        <div className="card stat-card">
          <h3>{data.verificationCount}</h3>
          <p className="muted">Pass verifications</p>
          <Link className="btn btn-sm" to="/passes">Print passes</Link>
        </div>
        <div className="card stat-card">
          <h3>&nbsp;</h3>
          <p className="muted">Scan QR to verify</p>
          <Link className="btn btn-sm btn-outline" to="/verify">Verify token</Link>
        </div>
      </div>

      <div className="card">
        <h4>Recent verifications</h4>
        {data.recent.length === 0 ? (
          <p className="muted">No verifications recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Time (UTC)</th><th>Employee</th><th>Token</th><th>Result</th></tr>
            </thead>
            <tbody>
              {data.recent.map((v) => (
                <tr key={v.id}>
                  <td>{v.verified_at?.replace('T', ' ').slice(0, 16)}</td>
                  <td>{v.full_name ?? '—'}</td>
                  <td><code>{v.qr_token}</code></td>
                  <td>
                    <span className={`badge ${v.was_valid ? 'badge-ok' : 'badge-bad'}`}>
                      {v.was_valid ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

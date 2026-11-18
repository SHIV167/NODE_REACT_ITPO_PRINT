import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const load = () => {
    api.getEmployees(search).then(setEmployees).catch((e) => setError(e.message));
  };

  useEffect(load, [search]);

  const remove = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await api.deleteEmployee(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const importExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setError('');
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/employees/import', { method: 'POST', body: fd }).then((r) => r.json());
      setImportResult(res);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="page-head">
        <h2>Employees</h2>
        <div className="flex gap-2">
          <label className="btn btn-outline btn-sm">
            {importing ? 'Importing…' : 'Import Excel'}
            <input type="file" accept=".xlsx,.xls" disabled={importing} onChange={importExcel} style={{ display: 'none' }} />
          </label>
          <Link className="btn btn-primary btn-sm" to="/employees/new">Add employee</Link>
        </div>
      </div>

      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search name, ID, designation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {importResult && (
        <div className="alert alert-info">
          <strong>Import complete:</strong> {importResult.inserted.length} imported, {importResult.errors.length} errors.
          {importResult.errors.length > 0 && (
            <details className="mt-2">
              <summary>Errors</summary>
              <ul className="small mt-1">
                {importResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.reason}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Photo</th><th>Employee ID</th><th>Name</th><th>Designation</th>
            <th>Company</th><th>Email</th><th>Mobile</th><th>QR Token</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td>
                {e.photoPath
                  ? <img className="thumb" src={e.photoPath} alt="" />
                  : <span className="badge badge-muted">No photo</span>}
              </td>
              <td>{e.employeeCode}</td>
              <td>{e.fullName}</td>
              <td>{e.designation}</td>
              <td>{e.company || '-'}</td>
              <td>{e.email || '-'}</td>
              <td>{e.mobile}</td>
              <td><code>{e.qrToken}</code></td>
              <td>
                <span className={`badge ${e.isActive ? 'badge-ok' : 'badge-bad'}`}>
                  {e.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="actions">
                <Link className="btn btn-sm" to={`/employees/${e.id}/edit`}>Edit</Link>
                <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr><td colSpan="10" className="muted center">No employees found.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

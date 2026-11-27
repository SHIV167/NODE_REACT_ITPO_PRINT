import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selected, setSelected] = useState(new Set());

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

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected employee(s)?`)) return;
    try {
      await api.bulkDeleteEmployees([...selected]);
      setSelected(new Set());
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
    <div className="page-wrapper">
      <div className="page-header">
        <h2>Employees</h2>
        <div className="header-actions">
          <label className="btn btn-outline btn-sm">
            {importing ? 'Importing…' : 'Import Excel'}
            <input type="file" accept=".xlsx,.xls" disabled={importing} onChange={importExcel} style={{ display: 'none' }} />
          </label>
          <Link className="btn btn-primary btn-sm" to="/employees/new">Add employee</Link>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>{selected.size} selected</span>
          <button className="btn btn-danger btn-sm" onClick={bulkDelete}>Delete selected</button>
          <button className="btn btn-outline btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      <div className="card">
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
            {importResult.savedFile && (
              <div className="muted small mt-1">File saved: <code>{importResult.savedFile}</code></div>
            )}
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

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(employees.map((x) => x.id)) : new Set())} checked={employees.length > 0 && selected.size === employees.length} /></th>
                <th>Photo</th><th>Employee ID</th><th>Name</th><th>Designation</th>
                <th>Company</th><th>Email</th><th>Mobile</th><th>QR Token</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className={selected.has(e.id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} /></td>
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
                <tr><td colSpan="11" className="muted center">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

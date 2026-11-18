import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import PassCard from '../components/PassCard.jsx';

export default function Passes() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getEmployees(search)
      .then((list) => setEmployees(list.filter((e) => e.isActive)))
      .catch((e) => setError(e.message));
  }, [search]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allChecked = employees.length > 0 && employees.every((e) => selected.has(e.id));

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(employees.map((e) => e.id)));
  };

  const print = () => {
    if (selected.size === 0) return;
    navigate(`/print?ids=${[...selected].join(',')}`);
  };

  return (
    <>
      <div className="page-head">
        <h2>Passes</h2>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name, ID, designation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" disabled={selected.size === 0} onClick={print}>
          Print selected ({selected.size})
        </button>
        <button className="btn" onClick={toggleAll}>{allChecked ? 'Clear' : 'Select all'}</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {employees.length === 0 ? (
        <div className="alert alert-info">No active employees found.</div>
      ) : (
        <div className="pass-grid">
          {employees.map((e) => (
            <div className="pass-item" key={e.id}>
              <label className="pass-check">
                <input
                  type="checkbox"
                  checked={selected.has(e.id)}
                  onChange={() => toggle(e.id)}
                />
                Select
              </label>
              <PassCard employee={e} />
              <div className="muted small center">{e.qrToken}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PassCard from '../components/PassCard.jsx';

export default function Print() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((list) => setEmployees(list.filter((e) => ids.includes(String(e.id)) && e.isActive)));
  }, [ids]);

  return (
    <div className="print-page">
      <div className="no-print">
        <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
        <button className="btn" onClick={() => window.close()}>Close</button>
        <span className="muted small">Use "fit to page" if passes are cut off.</span>
      </div>
      <div className="pass-grid print-grid">
        {employees.map((e) => <PassCard key={e.id} employee={e} />)}
      </div>
    </div>
  );
}

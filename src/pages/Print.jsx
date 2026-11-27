import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PassCard from '../components/PassCard.jsx';

export default function Print() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const mode = params.get('mode') || 'bulk';
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((list) => setEmployees(list.filter((e) => ids.includes(String(e.id)) && e.isActive)));
  }, [ids]);

  const handlePrint = () => window.print();

  return (
    <div className="print-page">
      <div className="no-print">
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        <button className="btn" onClick={() => window.close()}>Close</button>
        <span className="muted small">Printer paper size will be used automatically.</span>
      </div>
      <div className={`pass-grid ${mode === 'single' ? 'print-single' : 'print-grid'}`}>
        {employees.map((e) => <PassCard key={e.id} employee={e} />)}
      </div>
    </div>
  );
}

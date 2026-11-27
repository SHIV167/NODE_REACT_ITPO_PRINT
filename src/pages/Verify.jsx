import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Verify() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (token.trim()) navigate(`/verify/${encodeURIComponent(token.trim())}`);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h2>Verify pass</h2>
      </div>
      <div className="card verify-card">
        <p className="muted">Enter the token printed below the QR code on the pass.</p>
        <form onSubmit={submit} className="inline-form">
          <input
            type="text"
            placeholder="e.g. PP-4F8K2QZ1"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <button className="btn btn-primary">Verify</button>
        </form>
        <hr />
        <p className="muted small">
          Normally no manual entry is needed — scanning the QR code with any phone
          camera opens the verification page automatically.
        </p>
      </div>
    </div>
  );
}

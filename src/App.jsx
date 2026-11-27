import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import Passes from './pages/Passes.jsx';
import Print from './pages/Print.jsx';
import Verify from './pages/Verify.jsx';
import VerifyResult from './pages/VerifyResult.jsx';
import Login from './pages/Login.jsx';
import { api } from './api.js';

function RequireAuth({ children }) {
  const [user, setUser] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    api.me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, [location.pathname]);

  if (user === undefined) return <div className="page-wrapper"><p>Loading…</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:token" element={<VerifyResult />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/employees/new" element={<EmployeeForm />} />
                  <Route path="/employees/:id/edit" element={<EmployeeForm />} />
                  <Route path="/passes" element={<Passes />} />
                  <Route path="/print" element={<Print />} />
                  <Route path="/verify" element={<Verify />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

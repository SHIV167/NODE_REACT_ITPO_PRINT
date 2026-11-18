import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import Passes from './pages/Passes.jsx';
import Print from './pages/Print.jsx';
import Verify from './pages/Verify.jsx';
import VerifyResult from './pages/VerifyResult.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/passes" element={<Passes />} />
        <Route path="/verify" element={<Verify />} />
      </Route>
      <Route path="/print" element={<Print />} />
      <Route path="/verify/:token" element={<VerifyResult />} />
    </Routes>
  );
}

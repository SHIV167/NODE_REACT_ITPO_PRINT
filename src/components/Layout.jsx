import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Layout() {
  const navigate = useNavigate();

  const logout = async () => {
    try { await api.logout(); } catch {}
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <span className="brand" onClick={() => navigate('/')}>PrintPass</span>
          <div className="nav-links">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/employees">Employees</NavLink>
            <NavLink to="/passes">Passes</NavLink>
            <NavLink to="/verify">Verify</NavLink>
            <button className="btn btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <span className="brand">PrintPass</span>
          <div className="nav-links">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/employees">Employees</NavLink>
            <NavLink to="/passes">Passes</NavLink>
            <NavLink to="/verify">Verify</NavLink>
          </div>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

import { NavLink } from "react-router-dom";
import { useState } from "react";

export function Navbar() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link d-flex align-items-center ${isActive ? "active" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-camera-reels me-2 fs-4"></i>
          <span className="fs-4">🎬 CineBrunão!</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto gap-2">
            <li className="nav-item">
              <NavLink to="/" className={getLinkClass} end>
                <i className="bi bi-house-door me-2"></i>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/filmes" className={getLinkClass}>
                <i className="bi bi-film me-2"></i>
                Filmes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/salas" className={getLinkClass}>
                <i className="bi bi-door-open me-2"></i>
                Salas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/sessoes" className={getLinkClass}>
                <i className="bi bi-calendar-event me-2"></i>
                Sessões
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/ingressos" className={getLinkClass}>
                <i className="bi bi-ticket-perforated me-2"></i>
                Ingressos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cinemas" className={getLinkClass}>
                <i className="bi bi-building me-2"></i>
                Cinemas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/lanches" className={getLinkClass}>
                <i className="bi bi-egg-fried me-2"></i>
                Lanches
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/combos" className={getLinkClass}>
                <i className="bi bi-basket me-2"></i>
                Combos
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <style>
        {`
          .navbar {
            background-color: var(--bs-tertiary-bg);
          }
          .nav-link {
            color: var(--bs-primary);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
          }
          .nav-link:hover {
            color: var(--bs-body-dark);
            background-color: var(--bs-light);
          }
          .nav-link.active {
            color: var(--bs-dark) !important;
            background-color: var(--bs-primary);
          }
          .navbar-brand {
            color: var(--bs-primary);
          }
        `}
      </style>
    </nav>
  );
}

// Sidebar.tsx

import { NavLink } from "react-router-dom";
import { BackendStatusBar } from "./BackendStatusBar";
import "./Sidebar.css";

const Sidebar = () => (
  <div className="sidebar">
    <nav className="nav">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/buscar-usuarios"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Buscar nuevos usuarios
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/chequear-hive-sbi"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Chequear usuario en Hive SBI
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ultimos-agregados"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Mostrar últimos agregados en HSBI
          </NavLink>
        </li>
      </ul>
    </nav>
    <BackendStatusBar />
  </div>
);

export default Sidebar;

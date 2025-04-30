import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BackendStatusBar } from "./BackendStatusBar";
import "./Sidebar.css";

const Sidebar = () => {
  const { isAuthenticated, user, logout, isLoadingAuth } = useAuth();

  return (
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
              to="/onboard-user"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Onboard Usuario
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
          {/* <li>
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
          </li> */}
        </ul>
      </nav>

      <div className="auth-status">
        {isLoadingAuth ? (
          <p>Loading auth...</p>
        ) : isAuthenticated ? (
          <div>
            <p>Logged in as: {user?.username}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <NavLink to="/login">
            <button>Go to Login</button>
          </NavLink>
        )}
      </div>

      <BackendStatusBar />
    </div>
  );
};

export default Sidebar;

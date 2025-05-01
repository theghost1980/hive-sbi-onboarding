import { NavLink } from "react-router-dom";
import styled from "styled-components";
import HSBIlogo from "../assets/logos/hsbi-logo.png";
import { useAuth } from "../context/AuthContext";
import { BackendStatusBar } from "./BackendStatusBar";

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Ocupa todo el espacio disponible */
  justify-content: flex-start; /* Alinea el contenido principal al inicio */
  padding: 20px 0; /* Añade padding superior e inferior para separar del borde del sidebar y el logo */
  /* El padding lateral se manejará dentro de StyledNav y StyledAuthStatus */
`;

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 0px;
  box-sizing: border-box;
  justify-content: space-between;
`;

const StyledNav = styled.nav`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 15px;

      a {
        display: block;
        padding: 10px 15px;
        color: #ecf0f1;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #34495e;
        }

        &.active {
          background-color: #1abc9c;
          color: #ffffff;
        }
      }
    }
  }
`;

const StyledAuthStatus = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #bdc3c7;

  p {
    font-size: 0.9em;
    margin-bottom: 10px;
    color: inherit;
  }

  button {
    background-color: #1abc9c;
    color: #ffffff;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9em;
    margin-bottom: 5px;

    &:hover {
      background-color: #16a085;
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

const StyledLogoutButton = styled.button`
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
  margin-top: 10px;

  &:hover {
    background-color: #c0392b;
  }
`;

const StyledLogo = styled.img`
  width: 150px; /* Ajusta el tamaño según necesites */
  height: auto; /* Mantiene la proporción */
  margin-bottom: 20px; /* Espacio debajo del logo */
  /* Si quieres centrar el logo horizontalmente dentro del sidebar */
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const Sidebar = () => {
  const { isAuthenticated, user, logout, isLoadingAuth } = useAuth();

  return (
    <StyledSidebar>
      <StyledMainContent>
        <StyledNav>
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
        </StyledNav>

        <StyledAuthStatus>
          {isLoadingAuth ? (
            <p>Loading auth...</p>
          ) : isAuthenticated ? (
            <div>
              <p>Logged in as: {user?.username}</p>
              <StyledLogoutButton onClick={logout}>Logout</StyledLogoutButton>
            </div>
          ) : (
            <NavLink to="/login">
              <button>Go to Login</button>
            </NavLink>
          )}
        </StyledAuthStatus>
      </StyledMainContent>

      <a
        href="https://www.hivesbi.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <StyledLogo src={HSBIlogo} alt="Logo de la comunidad HSBI de HIVE" />
      </a>
      <BackendStatusBar />
    </StyledSidebar>
  );
};

export default Sidebar;

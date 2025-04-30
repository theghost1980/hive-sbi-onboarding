import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { BackendStatusBar } from "./BackendStatusBar";

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

const Sidebar = () => {
  const { isAuthenticated, user, logout, isLoadingAuth } = useAuth();

  return (
    <StyledSidebar>
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

      <BackendStatusBar />
    </StyledSidebar>
  );
};

export default Sidebar;

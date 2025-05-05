import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import HSBIlogo from "../assets/logos/hsbi-logo.png";
import { useAuth } from "../context/AuthContext";
import { BackendStatusBar } from "./BackendStatusBar";

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  padding: 20px 0;
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
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const StyledLanguageSwitcher = styled.div`
  margin-top: 20px;
  text-align: center;

  button {
    background: none;
    border: 1px solid #ecf0f1;
    color: #ecf0f1;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease, color 0.3s ease;
    font-size: 0.9em;

    &:hover {
      background-color: #ecf0f1;
      color: #2c3e50;
    }
  }
`;

const Sidebar = () => {
  const { t, i18n, ready } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = ready ? i18n.language : i18n.language;
  const isSpanish = currentLanguage?.startsWith("es") || false;
  const targetLanguage = isSpanish ? "en" : "es";
  const targetLanguageLabel = isSpanish ? "English" : "Español";

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
                {t("sidebar.nav.home")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/onboard-user"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("sidebar.nav.onboard_user")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/buscar-usuarios"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("sidebar.nav.search_users")}
              </NavLink>
            </li>
          </ul>
        </StyledNav>
        <StyledLanguageSwitcher>
          <button onClick={() => changeLanguage(targetLanguage)}>
            {targetLanguageLabel}
          </button>
        </StyledLanguageSwitcher>
        <StyledAuthStatus>
          {isLoadingAuth ? (
            <p>{t("sidebar.auth_status.loading")}</p>
          ) : isAuthenticated ? (
            <div>
              <p>
                {t("sidebar.auth_status.logged_in_prefix")} {user?.username}
              </p>
              <StyledLogoutButton onClick={logout}>
                {t("sidebar.auth_status.logout_button")}
              </StyledLogoutButton>
            </div>
          ) : (
            <NavLink to="/login">
              <button>{t("sidebar.auth_status.go_to_login_button")}</button>
            </NavLink>
          )}
        </StyledAuthStatus>
      </StyledMainContent>
      <a
        href="https://www.hivesbi.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <StyledLogo src={HSBIlogo} alt={t("sidebar.alt.hsbi_logo")} />
      </a>
      <BackendStatusBar />
    </StyledSidebar>
  );
};

export default Sidebar;

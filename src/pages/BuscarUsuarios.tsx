import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next"; // Importa el hook useTranslation

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaAccessibleIcon, FaAngry, FaBaby } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import backendApi from "../api/Backend";
import CustomSelect from "../components/CustomSelect";
import UserItem from "../components/UserItem";
import { JWT_TOKEN_STORAGE_KEY, useAuth } from "../context/AuthContext";
import { Option } from "../types/selectors.type";

export interface Account {
  name: string;
  created?: string;
  account_created?: string;
  reputation_ui?: number;
  first_post_date?: string;
  total_posts?: number;
  avg_votes?: number;
}

// Elimina o comenta la definición global de options
// const options: Option[] = [...]

//TODO añade que el limite para la consulta "fish-new-limit" el usuario lo fije
//TODO pagination server side.

const StyledContainer = styled.div`
  padding: 20px;
`;

const StyledUserList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const spin = keyframes`
 to {
  transform: rotate(360deg);
 }
`;

const StyledLoadingSpinner = styled(AiOutlineLoading3Quarters)`
  animation: ${spin} 1s linear infinite;
  font-size: 2.5rem;
  color: #007bff;
  margin: 20px auto;
  display: block;
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  min-height: 100px;
  justify-content: center;
  text-align: center;

  p {
    margin-top: 10px;
    color: #555;
    font-size: 0.95rem;
  }
`;

const BuscarUsuarios = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState(
    localStorage.getItem(JWT_TOKEN_STORAGE_KEY)
  );

  const { user: onboarder, isAuthenticated, logout } = useAuth();

  const [showLongLoadingMessage, setShowLongLoadingMessage] =
    useState<boolean>(false);

  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  // Define options DENTRO del componente para usar t()
  const options: Option[] = [
    {
      value: "new-24-h",
      label: t("search_users_page.options.new_24h_label"), // Usa la clave de traducción
      icon: FaBaby,
    },
    {
      value: "fish-new",
      label: t("search_users_page.options.fish_new_label"), // Usa la clave de traducción
      icon: FaAccessibleIcon,
    },
    {
      value: "fish-new-limit",
      label: t("search_users_page.options.fish_new_limit_label"), // Usa la clave de traducción
      icon: FaAngry,
    },
  ];

  useEffect(() => {
    if (loading) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLongLoadingMessage(true);
      }, 10000);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      setShowLongLoadingMessage(false);
    }
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!selectedValue.trim().length) return;
      setLoading(true);
      try {
        const response: any = await backendApi.get(
          `/api/${selectedValue}`,
          true
        );
        if (response.results) {
          setAccounts(response.results);
        }
      } catch (error) {
        console.error(error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [selectedValue]);

  return (
    <StyledContainer>
      {/* Usa t() para el título principal */}{" "}
      <h1>{t("search_users_page.title")}</h1>{" "}
      <CustomSelect
        options={options} // options ahora está definido dentro del componente
        value={selectedValue}
        onChange={handleChange}
      />{" "}
      {loading ? (
        <StyledLoadingContainer>
          <StyledLoadingSpinner />{" "}
          {showLongLoadingMessage && (
            <p>{t("search_users_page.loading.long_message")}</p>
          )}{" "}
        </StyledLoadingContainer>
      ) : accounts.length > 0 ? (
        <StyledUserList>
          {" "}
          {accounts.map((account) => (
            <UserItem
              key={account.name}
              onboarded={account}
              onboarder={onboarder?.username}
              linkPeakdPrefix={"https://peakd.com/"}
              token={token}
            />
          ))}{" "}
        </StyledUserList>
      ) : (
        <p>{t("search_users_page.no_results_message")}</p>
      )}{" "}
    </StyledContainer>
  );
};

export default BuscarUsuarios;

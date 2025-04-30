import { useEffect, useRef, useState } from "react";
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

//TODO añade que el limite para la consulta "fish-new-limit" el usuario lo fije
const options: Option[] = [
  {
    value: "new-24-h",
    label: "Registrados en las últimas 24 horas",
    icon: FaBaby,
  },
  {
    value: "fish-new",
    label: "Registrados desde hace 30 días - Sin muchos votos",
    icon: FaAccessibleIcon,
  },
  {
    value: "fish-new-limit",
    label: "Registrados desde hace 30 días - Sin muchos votos - LIMITADO a 10",
    icon: FaAngry,
  },
];

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
  animation: ${spin} 1s linear infinite; /* Aplica la animación de giro */
  font-size: 2.5rem; /* Tamaño del spinner */
  color: #007bff; /* Color del spinner (puedes ajustarlo) */
  margin: 20px auto; /* Centra el spinner horizontalmente y añade margen */
  display: block; /* Asegura que 'margin: auto' funcione para centrar */
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  flex-direction: column; /* Apila los elementos verticalmente */
  align-items: center; /* Centra horizontalmente */
  margin-top: 20px; /* Espacio respecto al selector */
  min-height: 100px; /* Altura mínima para que se vea centrado */
  justify-content: center; /* Centra verticalmente si el contenedor tiene altura */
  text-align: center; /* Centra el texto dentro del párrafo */

  /* Estilos para el párrafo dentro de este contenedor */
  p {
    margin-top: 10px; /* Espacio entre el spinner y el texto */
    color: #555; /* Color para el texto */
    font-size: 0.95rem;
  }
`;

const BuscarUsuarios = () => {
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
      <h1>Buscar nuevos usuarios</h1>
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={handleChange}
      />

      {loading ? (
        <StyledLoadingContainer>
          <StyledLoadingSpinner />
          {showLongLoadingMessage && (
            <p>
              Esto está tardando un poco... ¡Seguro que los usuarios se están
              haciendo de rogar!
            </p>
          )}
        </StyledLoadingContainer>
      ) : accounts.length > 0 ? (
        <StyledUserList>
          {accounts.map((account) => (
            <UserItem
              key={account.name}
              onboarded={account}
              onboarder={onboarder?.username}
              linkPeakdPrefix={"https://peakd.com/"}
              token={token}
            />
          ))}
        </StyledUserList>
      ) : (
        <p>
          No se encontraron usuarios. O no se han hecho busquedas. Seleccione al
          menos una!
        </p>
      )}
    </StyledContainer>
  );
};

export default BuscarUsuarios;

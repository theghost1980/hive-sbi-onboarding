import { useEffect, useState } from "react";
import { FaAccessibleIcon, FaAngry, FaBaby } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import backendApi from "../api/backend";
import CustomSelect from "../components/CustomSelect";
import UserItem from "../components/UserItem";
import { JWT_TOKEN_STORAGE_KEY, useAuth } from "../context/AuthContext";
import { Option } from "../types/selectors.type";
import "./BuscarUsuarios.css";

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

const BuscarUsuarios = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState(
    localStorage.getItem(JWT_TOKEN_STORAGE_KEY)
  );

  const { user: onboarder, isAuthenticated, logout } = useAuth();

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!selectedValue.trim().length) return;
      setLoading(true);
      try {
        const response: any = await backendApi.get(
          `/api/${selectedValue}`,
          true
        );
        //TODO cleanup && handle 401???
        // console.log({ responseTest });
        // const response = await fetch(`${beBaseUrl}/api/${selectedValue}`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //   },
        // });
        // if (response.status === 401) {
        //   console.log(
        //     "Token expirado o inválido al cargar la lista. Redirigiendo a login."
        //   );
        //   logout();
        //   navigate("/login");
        // }
        // if (!response.ok) {
        //   throw new Error("Error al obtener los datos");
        // }
        // const resData = await response.json();
        // console.log({ resData });
        //TODO add execution_time + limit used
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
    <div className="buscar-usuarios">
      <h1>Buscar nuevos usuarios</h1>
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={handleChange}
      />

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : accounts.length > 0 ? (
        <ul className="user-list">
          {accounts.map((account) => (
            <UserItem
              key={account.name}
              onboarded={account}
              onboarder={onboarder?.username}
              linkPeakdPrefix={"https://peakd.com/"}
              token={token}
            />
          ))}
        </ul>
      ) : (
        <p>
          No se encontraron usuarios. O no se han hecho busquedas. Seleccione al
          menos una!
        </p>
      )}
    </div>
  );
};

export default BuscarUsuarios;

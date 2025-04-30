import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import backendApi from "../api/Backend";
import { HSBIApi } from "../api/HSBI";
import {
  BE_ONBOARDED_BY_USERNAME_EP,
  HSBI_API_MEMBERS_EP,
} from "../config/constants";
import { Account } from "../pages/BuscarUsuarios";
import OnboardModal from "./OnboardModal";

interface UserItemProps {
  onboarder: string | undefined;
  onboarded: Account;
  token: string | null;
  linkPeakdPrefix?: string;
}
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const StyledUserItem = styled.li`
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  position: relative;
  // Color sugerido para la card (el original era #f9f9f9)
  // Podríamos usar un blanco puro #fff, un gris muy claro como #f8f8f8
  // o incluso añadir una pequeña sombra para darle profundidad.
  // Mantengamos el original por ahora, pero considera añadir:
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9; /* Color de fondo de la card */
  list-style: none; /* Aseguramos que no tenga viñetas de lista si el ul padre no las quitó */
`;

const StyledUserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledUserName = styled.div`
  a {
    /* Estilos para el NavLink dentro de este div */
    font-weight: bold;
    color: #333; /* Color de texto para el nombre de usuario */
    text-decoration: none;
    font-size: 1.1rem;

    /* Opcional: Estilos hover si quieres algo diferente al global */
    /* &:hover {
      text-decoration: underline;
    } */
  }
`;

const StyledUserStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Estilos para los iconos, apuntando a sus clases */

  .loading-icon {
    /* Apunta a la clase 'loading-icon' */
    animation: ${spin} 1s linear infinite;
    font-size: 1.2rem;
    color: #999;
  }

  .member-icon {
    /* Apunta a la clase 'member-icon' */
    color: green;
    font-size: 1.2rem;
  }

  .non-member-icon {
    /* Apunta a la clase 'non-member-icon' */
    color: red;
    font-size: 1.2rem;
  }

  .check-icon {
    /* Apunta a la clase 'check-icon' (la imagen) */
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  /* Mantén los estilos para el botón si también lo estilizaras aquí,
     aunque ya creamos StyledOnboardButton aparte, que es más limpio. */
`;

const StyledOnboardButton = styled.button`
  background-color: #007bff; /* Color de fondo del botón */
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s ease; /* Suaviza el efecto hover */

  &:hover {
    background-color: #0056b3; /* Color de fondo al pasar el ratón */
  }
`;

const StyledUserDetails = styled.div`
  /* Este contenedor solo necesita margen superior según el CSS original */
  margin-top: 0.4rem;
  /* Si quisieras que los detalles se muestren en una rejilla (grid), aquí lo configurarías:
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); // Ejemplo de grid responsivo
  gap: 0.5rem; // Espacio entre ítems del grid
  */
`;

const StyledUserDetail = styled.div`
  /* El margen superior ya lo puede dar el contenedor padre o un gap en grid */
  /* margin-top: 0.4rem; */ // Lo quitamos si usamos gap en el padre o si ya está en el padre
  color: #444; /* Color de texto general para el detalle */
  font-size: 0.95rem;

  display: flex; /* Del CSS original */
  align-items: center; /* Del CSS original */
  gap: 0.5rem; /* Del CSS original */

  /* Estilos para el span con clase 'detail-label' */
  .detail-label {
    color: #222; /* Color para la etiqueta (originalmente en strong) */
    min-width: 140px; /* Ancho mínimo para la etiqueta (originalmente en strong) */
    display: inline-block; /* Permite min-width (originalmente en strong) */
    font-weight: bold; /* Hacemos la etiqueta negrita (originalmente en strong) */
  }

  /* Estilos para el span con clase 'detail-value' */
  .detail-value {
    /* No hay estilos específicos para el valor en el CSS original */
    /* Flex-grow podría ser útil si quieres que ocupe el espacio restante */
    /* flex-grow: 1; */
  }
`;

// --- Fin de los estilos ---

const UserItem: React.FC<UserItemProps> = ({
  onboarded,
  onboarder,
  token,
  linkPeakdPrefix,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);

  const handleCheckMembership = async () => {
    setIsChecking(true);

    try {
      const responseUsername: any = await HSBIApi.get(
        `${HSBI_API_MEMBERS_EP}${onboarded.name}/`
      );
      if (responseUsername.account) setIsMember(true);
    } catch (error: any) {
      if (error.message.includes("404")) {
        const response: any = await backendApi.get(
          `${BE_ONBOARDED_BY_USERNAME_EP}/?username=${onboarded.name}`
        );
        if (response && response.length > 0) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
      } else {
        console.log("Error OnboardUser fetch", { error });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString?: string): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formattedCreatedDate = formatDate(
    onboarded.created || onboarded.account_created
  );
  const formattedFirstPostDate = formatDate(onboarded.first_post_date);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!onboarder) return null;

  return (
    <StyledUserItem>
      <StyledUserHeader>
        <StyledUserName>
          {linkPeakdPrefix ? (
            <NavLink
              target="_blank"
              rel="noopener noreferrer"
              to={`${linkPeakdPrefix}@${onboarded.name}`}
            >
              @{onboarded.name}
            </NavLink>
          ) : (
            `@${onboarded.name}`
          )}
        </StyledUserName>
        <StyledUserStatus>
          {isChecking ? (
            <AiOutlineLoading3Quarters className="loading-icon" />
          ) : isMember === true ? (
            <FaCheckCircle className="member-icon" title="Miembro de HSBI" />
          ) : isMember === false ? (
            <>
              <FaTimesCircle
                className="non-member-icon"
                title="No es miembro de HSBI"
              />

              <StyledOnboardButton onClick={openModal}>
                On-board
              </StyledOnboardButton>
              <OnboardModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                username={onboarded.name}
                onboarderUsername={onboarder}
              />
            </>
          ) : (
            <img
              src="https://files.peakd.com/file/peakd-hive/theghost1980/23yJXfDYQfGae8EdUPf7jX6B564dxmTSKr9qfUnH3MsAmPkhNSZ3Yo2irSw33WChfnC9m.png"
              alt="Verificar membresía"
              className="check-icon"
              onClick={handleCheckMembership}
              title="Verificar membresía HSBI"
            />
          )}
        </StyledUserStatus>
      </StyledUserHeader>
      <StyledUserDetails>
        {formattedCreatedDate && (
          <StyledUserDetail>
            <span className="detail-label">📅 Registrado:</span>
            <span className="detail-value">{formattedCreatedDate}</span>
          </StyledUserDetail>
        )}
        {formattedFirstPostDate && (
          <StyledUserDetail>
            <span className="detail-label">📝 Primer post:</span>
            <span className="detail-value">{formattedFirstPostDate}</span>
          </StyledUserDetail>
        )}
        {onboarded.reputation_ui !== undefined && (
          <StyledUserDetail>
            <span className="detail-label">⭐ Reputación:</span>
            <span className="detail-value">{onboarded.reputation_ui}</span>
          </StyledUserDetail>
        )}
        {onboarded.total_posts !== undefined && (
          <StyledUserDetail>
            <span className="detail-label">🧾 Posts:</span>
            <span className="detail-value">{onboarded.total_posts}</span>
          </StyledUserDetail>
        )}
        {onboarded.avg_votes !== undefined && (
          <StyledUserDetail>
            <span className="detail-label">📊 Promedio votos:</span>
            <span className="detail-value">
              {onboarded.avg_votes.toFixed(2)}
            </span>
          </StyledUserDetail>
        )}
      </StyledUserDetails>
    </StyledUserItem>
  );
};

export default UserItem;

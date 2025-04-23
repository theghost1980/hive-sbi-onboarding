import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Account } from "../pages/BuscarUsuarios";
import OnboardModal from "./OnboardModal";
import "./UserItem.css";

interface UserItemProps {
  account: Account;
  linkPeakdPrefix?: string;
}

const UserItem: React.FC<UserItemProps> = ({ account, linkPeakdPrefix }) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);

  const handleCheckMembership = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `https://api.hivesbi.com/v1/members/${account.name}/`
      );
      setIsMember(response.status === 404 ? false : true);
    } catch (error) {
      console.error("Error al verificar membresía:", error);
      setIsMember(false);
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
    account.created || account.account_created
  );
  const formattedFirstPostDate = formatDate(account.first_post_date);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <li className="user-item">
      <div className="user-header">
        <div className="user-name">
          {linkPeakdPrefix ? (
            <NavLink
              target="_blank"
              rel="noopener noreferrer"
              to={`${linkPeakdPrefix}@${account.name}`}
            >
              @{account.name}
            </NavLink>
          ) : (
            `@${account.name}`
          )}
        </div>
        <div className="user-status">
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
              <button className="onboard-button" onClick={openModal}>
                On-board
              </button>
              <OnboardModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                username={account.name}
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
        </div>
      </div>
      <div className="user-details-grid">
        {formattedCreatedDate && (
          <div className="user-detail">
            <span className="detail-label">📅 Registrado:</span>
            <span className="detail-value">{formattedCreatedDate}</span>
          </div>
        )}
        {formattedFirstPostDate && (
          <div className="user-detail">
            <span className="detail-label">📝 Primer post:</span>
            <span className="detail-value">{formattedFirstPostDate}</span>
          </div>
        )}
        {account.reputation_ui !== undefined && (
          <div className="user-detail">
            <span className="detail-label">⭐ Reputación:</span>
            <span className="detail-value">{account.reputation_ui}</span>
          </div>
        )}
        {account.total_posts !== undefined && (
          <div className="user-detail">
            <span className="detail-label">🧾 Posts:</span>
            <span className="detail-value">{account.total_posts}</span>
          </div>
        )}
        {account.avg_votes !== undefined && (
          <div className="user-detail">
            <span className="detail-label">📊 Promedio votos:</span>
            <span className="detail-value">{account.avg_votes.toFixed(2)}</span>
          </div>
        )}
      </div>
    </li>
  );
};

export default UserItem;

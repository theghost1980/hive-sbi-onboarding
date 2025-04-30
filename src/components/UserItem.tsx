import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import backendApi from "../api/Backend";
import { HSBIApi } from "../api/HSBI";
import {
  BE_ONBOARDED_BY_USERNAME_EP,
  HSBI_API_MEMBERS_EP,
} from "../config/constants";
import { Account } from "../pages/BuscarUsuarios";
import OnboardModal from "./OnboardModal";
import "./UserItem.css";

interface UserItemProps {
  onboarder: string | undefined;
  onboarded: Account;
  token: string | null;
  linkPeakdPrefix?: string;
}

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
    <li className="user-item">
      <div className="user-header">
        <div className="user-name">
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
        {onboarded.reputation_ui !== undefined && (
          <div className="user-detail">
            <span className="detail-label">⭐ Reputación:</span>
            <span className="detail-value">{onboarded.reputation_ui}</span>
          </div>
        )}
        {onboarded.total_posts !== undefined && (
          <div className="user-detail">
            <span className="detail-label">🧾 Posts:</span>
            <span className="detail-value">{onboarded.total_posts}</span>
          </div>
        )}
        {onboarded.avg_votes !== undefined && (
          <div className="user-detail">
            <span className="detail-label">📊 Promedio votos:</span>
            <span className="detail-value">
              {onboarded.avg_votes.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </li>
  );
};

export default UserItem;

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import { beBaseUrl } from "../config/constants";

type Status = "checking" | "online" | "offline";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const StyledStatusBar = styled.div`
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledStatusText = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  p {
    margin: 0;
  }
`;

const StyledStatusUrl = styled.p`
  margin-top: 8px;
  font-size: 12px;
  color: inherit;

  a {
    color: inherit;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledSpinnerIcon = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  font-size: 16px;
  color: ${(props) => props.color || "gray"};
`;

const StyledCheckIcon = styled(FaCheckCircle)`
  font-size: 16px;
  color: ${(props) => props.color || "green"};
`;

const StyledWarningIcon = styled(FaExclamationTriangle)`
  font-size: 16px;
  color: ${(props) => props.color || "red"};
`;

export const BackendStatusBar = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("checking");
  const [backendUrl, setBackendUrl] = useState<string>("");

  useEffect(() => {
    const checkBackend = async () => {
      const url = `${beBaseUrl}/`;
      setBackendUrl(beBaseUrl!);

      try {
        const res = await fetch(url);
        if (res.ok) {
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch (err) {
        setStatus("offline");
      }
    };

    checkBackend();
  }, []);

  const getStatusProps = () => {
    switch (status) {
      case "checking":
        return {
          icon: StyledSpinnerIcon,
          text: t("backend_status_bar.checking_status_text"),
          color: "gray",
        };
      case "online":
        return {
          icon: StyledCheckIcon,
          text: t("backend_status_bar.online_status_text"),
          color: "green",
        };
      case "offline":
        return {
          icon: StyledWarningIcon,
          text: t("backend_status_bar.offline_status_text"),
          color: "red",
        };
      default:
        return {
          icon: null,
          text: "",
          color: "gray",
        };
    }
  };

  const { icon: StatusIconComponent, text, color } = getStatusProps();

  return (
    <StyledStatusBar>
      <StyledStatusText>
        <p>{text}</p>
        {StatusIconComponent && <StatusIconComponent color={color} />}
      </StyledStatusText>
      <StyledStatusUrl>
        {t("backend_status_bar.available_at_prefix")}
        <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">
          {backendUrl}
        </a>
      </StyledStatusUrl>
    </StyledStatusBar>
  );
};

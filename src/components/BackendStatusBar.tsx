import { useEffect, useState } from "react";
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
          text: "Verificando conexión...",
          color: "gray",
        };
      case "online":
        return {
          icon: StyledCheckIcon,
          text: "Backend disponible",
          color: "green",
        };
      case "offline":
        return {
          icon: StyledWarningIcon,
          text: "Backend no disponible",
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
        Disponible en:{" "}
        <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">
          {backendUrl}
        </a>
      </StyledStatusUrl>
    </StyledStatusBar>
  );
};

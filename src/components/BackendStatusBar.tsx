import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { config } from "../config/config";
import "./BackendStatusBar.css";

type Status = "checking" | "online" | "offline";

export const beBaseUrl = config.backend.local;

export const BackendStatusBar = () => {
  const [status, setStatus] = useState<Status>("checking");
  const [backendUrl, setBackendUrl] = useState<string>("");

  useEffect(() => {
    const checkBackend = async () => {
      const url = `${beBaseUrl}/`;
      setBackendUrl(beBaseUrl);

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
          icon: FaSpinner,
          text: "Verificando conexión...",
          color: "gray",
        };
      case "online":
        return {
          icon: FaCheckCircle,
          text: "Backend disponible",
          color: "green",
        };
      case "offline":
        return {
          icon: FaExclamationTriangle,
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

  const { icon, text, color } = getStatusProps();

  return (
    <div className={"statusBar"}>
      <div className={"statusText"}>
        <p>{text}</p>
        {icon && React.createElement(icon, { color })}
      </div>
      <p className={"statusUrl"}>
        Disponible en:
        <a
          className="link"
          href={`${backendUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {backendUrl}
        </a>
      </p>
    </div>
  );
};

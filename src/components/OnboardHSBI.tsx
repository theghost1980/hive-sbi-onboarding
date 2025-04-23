import React from "react";
import { useParams } from "react-router-dom";
import "./OnboardHSBI.css";

const OnboardHSBI: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Onboard HSBI</h2>
      <p>
        Usuario: <strong>@{username}</strong>
      </p>
    </div>
  );
};

export default OnboardHSBI;

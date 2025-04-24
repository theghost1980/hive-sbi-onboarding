import React, { useState } from "react";
import { HiveApi } from "../api/HIveApi";
import OnboardModal from "../components/OnboardModal";
import { useAuth } from "../context/AuthContext";
import "./OnBoardUser.css";

interface HiveAccount {
  name: string;
}

const OnBoardUser: React.FC = () => {
  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<HiveAccount | null>(null);

  // *** Nuevos estados para la verificación de membresía ***
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  // null: no verificado, true: es miembro, false: no es miembro (API retornó 404)
  const [isMember, setIsMember] = useState<boolean | null>(null);
  // Mensaje de error si falla la verificación de membresía
  const [membershipCheckError, setMembershipCheckError] = useState<
    string | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserToOnboard, setSelectedUserToOnboard] = useState<
    string | null
  >(null);

  const { user: onboarder } = useAuth();
  const onboarderUsername = onboarder?.username || "unknown";

  // *** Función para verificar si un usuario es miembro de HSBI ***
  const checkMembership = async (username: string) => {
    setIsCheckingMembership(true);
    setIsMember(null); // Resetear estado de membresía
    setMembershipCheckError(null); // Limpiar error anterior de membresía

    try {
      // API de HSBI v1 para miembros. Retorna 404 si no existe.
      const response = await fetch(
        `https://api.hivesbi.com/v1/members/${username}/`
      );

      if (response.ok) {
        // Si la respuesta es 2xx (ej: 200), el usuario es miembro.
        setIsMember(true);
        setMembershipCheckError(null);
        console.log(`User @${username} IS a member of HSBI.`);
      } else if (response.status === 404) {
        // Si la respuesta es 404, el usuario NO es miembro.
        setIsMember(false);
        setMembershipCheckError(null);
        console.log(`User @${username} IS NOT a member of HSBI (Status 404).`);
      } else {
        // Otros códigos de estado de error de la API de HSBI.
        setIsMember(null); // No pudimos determinar la membresía
        setMembershipCheckError(
          `HSBI API error checking membership (Status: ${response.status})`
        );
        console.error(
          `HSBI API error checking membership for @${username}. Status: ${response.status}`
        );
      }
    } catch (error: any) {
      // Errores de red, etc.
      setIsMember(null); // No pudimos determinar la membresía
      setMembershipCheckError(
        `Network error checking membership: ${error.message || "Unknown error"}`
      );
      console.error(
        `Network error checking membership for @${username}:`,
        error
      );
    } finally {
      setIsCheckingMembership(false); // Finalizar estado de carga de membresía
    }
  };

  // *** Función principal para manejar la búsqueda ***
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    // Limpiar estados al iniciar una nueva búsqueda
    setFoundUser(null);
    setError(null);
    setIsMember(null); // Resetear estado de membresía
    setMembershipCheckError(null); // Limpiar error de membresía

    const trimmedUsername = usernameInput.trim().toLowerCase();
    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }

    setIsLoading(true); // Iniciar carga de búsqueda principal

    try {
      // 1. Buscar usuario en Hive
      const accounts = await HiveApi.getAccount(trimmedUsername);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const userData: HiveAccount = {
          name: account.name,
        };
        setFoundUser(userData);
        setError(null); // No error principal

        // *** 2. Si se encuentra el usuario, verificar membresía ***
        await checkMembership(userData.name); // Esperar a que termine la verificación de membresía
      } else {
        // Usuario no encontrado en Hive
        setError(`User "@${trimmedUsername}" not found on Hive.`);
        setFoundUser(null);
        setIsMember(null); // Asegurarse de que el estado de membresía no quede residual
      }
    } catch (err: any) {
      // Manejar errores de la búsqueda principal
      console.error("Error fetching account:", err);
      setError(
        `Error searching for user: ${err.message || "An API error occurred"}`
      );
      setFoundUser(null);
      setIsMember(null); // Asegurarse de que el estado de membresía no quede residual
    } finally {
      setIsLoading(false); // Finalizar carga de búsqueda principal
      // isCheckingMembership se gestiona dentro de checkMembership
    }
  };

  const handleOpenModal = (usernameToOnboard: string) => {
    setSelectedUserToOnboard(usernameToOnboard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserToOnboard(null);
  };

  return (
    <div className="onboard-user-container">
      <h1>Onboard User</h1>

      <form onSubmit={handleSearch} className="user-search-form">
        <input
          type="text"
          placeholder="Enter Hive username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          // Deshabilitar durante cualquiera de las cargas
          disabled={isLoading || isCheckingMembership}
          className="search-input"
        />
        {/* Cambiar texto y deshabilitar durante ambas cargas */}
        <button
          type="submit"
          disabled={isLoading || isCheckingMembership || !usernameInput.trim()}
          className="search-button"
        >
          {isLoading
            ? "Searching..."
            : isCheckingMembership
            ? "Checking Membership..."
            : "Search User"}
        </button>
      </form>

      {/* Mostrar estado de búsqueda principal y errores */}
      {isLoading && <p className="search-status">Searching Hive...</p>}
      {error && <p className="search-error">Error: {error}</p>}

      {/* *** Mostrar resultado de usuario y estado de membresía *** */}
      {foundUser && (
        <div className="user-result">
          <p>
            User found: <strong>@{foundUser.name}</strong>
          </p>

          {/* Mostrar estado de verificación de membresía */}
          {isCheckingMembership ? (
            <p className="membership-status">Checking membership...</p>
          ) : isMember === null && membershipCheckError ? (
            <p className="membership-error">
              Membership check failed: {membershipCheckError}
            </p>
          ) : isMember === true ? (
            <div className="membership-status">
              <span className="membership-status-icon is-member-icon">✓</span>
              <p>Already a member of HSBI.</p>
            </div>
          ) : isMember === false ? (
            <div className="membership-status">
              <span className="membership-status-icon not-member-icon">✗</span>
              <p>Not yet a member of HSBI.</p>

              <button
                onClick={() => handleOpenModal(foundUser.name)}
                className="onboard-button"
              >
                Onboard @{foundUser.name}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {isModalOpen && selectedUserToOnboard && (
        <OnboardModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          username={selectedUserToOnboard} // Pasamos el usuario encontrado al modal
          onboarderUsername={onboarderUsername} // Pasamos el usuario que apadrina (loggeado)
        />
      )}
    </div>
  );
};

export default OnBoardUser;

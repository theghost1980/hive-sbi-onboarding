import React from "react";

interface Step1Props {
  onNext: () => void;
  onReset: () => void;
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
  onCancel: () => void;
  onTransactionInitiated?: () => void;
  onTransactionComplete?: (response: any) => void;
  onTransactionError?: (message: string) => void;
}

const Step1: React.FC<Step1Props> = ({
  onNext,
  onReset,
  username,
  onboarderUsername,
  isKeychainAvailable,
  onTransactionInitiated,
  onTransactionComplete,
  onTransactionError,
  onCancel,
}) => {
  const handlePayWithKeychain = () => {
    if (!isKeychainAvailable) {
      if (onTransactionError) {
        onTransactionError("Hive Keychain is not installed or available.");
      }
      return;
    }

    if (onTransactionInitiated) {
      onTransactionInitiated();
    }

    if (typeof window.hive_keychain !== "undefined") {
      //@ts-ignore
      window.hive_keychain.requestTransfer(
        onboarderUsername,
        "steembasicincome",
        "1.000",
        `@${username}`,
        "HIVE",
        async (response: any) => {
          console.log("Keychain Transfer Response:", response);

          if (response.success) {
            if (onTransactionComplete) {
              onTransactionComplete(response);
            }
            onNext();
          } else {
            if (onTransactionError) {
              onTransactionError(
                response.message ||
                  "Keychain transaction failed or was cancelled."
              );
            }
          }
        }
      );
    } else {
      if (onTransactionError) {
        onTransactionError("Hive Keychain API is not available.");
      }
    }
  };

  return (
    <div className="onboarding-step confirm-transaction-step">
      <h3>Paso 1: Confirmación y Pago</h3>
      <p>
        Vamos a llevar a cabo el onboarding para el usuario{" "}
        <strong>@{username}</strong>.
      </p>
      <p>Por favor, antes de continuar, verifica lo siguiente:</p>

      <ul className="prerequisites-list">
        <li>
          <span className="prerequisite-icon icon-hive">🐝</span>
          Poseo al menos 1 HIVE disponible en mi cuenta.
        </li>
        <li>
          <span className="prerequisite-icon icon-keychain">🔑</span>
          Tengo acceso a Keychain, donde he cargado mi cuenta (
          <strong>@{onboarderUsername}</strong>) con su clave activa o posting.
        </li>
        <li>
          <span className="prerequisite-icon icon-gain">💰</span>
          Sé que por cada HIVE que otorgue al apadrinar a este usuario, ganaré
          unidades SBI.
        </li>
        <li>
          <span className="prerequisite-icon icon-beta">🧪</span>
          Estoy consciente de que a pesar de los esfuerzos, el chequeo de las
          cuentas y los registros en HSBI tardan y por ende pueden haber errores
          (esto es BETA).
        </li>
        <li>
          <span className="prerequisite-icon icon-time">⏱️</span>
          Dispongo de al menos unos minutos para llevar a cabo el proceso.
        </li>
      </ul>

      <p>Estoy de acuerdo con empezar el proceso.</p>

      {!isKeychainAvailable && (
        <p className="keychain-required-message">
          Hive Keychain es requerido y no detectado. Por favor, asegúrese de que
          está instalado y activo.
        </p>
      )}

      <button
        onClick={handlePayWithKeychain}
        disabled={!isKeychainAvailable}
        className="pay-button"
      >
        Pagar con Keychain (1 HIVE)
      </button>

      <button onClick={onCancel} className="cancel-button">
        Cancelar
      </button>
    </div>
  );
};

export default Step1;

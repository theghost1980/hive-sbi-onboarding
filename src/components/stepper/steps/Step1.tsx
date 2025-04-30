import { KeychainHelper } from "keychain-helper";
import React from "react";
import backendApi from "../../../api/Backend";
import { config } from "../../../config/config";
import { BE_ADD_ONBOARDING } from "../../../config/constants";
import { JWT_TOKEN_STORAGE_KEY } from "../../../context/AuthContext";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { StepData } from "../../OnboardModal";

interface Step1Props {
  stepData: StepData;
  existingOnboardInfo?: BackendOnboardingInfo | null;
  onStepDataChange: (data: Partial<any>) => void;
  onProcessError: (message: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onComplete: () => void;
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
  onCancel: () => void;
  onTransactionInitiated?: () => void;
  onTransactionComplete?: (response: any) => void;
  onTransactionError?: (message: string) => void;
}

const Step1: React.FC<Step1Props> = ({
  onNextStep,
  onPrevStep,
  username,
  onboarderUsername,
  isKeychainAvailable,
  onTransactionInitiated,
  onTransactionComplete,
  onTransactionError,
  onCancel,
  onStepDataChange,
}) => {
  const handlePayWithKeychain = async () => {
    const hardCodedAmount = "1.000";
    const memo = `@${username}`;
    if (!isKeychainAvailable) {
      if (onTransactionError) {
        onTransactionError("Hive Keychain is not installed or available.");
      }
      return;
    }
    const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);

    if (onTransactionInitiated) {
      onTransactionInitiated();
    }

    if (onTransactionComplete && token) {
      KeychainHelper.requestTransfer(
        onboarderUsername,
        config.hsbi.main_account,
        hardCodedAmount,
        memo,
        "HIVE",
        async (response) => {
          console.log("Transfer Response:", response);
          if (response.success) {
            console.log(
              "Transfer broadcast successful! Tx ID:",
              response.result.tx_id
            );
            let dataBE;
            try {
              const responseBE: any = await backendApi.post(BE_ADD_ONBOARDING, {
                onboarder: onboarderUsername,
                onboarded: username,
                amount: `${hardCodedAmount} HIVE`,
                memo: memo,
              });
              // const responseBE = await addOnboardingEntry(
              //   onboarderUsername,
              //   username,
              //   `${hardCodedAmount} HIVE`,
              //   memo,
              //   token
              // );
              if (
                responseBE.message === "Onboarding registered successfully."
              ) {
                console.log("addOnboardingEntry success!", { responseBE });
                if (responseBE.data) dataBE = responseBE.data;
              }
            } catch (error) {
              console.error("addOnboardingEntry error", { error });
            } finally {
              onStepDataChange({
                onboarder: onboarderUsername,
                onboarded: username,
                beResponse1: dataBE,
                transactionResponse: response,
              });
              onNextStep();
            }
          } else {
            console.warn("Transfer failed:", response.message);
          }
        }
      );
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

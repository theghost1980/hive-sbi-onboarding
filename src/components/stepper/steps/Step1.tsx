import { KeychainHelper } from "keychain-helper";
import React from "react";
import styled from "styled-components";
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

// El contenedor principal del paso (puede extender de un componente base si tuvieramos uno)
const StyledStep1Container = styled.div`
  /* Estilos de .onboarding-step y .confirm-transaction-step de OnboardModal.css */
  padding: 20px; /* Ya aplicado en el Stepper, pero lo definimos aquí por si acaso */
  /* otros estilos específicos de este paso si los hay */
`;

const StyledPrerequisitesList = styled.ul`
  /* Estilos de .prerequisites-list de OnboardModal.css */
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const StyledPrerequisiteItem = styled.li`
  /* Estilos para los items de la lista si los hay (no hay clases específicas en CSS) */
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  font-size: 0.95em;
  color: #333;
`;

const StyledPrerequisiteIcon = styled.span`
  /* Estilos de .prerequisite-icon y los específicos icon-* de OnboardModal.css */
  margin-right: 10px;
  font-size: 1.2em; /* Ajusta si es necesario */
  /* Los estilos específicos de color por icono los manejaremos con el texto directamente o con una prop si fuera muy complejo */
  &.icon-hive {
    color: #ffc107;
  } /* Ejemplo, si definimos colores por icono */
  &.icon-keychain {
    color: #007bff;
  }
  /* ... añade más si hay otros iconos ... */
`;

const StyledKeychainRequiredMessage = styled.p`
  /* Estilos de .keychain-required-message de Step2.tsx (estilo en línea) y OnboardModal.css */
  color: #ffc107; /* color de warning */
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
`;

const StyledPayButton = styled.button`
  /* Estilos de .pay-button de OnboardModal.css */
  display: block; /* Para que ocupe el ancho completo si es necesario */
  width: 100%; /* Ajusta si no quieres que ocupe todo el ancho */
  padding: 12px 20px;
  background-color: #28a745; /* Color de éxito */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1.1em;
  margin-top: 20px;

  &:hover:not(:disabled) {
    background-color: #218838;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StyledCancelButton = styled.button`
  /* Estilos de .cancel-button de OnboardModal.css */
  display: block; /* Para que ocupe el ancho completo si es necesario */
  width: 100%; /* Ajusta si no quieres que ocupe todo el ancho */
  padding: 12px 20px;
  background-color: #dc3545; /* Color de peligro/cancelar */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1.1em;
  margin-top: 10px; /* Espacio entre botones */

  &:hover {
    background-color: #c82333;
  }
`;

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
    <StyledStep1Container>
      <h3>Paso 1: Confirmación y Pago</h3>
      <p>
        Vamos a llevar a cabo el onboarding para el usuario{" "}
        <strong>@{username}</strong>.
      </p>
      <p>Por favor, antes de continuar, verifica lo siguiente:</p>

      <StyledPrerequisitesList>
        <StyledPrerequisiteItem>
          <StyledPrerequisiteIcon className="icon-hive">
            🐝
          </StyledPrerequisiteIcon>
          Poseo al menos 1 HIVE disponible en mi cuenta.
        </StyledPrerequisiteItem>
        <StyledPrerequisiteItem>
          <StyledPrerequisiteIcon className="icon-keychain">
            🔑
          </StyledPrerequisiteIcon>
          {`Tengo acceso a Keychain, donde he cargado mi cuenta
          @${onboarderUsername} con su clave activa o posting.`}
        </StyledPrerequisiteItem>
        <StyledPrerequisiteItem>
          <StyledPrerequisiteIcon className="icon-gain">
            💰
          </StyledPrerequisiteIcon>
          Sé que por cada HIVE que otorgue al apadrinar a este usuario, ganaré
          unidades SBI.
        </StyledPrerequisiteItem>
        <StyledPrerequisiteItem>
          <StyledPrerequisiteIcon className="icon-beta">
            🧪
          </StyledPrerequisiteIcon>
          Estoy consciente de que a pesar de los esfuerzos, el chequeo de las
          cuentas y los registros en HSBI tardan y por ende pueden haber errores
          (esto es BETA).
        </StyledPrerequisiteItem>
        <StyledPrerequisiteItem>
          <StyledPrerequisiteIcon className="icon-time">
            ⏱️
          </StyledPrerequisiteIcon>
          Dispongo de al menos unos minutos para llevar a cabo el proceso.
        </StyledPrerequisiteItem>
      </StyledPrerequisitesList>

      <p>Estoy de acuerdo con empezar el proceso.</p>

      {!isKeychainAvailable && (
        <StyledKeychainRequiredMessage>
          Hive Keychain es requerido para apadrinar usuarios. Por favor,
          asegúrese de que está instalado.
        </StyledKeychainRequiredMessage>
      )}

      <StyledPayButton
        onClick={handlePayWithKeychain}
        disabled={!isKeychainAvailable}
      >
        Pagar con Keychain (1 HIVE)
      </StyledPayButton>

      <StyledCancelButton onClick={onCancel}>Cancelar</StyledCancelButton>
    </StyledStep1Container>
  );
};

export default Step1;

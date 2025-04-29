import React, { useEffect, useState } from "react";
import { StepData } from "../OnboardModal";

// Define la estructura de un paso
interface StepDefinition {
  component: React.ComponentType<any>;
  props: any; // Props específicas que el Modal define para este paso
}

// Define las props que el Stepper recibe del Modal
interface StepperProps {
  steps: StepDefinition[]; // Array con TODOS los pasos

  // Control del flujo
  initialStep?: number; // Índice del paso inicial (base 0), default 0

  // Datos y callbacks compartidos (pasados a TODOS los pasos)
  stepData: StepData;
  existingOnboardInfo?: any;
  onStepDataChange: (data: StepData) => void; // Para que pasos actualicen stepData en Modal
  onProcessError: (message: string) => void; // Para que pasos reporten error general al Modal
  onCancel: () => void; // Para cancelar/cerrar el modal

  // Props generales pasadas a TODOS los pasos (del Modal)
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;

  // Callbacks específicos de transacción que el Modal quiere manejar (pasados a Step1)
  onTransactionInitiated?: () => void;
  onTransactionComplete?: (response: any) => void;
  onTransactionError?: (message: string) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  initialStep = 0, // Default 0
  stepData,
  existingOnboardInfo,
  onStepDataChange,
  onProcessError,
  onCancel,
  username,
  onboarderUsername,
  isKeychainAvailable,
  onTransactionInitiated,
  onTransactionComplete,
  onTransactionError,
}) => {
  // Estado interno para el paso actual (base 0)
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Resetear el paso si initialStep cambia (aunque con el Modal actual, solo cambia al abrir)
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // --- Manejadores de Navegación (llamados por los componentes de paso) ---
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      // onProcessError(null); // Limpia error general al avanzar (opcional)
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      // onProcessError(null); // Limpia error general al retroceder (opcional)
    }
  };

  const handleComplete = () => {
    // Llamado por el *último paso* cuando termina el flujo
    onCancel(); // En este diseño simple, completar significa cerrar el modal
  };

  // --- Renderizar el paso actual ---
  const currentStepDefinition = steps[currentStep];

  if (!currentStepDefinition) {
    console.error(`Stepper: Step index ${currentStep} out of bounds.`);
    return (
      <p style={{ color: "red" }}>
        Error interno del Stepper: Paso no encontrado.
      </p>
    );
  }

  const CurrentStepComponent = currentStepDefinition.component;
  const currentStepProps = currentStepDefinition.props || {};

  // --- Indicador Visual Básico ---
  const StepIndicator = () => (
    <div
      style={{
        textAlign: "center",
        margin: "10px 0",
        fontSize: "0.9em",
        color: "#555",
      }}
    >
      Paso {currentStep + 1} de {steps.length}
    </div>
  );

  return (
    <div className="stepper-container">
      <StepIndicator />

      <CurrentStepComponent
        // Props específicas para este paso
        {...currentStepProps}
        // Datos compartidos y callbacks generales (del Modal)
        stepData={stepData}
        existingOnboardInfo={existingOnboardInfo}
        onStepDataChange={onStepDataChange}
        onProcessError={onProcessError} // Aseguramos que use el manejador interno del Stepper
        onCancel={onCancel}
        // Props generales de contexto (del Modal)
        username={username}
        onboarderUsername={onboarderUsername}
        isKeychainAvailable={isKeychainAvailable}
        // Callbacks de navegación que el Stepper pasa AL paso actual
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onComplete={handleComplete}
        // Callbacks específicos de transacción pasados a Step1 (si lo recibe como props)
        onTransactionInitiated={onTransactionInitiated}
        onTransactionComplete={onTransactionComplete}
        onTransactionError={onTransactionError}
      />

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {currentStep > 0 && <button onClick={handlePrevStep}>Anterior</button>}
        {currentStep < steps.length - 1 && (
          <button onClick={handleNextStep}>Siguiente</button>
        )}
        {currentStep === steps.length - 1 && // Si estás en el último paso
          // El último paso probablemente tiene su propio botón que llama a onComplete
          null}
      </div>
    </div>
  );
};

export default Stepper;

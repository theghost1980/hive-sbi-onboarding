import React, { useState } from "react";
import { Post } from "../OnboardModal";

interface StepNavigationProps {
  onNext: () => void;
  onReset: () => void;
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
  selectedPost: Post;
  onCancel: () => void;
  onTransactionInitiated?: () => void;
  onTransactionComplete?: (response: any) => void;
  onTransactionError?: (message: string) => void;
}

type StepComponent = React.FC<StepNavigationProps>;

interface StepperProps {
  steps: StepComponent[];
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
  selectedPost: Post;
  transactionResponse: any;
  onCancel: () => void;
  onTransactionInitiated?: () => void;
  onTransactionComplete?: (response: any) => void;
  onTransactionError?: (message: string) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  username,
  onboarderUsername,
  isKeychainAvailable,
  selectedPost,
  onCancel,
  onTransactionComplete,
  onTransactionError,
  onTransactionInitiated,
}) => {
  // Estado para controlar cuál es el índice del paso actual que se muestra.
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Función para pasar al siguiente paso.
  const nextStep = () => {
    setCurrentStepIndex((prevIndex) => {
      // Avanza solo si no estamos en el último paso
      if (prevIndex < steps.length - 1) {
        return prevIndex + 1;
      }
      // Si ya estamos en el último paso, nos quedamos ahí o podríamos llamar a una función de 'onComplete'.
      console.log("Reached last step"); // Placeholder
      return prevIndex; // Permanece en el último paso
    });
  };

  // Función para resetear el Stepper al primer paso.
  const reset = () => {
    setCurrentStepIndex(0);
    // Si manejas datos compartidos, aquí podrías resetearlos también.
  };

  // Función para volver al paso anterior (opcional)
  // const prevStep = () => {
  //   setCurrentStepIndex(prevIndex => {
  //      if (prevIndex > 0) {
  //          return prevIndex - 1;
  //      }
  //      return prevIndex;
  //   });
  // };

  // Obtiene el componente de paso actual del array basado en el índice.
  const CurrentStepComponent = steps[currentStepIndex];

  // Renderiza el componente del paso actual, pasándole las funciones de navegación como props.
  // También puedes pasar 'initialData' o cualquier otro dato compartido.
  return (
    <div className="stepper-container">
      {/* Renderiza el componente del paso actual */}
      <CurrentStepComponent
        onNext={nextStep}
        onReset={reset}
        username={username}
        onboarderUsername={onboarderUsername}
        isKeychainAvailable={isKeychainAvailable}
        onCancel={onCancel}
        onTransactionInitiated={onTransactionInitiated}
        onTransactionComplete={onTransactionComplete}
        onTransactionError={onTransactionError}
        selectedPost={selectedPost}
      />
      {/*
        Los botones "Siguiente", "Volver", etc. generalmente se colocan DENTRO
        de cada componente de paso, ya que la lógica de cuándo mostrarlos (ej: no "Siguiente" en el último paso)
        y qué habilitar/deshabilitar es específica de cada paso.
      */}
    </div>
  );
};

export default Stepper;

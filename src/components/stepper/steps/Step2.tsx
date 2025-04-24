// src/components/OnboardingSteps/Step2.tsx
import React from "react";

interface Step2Props {
  onNext: () => void;
  onReset: () => void;
  // ... otras props si son necesarias ...
}

const Step2: React.FC<Step2Props> = ({ onNext, onReset }) => {
  // Lógica específica del Paso 2 (ej. un formulario, una carga de datos)

  // Ejemplo: Si el usuario completa una acción en este paso:
  const handleCompleteStep2 = () => {
    // Realizar validaciones o acciones del paso 2
    console.log("Paso 2 completado!");
    // Luego, llamar a onNext para ir al Paso 3
    onNext();
  };

  return (
    <div className="onboarding-step step-2">
      <h3>Paso 2: Recopilación de Información</h3>
      <p>Completa los datos o realiza la acción de este paso.</p>

      {/* Ejemplo de cómo se activaría el siguiente paso */}
      <button onClick={handleCompleteStep2}>Completar Paso 2</button>

      <button onClick={onReset}>Reiniciar Proceso</button>
      {/* Si tuvieras onBack, podrías tener un botón "Volver" */}
      {/* <button onClick={onBack}>Volver</button> */}
    </div>
  );
};

export default Step2;

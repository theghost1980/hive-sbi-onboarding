import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { StepData } from "../../OnboardModal";

interface Step3Props {
  stepData: StepData; // Datos recolectados de pasos anteriores
  existingOnboardInfo?: BackendOnboardingInfo | null; // Datos para modo edición

  onStepDataChange: (data: Partial<any>) => void; // Para actualizar stepData en el Modal
  onProcessError: (message: string) => void; // Para reportar errores generales al Modal
  onCancel: () => void; // Para cancelar el flujo completo

  onNextStep: () => void; // Para avanzar al siguiente paso (ej: Summary)
  onPrevStep: () => void; // Para ir al paso anterior
  onComplete: () => void; // Para finalizar el flujo (si este fuera el último paso)

  username: string; // El usuario a quien se le comentará (el 'onboarded')
  onboarderUsername: string; // El usuario que hace el comentario (el 'onboarder' loggeado)
  isKeychainAvailable: boolean; // Estado de disponibilidad de Keychain
}

const Step3: React.FC<Step3Props> = ({
  stepData,
  existingOnboardInfo,
  onStepDataChange,
  onProcessError,
  onNextStep,
  onPrevStep,
  onComplete,
  onCancel,
  username,
  onboarderUsername,
  isKeychainAvailable,
}) => {
  console.log({ stepData });
  return (
    <div>
      <h2>Final Report! //TODO</h2>
    </div>
  );
};

export default Step3;

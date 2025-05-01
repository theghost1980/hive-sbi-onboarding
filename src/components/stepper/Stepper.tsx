import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StepData } from "../OnboardModal";
interface StepDefinition {
  component: React.ComponentType<any>;
  props: any;
}
interface StepperProps {
  steps: StepDefinition[];
  initialStep?: number;
  stepData: StepData;
  existingOnboardInfo?: any;
  onStepDataChange: (data: StepData) => void;
  onProcessError: (message: string) => void;
  onCancel: () => void;
  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
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
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      // onProcessError(null); // Limpia error general al avanzar (opcional)
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onCancel();
  };

  const currentStepDefinition = steps[currentStep];

  if (!currentStepDefinition) {
    console.error(`Stepper: Step index ${currentStep} out of bounds.`);
    return (
      <p style={{ color: "red" }}>
        {t("stepper.internal_error_step_not_found")}
      </p>
    );
  }

  const CurrentStepComponent = currentStepDefinition.component;
  const currentStepProps = currentStepDefinition.props || {};

  const StepIndicator = () => (
    <div
      style={{
        textAlign: "center",
        margin: "10px 0",
        fontSize: "0.9em",
        color: "#555",
      }}
    >
      {t("stepper.step")} {currentStep + 1} {t("stepper.of")} {steps.length}
    </div>
  );

  return (
    <div className="stepper-container">
      <StepIndicator />

      <CurrentStepComponent
        {...currentStepProps}
        stepData={stepData}
        existingOnboardInfo={existingOnboardInfo}
        onStepDataChange={onStepDataChange}
        onProcessError={onProcessError}
        onCancel={onCancel}
        username={username}
        onboarderUsername={onboarderUsername}
        isKeychainAvailable={isKeychainAvailable}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onComplete={handleComplete}
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
        {currentStep > 0 && (
          <button onClick={handlePrevStep}>{t("stepper.prev")}</button>
        )}
        {currentStep < steps.length - 1 && (
          <button onClick={handleNextStep}>{t("stepper.next")}</button>
        )}
        {currentStep === steps.length - 1 && null}
      </div>
    </div>
  );
};

export default Stepper;

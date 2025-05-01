import React, { useState } from "react";
import styled from "styled-components";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { StepData } from "../../OnboardModal";
import {
  StyledCompleteButton, // Usaremos este para el botón "Complete"
  StyledCopyReportButton,
  StyledNavigationButtons,
  StyledPrevButton,
} from "../../StyledElements";
interface Step3Props {
  stepData: StepData;
  existingOnboardInfo?: BackendOnboardingInfo | null;

  onStepDataChange: (data: Partial<any>) => void;
  onProcessError: (message: string) => void;
  onCancel: () => void;

  onNextStep: () => void;
  onPrevStep: () => void;
  onComplete: () => void;

  username: string;
  onboarderUsername: string;
  isKeychainAvailable: boolean;
}

const StyledStep3SummaryContainer = styled.div`
  /* Estilos de .onboarding-step.step-3-summary de Step3.css */
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;

  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }
`;

const StyledSummaryModeInfo = styled.p`
  /* Estilos de .summary-mode-info de Step3.css */
  text-align: center;
  font-style: italic;
  margin-bottom: 25px;
  color: #555;
`;

const StyledSummarySection = styled.div`
  /* Estilos de .summary-section de Step3.css */
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ccc;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  h3 {
    color: #0056b3;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2em;
  }

  p {
    margin: 5px 0;
    color: #333;
    font-size: 0.95em;
  }

  p strong {
    color: #000;
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

// Componentes para resultados de transacción/respuesta (éxito/error)
interface StyledResultProps {
  success?: boolean; // Para determinar si aplicar estilos de éxito o error
}

const StyledTransactionResult = styled.div<StyledResultProps>`
  /* Estilos de .transaction-result, .transaction-result.success, .transaction-result.error de Step3.css */
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9em;

  ${(props) =>
    props.success
      ? `
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724; /* color de texto para éxito */
  `
      : `
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24; /* color de texto para error */
  `}

  p {
    margin: 3px 0;
    color: inherit; /* Hereda el color del contenedor (éxito/error) */
  }
  p strong {
    color: inherit; /* Hereda el color del contenedor */
  }
`;

// Backend response result (similar a transaction, podría refactorizarse si hay más similitud)
const StyledBackendResponseResult = styled.div<StyledResultProps>`
  /* Estilos de .backend-response-result, .backend-response-result.success, .backend-response-result.error de Step3.css */
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9em;

  ${(props) =>
    props.success
      ? `
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724; /* color de texto para éxito */
  `
      : `
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24; /* color de texto para error */
  `}

  p {
    margin: 3px 0;
    color: inherit; /* Hereda el color del contenedor */
  }

  pre {
    margin: 5px 0;
    padding: 10px;
    background-color: #eee;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85em;
    word-wrap: break-word;
    white-space: pre-wrap;
    color: #333; /* Un color más oscuro para el código */
  }
`;

const StyledTransactionDetails = styled.div`
  /* Estilos de .transaction-details de Step3.css */
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.2);

  p {
    margin: 2px 0;
    font-size: 0.9em;
    color: inherit;
  }
  p strong {
    color: inherit;
    font-weight: normal;
    margin-right: 5px;
  }
`;

const StyledBackendResponseDetails = styled.div`
  /* Estilos de .backend-response-details de Step3.css */
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.2);

  p {
    margin: 2px 0;
    font-size: 0.9em;
    color: inherit;
  }
`;

const StyledCommentTextPreview = styled.div`
  /* Estilos de .comment-text-preview de Step3.css */
  background-color: #fff;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 0.9em;
  max-height: 150px;
  overflow-y: auto;
`;

const StyledCopyStatusMessage = styled.p`
  /* Estilos de .copy-status-message de Step3.css */
  text-align: center;
  margin-top: 10px;
  font-style: italic;
  color: #555;
`;

const Step3: React.FC<Step3Props> = ({
  stepData,
  existingOnboardInfo,
  onStepDataChange,
  onProcessError,
  onCancel,
  onNextStep,
  onPrevStep,
  onComplete,
  username,
  onboarderUsername,
  isKeychainAvailable,
}) => {
  const isEditMode = !!existingOnboardInfo;
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopyReport = async () => {
    let reportText = `--- Onboarding Summary for @${username} by @${onboarderUsername} ---\n\n`;

    reportText += `Mode: ${
      isEditMode ? "Editing existing record" : "New onboarding"
    }\n\n`;

    reportText += `--- Backend Record Update Result ---\n`;
    if (stepData.beResponse1) {
      reportText += `Response Details:\n`;
      reportText += `${JSON.stringify(stepData.beResponse1, null, 2)}\n`;
    } else {
      reportText += `Backend record update result is unavailable.\n`;
    }
    reportText += `\n`;

    reportText += `--- Post Selected ---\n`;
    if (stepData.selectedPost) {
      reportText += `Commented on: "${stepData.selectedPost.title}" by @${stepData.selectedPost.author}\n`;
      reportText += `View Post: https://peakd.com${stepData.selectedPost.url}\n`;
    } else {
      reportText += `No specific post selected.\n`;
    }
    reportText += `\n`;

    reportText += `--- Transfer Transaction Result ---\n`;
    if (stepData.transactionResponse) {
      reportText += `Status: ${
        stepData.transactionResponse.success ? "Success" : "Failed"
      }\n`;
      if (stepData.transactionResponse.id)
        reportText += `Transaction ID: ${stepData.transactionResponse.id}\n`;
      if (stepData.transactionResponse.message)
        reportText += `Message: ${stepData.transactionResponse.message}\n`;
      if (stepData.transactionResponse.error)
        reportText += `Error: ${JSON.stringify(
          stepData.transactionResponse.error
        )}\n`;

      if (
        stepData.transactionResponse.success &&
        stepData.transactionResponse.result &&
        stepData.transactionResponse.data
      ) {
        reportText += `\nTransaction Details:\n`;
        reportText += `  Tx ID: ${
          stepData.transactionResponse.result.tx_id ||
          stepData.transactionResponse.result.id
        }\n`;
        reportText += `  From: @${stepData.transactionResponse.data.username}\n`;
        reportText += `  To: @${stepData.transactionResponse.data.to}\n`;
        reportText += `  Amount: ${stepData.transactionResponse.data.amount} ${stepData.transactionResponse.data.currency}\n`;
        if (stepData.transactionResponse.data.memo)
          reportText += `  Memo: ${stepData.transactionResponse.data.memo}\n`;
      }
    } else {
      reportText += `Transfer transaction was not attempted or result is unavailable.\n`;
    }
    reportText += `\n`;

    reportText += `--- Comment Transaction Result ---\n`;
    if (stepData.commentResponse) {
      reportText += `Status: ${
        stepData.commentResponse.success ? "Success" : "Failed"
      }\n`;
      if (stepData.postedCommentPermlink) {
        reportText += `Comment Permlink: ${stepData.postedCommentPermlink}\n`;
        reportText += `View Comment: https://hive.blog/@${onboarderUsername}/${stepData.postedCommentPermlink}\n`;
      }
      if (stepData.commentResponse.message)
        reportText += `Message: ${stepData.commentResponse.message}\n`;
      if (stepData.commentResponse.error)
        reportText += `Error: ${JSON.stringify(
          stepData.commentResponse.error
        )}\n`;
    } else {
      reportText += `Comment was not posted or result is unavailable.\n`;
    }
    reportText += `\n`;

    if (stepData.generatedComment || stepData.editedComment) {
      reportText += `--- Comment Text ---\n`;
      reportText += `${stepData.editedComment || stepData.generatedComment}\n`;
      reportText += `\n`;
    }

    try {
      await navigator.clipboard.writeText(reportText);
      setCopyStatus("Report Copied!");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (err) {
      console.error("Failed to copy report:", err);
      setCopyStatus("Failed to copy report.");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <StyledStep3SummaryContainer>
      <h2>Onboarding Summary</h2>
      {isEditMode ? (
        <StyledSummaryModeInfo>
          Reviewing existing onboarding record for @{username} by @
          {onboarderUsername}.
        </StyledSummaryModeInfo>
      ) : (
        <StyledSummaryModeInfo>
          Reviewing process for onboarding @{username} by @{onboarderUsername}.
        </StyledSummaryModeInfo>
      )}
      <StyledSummarySection>
        <h3>Backend Record Update Result</h3>
        {stepData.beResponse1 ? (
          <StyledBackendResponseResult success={stepData.beResponse1.success}>
            <StyledBackendResponseDetails>
              <p>Response Details:</p>
              <pre>{JSON.stringify(stepData.beResponse1, null, 2)}</pre>
            </StyledBackendResponseDetails>
          </StyledBackendResponseResult>
        ) : (
          <p>Backend record update result is unavailable.</p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>Post Selected</h3>
        {stepData.selectedPost ? (
          <p>
            Commented on: <strong>{stepData.selectedPost.title}</strong> by @
            {stepData.selectedPost.author}
            {" ("}
            <a
              href={`https://peakd.com${stepData.selectedPost.url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Post
            </a>
            {")"}
          </p>
        ) : (
          <p>No specific post selected in previous steps.</p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>Transfer Transaction Result</h3>
        {stepData.transactionResponse ? (
          <StyledTransactionResult
            success={stepData.transactionResponse.success}
          >
            <p>
              Status:{" "}
              <strong>
                {stepData.transactionResponse.success ? "Success" : "Failed"}
              </strong>
            </p>
            {stepData.transactionResponse.id && (
              <p>Transaction ID: {stepData.transactionResponse.id}</p>
            )}
            {stepData.transactionResponse.message && (
              <p>Message: {stepData.transactionResponse.message}</p>
            )}
            {stepData.transactionResponse.error && (
              <p>Error: {JSON.stringify(stepData.transactionResponse.error)}</p>
            )}

            {stepData.transactionResponse.success &&
              stepData.transactionResponse.result &&
              stepData.transactionResponse.data && (
                <StyledTransactionDetails>
                  <p>
                    <strong>Transaction Details:</strong>
                  </p>
                  <p>
                    Tx ID:{" "}
                    {stepData.transactionResponse.result.tx_id ||
                      stepData.transactionResponse.result.id}
                  </p>
                  <p>From: @{stepData.transactionResponse.data.username}</p>
                  <p>To: @{stepData.transactionResponse.data.to}</p>
                  <p>
                    Amount: {stepData.transactionResponse.data.amount}{" "}
                    {stepData.transactionResponse.data.currency}
                  </p>
                  {stepData.transactionResponse.data.memo && (
                    <p>Memo: {stepData.transactionResponse.data.memo}</p>
                  )}
                </StyledTransactionDetails>
              )}
          </StyledTransactionResult>
        ) : (
          <p>
            Transfer transaction was not attempted or result is unavailable.
          </p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>Comment Transaction Result</h3>
        {stepData.commentResponse ? (
          <StyledTransactionResult success={stepData.commentResponse.success}>
            <p>
              Status:{" "}
              <strong>
                {stepData.commentResponse.success ? "Success" : "Failed"}
              </strong>
            </p>
            {stepData.postedCommentPermlink && (
              <p>
                Comment Permlink:
                <a
                  href={`https://hive.blog/@${onboarderUsername}/${stepData.postedCommentPermlink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {stepData.postedCommentPermlink}
                </a>
              </p>
            )}
            {stepData.commentResponse.message && (
              <p>Message: {stepData.commentResponse.message}</p>
            )}
            {stepData.commentResponse.error && (
              <p>Error: {JSON.stringify(stepData.commentResponse.error)}</p>
            )}
          </StyledTransactionResult>
        ) : (
          <p>Comment was not posted or result is unavailable.</p>
        )}
      </StyledSummarySection>
      {(stepData.generatedComment || stepData.editedComment) && (
        <StyledSummarySection>
          <h3>Comment Text</h3>
          <StyledCommentTextPreview>
            {stepData.editedComment || stepData.generatedComment}
          </StyledCommentTextPreview>
        </StyledSummarySection>
      )}
      <StyledNavigationButtons justify="center" gap="20px" marginTop="30px">
        <StyledPrevButton onClick={onPrevStep}>Back</StyledPrevButton>
        <StyledCompleteButton onClick={onComplete}>
          Complete
        </StyledCompleteButton>
        <StyledCopyReportButton onClick={handleCopyReport}>
          Copy Report
        </StyledCopyReportButton>
      </StyledNavigationButtons>
      {copyStatus && (
        <StyledCopyStatusMessage>{copyStatus}</StyledCopyStatusMessage>
      )}
    </StyledStep3SummaryContainer>
  );
};

export default Step3;

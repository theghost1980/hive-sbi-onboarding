import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { StepData } from "../../OnboardModal";
import {
  StyledCompleteButton,
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
  const { t } = useTranslation();
  const isEditMode = !!existingOnboardInfo;
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopyReport = async () => {
    const reportHeader = t("onboard_step3.report.header", {
      username: username,
      onboarderUsername: onboarderUsername,
    });
    const modePrefix = t("onboard_step3.report.mode_prefix");
    const mode = isEditMode
      ? t("onboard_step3.report.mode.editing")
      : t("onboard_step3.report.mode.new");

    const backendResultTitle = t(
      "onboard_step3.report.sections.backend_result.title"
    );
    const backendResultResponseDetails = t(
      "onboard_step3.report.sections.backend_result.response_details"
    );
    const backendResultUnavailable = t(
      "onboard_step3.report.sections.backend_result.unavailable"
    );

    const postSelectedTitle = t(
      "onboard_step3.report.sections.post_selected.title"
    );
    const postSelectedCommentedOnPrefix = t(
      "onboard_step3.report.sections.post_selected.commented_on_prefix"
    );
    const postSelectedByAuthorConnector = t(
      "onboard_step3.report.sections.post_selected.by_author_connector"
    );
    const postSelectedViewPostLink = t(
      "onboard_step3.report.sections.post_selected.view_post_link"
    );
    const postSelectedNotSelected = t(
      "onboard_step3.report.sections.post_selected.not_selected"
    );

    const transferResultTitle = t(
      "onboard_step3.report.sections.transfer_result.title"
    );
    const transferResultStatusPrefix = t(
      "onboard_step3.report.sections.transfer_result.status_prefix"
    );
    const transferResultStatusSuccess = t(
      "onboard_step3.sections.transfer_result.status.success"
    );
    const transferResultStatusFailed = t(
      "onboard_step3.sections.transfer_result.status.failed"
    );
    const transferResultTxIdPrefix = t(
      "onboard_step3.report.sections.transfer_result.tx_id_prefix"
    );
    const transferResultMessagePrefix = t(
      "onboard_step3.report.sections.transfer_result.message_prefix"
    );
    const transferResultErrorPrefix = t(
      "onboard_step3.report.sections.transfer_result.error_prefix"
    );
    const transferResultDetailsTitle = t(
      "onboard_step3.report.sections.transfer_result.details_title"
    );
    const transferResultDetailTxIdPrefix = t(
      "onboard_step3.report.sections.transfer_result.detail.tx_id_prefix"
    );
    const transferResultDetailFromPrefix = t(
      "onboard_step3.report.sections.transfer_result.detail.from_prefix"
    );
    const transferResultDetailToPrefix = t(
      "onboard_step3.report.sections.transfer_result.detail.to_prefix"
    );
    const transferResultDetailAmountPrefix = t(
      "onboard_step3.report.sections.transfer_result.detail.amount_prefix"
    );
    const transferResultDetailMemoPrefix = t(
      "onboard_step3.report.sections.transfer_result.detail.memo_prefix"
    );
    const transferResultUnavailable = t(
      "onboard_step3.report.sections.transfer_result.unavailable"
    );

    const commentResultTitle = t(
      "onboard_step3.report.sections.comment_result.title"
    );
    const commentResultStatusPrefix = t(
      "onboard_step3.report.sections.comment_result.status_prefix"
    ); // Use from transferResult? No, keep separate as per JSON
    const commentResultStatusSuccess = t(
      "onboard_step3.sections.comment_result.status.success"
    );
    const commentResultStatusFailed = t(
      "onboard_step3.sections.comment_result.status.failed"
    );
    const commentResultPermlinkPrefix = t(
      "onboard_step3.report.sections.comment_result.comment_permlink_prefix"
    );
    const commentResultViewCommentLink = t(
      "onboard_step3.report.sections.comment_result.view_comment_link"
    );
    const commentResultMessagePrefix = t(
      "onboard_step3.report.sections.comment_result.message_prefix"
    ); // Use from transferResult? No, keep separate as per JSON
    const commentResultErrorPrefix = t(
      "onboard_step3.report.sections.comment_result.error_prefix"
    ); // Use from transferResult? No, keep separate as per JSON
    const commentResultUnavailable = t(
      "onboard_step3.report.sections.comment_result.unavailable"
    );

    const commentTextTitle = t(
      "onboard_step3.report.sections.comment_text.title"
    );

    let reportText = `${reportHeader}\n\n`;

    reportText += `${modePrefix}: ${mode}\n\n`;

    reportText += `${backendResultTitle}\n`;
    if (stepData.beResponse1) {
      reportText += `${backendResultResponseDetails}\n`;
      reportText += `${JSON.stringify(stepData.beResponse1, null, 2)}\n`;
    } else {
      reportText += `${backendResultUnavailable}\n`;
    }
    reportText += `\n`;

    reportText += `${postSelectedTitle}\n`;
    if (stepData.selectedPost) {
      reportText += `${postSelectedCommentedOnPrefix}"${stepData.selectedPost.title}" ${postSelectedByAuthorConnector}@${stepData.selectedPost.author}\n`;
      reportText += `${postSelectedViewPostLink}: https://peakd.com${stepData.selectedPost.url}\n`;
    } else {
      reportText += `${postSelectedNotSelected}\n`;
    }
    reportText += `\n`;

    reportText += `${transferResultTitle}\n`;
    if (stepData.transactionResponse) {
      reportText += `${transferResultStatusPrefix}: ${
        stepData.transactionResponse.success
          ? transferResultStatusSuccess
          : transferResultStatusFailed
      }\n`;
      if (stepData.transactionResponse.id)
        reportText += `${transferResultTxIdPrefix}: ${stepData.transactionResponse.id}\n`;
      if (stepData.transactionResponse.message)
        reportText += `${transferResultMessagePrefix}: ${stepData.transactionResponse.message}\n`;
      if (stepData.transactionResponse.error)
        reportText += `${transferResultErrorPrefix}: ${JSON.stringify(
          stepData.transactionResponse.error
        )}\n`;

      if (
        stepData.transactionResponse.success &&
        stepData.transactionResponse.result &&
        stepData.transactionResponse.data
      ) {
        reportText += `\n${transferResultDetailsTitle}\n`;
        reportText += ` ${transferResultDetailTxIdPrefix} ${
          stepData.transactionResponse.result.tx_id ||
          stepData.transactionResponse.result.id
        }\n`;
        reportText += ` ${transferResultDetailFromPrefix}@${stepData.transactionResponse.data.username}\n`;
        reportText += ` ${transferResultDetailToPrefix}@${stepData.transactionResponse.data.to}\n`;
        reportText += ` ${transferResultDetailAmountPrefix} ${stepData.transactionResponse.data.amount} ${stepData.transactionResponse.data.currency}\n`;
        if (stepData.transactionResponse.data.memo)
          reportText += ` ${transferResultDetailMemoPrefix}: ${stepData.transactionResponse.data.memo}\n`;
      }
    } else {
      reportText += `${transferResultUnavailable}\n`;
    }
    reportText += `\n`;

    reportText += `${commentResultTitle}\n`;
    if (stepData.commentResponse) {
      reportText += `${commentResultStatusPrefix}: ${
        stepData.commentResponse.success
          ? commentResultStatusSuccess
          : commentResultStatusFailed
      }\n`;
      if (stepData.postedCommentPermlink) {
        reportText += `${commentResultPermlinkPrefix}: ${stepData.postedCommentPermlink}\n`;
        reportText += `${commentResultViewCommentLink} https://hive.blog/@${onboarderUsername}/${stepData.postedCommentPermlink}\n`;
      }
      if (stepData.commentResponse.message)
        reportText += `${commentResultMessagePrefix}: ${stepData.commentResponse.message}\n`;
      if (stepData.commentResponse.error)
        reportText += `${commentResultErrorPrefix}: ${JSON.stringify(
          stepData.commentResponse.error
        )}\n`;
    } else {
      reportText += `${commentResultUnavailable}\n`;
    }
    reportText += `\n`;

    if (stepData.generatedComment || stepData.editedComment) {
      reportText += `${commentTextTitle}\n`;
      reportText += `${stepData.editedComment || stepData.generatedComment}\n`;
      reportText += `\n`;
    }

    try {
      await navigator.clipboard.writeText(reportText);
      setCopyStatus(t("onboard_step3.copy_status.success"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (err) {
      console.error("Failed to copy report:", err);
      setCopyStatus(t("onboard_step3.copy_status.failed"));
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <StyledStep3SummaryContainer>
      <h2>{t("onboard_step3.title")}</h2>
      {isEditMode ? (
        <StyledSummaryModeInfo>
          {t("onboard_step3.summary_mode.editing", {
            username: username,
            onboarderUsername: onboarderUsername,
          })}
        </StyledSummaryModeInfo>
      ) : (
        <StyledSummaryModeInfo>
          {t("onboard_step3.summary_mode.new_onboarding", {
            username: username,
            onboarderUsername: onboarderUsername,
          })}
        </StyledSummaryModeInfo>
      )}
      <StyledSummarySection>
        <h3>{t("onboard_step3.sections.backend_result.title")}</h3>
        {stepData.beResponse1 ? (
          <StyledBackendResponseResult success={stepData.beResponse1.success}>
            <StyledBackendResponseDetails>
              <p>
                {t("onboard_step3.sections.backend_result.response_details")}
              </p>
              <pre>{JSON.stringify(stepData.beResponse1, null, 2)}</pre>
            </StyledBackendResponseDetails>
          </StyledBackendResponseResult>
        ) : (
          <p>{t("onboard_step3.sections.backend_result.unavailable")}</p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>{t("onboard_step3.sections.post_selected.title")}</h3>
        {stepData.selectedPost ? (
          <p>
            {t("onboard_step3.sections.post_selected.commented_on_prefix")}
            <strong>{stepData.selectedPost.title}</strong>
            {t("onboard_step3.sections.post_selected.by_author_connector")}@
            {stepData.selectedPost.author} {" ("}
            <a
              href={`https://peakd.com${stepData.selectedPost.url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("onboard_step3.sections.post_selected.view_post_link")}
            </a>
            {")"}
          </p>
        ) : (
          <p>{t("onboard_step3.sections.post_selected.not_selected")}</p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>{t("onboard_step3.sections.transfer_result.title")}</h3>
        {stepData.transactionResponse ? (
          <StyledTransactionResult
            success={stepData.transactionResponse.success}
          >
            <p>
              {t("onboard_step3.sections.transfer_result.status_prefix")}
              <strong>
                {stepData.transactionResponse.success
                  ? t("onboard_step3.sections.transfer_result.status.success")
                  : t("onboard_step3.sections.transfer_result.status.failed")}
              </strong>
            </p>
            {stepData.transactionResponse.id && (
              <p>
                {t("onboard_step3.sections.transfer_result.tx_id_prefix")}:
                {stepData.transactionResponse.id}
              </p>
            )}
            {stepData.transactionResponse.message && (
              <p>
                {t("onboard_step3.sections.transfer_result.message_prefix")}:
                {stepData.transactionResponse.message}
              </p>
            )}
            {stepData.transactionResponse.error && (
              <p>
                {t("onboard_step3.sections.transfer_result.error_prefix")}:
                {JSON.stringify(stepData.transactionResponse.error)}
              </p>
            )}
            {stepData.transactionResponse.success &&
              stepData.transactionResponse.result &&
              stepData.transactionResponse.data && (
                <StyledTransactionDetails>
                  <p>
                    <strong>
                      {t(
                        "onboard_step3.sections.transfer_result.details_title"
                      )}
                    </strong>
                  </p>
                  <p>
                    {t(
                      "onboard_step3.sections.transfer_result.detail.tx_id_prefix"
                    )}
                    {stepData.transactionResponse.result.tx_id ||
                      stepData.transactionResponse.result.id}
                  </p>
                  <p>
                    {t(
                      "onboard_step3.sections.transfer_result.detail.from_prefix"
                    )}
                    @{stepData.transactionResponse.data.username}
                  </p>
                  <p>
                    {t(
                      "onboard_step3.sections.transfer_result.detail.to_prefix"
                    )}
                    @{stepData.transactionResponse.data.to}
                  </p>
                  <p>
                    {t(
                      "onboard_step3.sections.transfer_result.detail.amount_prefix"
                    )}
                    {stepData.transactionResponse.data.amount}
                    {stepData.transactionResponse.data.currency}
                  </p>
                  {stepData.transactionResponse.data.memo && (
                    <p>
                      {t(
                        "onboard_step3.sections.transfer_result.detail.memo_prefix"
                      )}
                      : {stepData.transactionResponse.data.memo}
                    </p>
                  )}
                </StyledTransactionDetails>
              )}
          </StyledTransactionResult>
        ) : (
          <p> {t("onboard_step3.sections.transfer_result.unavailable")} </p>
        )}
      </StyledSummarySection>
      <StyledSummarySection>
        <h3>{t("onboard_step3.sections.comment_result.title")}</h3>
        {stepData.commentResponse ? (
          <StyledTransactionResult success={stepData.commentResponse.success}>
            <p>
              {t("onboard_step3.sections.comment_result.status_prefix")}
              <strong>
                {stepData.commentResponse.success
                  ? t("onboard_step3.sections.comment_result.status.success")
                  : t("onboard_step3.sections.comment_result.status.failed")}
              </strong>
            </p>
            {stepData.postedCommentPermlink && (
              <p>
                {t(
                  "onboard_step3.sections.comment_result.comment_permlink_prefix"
                )}
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
              <p>
                {t("onboard_step3.sections.comment_result.message_prefix")}:
                {stepData.commentResponse.message}
              </p>
            )}
            {stepData.commentResponse.error && (
              <p>
                {t("onboard_step3.sections.comment_result.error_prefix")}:
                {JSON.stringify(stepData.commentResponse.error)}
              </p>
            )}
          </StyledTransactionResult>
        ) : (
          <p>{t("onboard_step3.sections.comment_result.unavailable")}</p>
        )}
      </StyledSummarySection>
      {(stepData.generatedComment || stepData.editedComment) && (
        <StyledSummarySection>
          <h3>{t("onboard_step3.sections.comment_text.title")}</h3>
          <StyledCommentTextPreview>
            {stepData.editedComment || stepData.generatedComment}
          </StyledCommentTextPreview>
        </StyledSummarySection>
      )}
      <StyledNavigationButtons justify="center" gap="20px" marginTop="30px">
        <StyledPrevButton onClick={onPrevStep}>
          {t("onboard_step3.buttons.back")}
        </StyledPrevButton>
        <StyledCompleteButton onClick={onComplete}>
          {t("onboard_step3.buttons.complete")}
        </StyledCompleteButton>
        <StyledCopyReportButton onClick={handleCopyReport}>
          {t("onboard_step3.buttons.copy_report")}
        </StyledCopyReportButton>
      </StyledNavigationButtons>
      {copyStatus && (
        <StyledCopyStatusMessage>{copyStatus}</StyledCopyStatusMessage>
      )}
    </StyledStep3SummaryContainer>
  );
};

export default Step3;

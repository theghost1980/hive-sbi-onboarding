import React, { useState } from "react";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { StepData } from "../../OnboardModal";
import "./Step3.css";

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
    <div className="onboarding-step step-3-summary">
      <h2>Onboarding Summary</h2>

      {isEditMode ? (
        <p className="summary-mode-info">
          Reviewing existing onboarding record for @{username} by @
          {onboarderUsername}.
        </p>
      ) : (
        <p className="summary-mode-info">
          Reviewing process for onboarding @{username} by @{onboarderUsername}.
        </p>
      )}

      <div className="summary-section">
        <h3>Backend Record Update Result</h3>
        {stepData.beResponse1 ? (
          <div className="backend-response-details">
            <p>Response Details:</p>
            <pre>{JSON.stringify(stepData.beResponse1, null, 2)}</pre>
          </div>
        ) : (
          <p>Backend record update result is unavailable.</p>
        )}
      </div>

      <div className="summary-section">
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
      </div>

      <div className="summary-section">
        <h3>Transfer Transaction Result</h3>
        {stepData.transactionResponse ? (
          <div
            className={`transaction-result ${
              stepData.transactionResponse.success ? "success" : "error"
            }`}
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
                <div className="transaction-details">
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
                </div>
              )}
          </div>
        ) : (
          <p>
            Transfer transaction was not attempted or result is unavailable.
          </p>
        )}
      </div>

      <div className="summary-section">
        <h3>Comment Transaction Result</h3>
        {stepData.commentResponse ? (
          <div
            className={`transaction-result ${
              stepData.commentResponse.success ? "success" : "error"
            }`}
          >
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
          </div>
        ) : (
          <p>Comment was not posted or result is unavailable.</p>
        )}
      </div>

      {(stepData.generatedComment || stepData.editedComment) && (
        <div className="summary-section">
          <h3>Comment Text</h3>
          <div className="comment-text-preview">
            {stepData.editedComment || stepData.generatedComment}
          </div>
        </div>
      )}

      <div className="step-navigation-buttons">
        <button onClick={onPrevStep} className="prev-step-button">
          Back
        </button>
        <button onClick={onComplete} className="complete-button">
          Complete
        </button>
        <button onClick={handleCopyReport} className="copy-report-button">
          Copy Report
        </button>
      </div>
      {copyStatus && <p className="copy-status-message">{copyStatus}</p>}
    </div>
  );
};

export default Step3;

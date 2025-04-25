import React, { useState } from "react";
import { HiveApi } from "../api/HIveApi";
import { getOnboarded } from "../api/OnboardingApi";
import OnboardModal from "../components/OnboardModal";
import { config } from "../config/config";
import { JWT_TOKEN_STORAGE_KEY, useAuth } from "../context/AuthContext";
import { formatTimestampManual } from "../utils/format,utils"; // Assuming this utility exists
import "./OnBoardUser.css";

interface HiveAccount {
  name: string;
}

export interface BackendOnboardingInfo {
  id: number;
  onboarder: string;
  onboarded: string;
  amount: string;
  memo: string;
  comment_permlink?: string;
  timestamp: number;
}

const OnBoardUser: React.FC = () => {
  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<HiveAccount | null>(null);

  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [membershipCheckError, setMembershipCheckError] = useState<
    string | null
  >(null);
  const [backendOnboardingInfo, setBackendOnboardingInfo] =
    useState<BackendOnboardingInfo | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<string | null>(null);
  const [modalStartStep, setModalStartStep] = useState<number>(1);

  const { user: onboarder } = useAuth();
  const onboarderUsername = onboarder?.username || "unknown";

  const checkMembership = async (username: string) => {
    setIsCheckingMembership(true);
    setIsMember(null);
    setMembershipCheckError(null);
    setBackendOnboardingInfo(null);

    try {
      const hsbiApiResponse = await fetch(`${config.hsbi.api_url}${username}/`);

      if (hsbiApiResponse.ok) {
        setIsMember(true);
        console.log(`User @${username} IS a member of HSBI.`);
      } else if (hsbiApiResponse.status === 404) {
        console.log(
          `User @${username} not found in HSBI API. Checking backend records...`
        );
        try {
          const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
          const backendRecords = await getOnboarded(username, token!);

          if (backendRecords && backendRecords.length > 0) {
            setIsMember(true); // Member from our perspective
            setBackendOnboardingInfo(backendRecords[0]);
            console.log(`User @${username} found in backend records.`);
          } else {
            setIsMember(false); // Not member anywhere
            console.log(
              `User @${username} NOT found in backend records either. Can be onboarded.`
            );
          }
        } catch (backendError: any) {
          setIsMember(null); // Status unknown due to backend error
          setMembershipCheckError(
            `Backend check failed: ${
              backendError.message || "Unknown backend error"
            }`
          );
          console.error(
            `Error checking backend for @${username}:`,
            backendError
          );
        }
      } else {
        setIsMember(null); // Status unknown due to HSBI API error
        setMembershipCheckError(
          `HSBI API error: ${hsbiApiResponse.status} ${hsbiApiResponse.statusText}`
        );
        console.error(
          `HSBI API error for @${username}. Status: ${hsbiApiResponse.status}`
        );
      }
    } catch (networkError: any) {
      setIsMember(null); // Status unknown due to network error
      setMembershipCheckError(
        `Network error checking HSBI status: ${
          networkError.message || "Unknown network error"
        }`
      );
      console.error(
        `Network error checking HSBI API for @${username}:`,
        networkError
      );
    } finally {
      setIsCheckingMembership(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    setFoundUser(null);
    setError(null);
    setIsMember(null);
    setMembershipCheckError(null);
    setBackendOnboardingInfo(null);

    const trimmedUsername = usernameInput.trim().toLowerCase();
    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }

    setIsLoading(true);

    try {
      const accounts = await HiveApi.getAccount(trimmedUsername);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const userData: HiveAccount = { name: account.name };
        setFoundUser(userData);
        setError(null);
        await checkMembership(userData.name);
      } else {
        setError(`User "@${trimmedUsername}" not found on Hive.`);
        setFoundUser(null);
        setIsMember(null);
        setBackendOnboardingInfo(null);
      }
    } catch (err: any) {
      console.error("Error fetching account:", err);
      setError(
        `Error searching for user: ${err.message || "An API error occurred"}`
      );
      setFoundUser(null);
      setIsMember(null);
      setBackendOnboardingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openOnboardModal = (usernameToUse: string, startStep: number) => {
    setModalUser(usernameToUse);
    setModalStartStep(startStep);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalUser(null);
    setModalStartStep(1);
  };

  return (
    <div className="onboard-user-container">
      <h1>Onboard User</h1>

      <form onSubmit={handleSearch} className="user-search-form">
        <input
          type="text"
          placeholder="Enter Hive username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          disabled={isLoading || isCheckingMembership}
          className="search-input"
        />
        <button
          type="submit"
          disabled={isLoading || isCheckingMembership || !usernameInput.trim()}
          className="search-button"
        >
          {isLoading
            ? "Searching..."
            : isCheckingMembership
            ? "Checking Membership..."
            : "Search User"}
        </button>
      </form>

      {isLoading && <p className="search-status">Searching Hive...</p>}
      {error && <p className="search-error">Error: {error}</p>}

      {foundUser && (
        <div className="user-result">
          <p>
            User found: <strong>@{foundUser.name}</strong>
          </p>

          {isCheckingMembership ? (
            <p className="membership-status">Checking membership...</p>
          ) : membershipCheckError ? (
            <p className="membership-error">
              Membership check failed: {membershipCheckError}
            </p>
          ) : isMember === true ? (
            <div className="membership-status member">
              {" "}
              {/* Added 'member' class for specific styling */}
              <span className="membership-status-icon is-member-icon">✓</span>
              <p>Already a member of HSBI.</p>
              {backendOnboardingInfo && (
                <div className="backend-onboard-info">
                  {" "}
                  {/* Added class for this section */}
                  <p>
                    Onboarded by:{" "}
                    <strong>{backendOnboardingInfo.onboarder}</strong> on{" "}
                    {/* Assuming formatTimestampManual expects ms */}
                    {formatTimestampManual(backendOnboardingInfo.timestamp)}
                  </p>
                  {!backendOnboardingInfo.comment_permlink && (
                    <div className="missing-comment-section">
                      {" "}
                      {/* Added class */}
                      <p>
                        Onboard Comment is missing. Click below to edit and post
                        it.
                      </p>
                      <button
                        onClick={() => openOnboardModal(foundUser.name, 2)} // Step 2 for editing comment
                        className="edit-onboard-button"
                      >
                        Edit Comment
                      </button>
                    </div>
                  )}
                  {backendOnboardingInfo.comment_permlink && (
                    <p>
                      Comment posted:{" "}
                      <a
                        href={`https://hive.blog/@${backendOnboardingInfo.onboarder}/${backendOnboardingInfo.comment_permlink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comment-permlink-link"
                      >
                        {backendOnboardingInfo.comment_permlink}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : isMember === false ? (
            <div className="membership-status not-member">
              {" "}
              {/* Added 'not-member' class */}
              <span className="membership-status-icon not-member-icon">✗</span>
              <p>Not yet a member of HSBI.</p>
              <button
                onClick={() => openOnboardModal(foundUser.name, 1)} // Step 1 for new onboarding
                className="onboard-button"
              >
                Onboard @{foundUser.name}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {isModalOpen && modalUser && (
        <OnboardModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          username={modalUser}
          onboarderUsername={onboarderUsername}
          startStep={modalStartStep}
          existingOnboardInfo={backendOnboardingInfo}
        />
      )}
    </div>
  );
};

export default OnBoardUser;

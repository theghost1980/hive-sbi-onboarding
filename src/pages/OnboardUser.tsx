import React, { useEffect, useState } from "react";
import backendApi from "../api/backend";
import { HiveApi } from "../api/HIveApi";
import { HSBIApi } from "../api/HSBI";
import OnboardingList, { OnboardingEntry } from "../components/OnBoardingList";
import OnboardModal from "../components/OnboardModal";
import {
  BE_ONBOARDED_BY_USERNAME_EP,
  HSBI_API_MEMBERS_EP,
} from "../config/constants";
import { useAuth } from "../context/AuthContext";
import { formatTimestampManual } from "../utils/format.utils";
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

  const [showOnboardingList, setShowOnboardingList] = useState(true);
  const [latestsAdditionsList, setLatestsAdditionsList] =
    useState<OnboardingEntry[]>();

  const { user: onboarder } = useAuth();
  const onboarderUsername = onboarder?.username || "unknown";

  useEffect(() => {
    if (usernameInput.trim().length > 3 && latestsAdditionsList?.length) {
      const trimmedUsername = usernameInput.trim();
      const foundInList = latestsAdditionsList.find(
        (item) => item.onboarded.toLowerCase() === trimmedUsername
      );

      if (foundInList) {
        console.log(
          `Usuario @${trimmedUsername} encontrado en la lista local.`
        );
        setFoundUser({ name: trimmedUsername });
        setError(null);
        setIsMember(true);
        setBackendOnboardingInfo(foundInList as BackendOnboardingInfo);
        setIsCheckingMembership(false);
        setIsLoading(false);
        return;
      }
    }
  }, [usernameInput]);

  const checkMembership = async (username: string) => {
    setShowOnboardingList(false);
    setIsCheckingMembership(true);
    setIsMember(null);
    setMembershipCheckError(null);
    setBackendOnboardingInfo(null);

    try {
      const responseUsername: any = await HSBIApi.get(
        `${HSBI_API_MEMBERS_EP}${username}/`
      );
      if (responseUsername.account) setIsMember(true);
    } catch (error: any) {
      if (error.message.includes("404")) {
        const response: any = await backendApi.get(
          `${BE_ONBOARDED_BY_USERNAME_EP}/?username=${username}`
        );
        if (response && response.length > 0) {
          setIsMember(true);
          setBackendOnboardingInfo(response[0]);
        } else {
          setIsMember(false);
        }
      } else {
        console.log("Error OnboardUser fetch", { error });
      }
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
        `Error searching for user: ${
          (err as Error).message || "An API error occurred"
        }`
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
    <div className="onboard-layout">
      {" "}
      <div className="onboard-search-section">
        {" "}
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
            disabled={
              isLoading || isCheckingMembership || !usernameInput.trim()
            }
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
                <span className="membership-status-icon is-member-icon">✓</span>
                <p>Already a member of HSBI.</p>
                {backendOnboardingInfo && (
                  <div className="backend-onboard-info">
                    {" "}
                    <p>
                      Onboarded by:{" "}
                      <strong>{backendOnboardingInfo.onboarder}</strong> on{" "}
                      {formatTimestampManual(backendOnboardingInfo.timestamp)}
                    </p>
                    {!backendOnboardingInfo.comment_permlink && (
                      <div className="missing-comment-section">
                        {" "}
                        <p>
                          Onboard Comment is missing. Click below to edit and
                          post it.
                        </p>
                        <button
                          onClick={() => openOnboardModal(foundUser.name, 2)}
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
                <span className="membership-status-icon not-member-icon">
                  ✗
                </span>
                <p>Not yet a member of HSBI.</p>
                <button
                  onClick={() => openOnboardModal(foundUser.name, 1)}
                  className="onboard-button"
                >
                  Onboard @{foundUser.name}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>{" "}
      <div className="all-onboardings-section">
        {" "}
        <div className="list-header-controls">
          {" "}
          <h2 className="all-onboardings-title">All Onboarding Records</h2>
          <button
            type="button"
            className="toggle-list-button"
            onClick={() => setShowOnboardingList(!showOnboardingList)}
          >
            {showOnboardingList ? "Hide List" : "Show List"}
          </button>
        </div>
        {showOnboardingList && (
          <OnboardingList setOnboardingList={setLatestsAdditionsList} />
        )}{" "}
      </div>{" "}
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

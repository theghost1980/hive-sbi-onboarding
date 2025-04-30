import React, { useEffect, useState } from "react";
import styled from "styled-components";
import backendApi from "../api/Backend";
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

const StyledOnboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
  font-family: sans-serif;
`;

const StyledSearchSection = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }
`;

const StyledAllOnboardingsSection = styled.div`
  width: 100%;
`;

const StyledListHeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 10px;
`;

const StyledAllOnboardingsTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5em;
`;

const StyledToggleListButton = styled.button`
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #eee;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ddd;
  }
`;

const StyledUserSearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const StyledSearchInput = styled.input`
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StyledSearchButton = styled(StyledButton)`
  background-color: #007bff;
  color: white;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

const StyledOnboardButton = styled(StyledButton)`
  background-color: #28a745;
  color: white;
  margin-top: 15px;

  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

const StyledEditOnboardButton = styled(StyledButton)`
  background-color: #ffc107;
  color: #333;
  margin-top: 15px;
  border: 1px solid #ffb000;

  &:hover:not(:disabled) {
    background-color: #e0a800;
    border-color: #d39e00;
  }
`;

const StyledSearchStatus = styled.p`
  color: #555;
  text-align: center;
  font-style: italic;
  margin-top: 10px;
`;

const StyledSearchError = styled.p`
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
`;

const StyledUserResult = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);

  > p strong {
    color: #0056b3;
  }
`;

type MembershipStatusProps = { $isMember?: boolean | null };

const StyledMembershipStatus = styled.div<MembershipStatusProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  padding-top: 0;

  p {
    margin: 5px 0;
    font-size: 1em;
    color: #333;
  }

  ${(props) =>
    props.$isMember === true &&
    `
     p { color: #28a745; font-weight: bold; }
  `}
  ${(props) =>
    props.$isMember === false &&
    `
     p { color: #ffc107; font-weight: bold; }
  `}
`;

const StyledMembershipStatusIcon = styled.span<MembershipStatusProps>`
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 8px;

  ${(props) =>
    props.$isMember === true &&
    `
     color: #28a745;
  `}
  ${(props) =>
    props.$isMember === false &&
    `
     color: #ffc107;
  `}
`;

const StyledBackendOnboardInfo = styled.div`
  width: 100%;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
  text-align: center;

  p {
    margin: 5px 0;
    color: #555;
    font-size: 0.9em;
  }

  strong {
    color: #007bff;
  }
`;

const StyledMissingCommentSection = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  width: 100%;
  text-align: center;

  p {
    margin-bottom: 10px;
    font-weight: bold;
    color: #dc3545;
  }
`;

const StyledCommentPermlinkLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: normal;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledMembershipError = styled.p`
  color: #dc3545;
  font-weight: bold;
  margin-top: 15px;
  text-align: center;
`;

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
      const trimmedUsername = usernameInput.trim().toLowerCase();
      const foundInList = latestsAdditionsList.find(
        (item) => item.onboarded.toLowerCase() === trimmedUsername
      );

      if (foundInList) {
        console.log(`User @${trimmedUsername} found in local list.`);
        setFoundUser({ name: trimmedUsername });
        setError(null);
        setIsMember(true);
        setBackendOnboardingInfo(foundInList as BackendOnboardingInfo);
        setIsCheckingMembership(false);
        setIsLoading(false);
        return;
      }
    }
  }, [usernameInput, latestsAdditionsList]);

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
      if (responseUsername && responseUsername.account) {
        setIsMember(true);
      } else {
        const response: any = await backendApi.get(
          `${BE_ONBOARDED_BY_USERNAME_EP}/?username=${username}`
        );
        if (response && response.length > 0) {
          setIsMember(true);
          setBackendOnboardingInfo(response[0]);
        } else {
          setIsMember(false);
        }
      }
    } catch (error: any) {
      if (
        error.message &&
        typeof error.message === "string" &&
        error.message.includes("404")
      ) {
        try {
          const response: any = await backendApi.get(
            `${BE_ONBOARDED_BY_USERNAME_EP}/?username=${username}`
          );
          if (response && response.length > 0) {
            setIsMember(true);
            setBackendOnboardingInfo(response[0]);
          } else {
            setIsMember(false);
          }
        } catch (backendError: any) {
          console.error("Error checking backend for onboarding:", backendError);
          setMembershipCheckError(
            `Backend check failed: ${backendError.message || "Unknown error"}`
          );
          setIsMember(null);
        }
      } else {
        console.error("Error checking HSBI membership:", error);
        setMembershipCheckError(
          `HSBI API check failed: ${error.message || "Unknown error"}`
        );
        setIsMember(null);
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
    setShowOnboardingList(false);

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
        setIsCheckingMembership(false);
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
      setIsCheckingMembership(false);
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
    <StyledOnboardLayout>
      <StyledSearchSection>
        <h1>Onboard User</h1>
        <StyledUserSearchForm onSubmit={handleSearch}>
          <StyledSearchInput
            type="text"
            placeholder="Enter Hive username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            disabled={isLoading || isCheckingMembership}
          />
          <StyledSearchButton
            type="submit"
            disabled={
              isLoading || isCheckingMembership || !usernameInput.trim()
            }
          >
            {isLoading
              ? "Searching..."
              : isCheckingMembership
              ? "Checking Membership..."
              : "Search User"}
          </StyledSearchButton>
        </StyledUserSearchForm>

        {isLoading && (
          <StyledSearchStatus>Searching Hive...</StyledSearchStatus>
        )}
        {error && <StyledSearchError>Error: {error}</StyledSearchError>}

        {foundUser && (
          <StyledUserResult>
            <p>
              User found: <strong>@{foundUser.name}</strong>
            </p>

            {isCheckingMembership ? (
              <StyledMembershipStatus>
                <p>Checking membership...</p>
              </StyledMembershipStatus>
            ) : membershipCheckError ? (
              <StyledMembershipError>
                Membership check failed: {membershipCheckError}
              </StyledMembershipError>
            ) : isMember === true ? (
              <StyledMembershipStatus $isMember={true}>
                <StyledMembershipStatusIcon $isMember={true}>
                  ✓
                </StyledMembershipStatusIcon>
                <p>Already a member of HSBI.</p>
                {backendOnboardingInfo && (
                  <StyledBackendOnboardInfo>
                    <p>
                      Onboarded by:{" "}
                      <strong>{backendOnboardingInfo.onboarder}</strong> on{" "}
                      {formatTimestampManual(backendOnboardingInfo.timestamp)}
                    </p>
                    {!backendOnboardingInfo.comment_permlink && (
                      <StyledMissingCommentSection>
                        <p>
                          Onboard Comment is missing. Click below to edit and
                          post it.
                        </p>
                        <StyledEditOnboardButton
                          onClick={() => openOnboardModal(foundUser.name, 2)}
                        >
                          Edit Comment
                        </StyledEditOnboardButton>
                      </StyledMissingCommentSection>
                    )}
                    {backendOnboardingInfo.comment_permlink && (
                      <p>
                        Comment posted:{" "}
                        <StyledCommentPermlinkLink
                          href={`https://hive.blog/@${backendOnboardingInfo.onboarder}/${backendOnboardingInfo.comment_permlink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {backendOnboardingInfo.comment_permlink}
                        </StyledCommentPermlinkLink>
                      </p>
                    )}
                  </StyledBackendOnboardInfo>
                )}
              </StyledMembershipStatus>
            ) : isMember === false ? (
              <StyledMembershipStatus $isMember={false}>
                <StyledMembershipStatusIcon $isMember={false}>
                  ✗
                </StyledMembershipStatusIcon>
                <p>Not yet a member of HSBI.</p>
                <StyledOnboardButton
                  onClick={() => openOnboardModal(foundUser.name, 1)}
                >
                  Onboard @{foundUser.name}
                </StyledOnboardButton>
              </StyledMembershipStatus>
            ) : null}
          </StyledUserResult>
        )}
      </StyledSearchSection>

      <StyledAllOnboardingsSection>
        <StyledListHeaderControls>
          <StyledAllOnboardingsTitle>
            All Onboarding Records
          </StyledAllOnboardingsTitle>
          <StyledToggleListButton
            type="button"
            onClick={() => setShowOnboardingList(!showOnboardingList)}
          >
            {showOnboardingList ? "Hide List" : "Show List"}
          </StyledToggleListButton>
        </StyledListHeaderControls>
        {showOnboardingList && (
          <OnboardingList setOnboardingList={setLatestsAdditionsList} />
        )}{" "}
      </StyledAllOnboardingsSection>

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
    </StyledOnboardLayout>
  );
};

export default OnBoardUser;

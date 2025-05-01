import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backendApi from "../api/Backend";
import { BE_GET_ALL_ONBOARDED_EP } from "../config/constants";
import { JWT_TOKEN_STORAGE_KEY, useAuth } from "../context/AuthContext";
import { FormatUtils } from "../utils/format.utils";

export interface OnboardingEntry {
  onboarder: string;
  onboarded: string;
  amount: string;
  memo: string;
  timestamp: number;
}

interface OnboardingListProps {
  setOnboardingList: (data: OnboardingEntry[]) => void;
}

const StyledContainer = styled.div`
  margin: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-family: sans-serif;
  font-size: small;
  background-color: rgb(205, 255, 245);
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }
`;

const StyledLoadingMessage = styled.p`
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #007bff;
  background-color: #e9f5ff;
  border: 1px solid #b8daff;
`;

const StyledErrorMessage = styled.p`
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
`;

const StyledNoRecordsMessage = styled.p`
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #6c757d;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
`;

const StyledOnboardingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledOnboardingItem = styled.li`
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;

  p {
    margin: 0;
    font-size: 0.95em;
  }

  p strong {
    display: inline-block;
    width: 100px;
    margin-right: 5px;
  }
`;

function OnboardingList({ setOnboardingList }: OnboardingListProps) {
  const { t } = useTranslation();
  const { setAuth, isLoadingAuth, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [onboardings, setOnboardings] = useState<OnboardingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardings = async () => {
      const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
      if (!token) {
        if (!isAuthenticated) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data: OnboardingEntry[] = await backendApi.get(
          BE_GET_ALL_ONBOARDED_EP
        );
        setOnboardings(data);
        setOnboardingList(data);
      } catch (err: any) {
        console.error("Failed to fetch onboardings:", err);
        setError(
          "Error fetching onboardings: " + (err.message || "Unknown error")
        );
        if (
          err &&
          typeof err.message === "string" &&
          err.message.includes("401")
        ) {
          console.log(
            "Token expirado o inválido al cargar la lista. Redirigiendo a login."
          );
          logout();
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardings();
  }, [isAuthenticated, logout, navigate, setOnboardingList]);

  return (
    <StyledContainer>
         <h2>{t("onboarding_list.title")}</h2>     
      {isLoading && (
        <StyledLoadingMessage>
          {t("onboarding_list.loading_message")}
        </StyledLoadingMessage>
      )}
      {error && <StyledErrorMessage>{error}</StyledErrorMessage>}     
      {!isLoading && !error && onboardings.length > 0 && (
        <StyledOnboardingList>
          {onboardings.map((item, index) => (
            <StyledOnboardingItem key={index}>
              <p>
                <strong>{t("onboarding_list.labels.onboarder")}</strong>
                {item.onboarder}             
              </p>
              <p>
                <strong>{t("onboarding_list.labels.onboarded")}</strong>
                {item.onboarded}             
              </p>
              <p>
                <strong>{t("onboarding_list.labels.amount")}</strong>
                {item.amount}             
              </p>
              <p>
                <strong>{t("onboarding_list.labels.memo")}</strong>
                {item.memo}   
              </p>
              <p>
                <strong>{t("onboarding_list.labels.date")}</strong>      
                {FormatUtils.formatTimestampManual(item.timestamp)}             
              </p>
            </StyledOnboardingItem>
          ))}
        </StyledOnboardingList>
      )}
           
      {!isLoading && !error && onboardings.length === 0 && (
        <StyledNoRecordsMessage>
          {t("onboarding_list.no_records_message")}       
        </StyledNoRecordsMessage>
      )}
    </StyledContainer>
  );
}

export default OnboardingList;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendApi from "../api/backend";
import { BE_GET_ALL_ONBOARDED_EP } from "../config/constants";
import { JWT_TOKEN_STORAGE_KEY, useAuth } from "../context/AuthContext";
import { FormatUtils } from "../utils/format.utils";
import "./OnboardingList.css";

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

function OnboardingList({ setOnboardingList }: OnboardingListProps) {
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
        if (err.includes("401")) {
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
  }, [isAuthenticated]);

  return (
    <div className="onboarding-list-container">
      <h2>Last Onboardings</h2>

      {isLoading && <p className="loading-message">Loading onboardings...</p>}

      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && onboardings.length > 0 && (
        <ul className="onboarding-items-list">
          {onboardings.map((item, index) => (
            <li key={index} className="onboarding-item">
              <p>
                <strong>Onboarder:</strong> {item.onboarder}
              </p>
              <p>
                <strong>Onboarded:</strong> {item.onboarded}
              </p>
              <p>
                <strong>Amount:</strong> {item.amount}
              </p>
              <p>
                <strong>Memo:</strong> {item.memo}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {FormatUtils.formatTimestampManual(item.timestamp)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && !error && onboardings.length === 0 && (
        <p className="no-records-message">No onboarding records found yet.</p>
      )}
    </div>
  );
}

export default OnboardingList;

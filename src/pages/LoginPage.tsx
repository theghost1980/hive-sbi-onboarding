import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { config } from "../config/config";
import { useAuth } from "../context/AuthContext";
import { KeychainUtils } from "../utils/keychain.utils";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isLoadingAuth, isAuthenticated, user, logout } = useAuth();

  const [keychainStatusText, setKeychainStatusText] =
    useState("Verificando...");
  const [isKeychainExtensionInstalled, setIsKeychainExtensionInstalled] =
    useState(false);

  useEffect(() => {
    const checkWithDelay = () => {
      if (typeof window !== "undefined") {
        const installed = KeychainUtils.isKeychainInstalled(window);
        setIsKeychainExtensionInstalled(installed);

        if (installed) {
          setKeychainStatusText("Hive Keychain está instalado.");
        } else {
          setKeychainStatusText("Hive Keychain NO está instalado.");
        }
      } else {
        setKeychainStatusText("No en entorno de navegador.");
        setIsKeychainExtensionInstalled(false);
      }
    };

    const timer = setTimeout(checkWithDelay, 120);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleLoginWithKeychain = async () => {
    if (!username) {
      setMessage("Please enter your Hive username.");
      return;
    }

    if (!isKeychainExtensionInstalled) {
      setMessage(
        "Hive Keychain extension not found or browser environment not detected. Please install it."
      );
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const challengeResponse = await fetch(
        `${config.backend.remote}/auth/challenge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      ).then((res) => {
        if (!res.ok)
          throw new Error(
            `Failed to get challenge from backend (Status: ${res.status})`
          );
        return res.json();
      });
      const challenge = challengeResponse.challenge;

      if (typeof window.hive_keychain !== "undefined") {
        //@ts-ignore
        window.hive_keychain.requestSignBuffer(
          username,
          challenge,
          "Posting",
          async (response: any) => {
            setIsLoading(false);

            if (response.success) {
              const signature = response.result;

              try {
                const verifyResponse = await fetch(
                  `${config.backend.remote}/auth/verify`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, signature }),
                  }
                ).then((res) => {
                  if (!res.ok) {
                    if (res.status === 401)
                      throw new Error(
                        "Backend verification failed: Invalid signature or key."
                      );
                    if (res.status === 404)
                      throw new Error(
                        "Backend verification failed: User not found during verification."
                      );
                    throw new Error(
                      `Backend verification failed with status: ${res.status}`
                    );
                  }
                  return res.json();
                });

                if (verifyResponse.success && verifyResponse.token) {
                  const userAuthenticated = {
                    username: username,
                    role: "user",
                  };

                  setAuth(userAuthenticated, verifyResponse.token);
                  setMessage("Login successful!");
                  navigate("/");
                } else {
                  setMessage(verifyResponse.error || "Verification failed.");
                }
              } catch (verifyError: any) {
                console.error(
                  "Error during backend verification fetch:",
                  verifyError
                );
                setMessage(
                  verifyError.message ||
                    "An error occurred during verification."
                );
              }
            } else {
              console.warn(
                "Keychain request failed or was cancelled:",
                response.message
              );
              setMessage(response.message || "Keychain request failed.");
            }
          }
        );
      } else {
        setMessage(
          "Keychain not available immediately before signing request."
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error before Keychain request:", error);
      setMessage(
        error.message || "An error occurred before the login request."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {isLoadingAuth ? (
        <div className="auth-loading-status">
          Loading authentication status...
        </div>
      ) : isAuthenticated ? (
        <div className="already-logged-in">
          <h2>You are already logged in</h2>
          {user && (
            <p>
              Logged in as: <strong>{user.username}</strong>
            </p>
          )}
          <p>
            <Link to="/">Go to Home</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="login-title-container">
            <h2>Login with Hive Keychain</h2>
            {keychainStatusText !== "Verificando..." && (
              <span
                className={`keychain-status-icon ${
                  isKeychainExtensionInstalled ? "installed" : "not-installed"
                }`}
              >
                {isKeychainExtensionInstalled ? "✓" : "✗"}
              </span>
            )}
          </div>

          {message && (
            <p
              className={`login-message ${
                message.includes("successful") ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}

          <input
            type="text"
            placeholder="Hive Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || !isKeychainExtensionInstalled}
            className="login-input"
          />

          <button
            onClick={handleLoginWithKeychain}
            disabled={isLoading || !isKeychainExtensionInstalled || !username}
            className="login-button"
          >
            {isLoading ? "Processing..." : "Login with Keychain"}
          </button>

          {!isKeychainExtensionInstalled &&
            keychainStatusText !== "Verificando..." && (
              <p className="install-keychain-prompt">
                <a
                  href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjddpbnngghimicjdapipbob"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click here to install Hive Keychain
                </a>
              </p>
            )}
        </>
      )}
    </div>
  );
};

export default LoginPage;

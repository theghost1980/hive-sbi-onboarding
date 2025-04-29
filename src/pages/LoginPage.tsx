import { KeychainHelper, KeychainHelperUtils } from "keychain-helper";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getChallenge, verifyUser } from "../api/AuthApi";
import { useAuth } from "../context/AuthContext";
import { LocalStorageUtils } from "../utils/localstorage.utils";
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

  const [savedUsernames, setSavedUsernames] = useState<string[]>([]);
  const [showSavedUsernames, setShowSavedUsernames] = useState(false);

  useEffect(() => {
    KeychainHelperUtils.isKeychainInstalled(window, (isInstalled) => {
      if (isInstalled) {
        setIsKeychainExtensionInstalled(isInstalled);
        setKeychainStatusText("Hive Keychain está instalado.");
      } else {
        setKeychainStatusText("Hive Keychain NO está instalado.");
      }
    });
  }, []);

  useEffect(() => {
    const loadedUsernames = LocalStorageUtils.getSavedUsernames();
    setSavedUsernames(loadedUsernames);
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
    setShowSavedUsernames(false);

    try {
      const challenge = (await getChallenge(username)).challenge;
      KeychainHelper.requestSignBuffer(
        username,
        challenge,
        "Posting",
        async (response) => {
          if (response.success) {
            const signature = response.result;
            if (!signature) {
              setMessage("Keychain did not return a signature.");
              return;
            }
            try {
              const verifyResponse = await verifyUser(username, signature);
              if (verifyResponse.success && verifyResponse.token) {
                const userAuthenticated = {
                  username: username,
                  role: "user",
                };
                setAuth(userAuthenticated, verifyResponse.token);
                setMessage("Login successful!");
                LocalStorageUtils.saveUsername(username);
                navigate("/");
              } else {
                setMessage(verifyResponse.error || "Verification failed.");
              }
            } catch (error) {
              setMessage(
                (error as Error).message ||
                  "An error occurred before the login request."
              );
              setIsLoading(false);
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
    } catch (error) {
      console.error("getChallenge error: ", { error });
    }
  };

  const handleSelectSavedUsername = (selectedName: string) => {
    setUsername(selectedName);
    setShowSavedUsernames(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSavedUsernames(false);
    }, 100);
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
          <div className="username-input-container">
            {" "}
            <input
              type="text"
              placeholder="Hive Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() =>
                savedUsernames.length > 0 && setShowSavedUsernames(true)
              }
              onBlur={handleInputBlur}
              disabled={isLoading || !isKeychainExtensionInstalled}
              className="login-input"
              autoComplete="off"
            />
            {showSavedUsernames && savedUsernames.length > 0 && (
              <ul className="username-suggestions">
                {" "}
                {savedUsernames.map((name) => (
                  <li
                    key={name}
                    className="username-suggestion-item"
                    onMouseDown={() => handleSelectSavedUsername(name)}
                  >
                    {" "}
                    {name}
                  </li>
                ))}{" "}
              </ul>
            )}{" "}
          </div>{" "}
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

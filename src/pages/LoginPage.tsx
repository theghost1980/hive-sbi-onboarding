import { KeychainHelper, KeychainHelperUtils } from "keychain-helper";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getChallenge, verifyUser } from "../api/AuthApi";
import bgImageHive from "../assets/bg/explode_hive.png";
import { useAuth } from "../context/AuthContext";
import { LocalStorageUtils } from "../utils/localstorage.utils";
import "./LoginPage.css";

import styled from "styled-components";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  overflow: hidden;

  &::before {
    content: "";
    background-image: url(${bgImageHive}); // Cambia por la ruta de tu imagen
    background-size: cover;
    background-position: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.2; /* opacidad del fondo */
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1; /* asegura que el contenido esté encima del fondo */
  }
`;

const LoadingMessage = styled.div`
  font-size: 1.2rem;
`;

const LoggedInBox = styled.div`
  text-align: center;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const KeychainStatus = styled.span<{ installed: boolean }>`
  font-size: 1.5rem;
  color: ${({ installed }) => (installed ? "green" : "red")};
`;

const Message = styled.p<{ success: boolean }>`
  color: ${({ success }) => (success ? "green" : "red")};
  margin-bottom: 1rem;
`;

const UsernameContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  position: absolute;
  width: 100%;
  z-index: 10;
`;

const SuggestionItem = styled.li`
  padding: 0.5rem;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 0;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const InstallPrompt = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  a {
    color: #0070f3;
    text-decoration: underline;
  }
`;

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
    <Container>
      {isLoadingAuth ? (
        <LoadingMessage>Loading authentication status...</LoadingMessage>
      ) : isAuthenticated ? (
        <LoggedInBox>
          <h2>You are already logged in</h2>
          {user && (
            <p>
              Logged in as: <strong>{user.username}</strong>
            </p>
          )}
          <p>
            <Link to="/">Go to Home</Link>
          </p>
        </LoggedInBox>
      ) : (
        <>
          <TitleContainer>
            <h2>Login with Hive Keychain</h2>
            {keychainStatusText !== "Verificando..." && (
              <KeychainStatus installed={isKeychainExtensionInstalled}>
                {isKeychainExtensionInstalled ? "✓" : "✗"}
              </KeychainStatus>
            )}
          </TitleContainer>

          {message && (
            <Message success={message.includes("successful")}>
              {message}
            </Message>
          )}

          <UsernameContainer>
            <Input
              type="text"
              placeholder="Hive Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() =>
                savedUsernames.length > 0 && setShowSavedUsernames(true)
              }
              onBlur={handleInputBlur}
              disabled={isLoading || !isKeychainExtensionInstalled}
              autoComplete="off"
            />
            {showSavedUsernames && savedUsernames.length > 0 && (
              <SuggestionsList>
                {savedUsernames.map((name) => (
                  <SuggestionItem
                    key={name}
                    onMouseDown={() => handleSelectSavedUsername(name)}
                  >
                    {name}
                  </SuggestionItem>
                ))}
              </SuggestionsList>
            )}
          </UsernameContainer>

          <Button
            onClick={handleLoginWithKeychain}
            disabled={isLoading || !isKeychainExtensionInstalled || !username}
          >
            {isLoading ? "Processing..." : "Login with Keychain"}
          </Button>

          {!isKeychainExtensionInstalled &&
            keychainStatusText !== "Verificando..." && (
              <InstallPrompt>
                <a
                  href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjddpbnngghimicjdapipbob"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click here to install Hive Keychain
                </a>
              </InstallPrompt>
            )}
        </>
      )}
    </Container>
  );
};

export default LoginPage;

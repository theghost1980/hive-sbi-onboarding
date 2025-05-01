import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";
import { BackendOnboardingInfo } from "../pages/OnboardUser";
import { ImageUtils } from "../utils/image.utils";
import { KeychainUtils } from "../utils/keychain.utils";
import Stepper from "./stepper/Stepper";
import Step1 from "./stepper/steps/Step1";
import Step2 from "./stepper/steps/Step2";
import Step3 from "./stepper/steps/Step3";
import {
  StyledItemActionButton,
  StyledKeychainRequiredMessage,
  StyledPostContent,
  StyledPostItem,
  StyledPostList,
  StyledPostThumbnail,
} from "./StyledElements";
export interface StepData {
  selectedPost?: Post; // Del Step 1
  onboarder?: string; // Del Step 1
  onboarded?: string; // Del Step 1
  beResponse1?: any;
  transactionResponse?: any; // Del Step 1 (resultado stake)
  generatedComment?: string; // Del Step 2 (comentario generado)
  postedCommentPermlink?: string;
  editedComment?: string; // Del Step 2 (comentario editado por usuario)
  commentResponse?: any; // Del Step 2 (resultado transacción comentario)
  onboardingSummary?: any;
  editCommentBEresults?: any;
}

export interface Post {
  title: string;
  body: string;
  url: string;
  author: string;
  permlink: string;
  imageUrl?: string;
}

interface OnboardModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  username: string;
  onboarderUsername: string;
  startStep?: number;
  existingOnboardInfo?: BackendOnboardingInfo | null;
}

const StyledModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Mantiene el scroll en el body */
`;

const StyledModalHeaderBar = styled.div`
  background-color: #f0f0f0;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  z-index: 10;
  flex-shrink: 0;
  text-align: center;

  h2 {
    margin: 0 0 5px 0;
    font-size: 1.2em;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.85em;
    color: #555;
  }

  strong {
    color: #007bff;
  }
`;

const StyledModalContentBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  padding-top: 20px; /* Esto parece duplicado, revisaremos después si es necesario */

  .process-error-message {
    color: #dc3545;
    text-align: center;
    margin-bottom: 15px;
    font-weight: bold;
  }

  .keychain-required-message {
    color: #ffc107;
    text-align: center;
    margin-bottom: 15px;
    font-weight: bold;
  }
`;

const StyledCloseButton = styled.button`
  flex-shrink: 0;
  display: block;
  width: 100%;
  padding: 12px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: auto;

  &:hover {
    background-color: #5a6268;
  }
`;

// ... tus otras definiciones de styled-components ...

const StyledProcessErrorMessage = styled.p`
  /* Estilos de .process-error-message de OnboardModal.css */
  color: #dc3545; /* color de peligro */
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
`;

const StyledNoImagePlaceholder = styled.div`
  /* Estilos de .no-image de OnboardModal.css */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #777;
  font-size: 0.8em;
  text-align: center;
  height: 100%; /* Asegura que ocupe el espacio del thumbnail */
  width: 100%;
  border-radius: 4px; /* Si StyledPostThumbnail tiene border-radius */
`;

const StyledMyFlowArea = styled.div`
  /* Estilos de .my-flow-area de OnboardModal.css */
  /* Este div no tenía muchos estilos específicos, a menudo solo es un contenedor para organizar */
  /* Si tenía padding o margin, añádelos aquí */
  /* padding: 10px; */
`;

const OnboardModal: React.FC<OnboardModalProps> = ({
  isOpen,
  onRequestClose,
  username,
  onboarderUsername,
  startStep = 1,
  existingOnboardInfo,
}) => {
  const [stepData, setStepData] = useState<StepData>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorFetchingPosts, setErrorFetchingPosts] = useState<string | null>(
    null
  );
  const [processError, setProcessError] = useState<string | null>(null);
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);

  useEffect(() => {
    if (isOpen && startStep > 1 && existingOnboardInfo) {
      setStepData((prev) => ({
        ...prev,
        commentParentAuthor: existingOnboardInfo.onboarded,
        commentParentPermlink: "initial-post-permlink-here",
      }));
    }
    if (!isOpen) {
      setStepData({});
      setPosts([]);
      setLoadingPosts(false);
      setErrorFetchingPosts(null);
      setProcessError(null);
    }
  }, [isOpen, startStep, existingOnboardInfo]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setIsKeychainAvailable(KeychainUtils.isKeychainInstalled(window));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && username && startStep === 1) {
      setLoadingPosts(true);
      setErrorFetchingPosts(null);

      fetch("https://api.hive.blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "bridge.get_account_posts",
          params: { sort: "posts", account: username, limit: 5 },
          id: 1,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error fetching posts: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.result && data.result.length > 0) {
            const postsData = data.result.map((post: any) => ({
              title: post.title,
              body: post.body,
              url: post.url,
              author: post.author,
              permlink: post.permlink,
              imageUrl: ImageUtils.extractFirstImage(post.body),
            }));
            setPosts(postsData);
          } else {
            setPosts([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching posts:", err);
          setErrorFetchingPosts("Error al obtener publicaciones.");
        })
        .finally(() => setLoadingPosts(false));
    }
  }, [isOpen, username, startStep]);

  const handleStepDataChange = (newData: Partial<StepData>) => {
    setStepData((prev) => ({ ...prev, ...newData }));
  };

  const handleProcessError = (message: string) => {
    setProcessError(message);
  };

  const handlePostSelected = (post: Post) => {
    handleStepDataChange({ selectedPost: post });
  };

  const handleCancelFlow = () => {
    onRequestClose();
  };

  const onboardSteps = [
    {
      component: Step1,
      props: {
        posts: posts,
        loadingPosts: loadingPosts,
        errorFetchingPosts: errorFetchingPosts,
        onPostSelected: handlePostSelected,
        username: username,
        onboarderUsername: onboarderUsername,
        isKeychainAvailable: isKeychainAvailable,
        onTransactionInitiated: () => console.log("Step1 Transaction Init"),
        onTransactionComplete: (response: any) =>
          handleStepDataChange({ transactionResponse: response }),
        onTransactionError: handleProcessError,
      },
    },

    {
      component: Step2,
      props: {
        selectedPost: stepData.selectedPost,
        existingOnboardInfo: existingOnboardInfo,
        username: username,
        onboarderUsername: onboarderUsername,
        isKeychainAvailable: isKeychainAvailable,
        onCommentGenerated: (comment: string) =>
          handleStepDataChange({ generatedComment: comment }),
        onCommentEdited: (comment: string) =>
          handleStepDataChange({ editedComment: comment }),
        onCommentPosted: (response: any) =>
          handleStepDataChange({ commentResponse: response }),

        onTransactionInitiated: () => console.log("Step2 Transaction Init"),
        onTransactionComplete: (response: any) =>
          handleStepDataChange({ commentResponse: response }),
        onTransactionError: handleProcessError,
      },
    },

    {
      component: Step3,
      props: {
        stepData: stepData,
        username: username,
        onboarderUsername: onboarderUsername,
        onComplete: handleCancelFlow,
      },
    },
  ];

  const showPostSelectionList = startStep === 1 && !stepData.selectedPost;

  const showStepperFlow =
    startStep > 1 ||
    (startStep === 1 &&
      stepData.selectedPost !== undefined &&
      stepData.selectedPost !== null);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancelFlow}
      contentLabel="Onboard HSBI Modal"
      className="onboard-modal"
      overlayClassName="onboard-modal-overlay"
      ariaHideApp={false}
    >
      <StyledModalContent>
        <StyledModalHeaderBar>
          <h2>Onboard HSBI</h2>
          <p>
            Usuario: <strong>@{username}</strong> (Onboarder: @
            {onboarderUsername})
          </p>
        </StyledModalHeaderBar>

        <StyledModalContentBody>
          {processError && (
            <StyledProcessErrorMessage>
              {processError}
            </StyledProcessErrorMessage>
          )}

          {showPostSelectionList && (
            <>
              {!isKeychainAvailable && !loadingPosts && !errorFetchingPosts && (
                <StyledKeychainRequiredMessage>
                  Hive Keychain es requerido para apadrinar usuarios. Por favor,
                  asegúrese de que está instalado.
                </StyledKeychainRequiredMessage>
              )}
              {loadingPosts && <p>Cargando publicaciones...</p>}
              {errorFetchingPosts && <p>{errorFetchingPosts}</p>}

              {!loadingPosts && !errorFetchingPosts && posts.length > 0 && (
                <StyledPostList>
                  {posts.map((post, index) => (
                    <StyledPostItem key={post.permlink || index}>
                      <StyledPostThumbnail size="large">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={`Thumbnail for ${post.title}`}
                          />
                        ) : (
                          <StyledNoImagePlaceholder>
                            No image
                          </StyledNoImagePlaceholder>
                        )}
                      </StyledPostThumbnail>

                      <StyledPostContent>
                        <a
                          href={`https://peakd.com${post.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <h3>{post.title}</h3>
                        </a>
                        <p>por @{post.author}</p>
                      </StyledPostContent>
                      <StyledItemActionButton
                        onClick={() => handlePostSelected(post)}
                        disabled={!isKeychainAvailable}
                        title={
                          !isKeychainAvailable ? "Requires Hive Keychain" : ""
                        }
                      >
                        On-board here
                      </StyledItemActionButton>
                    </StyledPostItem>
                  ))}
                </StyledPostList>
              )}
              {!loadingPosts && !errorFetchingPosts && posts.length === 0 && (
                <p>No hay publicaciones recientes para @{username}.</p>
              )}
            </>
          )}

          {showStepperFlow && (
            <StyledMyFlowArea>
              <Stepper
                steps={onboardSteps}
                initialStep={startStep - 1}
                stepData={stepData}
                existingOnboardInfo={existingOnboardInfo}
                onStepDataChange={handleStepDataChange}
                onProcessError={handleProcessError}
                onCancel={handleCancelFlow}
                username={username}
                onboarderUsername={onboarderUsername}
                isKeychainAvailable={isKeychainAvailable}
                onTransactionInitiated={() =>
                  console.log("Modal: Step1 Transaction Init")
                }
                onTransactionComplete={(response: any) =>
                  handleStepDataChange({ transactionResponse: response })
                }
                onTransactionError={handleProcessError}
              />
            </StyledMyFlowArea>
          )}
        </StyledModalContentBody>

        <StyledCloseButton onClick={handleCancelFlow}>Cerrar</StyledCloseButton>
      </StyledModalContent>
    </Modal>
  );
};

export default OnboardModal;

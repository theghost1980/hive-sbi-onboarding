import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { BackendOnboardingInfo } from "../pages/OnboardUser";
import { ImageUtils } from "../utils/image.utils";
import { KeychainUtils } from "../utils/keychain.utils";
import "./OnboardModal.css";
import Stepper from "./stepper/Stepper";
import Step1 from "./stepper/steps/Step1";
import Step2 from "./stepper/steps/Step2";
import Step3 from "./stepper/steps/Step3";
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
      <div className="modal-header-bar">
        <h2>Onboard HSBI</h2>
        <p>
          Usuario: <strong>@{username}</strong> (Onboarder: @{onboarderUsername}
          )
        </p>
      </div>

      <div className="modal-content-body">
        {processError && (
          <p className="process-error-message">{processError}</p>
        )}

        {showPostSelectionList && (
          <>
            {!isKeychainAvailable && !loadingPosts && !errorFetchingPosts && (
              <p className="keychain-required-message">
                Hive Keychain es requerido para apadrinar usuarios. Por favor,
                asegúrese de que está instalado.
              </p>
            )}
            {loadingPosts && <p>Cargando publicaciones...</p>}
            {errorFetchingPosts && <p>{errorFetchingPosts}</p>}

            {!loadingPosts && !errorFetchingPosts && posts.length > 0 && (
              <ul className="post-list">
                {posts.map((post, index) => (
                  <li key={post.permlink || index} className="post-item">
                    <div className="post-thumbnail">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={`Thumbnail for ${post.title}`}
                        />
                      ) : (
                        <div className="no-image">No image</div>
                      )}
                    </div>

                    <div className="post-content">
                      <a
                        href={`https://peakd.com${post.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h3>{post.title}</h3>
                      </a>
                      <p>por @{post.author}</p>
                    </div>
                    <button
                      onClick={() => handlePostSelected(post)}
                      className="onboard-here-button"
                      disabled={!isKeychainAvailable}
                      title={
                        !isKeychainAvailable ? "Requires Hive Keychain" : ""
                      }
                    >
                      On-board here
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!loadingPosts && !errorFetchingPosts && posts.length === 0 && (
              <p>No hay publicaciones recientes para @{username}.</p>
            )}
          </>
        )}

        {showStepperFlow && (
          <div className="my-flow-area">
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
          </div>
        )}
      </div>

      <button onClick={handleCancelFlow} className="close-button">
        Cerrar
      </button>
    </Modal>
  );
};

export default OnboardModal;

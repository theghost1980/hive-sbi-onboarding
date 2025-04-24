import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { KeychainUtils } from "../utils/keychain.utils";
import "./OnboardModal.css";
import Stepper from "./stepper/Stepper";

import Step1 from "./stepper/steps/Step1";

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
  initialSelectedPost?: Post;
}

const OnboardModal: React.FC<OnboardModalProps> = ({
  isOpen,
  onRequestClose,
  username,
  onboarderUsername,
  initialSelectedPost,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorFetchingPosts, setErrorFetchingPosts] = useState<string | null>(
    null
  );

  const [selectedPost, setSelectedPost] = useState<Post | null>(
    initialSelectedPost || null
  );
  const [transactionResponse, setTransactionResponse] = useState<any>(null);
  const [generatedComment, setGeneratedComment] = useState<string>("");
  const [editedComment, setEditedComment] = useState<string>("");
  const [commentResponse, setCommentResponse] = useState<any>(null);
  const [onboardingSummary, setOnboardingSummary] = useState<any>(null);

  const [processError, setProcessError] = useState<string | null>(null);

  const [showSteps, setShowSteps] = useState(
    initialSelectedPost ? true : false
  );

  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setIsKeychainAvailable(KeychainUtils.isKeychainInstalled(window));
    }
    if (!isOpen) {
      setSelectedPost(initialSelectedPost || null);
      setTransactionResponse(null);
      setGeneratedComment("");
      setEditedComment("");
      setCommentResponse(null);
      setOnboardingSummary(null);
      setProcessError(null);
      setShowSteps(initialSelectedPost ? true : false);
      if (!initialSelectedPost) {
        setPosts([]);
        setLoadingPosts(false);
        setErrorFetchingPosts(null);
      }
    }
  }, [isOpen, initialSelectedPost]);

  useEffect(() => {
    if (isOpen && username && !initialSelectedPost && !showSteps) {
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
        .then((res) => res.json())
        .then((data) => {
          if (data.result && data.result.length > 0) {
            const postsData = data.result.map((post: any) => ({
              title: post.title,
              body: post.body,
              url: post.url,
              author: post.author,
              permlink: post.permlink,
              imageUrl: extractFirstImage(post.body),
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
  }, [isOpen, username, initialSelectedPost, showSteps]);

  const extractFirstImage = (body: string): string | null => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = imgRegex.exec(body);
    if (match && match[1]) return match[1];
    const htmlImgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i;
    const htmlMatch = htmlImgRegex.exec(body);
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
    return null;
  };

  const handlePostSelected = (post: Post) => {
    setSelectedPost(post);
    setShowSteps(true);
    setProcessError(null);
  };

  const handleCancelFlow = () => {
    setSelectedPost(initialSelectedPost || null);
    setTransactionResponse(null);
    setGeneratedComment("");
    setEditedComment("");
    setCommentResponse(null);
    setOnboardingSummary(null);
    setProcessError(null);
    setShowSteps(initialSelectedPost ? true : false);
    if (!initialSelectedPost) {
      setPosts([]);
      setLoadingPosts(false);
      setErrorFetchingPosts(null);
    }

    onRequestClose();
  };

  const handleTransactionInitiated = () => {
    console.log("Modal: Transaction initiated from Step1");
  };

  const handleTransactionComplete = (response: any) => {
    console.log("Modal: Transaction complete from Step1!", response);
    setTransactionResponse(response);
    setProcessError(null);
  };

  const handleTransactionError = (message: string) => {
    console.error("Modal: Transaction error from Step1:", message);
    setProcessError(message);
  };

  const onboardSteps = [Step1];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancelFlow}
      contentLabel="Onboard HSBI Modal"
      className="onboard-modal"
      overlayClassName="onboard-modal-overlay"
      ariaHideApp={false}
    >
      <h2>Onboard HSBI</h2>
      <p>
        Usuario a apadrinar: <strong>@{username}</strong>
      </p>

      {processError && <p className="process-error-message">{processError}</p>}

      {!showSteps && (
        <>
          {!isKeychainAvailable && !loadingPosts && !errorFetchingPosts && (
            <p className="keychain-required-message">
              Hive Keychain es requerido para apadrinar usuarios. Por favor,
              asegúrese de que está instalado y accesible.
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
                      <img src={post.imageUrl} alt="Post thumbnail" />
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
                    <p>{post.body.substring(0, 100)}...</p>
                    <div className="post-buttons">
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
                      <a
                        href={`https://peakd.com${post.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="onboard-peakd-button"
                      >
                        View on PeakD
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loadingPosts &&
            !errorFetchingPosts &&
            posts.length === 0 &&
            !isKeychainAvailable && (
              <p>
                No hay publicaciones recientes para @{username}, y Keychain es
                requerido para apadrinar.
              </p>
            )}

          {!loadingPosts &&
            !errorFetchingPosts &&
            posts.length === 0 &&
            isKeychainAvailable && (
              <p>No hay publicaciones recientes para @{username}.</p>
            )}
        </>
      )}

      {showSteps && selectedPost && (
        <div className="my-flow-area">
          <Stepper
            steps={onboardSteps}
            username={username}
            onboarderUsername={onboarderUsername}
            isKeychainAvailable={isKeychainAvailable}
            onCancel={handleCancelFlow}
            onTransactionInitiated={handleTransactionInitiated}
            onTransactionComplete={handleTransactionComplete}
            onTransactionError={handleTransactionError}
            selectedPost={selectedPost}
            transactionResponse={transactionResponse}
          />
        </div>
      )}

      {showSteps && !selectedPost && (
        <p className="process-error-message">
          Error interno: No post seleccionado para iniciar el flujo.
        </p>
      )}

      <button onClick={handleCancelFlow} className="close-button">
        Cerrar
      </button>
    </Modal>
  );
};

export default OnboardModal;

import DOMPurify from "dompurify";
import { KeychainHelper } from "keychain-helper";
import { marked } from "marked";
import React, { useEffect, useState } from "react";
import backendApi from "../../../api/Backend";
import { HttpError, post } from "../../../api/RequestsApi";
import { config } from "../../../config/config";
import { BE_EDIT_ONBOARDING } from "../../../config/constants";
import { JWT_TOKEN_STORAGE_KEY } from "../../../context/AuthContext";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { ImageUtils } from "../../../utils/image.utils";
import { PermlinkUtils } from "../../../utils/permlink.utils";
import { Post, StepData } from "../../OnboardModal";
import "./Step2.css";

// Interfaz de props actualizada para incluir 'config'
interface Step2Props {
  stepData: StepData; // Datos recolectados de pasos anteriores
  existingOnboardInfo?: BackendOnboardingInfo | null; // Datos para modo edición

  onStepDataChange: (data: Partial<any>) => void; // Para actualizar stepData en el Modal
  onProcessError: (message: string) => void; // Para reportar errores generales al Modal
  onCancel: () => void; // Para cancelar el flujo completo

  onNextStep: () => void; // Para avanzar al siguiente paso (ej: Summary)
  onPrevStep: () => void; // Para ir al paso anterior
  onComplete: () => void; // Para finalizar el flujo (si este fuera el último paso)

  username: string; // El usuario a quien se le comentará (el 'onboarded')
  onboarderUsername: string; // El usuario que hace el comentario (el 'onboarder' loggeado)
  isKeychainAvailable: boolean; // Estado de disponibilidad de Keychain
}

const Step2: React.FC<Step2Props> = ({
  stepData,
  existingOnboardInfo,
  onStepDataChange,
  onProcessError,
  onNextStep,
  onPrevStep,
  onComplete,
  onCancel,
  username,
  onboarderUsername,
  isKeychainAvailable,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorFetchingPosts, setErrorFetchingPosts] = useState<string | null>(
    null
  );

  const [selectedPostForComment, setSelectedPostForComment] =
    useState<Post | null>(null);

  const [commentMarkdown, setCommentMarkdown] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>(""); // --- Estados para la transacción de publicación del comentario ---

  const [isPostingComment, setIsPostingComment] = useState(false);
  const [postCommentSuccess, setPostCommentSuccess] = useState(false);
  const [postCommentError, setPostCommentError] = useState<string | null>(null);

  const onboarder = onboarderUsername;
  const onboarded = username;

  useEffect(() => {
    if (!selectedPostForComment && username) {
      setLoadingPosts(true);
      setErrorFetchingPosts(null);
      //    onProcessError(null); // Limpiar error general

      const hiveRpcUrl = "https://api.hive.blog";

      const fetchPosts = async () => {
        try {
          const data = await post(hiveRpcUrl, "", {
            jsonrpc: "2.0",
            method: "bridge.get_account_posts",
            params: { sort: "posts", account: username, limit: 5 },
            id: 1,
          });

          if (data.result && Array.isArray(data.result)) {
            const postsData = data.result.map((post: any) => ({
              title:
                post.title ||
                `Post sin título (${post.permlink.substring(0, 10)}...)`,
              body: post.body,
              url: `/@${post.author}/${post.permlink}`,
              author: post.author,
              permlink: post.permlink,
              imageUrl: ImageUtils.extractFirstImage(post.body),
            }));
            setPosts(postsData);
          } else {
            setPosts([]);
          }
        } catch (err: any) {
          console.error("Error fetching posts in Step 2:", err);
          const errorMessage = `Error al obtener publicaciones: ${
            err instanceof HttpError
              ? err.message
              : err.message || "Error desconocido"
          }`;
          setErrorFetchingPosts(errorMessage);
          onProcessError(errorMessage);
        } finally {
          setLoadingPosts(false);
        }
      };

      fetchPosts();
    }
  }, [username, selectedPostForComment, existingOnboardInfo, config]);

  useEffect(() => {
    let post: Post | null = null;
    let initialText = "";

    setPostCommentSuccess(false);
    setPostCommentError(null);
    setIsPostingComment(false);

    if (stepData.selectedPost) {
      post = stepData.selectedPost;
      initialText = config.templates_comments[0].content_markdown(
        onboarded,
        onboarder
      );
    }
    if (post) {
      setSelectedPostForComment(post);
      setCommentMarkdown(initialText);
    }
  }, [
    stepData.selectedPost,
    existingOnboardInfo,
    username,
    onboarderUsername,
    config,
  ]);

  useEffect(() => {
    if (commentMarkdown) {
      const html = marked(commentMarkdown);
      const safeHtml = DOMPurify.sanitize(html as string);
      setPreviewHtml(safeHtml);
    } else {
      setPreviewHtml("");
    }
  }, [commentMarkdown]);

  const handlePostSelected = (post: Post) => {
    setSelectedPostForComment(post);
    setCommentMarkdown(
      config.templates_comments[0].content_markdown(onboarded, onboarder)
    );
    setPostCommentSuccess(false);
    setPostCommentError(null);
    setIsPostingComment(false);
  };

  const handleMarkdownChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCommentMarkdown(event.target.value);
  };

  const handlePostComment = () => {
    const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
    if (!token) {
      onProcessError(
        "Por favor, Inicie sesion de nuevo, token expirado, corrupto o vencido."
      );
      return;
    }
    if (!selectedPostForComment) {
      onProcessError(
        "Por favor, selecciona una publicación antes de publicar."
      );
      return;
    }
    if (!commentMarkdown.trim()) {
      onProcessError("El comentario no puede estar vacío.");
      return;
    }
    if (!isKeychainAvailable) {
      onProcessError(
        "Hive Keychain no está disponible para firmar la transacción."
      );
      return;
    }

    setIsPostingComment(true);
    setPostCommentSuccess(false);
    setPostCommentError(null);
    onProcessError("");

    const parentAuthor = selectedPostForComment.author;
    const parentPermlink = selectedPostForComment.permlink;
    const authorNewComment = onboarder; // El que publica el comentario // Generar un permlink único para el comentario

    const permlink =
      "re-" + parentAuthor + "-" + PermlinkUtils.generateRandomString(6, true); //removing numbers.

    const title = ""; // Título vacío para comentarios
    const body = commentMarkdown; // json_metadata básico

    const jsonMetadata: Record<string, any> = {
      tags: ["hive-124309", "hsbi", "onboarding"],
      format: "markdown",
      app: "hsbi-onboarder/v1",
      image: [],
      users: [],
    };

    const commentOptions = {
      author: authorNewComment,
      permlink: permlink,
      max_accepted_payout: "10000.000 SBD",
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
      percent_hbd: 100,
    };

    KeychainHelper.requestPost(
      authorNewComment,
      title,
      body,
      parentPermlink,
      parentAuthor,
      JSON.stringify(jsonMetadata),
      permlink,
      JSON.stringify(commentOptions),
      async (response) => {
        if (response.success) {
          setPostCommentSuccess(true);
          try {
            setIsPostingComment(false);
            const responseBEEDIT = await backendApi.put(BE_EDIT_ONBOARDING, {
              onboarder,
              onboarded,
              comment_permlink: permlink,
            });
            //TODO cleanup
            // const responsePutAPI = await editCommentPermlinkOnboardingEntry(
            //   onboarder,
            //   onboarded,
            //   permlink,
            //   token
            // );
            // console.log("editCommentPermlinkOnboardingEntry: ", {
            //   responsePutAPI,
            // });
            onStepDataChange({
              commentResponse: response,
              postedCommentPermlink: permlink,
              editCommentBEresults: responseBEEDIT,
            });
            onNextStep();
          } catch (error) {
            console.error("editCommentPermlinkOnboardingEntry error: ", {
              error,
            });
          }
        } else {
          console.error("Error posting comment:", response);
          const errorMessage =
            response?.message ||
            response?.display_msg ||
            "Error desconocido al publicar el comentario.";
          setPostCommentError(errorMessage);
          onProcessError(errorMessage);
          setIsPostingComment(false);
        }
      }
    );
  };

  const showPostList = !selectedPostForComment;
  const showEditorArea = selectedPostForComment !== null;

  let continueButtonText = "Siguiente";
  if (isPostingComment) {
    continueButtonText = "Publicando...";
  } else if (postCommentSuccess) {
    continueButtonText = "¡Publicado!";
  } else if (postCommentError) {
    continueButtonText = "Intentar de Nuevo";
  }

  return (
    <div className="onboarding-step step-2-comment">
      <h3>Agregar comentario en una publicación para @{username}</h3>{" "}
      {showPostList && (
        <div className="post-selection-section">
          {" "}
          <h4>
            Selecciona una publicación reciente de @{username} para comentar:
          </h4>
          {loadingPosts && <p>Cargando publicaciones...</p>}{" "}
          {errorFetchingPosts && (
            <p style={{ color: "red" }}>Error: {errorFetchingPosts}</p>
          )}{" "}
          {!loadingPosts && !errorFetchingPosts && posts.length > 0 && (
            <ul className="post-list-selectable">
              {" "}
              {posts.map((post, index) => (
                <li
                  key={post.permlink || index}
                  className="post-item-selectable"
                >
                  {" "}
                  <div className="post-thumbnail-small">
                    {" "}
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={`Thumbnail for ${post.title}`}
                      />
                    ) : (
                      <div className="no-image-small">No image</div>
                    )}{" "}
                  </div>{" "}
                  <div className="post-content">
                    {" "}
                    <a
                      href={`https://peakd.com${post.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h5>{post.title}</h5>
                    </a>
                    <p>por @{post.author}</p>{" "}
                  </div>{" "}
                  <button
                    onClick={() => handlePostSelected(post)}
                    className="select-post-button"
                  >
                    Seleccionar
                  </button>{" "}
                </li>
              ))}{" "}
            </ul>
          )}{" "}
          {!loadingPosts && !errorFetchingPosts && posts.length === 0 && (
            <p>No se encontraron publicaciones recientes para @{username}.</p>
          )}{" "}
          <div className="step-navigation-buttons">
            <button onClick={onPrevStep}>Volver</button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {showEditorArea && (
        <div className="comment-editing-section">
          <h4>Editar Comentario</h4>{" "}
          {selectedPostForComment && (
            <p>
              Comentando en:{" "}
              <a
                href={`https://peakd.com${selectedPostForComment.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedPostForComment.title || selectedPostForComment.url}
              </a>{" "}
              por @{selectedPostForComment.author}{" "}
            </p>
          )}{" "}
          <div className="comment-editor-preview-layout">
            {" "}
            <div className="markdown-editor-area">
              <h5>Markdown</h5>{" "}
              <textarea
                value={commentMarkdown}
                onChange={handleMarkdownChange}
                rows={10}
                className="comment-markdown-input"
                placeholder="Escribe tu comentario aquí en formato Markdown..."
                disabled={isPostingComment || postCommentSuccess}
              />{" "}
            </div>{" "}
            <div className="markdown-preview-area">
              <h5>Previsualización</h5>{" "}
              <div
                className="comment-preview"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />{" "}
            </div>{" "}
          </div>{" "}
          {isPostingComment && (
            <p style={{ color: "blue", textAlign: "center", margin: "10px 0" }}>
              Publicando comentario...
            </p>
          )}{" "}
          {postCommentSuccess && (
            <p
              style={{
                color: "green",
                textAlign: "center",
                fontWeight: "bold",
                margin: "10px 0",
              }}
            >
              ¡Comentario publicado con éxito!
            </p>
          )}{" "}
          {postCommentError && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                fontWeight: "bold",
                margin: "10px 0",
              }}
            >
              Error al publicar: {postCommentError}
            </p>
          )}{" "}
          <div className="step-navigation-buttons">
            {" "}
            {!isPostingComment && !postCommentSuccess && (
              <button onClick={onPrevStep}>Volver</button>
            )}{" "}
            <button
              onClick={handlePostComment}
              disabled={
                !commentMarkdown.trim() ||
                !isKeychainAvailable ||
                isPostingComment ||
                postCommentSuccess
              }
              title={
                !isKeychainAvailable
                  ? "Requires Hive Keychain"
                  : isPostingComment
                  ? "Publicando..."
                  : postCommentSuccess
                  ? "Publicado"
                  : "Continuar"
              }
              className="next-step-button"
            >
              {continueButtonText}{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

export default Step2;

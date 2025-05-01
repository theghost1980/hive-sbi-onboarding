import DOMPurify from "dompurify";
import { KeychainHelper } from "keychain-helper";
import { marked } from "marked";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import backendApi from "../../../api/Backend";
import { HttpError, post } from "../../../api/RequestsApi";
import { config } from "../../../config/config";
import { BE_EDIT_ONBOARDING } from "../../../config/constants";
import { JWT_TOKEN_STORAGE_KEY } from "../../../context/AuthContext";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser";
import { ImageUtils } from "../../../utils/image.utils";
import { PermlinkUtils } from "../../../utils/permlink.utils";
import { Post, StepData } from "../../OnboardModal";
import {
  StyledCommentEditorPreviewLayout,
  StyledCommentMarkdownInput,
  StyledCommentPreview,
  StyledItemActionButton,
  StyledMarkdownArea,
  StyledMarkdownPreviewArea,
  StyledNavigationButtons,
  StyledNextButton,
  StyledPostContent,
  StyledPostItem,
  StyledPostList,
  StyledPostThumbnail,
  StyledPrevButton,
} from "../../StyledElements";
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

// Contenedor principal del paso
const StyledStep2Container = styled.div`
  /* Estilos de .onboarding-step y .step-2-comment de Step2.css */
  padding: 20px; /* Ya aplicado en el Stepper, pero lo definimos aquí por si acaso */
`;

// Sección para seleccionar posts
const StyledPostSelectionSection = styled.div`
  /* Estilos de .post-selection-section de Step2.css */
  /* (Este div no tenía muchos estilos específicos, principalmente es un contenedor) */
`;

// Sección para editar el comentario
const StyledCommentEditingSection = styled.div`
  /* Estilos de .comment-editing-section de Step2.css */
  /* (Similarmente, este div es principalmente un contenedor) */
`;

// Algunos estilos en línea que podemos convertir a componentes estilizados si se usan a menudo
const StyledErrorMessage = styled.p`
  color: red;
  text-align: center; /* Ajusta si el estilo en línea no tenía esto */
  margin: 10px 0; /* Ajusta si el estilo en línea no tenía esto */
  font-weight: bold; /* Si aplica */
`;

const StyledSuccessMessage = styled.p`
  color: green;
  text-align: center;
  font-weight: bold;
  margin: 10px 0;
`;

const StyledInfoMessage = styled.p`
  color: blue;
  text-align: center;
  margin: 10px 0;
`;

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
      onProcessError("");

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
    <StyledStep2Container>
      <h3>Agregar comentario en una publicación para @{username}</h3>{" "}
      {showPostList && (
        <StyledPostSelectionSection>
          {" "}
          <h4>
            Selecciona una publicación reciente de @{username} para comentar:
          </h4>
          {loadingPosts && <p>Cargando publicaciones...</p>}{" "}
          {errorFetchingPosts && (
            <p style={{ color: "red" }}>Error: {errorFetchingPosts}</p>
          )}{" "}
          {!loadingPosts && !errorFetchingPosts && posts.length > 0 && (
            <StyledPostList>
              {posts.map((post, index) => (
                <StyledPostItem key={post.permlink || index}>
                  <StyledPostThumbnail size="small">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={`Thumbnail for ${post.title}`}
                      />
                    ) : (
                      <div className="no-image-small">No image</div>
                    )}{" "}
                  </StyledPostThumbnail>
                  <StyledPostContent>
                    <a
                      href={`https://peakd.com${post.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h5>{post.title}</h5>
                    </a>
                    <p>por @{post.author}</p>{" "}
                  </StyledPostContent>
                  <StyledItemActionButton
                    onClick={() => handlePostSelected(post)}
                  >
                    Seleccionar
                  </StyledItemActionButton>
                </StyledPostItem>
              ))}
            </StyledPostList>
          )}{" "}
          {!loadingPosts && !errorFetchingPosts && posts.length === 0 && (
            <p>No se encontraron publicaciones recientes para @{username}.</p>
          )}{" "}
          <StyledNavigationButtons justify="flex-start">
            <StyledPrevButton onClick={onPrevStep}>Volver</StyledPrevButton>
          </StyledNavigationButtons>
        </StyledPostSelectionSection>
      )}{" "}
      {showEditorArea && (
        <StyledCommentEditingSection>
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
          <StyledCommentEditorPreviewLayout>
            <StyledMarkdownArea>
              <h5>Markdown</h5>{" "}
              <StyledCommentMarkdownInput
                value={commentMarkdown}
                onChange={handleMarkdownChange}
                rows={10}
                placeholder="Escribe tu comentario aquí en formato Markdown..."
                disabled={isPostingComment || postCommentSuccess}
              />
            </StyledMarkdownArea>{" "}
            <StyledMarkdownPreviewArea>
              <h5>Previsualización</h5>{" "}
              <StyledCommentPreview
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </StyledMarkdownPreviewArea>
          </StyledCommentEditorPreviewLayout>
          {isPostingComment && (
            <StyledInfoMessage>Publicando comentario...</StyledInfoMessage>
          )}
          {postCommentSuccess && (
            <StyledSuccessMessage>
              ¡Comentario publicado con éxito!
            </StyledSuccessMessage>
          )}
          {postCommentError && (
            <StyledErrorMessage>
              Error al publicar: {postCommentError}
            </StyledErrorMessage>
          )}
          <StyledNavigationButtons justify="space-between">
            {!isPostingComment && !postCommentSuccess && (
              <StyledPrevButton onClick={onPrevStep}>Volver</StyledPrevButton>
            )}
            <StyledNextButton
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
            >
              {continueButtonText}{" "}
            </StyledNextButton>
          </StyledNavigationButtons>
        </StyledCommentEditingSection>
      )}
    </StyledStep2Container>
  );
};

export default Step2;

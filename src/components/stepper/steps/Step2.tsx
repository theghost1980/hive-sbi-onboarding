// src/components/stepper/steps/Step2.tsx

import DOMPurify from "dompurify";
import { marked } from "marked"; // Asegúrate de que marked está instalado
import React, { useEffect, useState } from "react";
// Importamos tu KeychainUtils actualizado
import { KeychainUtils } from "../../../utils/keychain.utils";

// Asegúrate de que estas rutas de importación sean correctas
import { HttpError, post } from "../../../api/RequestsApi"; // Para cargar posts, si no usas otra cosa
import { config } from "../../../config/config";
import { BackendOnboardingInfo } from "../../../pages/OnboardUser"; // Tipo de datos backend
import { PermlinkUtils } from "../../../utils/permlink.utils";
import { Post } from "../../OnboardModal"; // Tipo de Post
import "./Step2.css";

// Interfaz de props actualizada para incluir 'config'
interface Step2Props {
  stepData: any; // Datos recolectados de pasos anteriores
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
  const [postCommentError, setPostCommentError] = useState<string | null>(null); // --------------------------------------------------------------- // Efecto para cargar posts (solo si no hay post seleccionado/predeterminado)
  useEffect(() => {
    //   const isPostPredetermined = existingOnboardInfo?.originalPostAuthor; // Asumiendo esta estructura

    // Cargar posts solo si no hay un post ya determinado/seleccionado Y hay un usuario
    if (!selectedPostForComment && username) {
      setLoadingPosts(true);
      setErrorFetchingPosts(null); // Usar config para URL de RPC si está disponible, sino fallback
      //    onProcessError(null); // Limpiar error general

      const hiveRpcUrl = "https://api.hive.blog";

      const fetchPosts = async () => {
        try {
          // Usar tu helper 'post' para llamar al RPC de Hive
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
              imageUrl: extractFirstImage(post.body),
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
  }, [username, selectedPostForComment, existingOnboardInfo, config]); // Efecto para inicializar selectedPostForComment y commentMarkdown

  useEffect(() => {
    let post: Post | null = null;
    let initialText = ""; // Limpiar feedback de transacción al cambiar datos o contexto

    setPostCommentSuccess(false);
    setPostCommentError(null);
    setIsPostingComment(false); // Escenario 1: Viene de Step 1 con post seleccionado

    if (stepData.selectedPost) {
      post = stepData.selectedPost; // Usar plantilla de config para nuevo onboarding
      initialText = config.templates_comments[0].content_markdown(
        username,
        onboarderUsername
      );
    } // Escenario 2: Empieza en Step 2 (Editar comentario) // Asumimos que existingOnboardInfo tiene originalPostAuthor/Permlink // Escenario 3: Llega a Step 2 sin post seleccionado o info de edición -> Espera selección de lista
    //   else if (existingOnboardInfo?.originalPostAuthor && existingOnboardInfo.originalPostPermlink) {
    //    console.log("Step 2: Initializing for Edit Comment mode.");
    //    // Construir objeto Post con info del backend
    //    post = {
    //      author: existingOnboardInfo.originalPostAuthor,
    //      permlink: existingOnboardInfo.originalPostPermlink,
    //      title: 'Publicación Original', // Placeholder, idealmente se obtendría
    //      body: '...', // Placeholder
    //      url: `/@${existingOnboardInfo.originalPostAuthor}/${existingOnboardInfo.originalPostPermlink}`,
    //    };
    //    initialText = existingOnboardInfo.memo || ''; // Usar memo para editar
    //   }
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
  ]); // Efecto para actualizar la previsualización HTML

  useEffect(() => {
    if (commentMarkdown) {
      const html = marked(commentMarkdown);
      const safeHtml = DOMPurify.sanitize(html as string);
      setPreviewHtml(safeHtml);
    } else {
      setPreviewHtml("");
    }
  }, [commentMarkdown]); // Utilidad para extraer primera imagen

  const extractFirstImage = (body: string): string | null => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = imgRegex.exec(body);
    if (match && match[1]) return match[1];
    const htmlImgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i;
    const htmlMatch = htmlImgRegex.exec(body);
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
    return null;
  }; // Handler para seleccionar post de la lista

  const handlePostSelected = (post: Post) => {
    setSelectedPostForComment(post); // Usar plantilla de config al seleccionar de lista
    setCommentMarkdown(
      config.templates_comments[0].content_markdown(username, onboarderUsername)
    ); // Limpiar feedback de transacción al seleccionar post
    setPostCommentSuccess(false);
    setPostCommentError(null);
    setIsPostingComment(false);
  }; // Handler para cambios en el texto del comentario

  const handleMarkdownChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCommentMarkdown(event.target.value);
  }; // --- Handler para Publicar Comentario (Usando requestPost) ---

  const handlePostComment = () => {
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
    //   onProcessError(null); // Limpiar error general del modal

    const parentAuthor = selectedPostForComment.author;
    const parentPermlink = selectedPostForComment.permlink;
    const author = onboarderUsername; // El que publica el comentario // Generar un permlink único para el comentario

    const permlink =
      "re-" + parentAuthor + "-" + PermlinkUtils.generateRandomString(6); //removing numbers.

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
      author: author,
      permlink: permlink,
      max_accepted_payout: "10000.000 SBD",
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
      percent_hbd: 63, //TODO later research to see if this is unneccessary or not.
    };

    KeychainUtils.requestPost(
      author, // account (la cuenta que publica, tu onboarderUsername)
      title, // title (vacío para comentario)
      body, // body (el contenido markdown)
      parentPermlink, // parent_perm (permlink del post padre)
      parentAuthor, // parent_account (autor del post padre)
      JSON.stringify(jsonMetadata), // json_metadata
      permlink, // permlink (el permlink generado para el comentario)
      JSON.stringify(commentOptions), // comment_options (objeto de opciones, vacío por defecto)
      (response: any) => {
        // Callback al recibir respuesta de Keychain
        console.log("Keychain requestPost response:", response);

        if (response && response.success) {
          setPostCommentSuccess(true); // Guardar respuesta y nuevo permlink en stepData
          onStepDataChange({
            commentResponse: response,
            postedCommentPermlink: permlink,
          });

          // Esperar 3 segundos y avanzar
          //TODO here, should update onboarding record in BE

          setTimeout(() => {
            setIsPostingComment(false);
            onNextStep(); // Avanzar al siguiente paso (ej: Resumen)
          }, 3000);
        } else {
          // Manejar errores o cancelación por usuario
          console.error("Error posting comment:", response); // Usar response.message o display_msg si están disponibles
          const errorMessage =
            response?.message ||
            response?.display_msg ||
            "Error desconocido al publicar el comentario.";
          setPostCommentError(errorMessage);
          onProcessError(errorMessage); // Reportar error general al modal
          setIsPostingComment(false);
        }
      }
    );
  };

  const showPostList = !selectedPostForComment;
  const showEditorArea = selectedPostForComment !== null; // Texto del botón Siguiente/Publicar

  let continueButtonText = "Siguiente"; // Texto por defecto
  if (isPostingComment) {
    continueButtonText = "Publicando...";
  } else if (postCommentSuccess) {
    continueButtonText = "¡Publicado!";
  } else if (postCommentError) {
    continueButtonText = "Intentar de Nuevo"; // Texto en caso de error
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
          {/* Botón Volver - Visible solo en la vista de selección de post */}{" "}
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
                disabled={isPostingComment || postCommentSuccess} // Deshabilita durante publicación o éxito
              />{" "}
            </div>{" "}
            <div className="markdown-preview-area">
              <h5>Previsualización</h5>{" "}
              <div
                className="comment-preview"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />{" "}
            </div>{" "}
          </div>
          {/* --- Feedback de Transacción --- */}{" "}
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
          )}
          {/* ------------------------------- */}{" "}
          {/* Botones de navegación para esta vista */}{" "}
          <div className="step-navigation-buttons">
            {" "}
            {/* Botón 'Volver' - Visible solo si no estamos publicando ni tuvimos éxito */}{" "}
            {!isPostingComment && !postCommentSuccess && (
              <button onClick={onPrevStep}>Volver</button>
            )}
            {/* Botón 'Siguiente' / Publicar */}{" "}
            <button
              onClick={handlePostComment} // Llama a la función de publicación // Deshabilitado si: comentario vacío, Keychain no disponible, publicando, o éxito
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
              {continueButtonText} {/* Texto dinámico según el estado */}{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

export default Step2;

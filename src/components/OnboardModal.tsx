import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { BackendOnboardingInfo } from "../pages/OnboardUser";
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
  username: string; // Usuario a apadrinar/editar
  onboarderUsername: string; // Usuario que apadrina (loggeado)
  startStep?: number; // Paso inicial (1-indexed, default 1)
  // initialSelectedPost?: Post; // Eliminamos esta prop para simplificar y usar 'startStep'
  existingOnboardInfo?: BackendOnboardingInfo | null; // Datos para el modo edición (si startStep > 1)
}

const OnboardModal: React.FC<OnboardModalProps> = ({
  isOpen,
  onRequestClose,
  username,
  onboarderUsername,
  startStep = 1, // Valor por defecto 1 si no se pasa
  existingOnboardInfo, // Datos para el modo edición
}) => {
  // Estado para guardar datos recolectados a través de los pasos
  const [stepData, setStepData] = useState<StepData>({}); // Inicialmente vacío

  // Estados para la carga de posts (SOLO necesario si startStep es 1)
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorFetchingPosts, setErrorFetchingPosts] = useState<string | null>(
    null
  );

  // Estado para errores generales del proceso (mostrar encima del Stepper)
  const [processError, setProcessError] = useState<string | null>(null);

  // Estado para disponibilidad de Keychain (necesario para pasos con transacciones)
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);

  // --- Efecto para inicializar datos si iniciamos en modo edición (startStep > 1) ---
  useEffect(() => {
    if (isOpen && startStep > 1 && existingOnboardInfo) {
      // Si el modal se abre en un paso > 1 Y tenemos info existente,
      // inicializamos 'stepData' con esa info.
      // Esto asume que BackendOnboardingInfo tiene campos que coinciden o se mapean a StepData
      // Por ejemplo, si Step2 necesita el memo y amount existentes:
      setStepData((prev) => ({
        ...prev,
        // Aquí mapearías los datos de existingOnboardInfo a StepData según lo necesiten tus pasos
        // Ejemplo:
        // initialMemo: existingOnboardInfo.memo,
        // initialAmount: existingOnboardInfo.amount,
        // etc.
        // Si el paso 2 necesita el post al que comentar en modo edición,
        // necesitarías obtenerlo o pasarlo también (no está en BackendOnboardingInfo)
        // o asumir que el paso 2 solo necesita author/permlink del existingOnboardInfo
        // para construir el comentario.
        commentParentAuthor: existingOnboardInfo.onboarded, // El usuario a comentar (onboarded)
        commentParentPermlink: "initial-post-permlink-here", // <-- NECESITAS EL PERMLINK DEL POST INICIAL si no está en backendInfo!
        // Si no tienes el permlink del post inicial en BackendOnboardingInfo,
        // el modo "editar comentario" basado solo en backendInfo es complicado.
        // O bien el paso 2 puede funcionar solo con author/permlink del backendInfo (si es posible),
        // o necesitas guardar el permlink del post en BackendOnboardingInfo al crear el registro.
      }));
      // Opcional: Si iniciar en un paso > 1 implica que ciertos pasos anteriores están "completados"
      // y tienen datos, podrías setear esos datos iniciales aquí también si no se derivan de existingOnboardInfo.
    }
    // Resetear stepData si el modal se cierra (isOpen cambia a false)
    if (!isOpen) {
      setStepData({}); // Limpia los datos recolectados
      setPosts([]);
      setLoadingPosts(false);
      setErrorFetchingPosts(null);
      setProcessError(null);
      // startStep se reseteará en el componente padre (OnboardUser) handleCloseModal
    }
  }, [isOpen, startStep, existingOnboardInfo]); // Dependencias: re-ejecutar si estas props cambian

  // Efecto para verificar disponibilidad de Keychain
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setIsKeychainAvailable(KeychainUtils.isKeychainInstalled(window));
    }
  }, [isOpen]);

  // Efecto para cargar posts (SOLO si iniciamos en paso 1)
  useEffect(() => {
    // Carga posts SOLO si el modal está abierto, tenemos username, Y el paso inicial es 1
    if (isOpen && username && startStep === 1) {
      setLoadingPosts(true);
      setErrorFetchingPosts(null);

      // TODO: Reemplazar este fetch directo con tu función apiRequest/get
      fetch("https://api.hive.blog", {
        method: "POST", // bridge.get_account_posts usa POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "bridge.get_account_posts",
          params: { sort: "posts", account: username, limit: 5 },
          id: 1,
        }),
      })
        .then((res) => {
          // Manejo básico de respuesta no ok para fetch directo
          if (!res.ok) {
            // Podrías lanzar un HttpError si creas uno para fetch directo también
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
              imageUrl: extractFirstImage(post.body),
            }));
            setPosts(postsData);
          } else {
            setPosts([]); // No posts found
          }
        })
        .catch((err) => {
          console.error("Error fetching posts:", err);
          setErrorFetchingPosts("Error al obtener publicaciones.");
        })
        .finally(() => setLoadingPosts(false));

      // TODO: Considerar AbortController para cancelar la petición si el modal se cierra
    }
    // No hay un 'else if (!isOpen)' aquí porque ese caso ya lo maneja el useEffect de inicialización
  }, [isOpen, username, startStep]); // Dependencias

  const extractFirstImage = (body: string): string | null => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = imgRegex.exec(body);
    if (match && match[1]) return match[1];
    const htmlImgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i;
    const htmlMatch = htmlImgRegex.exec(body);
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
    return null;
  };

  // --- Callbacks para que los pasos interactúen con el modal ---

  // Callback para que un paso actualice los datos compartidos (stepData)
  const handleStepDataChange = (newData: Partial<StepData>) => {
    setStepData((prev) => ({ ...prev, ...newData }));
    // Opcional: Si actualizar stepData debe mover automáticamente al siguiente paso,
    // aquí podría haber lógica para decirle al Stepper que avance.
    // Pero es más común que el paso individual llame a un 'onNext' callback que le pase el Stepper.
  };

  // Callback para que los pasos reporten un error general del proceso
  const handleProcessError = (message: string) => {
    setProcessError(message);
  };

  // Callback para manejar la selección de un post en el Paso 1
  const handlePostSelected = (post: Post) => {
    // Cuando se selecciona un post, guardamos la info en stepData
    handleStepDataChange({ selectedPost: post });
    // Esto debería hacer que el Stepper avance al paso 2.
    // Asumimos que el Stepper tiene un mecanismo (ej: un botón "Siguiente" en el Step1
    // que llama a un callback onNextStep que el Stepper le pasa).
  };

  // Callback para cancelar el flujo y cerrar el modal
  const handleCancelFlow = () => {
    // El reset de estado se hace en el useEffect cuando isOpen cambia a false
    onRequestClose(); // Llama a la función que el padre le pasó para cerrar el modal
  };

  // --- Definición de los pasos del Stepper ---
  // Este array DEBE contener TODOS los componentes de los pasos
  // y las props que el Stepper DEBE pasarles.
  const onboardSteps = [
    {
      // Paso 1: Seleccionar Post / Stake
      component: Step1,
      props: {
        // Props específicas para Step1
        posts: posts, // Lista de posts cargados
        loadingPosts: loadingPosts, // Estado de carga de posts
        errorFetchingPosts: errorFetchingPosts, // Error de carga de posts
        onPostSelected: handlePostSelected, // Callback cuando se selecciona un post

        // Props generales que Step1 pueda necesitar
        username: username,
        onboarderUsername: onboarderUsername,
        isKeychainAvailable: isKeychainAvailable,
        // ... otras props que Step1 necesite

        // Callbacks para Step1 para reportar estado de transacción si la maneja directamente
        onTransactionInitiated: () => console.log("Step1 Transaction Init"), // Placeholder
        onTransactionComplete: (response: any) =>
          handleStepDataChange({ transactionResponse: response }), // Guarda la respuesta
        onTransactionError: handleProcessError, // Reporta error general

        // Si Step1 necesita el selectedPost o transactionResponse, los recibiría via stepData del Stepper
        // selectedPost: stepData.selectedPost, // <- Estos vendrían vía Stepper.props
        // transactionResponse: stepData.transactionResponse,
      },
    },

    {
      component: Step2,
      props: {
        // Props específicas para Step2Comment
        // Pasa los datos del post seleccionado y la info existente para edición
        selectedPost: stepData.selectedPost, // Post seleccionado en Step1
        existingOnboardInfo: existingOnboardInfo, // Info si estamos en modo edición

        // Props generales que Step2Comment pueda necesitar
        username: username,
        onboarderUsername: onboarderUsername,
        isKeychainAvailable: isKeychainAvailable,
        // ... otras props

        // Callbacks para Step2Comment para reportar estado de comentario/transacción
        onCommentGenerated: (comment: string) =>
          handleStepDataChange({ generatedComment: comment }),
        onCommentEdited: (comment: string) =>
          handleStepDataChange({ editedComment: comment }),
        onCommentPosted: (response: any) =>
          handleStepDataChange({ commentResponse: response }),

        onTransactionInitiated: () => console.log("Step2 Transaction Init"), // Placeholder
        onTransactionComplete: (response: any) =>
          handleStepDataChange({ commentResponse: response }), // Guarda la respuesta
        onTransactionError: handleProcessError, // Reporta error general

        // Callbacks para navegar al siguiente/anterior paso (el Stepper los pasaría a cada Step)
        // onNextStep: () => void,
        // onPrevStep: () => void,
      },
    },

    {
      component: Step3, // Crea este componente
      props: {
        // Props específicas para Step3Summary (probablemente necesita todos los datos recolectados)
        stepData: stepData, // Le pasamos todos los datos

        // Props generales
        username: username,
        onboarderUsername: onboarderUsername,

        // Callback para finalizar el flujo (probablemente cierra el modal)
        onComplete: handleCancelFlow, // O una función diferente si hay lógica de post-finalización
      },
    },
  ];

  // --- Renderizado del Modal ---

  // Condición para mostrar la lista de posts (SOLO si startStep es 1 y aún no se ha seleccionado post en este flujo)
  const showPostSelectionList = startStep === 1 && !stepData.selectedPost;

  // Condición para mostrar el Stepper (si startStep > 1, O si startStep es 1 Y ya se seleccionó post)
  const showStepperFlow =
    startStep > 1 ||
    (startStep === 1 &&
      stepData.selectedPost !== undefined &&
      stepData.selectedPost !== null);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancelFlow} // Usamos el manejador que resetea y cierra
      contentLabel="Onboard HSBI Modal"
      className="onboard-modal"
      overlayClassName="onboard-modal-overlay"
      ariaHideApp={false}
    >
      {/* --- Barra de Encabezado Fija --- */}
      <div className="modal-header-bar">
        <h2>Onboard HSBI</h2>
        <p>
          Usuario: <strong>@{username}</strong> (Onboarder: @{onboarderUsername}
          )
        </p>
      </div>
      {/* -------------------------------- */}

      {/* --- Cuerpo del Contenido (Desplazable) --- */}
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
                    {/* --- ÁREA DEL THUMBNAIL --- */}
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

        {/* Vista del Stepper */}
        {showStepperFlow && (
          <div className="my-flow-area">
            <Stepper
              steps={onboardSteps}
              initialStep={startStep - 1}
              stepData={stepData}
              existingOnboardInfo={existingOnboardInfo}
              onStepDataChange={handleStepDataChange}
              onProcessError={handleProcessError} // Pasar el manejador de error
              onCancel={handleCancelFlow}
              username={username}
              onboarderUsername={onboarderUsername}
              isKeychainAvailable={isKeychainAvailable}
              // Pasar callbacks específicos de transacción (Stepper los pasará a Step1)
              onTransactionInitiated={() =>
                console.log("Modal: Step1 Transaction Init")
              }
              onTransactionComplete={(response: any) =>
                handleStepDataChange({ transactionResponse: response })
              }
              onTransactionError={handleProcessError} // Step1 reporta error general
            />
          </div>
        )}
      </div>
      {/* ------------------------------------ */}

      {/* --- Botón Cerrar (Fuera del cuerpo desplazable pero dentro del modal) --- */}
      {/* Si el modal es flex-direction column, este botón se posicionará al final */}
      <button onClick={handleCancelFlow} className="close-button">
        Cerrar
      </button>
      {/* ----------------------------------------------------------------------- */}
    </Modal>
  );
};

export default OnboardModal;

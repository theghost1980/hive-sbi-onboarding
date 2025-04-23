import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./OnboardModal.css";

interface Post {
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
}

const OnboardModal: React.FC<OnboardModalProps> = ({
  isOpen,
  onRequestClose,
  username,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
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
              url: `https://peakd.com${post.url}`,
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
          setError("Error al obtener publicaciones.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const extractFirstImage = (body: string): string | null => {
    const imgRegex = /!\[.*?\]\((.*?)\)/;
    const match = imgRegex.exec(body);
    return match ? match[1] : null;
  };

  const handleOnboardHere = (post: Post) => {
    // Lógica para el onboarding aquí
    console.log(`Onboarding en esta publicación: ${post.title}`);
    //TODO la logica seria mas o menos asi.
    //1. Abre keychain para enviar la transaccion, con un monto minimo 1 HBD con el memo y todo lo que pide el HSBI.
    //2. espera confirmacion, mensaje de exito y procede a abrir un template con el usuario, todo en markdown de como sera el comentario de Onboarding HSBI. Ingles y espanol.
    //3. El usuario aprueba o edita y presiona continuar.
    //4. Se le pide que seleccione un post para incluir el comentario.
    //5. Se envia el comentario sobre dicho post.
    //6. Se ofrece al usuario mostrar un resumen de lo hecho en otro dialog con opcion de copiar y pegar, indicando que es bueno guardar esa data.
    //7. a la vez que se muestra dicha data, se almacena en localstorage para proximas sesiones.
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Onboard HSBI Modal"
      className="onboard-modal"
      overlayClassName="onboard-modal-overlay"
      ariaHideApp={false}
    >
      <h2>Onboard HSBI</h2>
      <p>
        Usuario: <strong>@{username}</strong>
      </p>
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post, index) => (
            <li key={index} className="post-item">
              <div className="post-thumbnail">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="Post thumbnail" />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>
              <div className="post-content">
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  <h3>{post.title}</h3>
                </a>
                <p>{post.body.substring(0, 100)}...</p>
                <div className="post-buttons">
                  <button
                    onClick={() => handleOnboardHere(post)}
                    className="onboard-here-button"
                  >
                    On-board here
                  </button>
                  <a
                    href={`https://peakd.com${post.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="onboard-peakd-button"
                  >
                    On-board PeakD
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && posts.length === 0 && <p>No hay publicaciones.</p>}
      <button onClick={onRequestClose} className="close-button">
        Cerrar
      </button>
    </Modal>
  );
};

export default OnboardModal;

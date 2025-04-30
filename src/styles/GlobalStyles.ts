import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', sans-serif;
    background-color: #f5f6fa;
    color: #333;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* --- Estilos globales para react-modal (usados por OnboardModal) --- */
  /* Estos estilos aplican a las clases que react-modal añade automáticamente */
  .onboard-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 1000; /* Asegura que el overlay esté por encima del contenido */
  }

  .onboard-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin-right: -50%;
    transform: translate(-50%, -50%); /* Centra el modal */

    background: #fff;
    border-radius: 8px;
    padding: 0; /* Quitamos padding del contenedor principal ya que el body interno lo tiene */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

    /* --- Ajustes de Tamaño --- */
    max-width: 800px; /* Ancho máximo */
    width: 90%; /* Ancho responsivo */
    max-height: 80vh; /* Altura máxima (80% del viewport height) */
    /* ------------------------- */

    display: flex; /* Usamos flexbox para la estructura interna (header, body, footer) */
    flex-direction: column; /* Apila los elementos verticalmente */
    overflow: hidden; /* Oculta cualquier contenido que se desborde (para manejar el scroll interno) */
  }
  /* --- Fin estilos globales react-modal --- */
`;

export default GlobalStyles;

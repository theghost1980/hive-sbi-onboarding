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
    /* position: absolute;
  }
  /* --- Fin estilos globales react-modal --- */
`;

export default GlobalStyles;

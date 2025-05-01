import styled from "styled-components";

// --- Componentes para Listas de Posts ---

export const StyledPostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Componente base para items de lista, variaciones se manejan con props o estilos anidados
export const StyledPostItem = styled.li`
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  background-color: #fff;
`;

// Componente base para thumbnails, variaciones de tamaño con prop
interface StyledPostThumbnailProps {
  size?: "small" | "large";
}

export const StyledPostThumbnail = styled.div<StyledPostThumbnailProps>`
  flex-shrink: 0;
  margin-right: ${(props) => (props.size === "small" ? "15px" : "20px")};
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
  width: ${(props) => (props.size === "small" ? "50px" : "80px")};
  height: ${(props) => (props.size === "small" ? "50px" : "80px")};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .no-image,
  .no-image-small {
    /* Mantener clases anidadas por ahora si se usan internamente */
    font-size: ${(props) => (props.size === "small" ? "0.6em" : "0.7em")};
    text-align: center;
    color: #777;
    padding: 5px;
    word-break: break-word;
  }
`;

export const StyledPostContent = styled.div`
  flex-grow: 1;
  margin-right: 15px; /* Este margen puede necesitar ajuste dependiendo del item */

  h3,
  h5 {
    margin: 0 0 5px 0;
    font-size: 1em; /* Puede haber variaciones entre h3 y h5, ajustar si es necesario */
  }

  p {
    margin: 0;
    font-size: 0.8em;
    color: #666;
  }
`;

// Componente base para botones de acción en items de lista
export const StyledItemActionButton = styled.button`
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// --- Componentes para Área de Editor/Previsualización ---

export const StyledCommentEditorPreviewLayout = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  /* Considerar media queries para apilar en pantallas pequeñas */
`;

export const StyledMarkdownArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  h5 {
    margin: 0 0 10px 0;
    font-size: 1em;
    color: #555;
  }
`;

export const StyledCommentMarkdownInput = styled.textarea`
  width: 100%;
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  font-family: monospace;
  resize: vertical;
  min-height: 150px;
`;

export const StyledMarkdownPreviewArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  h5 {
    margin: 0 0 10px 0;
    font-size: 1em;
    color: #555;
  }
`;

export const StyledCommentPreview = styled.div`
  width: 100%;
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
  min-height: 150px;
  overflow-y: auto;
  word-wrap: break-word;
`;

// --- Componente para Botones de Navegación (general) ---

interface StyledNavigationButtonsProps {
  justify?: "flex-start" | "flex-end" | "center" | "space-between";
  gap?: string;
  marginTop?: string;
}

export const StyledNavigationButtons = styled.div<StyledNavigationButtonsProps>`
  margin-top: ${(props) => props.marginTop || "20px"};
  display: flex;
  justify-content: ${(props) => props.justify || "space-between"};
  gap: ${(props) => props.gap || "10px"};
  /* Considerar flex-wrap si hay muchos botones en móvil */

  button {
    /* Estilos base para los botones dentro del contenedor */
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }
`;

// Estilos específicos para los botones de navegación (se aplicarán en los componentes de paso)
export const StyledPrevButton = styled.button`
  background-color: #6c757d;
  color: white;
  &:hover:not(:disabled) {
    background-color: #5a6268;
  }
`;

export const StyledNextButton = styled.button`
  background-color: #28a745;
  color: white;
  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

// Botón de completar (usado en Step3, similar a next pero quizás con otro texto/color final)
export const StyledCompleteButton = styled.button`
  background-color: #28a745; /* Mismo color que next por ahora */
  color: white;
  &:hover:not(:disabled) {
    background-color: #218838; /* Mismo hover que next por ahora */
  }
`;

// Botón de copiar reporte (específico de Step3)
export const StyledCopyReportButton = styled.button`
  background-color: #007bff;
  color: white;
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

export const StyledKeychainRequiredMessage = styled.p`
  /* Estilos de .keychain-required-message de OnboardModal.css */
  color: #ffc107; /* color de warning */
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
`;

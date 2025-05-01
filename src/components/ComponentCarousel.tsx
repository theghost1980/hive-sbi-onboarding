import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface ComponentCarouselProps {
  components: React.ReactNode[]; // Array de componentes o elementos JSX a mostrar
  interval?: number; // Intervalo en ms para auto-slide (opcional)
  height: string; // Altura fija requerida para el carrusel
}

const StyledCarouselContainer = styled.div<{ $height: string }>`
  position: relative;
  width: 100%;
  height: ${(props) => props.$height}; /* Altura fija definida por prop */
  margin: 20px auto;
  overflow: hidden; /* Oculta los slides que no están visibles */
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  padding: 0; /* Quitar padding del contenedor principal si el padding va en el slide */
  box-sizing: border-box;
`;

const StyledComponentsWrapper = styled.div<{
  $currentIndex: number;
  $totalComponents: number;
}>`
  display: flex;
  /* ===> CORRECCIÓN AQUÍ <=== */
  /* El wrapper tiene el 100% del ancho del contenedor visible */
  width: 100%;
  height: 100%;
  /* Desplaza el CONTENIDO del wrapper por múltiplos del 100% (del slide) */
  transform: translateX(${(props) => -(props.$currentIndex * 100)}%);
  transition: transform 0.5s ease-in-out;
  /* ========================= */
`;

const StyledComponentSlide = styled.div`
    /* Cada slide ocupa el 100% del ancho del contenedor visible */
    width: 100%;
    height: 100%;
    flex-shrink: 0; /* Evita que los slides se encojan */
    flex-basis: 100%; /* Asegura que cada item flex tome 100% del espacio base */

    /* Asegurar que el contenido dentro del slide se ajuste */
    overflow-y: auto; /* Permite scroll vertical si el contenido es muy largo */
    padding: 20px; /* Añadir padding DENTRO de cada slide */
    box-sizing: border-box;
    display: flex; /* Usar flex para centrar contenido o controlar su layout interno */
    flex-direction: column;
    align-items: center; /* Centrar contenido horizontalmente por defecto */
     /* Justify-content: center; /* Centrar contenido verticalmente por defecto */

    /* Ajustar estilos de los hijos directos (h3, p, ul, div) dentro del slide si es necesario */
    > h3, > p, > ul, > div {
        width: 100%; /* Asegura que los hijos usen el ancho completo del slide */
        max-width: 800px; /* O un max-width si no quieres que se estiren demasiado */
        margin: 0 auto; /* Centrar bloques de contenido dentro del slide */
         /* Ajustar márgenes internos si es necesario */
    }

    > h3 {
         margin-top: 1.5em; /* Mantener espacio superior para subtítulos */
         margin-bottom: 0.8em;
         text-align: center; /* Centrar subtítulos */
         color: #2c3e50;
         font-size: 1.5em;
    }

    > p {
         margin-bottom: 1em;
    }

     > ul {
         margin-bottom: 1em;
     }
      /* Ajustar márgenes específicos para StyledContactCard y StyledResourceList si son hijos directos */
      > div[class*="StyledContactCard"],
      > ul[class*="StyledResourceList"] {
           margin-top: 10px; /* Espacio después del párrafo o h3 */
           margin-bottom: 20px; /* Espacio antes del siguiente bloque */
      }
       > div[class*="StyledContactCard"]:last-child,
       > ul[class*="StyledResourceList"]:last-child {
            margin-bottom: 0; /* Eliminar margen después del último bloque */
       }
};
`;

const StyledNavButton = styled.button<{ $direction: "prev" | "next" }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.$direction === "prev" ? "left: 10px;" : "right: 10px;")}
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2em;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const StyledIndicators = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 6px;
`;

const StyledIndicatorDot = styled.button<{ $isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background-color: ${(props) =>
    props.$isActive ? "#1abc9c" : "rgba(44, 62, 80, 0.5)"};
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s ease;
`;

const ComponentCarousel: React.FC<ComponentCarouselProps> = ({
  components,
  interval = 7000,
  height,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (interval > 0 && components && components.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
      }, interval);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [components, interval]);

  const next = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
  };

  const prev = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + components.length) % components.length
    );
  };

  const goTo = (index: number) => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentIndex(index);
  };

  if (!components || components.length === 0) {
    return null;
  }

  const totalComponents = components.length;

  return (
    <StyledCarouselContainer $height={height}>
      <StyledComponentsWrapper
        $currentIndex={currentIndex}
        $totalComponents={totalComponents}
      >
        {components.map((component, index) => (
          // Es fundamental pasar el componente *dentro* de StyledComponentSlide
          <StyledComponentSlide key={index}>{component}</StyledComponentSlide>
        ))}
      </StyledComponentsWrapper>

      {totalComponents > 1 && (
        <>
          <StyledNavButton $direction="prev" onClick={prev}>
            &#10094;
          </StyledNavButton>
          <StyledNavButton $direction="next" onClick={next}>
            &#10095;
          </StyledNavButton>

          <StyledIndicators>
            {components.map((_, index) => (
              <StyledIndicatorDot
                key={index}
                $isActive={index === currentIndex}
                onClick={() => goTo(index)}
              />
            ))}
          </StyledIndicators>
        </>
      )}
    </StyledCarouselContainer>
  );
};

export default ComponentCarousel;

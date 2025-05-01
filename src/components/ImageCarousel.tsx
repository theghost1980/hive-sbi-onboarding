import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface ImageCarouselProps {
  images: string[];
  interval?: number;
}

const StyledCarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 400px;
  margin: 20px auto;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background-color: #eee;
`;

const StyledImageWrapper = styled.div<{
  $currentIndex: number;
  $totalImages: number;
}>`
  display: flex;
  width: ${(props) => props.$totalImages * 100}%;
  height: 100%;
  transform: translateX(
    ${(props) => -(props.$currentIndex * (100 / props.$totalImages))}%
  );
  transition: transform 0.5s ease-in-out;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
  width: 40px;
  height: 40px;
  font-size: 1.5em;
  line-height: 40px;
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
  gap: 8px;
`;

const StyledIndicatorDot = styled.button<{ $isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: ${(props) =>
    props.$isActive ? "white" : "rgba(255, 255, 255, 0.5)"};
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s ease;
`;

const StyledPausedMessage = styled.div`
  position: absolute;
  top: 90%;
  left: 15%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1.2em;
  z-index: 20;
  pointer-events: none; /* Asegura que el mensaje no bloquee clicks */
`;

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (interval > 0 && images && images.length > 1 && !isHovering) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, interval, isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const nextImage = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reiniciar el auto-slide solo si no se está haciendo hover DESPUÉS de la navegación manual
    if (!isHovering && interval > 0 && images.length > 1) {
      // Pequeño retardo para reiniciar el slide después del click manual
      // Esto puede ser opcional dependiendo del UX deseado
      // window.setTimeout(() => {
      //     if (!isHovering) { // Verificar hover de nuevo por si el ratón entró rápido
      //         intervalRef.current = window.setInterval(() => {
      //              setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      //          }, interval);
      //     }
      // }, 500); // Retardo de 500ms
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isHovering && interval > 0 && images.length > 1) {
      // Lógica opcional de reinicio del slide como en nextImage
    }
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToImage = (index: number) => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isHovering && interval > 0 && images.length > 1) {
      // Lógica opcional de reinicio del slide como en nextImage
    }
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const isAutoSlidingActive = interval > 0 && images.length > 1;

  return (
    <StyledCarouselContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StyledImageWrapper
        $currentIndex={currentIndex}
        $totalImages={images.length}
      >
        {images.map((imageUrl, index) => (
          <StyledImage
            key={index}
            src={imageUrl}
            alt={`Carousel image ${index + 1}`}
          />
        ))}
      </StyledImageWrapper>

      {isHovering && isAutoSlidingActive && (
        <StyledPausedMessage>pausado por cursor</StyledPausedMessage>
      )}

      {images.length > 1 && (
        <>
          <StyledNavButton $direction="prev" onClick={nextImage}>
            &#10094;
          </StyledNavButton>
          <StyledNavButton $direction="next" onClick={nextImage}>
            &#10095;
          </StyledNavButton>

          <StyledIndicators>
            {images.map((_, index) => (
              <StyledIndicatorDot
                key={index}
                $isActive={index === currentIndex}
                onClick={() => goToImage(index)}
              />
            ))}
          </StyledIndicators>
        </>
      )}
    </StyledCarouselContainer>
  );
};

export default ImageCarousel;

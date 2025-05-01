import React from "react";
import { FaDiscord, FaGithub, FaLink, FaNpm } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import heroBackground from "../assets/bg/hive-dc.jpeg";
import Image2 from "../assets/infographic/check-hsbi-member.png";
import Image4 from "../assets/infographic/check-real.png";
import Image3 from "../assets/infographic/clic-on-board.png";
import Image6 from "../assets/infographic/edit-public.png";
import Image7 from "../assets/infographic/save-report.png";
import Image1 from "../assets/infographic/search-user.png";
import Image5 from "../assets/infographic/transfer-hive-keychain.png";
import hiveLogo from "../assets/logos/hive-logo.png";
import hivesqlLogo from "../assets/logos/hivesql-logo.png";
import keychainLogo from "../assets/logos/keychain-logo.png";
import privexLogo from "../assets/logos/privex-logo.png";
import fixedButtonImage from "../assets/logos/tipjar-logo.png";
import ComponentCarousel from "../components/ComponentCarousel";
import ImageCarousel from "../components/ImageCarousel";

const IMAGES = [Image1, Image2, Image3, Image4, Image5, Image6, Image7];

const StyledHomePage = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: "Segoe UI", sans-serif;
  color: #333;
  line-height: 1.6;

  h1,
  h2,
  h3 {
    color: #2c3e50;
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
  }

  h2 {
    font-size: 2em;
    margin-bottom: 1em;
  }

  h3 {
    font-size: 1.5em;
    margin-bottom: 0.8em;
    margin-top: 1.5em; /* Espacio arriba de los subtítulos */
  }

  p {
    margin-bottom: 1em;
  }

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul {
    margin-bottom: 1em;
    padding-left: 0;
    list-style: none;
  }

  li {
    margin-bottom: 0.5em;
  }
`;

const StyledHeroSection = styled.section`
  background-image: url(${heroBackground});
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 80px 20px;
  margin-bottom: 40px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  h1,
  p {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
  }
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
`;

const StyledSection = styled.section`
  margin-bottom: 40px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const StyledSectionTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2em;
`;

const StyledButton = styled.a`
  background-color: #1abc9c;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #16a085;
    color: white;
  }
`;

const tremble = keyframes`
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-1px, -1px); }
  40% { transform: translate(1px, 1px); }
  60% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
`;

const StyledFixedButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #1abc9c;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #16a085;
    animation: ${tremble} 0.2s linear infinite;
  }

  img {
    display: block;
    width: 78px;
    height: 78px;
    object-fit: contain;
  }
`;

const StyledContactCard = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);

  h4 {
    font-size: 1.3em;
    margin-top: 0;
    margin-bottom: 10px;
    color: #2c3e50;
  }

  p {
    margin-bottom: 0.5em;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const StyledResourceList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
`;

const StyledResourceItem = styled.li`
  margin-bottom: 0;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-left: 3px solid #1abc9c;
  border-radius: 4px;
  flex: 1 1 250px;
  display: flex;
  align-items: center;

  a {
    font-weight: bold;
    margin-left: 10px;
    color: #007bff;
    flex-grow: 1;
  }
`;

const StyledLinkIcon = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  margin-right: 8px;
  color: #555; /* Color por defecto para iconos */
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;
    /* Opcional: Ajustar colores de iconos específicos si no quieres usar el color del span */
    /* path { fill: #COLOR; } */
  }
`;

const StyledFooter = styled.footer`
  background-color: #2c3e50; /* Color oscuro para contraste */
  color: #ecf0f1; /* Color de texto claro */
  padding: 30px 20px;
  text-align: center;
  font-size: 0.9em;
  margin-top: 40px; /* Espacio arriba del footer */

  a {
    color: #ecf0f1; /* Color de enlace en el footer */
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledFooterContent = styled.div`
  max-width: 1000px; /* Limitar ancho del contenido como el resto de la página */
  margin: 0 auto; /* Centrar contenido */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Espacio entre bloques principales del footer */
`;

const StyledMadeWithLove = styled.div`
  /* margin-bottom: 20px; */ /* El gap en StyledFooterContent maneja el espacio */

  svg {
    vertical-align: middle;
    margin: 0 5px;
    color: #e74c3c; /* Color rojo para el corazón */
    font-size: 1.2em; /* Tamaño del icono */
  }
`;

const StyledPoweredBy = styled.div`
  /* margin-top: 20px; */ /* El gap en StyledFooterContent maneja el espacio */
  border-top: 1px solid rgba(255, 255, 255, 0.1); /* Separador visual */
  padding-top: 20px;
  width: 100%; /* Asegura que el borde se extienda */

  h4 {
    color: #ecf0f1;
    font-size: 1.1em;
    margin-bottom: 15px;
    margin-top: 0; /* Sin margen superior duplicado */
  }
`;

const StyledPoweredByLogos = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;
`;

const StyledLogoLink = styled.a`
  display: inline-block;
  text-decoration: none !important;
  &:hover {
    opacity: 0.8;
  }
`;

const StyledLogoImage = styled.img`
  height: 30px;
  width: auto;
  /* Optional: Añadir filtro si los logos son claros sobre fondo oscuro */
  /* filter: invert(0.8) grayscale(0.5); */
`;

const HomePage: React.FC = () => {
  const contactCarouselComponents = [
    <div key="general-links">
      <h3>General</h3>
      <p>
        Encuentra más información y soporte sobre HSBI y esta herramienta en:
      </p>
      <StyledResourceList>
        <StyledResourceItem>
          {/* Usando icono real de react-icons */}
          <StyledLinkIcon>
            <FaLink />
          </StyledLinkIcon>
          <a
            href="https://peakd.com/c/hive-186392/created"
            target="_blank"
            rel="noopener noreferrer"
          >
            C/Synergy Builders
          </a>
        </StyledResourceItem>
        <StyledResourceItem>
          {/* Usando icono real de react-icons */}
          <StyledLinkIcon>
            <FaDiscord />
          </StyledLinkIcon>
          <a
            href="https://discord.gg/Ypw9aqJk5A"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord (Soporte y Comunidad de la Herramienta)
          </a>
        </StyledResourceItem>
      </StyledResourceList>
    </div>,
    <div key="developers">
      <h3>Desarrolladores y Colaboradores</h3>
      <StyledContactCard>
        <h4>Saturno Mangieri @theghost1980</h4>
        <p>
          {/* Usando icono real de react-icons */}
          <StyledLinkIcon>
            <FaGithub />
          </StyledLinkIcon>
          <a
            href="https://github.com/theghost1980"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/theghost1980
          </a>
        </p>
        <p>
          <StyledLinkIcon>
            <FaLink />
          </StyledLinkIcon>
          <a
            href="https://peakd.com/@theghost1980"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://peakd.com/@theghost1980
          </a>
        </p>
      </StyledContactCard>

      <StyledContactCard>
        <h4>@thecrazygm</h4>
        <p>
          <StyledLinkIcon>
            <FaLink />
          </StyledLinkIcon>{" "}
          <a
            href="https://thecrazygm.com/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://thecrazygm.com/home
          </a>
        </p>
        <p>
          <StyledLinkIcon>
            <FaLink />
          </StyledLinkIcon>
          <a
            href="https://peakd.com/@thecrazygm"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://peakd.com/@thecrazygm
          </a>
        </p>
      </StyledContactCard>

      <StyledContactCard>
        <h4>@ecoinstant</h4>
        <p>
          <StyledLinkIcon>
            <FaLink />
          </StyledLinkIcon>
          <a
            href="https://peakd.com/@ecoinstant"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://peakd.com/@ecoinstant
          </a>
        </p>
      </StyledContactCard>
    </div>,
    <div key="dev-resources">
      <h3>Recursos Útiles para Desarrollo en Hive</h3>
      <StyledResourceList>
        <StyledResourceItem>
          <StyledLinkIcon>
            <FaDiscord />
          </StyledLinkIcon>
          <a
            href="https://discord.gg/cgZbmhBbw7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord Hive (General)
          </a>
        </StyledResourceItem>
        <StyledResourceItem>
          <StyledLinkIcon>
            <FaDiscord />
          </StyledLinkIcon>
          <a
            href="https://discord.gg/t3Cg3w4nr4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord Hive Engine
          </a>
        </StyledResourceItem>
        <StyledResourceItem>
          <StyledLinkIcon>
            <IoDocumentText />
          </StyledLinkIcon>
          <a
            href="https://developers.hive.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentación Hive Developers
          </a>
        </StyledResourceItem>
        <StyledResourceItem>
          <StyledLinkIcon>
            <FaDiscord />
          </StyledLinkIcon>
          <a
            href="https://discord.gg/jKE5crrPsm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord HiveSQL
          </a>
        </StyledResourceItem>
        <StyledResourceItem>
          <StyledLinkIcon>
            <FaNpm />
          </StyledLinkIcon>
          <a
            href="https://www.npmjs.com/package/keychain-helper"
            target="_blank"
            rel="noopener noreferrer"
          >
            Paquete npm `keychain-helper`
          </a>
        </StyledResourceItem>
      </StyledResourceList>
    </div>,
  ];

  return (
    <>
      <StyledHomePage>
        <StyledHeroSection>
          <StyledOverlay />
          <h1>Bienvenido a la Herramienta de Onboarding HSBI</h1>
          <p>
            Facilita el proceso de apadrinar nuevos usuarios en la blockchain de
            Hive SBI de forma rápida y sencilla.
          </p>
        </StyledHeroSection>

        <StyledSection>
          <StyledSectionTitle>¿Qué es Hive SBI?</StyledSectionTitle>
          <p>
            Hive SBI (Hive Basic Income) es un proyecto de apoyo a creadores de
            contenido en la blockchain de Hive. Su objetivo es proporcionar un
            ingreso básico pasivo a largo plazo a sus miembros a través de
            shares (acciones) que generan recompensas diarias en Hive Power.
          </p>
          <p>
            Te conviertes en miembro (o apadrinas a alguien más) enviando HIVE o
            HBD a la cuenta @steembasicincome con un memo específico. Cada share
            que posees (o que tiene tu apadrinado) contribuye a un ingreso
            pasivo diario, incentivando la participación y la curación en la
            cadena.
          </p>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Simplificando el Proceso</StyledSectionTitle>
          <p>
            Apadrinar a un nuevo usuario en Hive SBI manualmente implica varios
            pasos técnicos: verificar su cuenta, encontrar un post adecuado,
            generar el memo correcto para la transacción y luego publicar un
            comentario de notificación en uno de sus posts.
          </p>
          <p>
            Esta herramienta ha sido diseñada para automatizar y guiar gran
            parte de este proceso, haciéndolo accesible incluso si eres nuevo
            apadrinando.
          </p>
          <p>
            Te ayuda a buscar usuarios, verificar su estado de membresía,
            encontrar posts recientes, generar el memo necesario para la
            transacción y te asiste en la creación y publicación del comentario
            de onboarding, todo en un solo lugar.
          </p>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Cómo Funciona (Paso a Paso)</StyledSectionTitle>
          <ImageCarousel images={IMAGES} interval={4000} />
          <p>Usar esta herramienta es fácil. Sigue estos pasos:</p>
          <ol>
            <li>
              <strong>Busca el Usuario:</strong> Ve a la sección "Onboard
              Usuario" y usa el buscador para encontrar el nombre de Hive de la
              persona que quieres apadrinar.
            </li>
            <li>
              <strong>Verificación de Membresía:</strong> La aplicación
              verificará automáticamente si el usuario ya es miembro de HSBI.
            </li>
            <li>
              <strong>Selecciona un Post:</strong> Si el usuario no es miembro,
              la aplicación te mostrará una lista de sus posts recientes. Elige
              el post donde quieras dejar el comentario de notificación.
            </li>
            <li>
              <strong>Genera el Comentario:</strong> La aplicación creará un
              borrador del comentario de onboarding con toda la información
              relevante.
            </li>
            <li>
              <strong>Revisa y Edita:</strong> Tendrás la opción de revisar y
              editar el borrador del comentario antes de publicarlo.
            </li>
            <li>
              <strong>Realiza la Transacción:</strong> Se te proporcionará el
              memo exacto y la cantidad que debes enviar a @steembasicincome
              usando Hive Keychain para apadrinar al usuario.
            </li>
            <li>
              <strong>Publica el Comentario:</strong> Una vez confirmada la
              transacción, la aplicación te guiará para publicar el comentario
              de notificación en el post que elegiste.
            </li>
            <li>
              <strong>Confirmación:</strong> Verás una confirmación y un resumen
              del apadrinamiento completado.
            </li>
          </ol>
        </StyledSection>

        <StyledSection style={{ textAlign: "center" }}>
          <StyledSectionTitle>¡Comienza Ahora!</StyledSectionTitle>
          <p>¿Listo para apadrinar a tu primer usuario en Hive SBI?</p>
          <StyledButton as={NavLink} to="/onboard-user">
            Ir a Onboard Usuario
          </StyledButton>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Recursos y Contacto</StyledSectionTitle>
          <ComponentCarousel
            components={contactCarouselComponents}
            height="450px" // Define una altura fija para el carrusel
            interval={10000} // Opcional: auto-slide cada 10 segundos
          />
        </StyledSection>
      </StyledHomePage>

      <StyledFooter>
        <StyledFooterContent>
          <StyledMadeWithLove>
            Hecho con ❤️ por{" "}
            <a
              href="https://peakd.com/@theghost1980"
              target="_blank"
              rel="noopener noreferrer"
            >
              @theghost1980
            </a>{" "}
            @2025
          </StyledMadeWithLove>

          <StyledPoweredBy>
            <h4>Powered by</h4>
            <StyledPoweredByLogos>
              <StyledLogoLink
                href="https://hive.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledLogoImage src={hiveLogo} alt="Hive Logo" />
              </StyledLogoLink>
              <StyledLogoLink
                href="https://github.com/hiveio/hive-keychain"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                {/* Link a GitHub repo */}
                <StyledLogoImage src={keychainLogo} alt="Keychain Logo" />
              </StyledLogoLink>
              <StyledLogoLink
                href="https://hivesql.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledLogoImage src={hivesqlLogo} alt="HiveSQL Logo" />
              </StyledLogoLink>
              <StyledLogoLink
                href="https://www.privex.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledLogoImage src={privexLogo} alt="Privex Logo" />
              </StyledLogoLink>
            </StyledPoweredByLogos>
          </StyledPoweredBy>
        </StyledFooterContent>
      </StyledFooter>

      <StyledFixedButton>
        <a
          href={"https://thecrazygm.com/hivetools/give/theghost1980/10/HBD"}
          target="_blank"
          rel="noopener noreferrer"
          title="Tipu Love"
        >
          <img src={fixedButtonImage} alt="Button icon" />
        </a>
      </StyledFixedButton>
    </>
  );
};

export default HomePage;

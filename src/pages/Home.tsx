import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import heroBackground from "../assets/bg/hive-dc.jpeg";

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

  ${""}/* Comentarios de selector eliminados */
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
  color: white; /* Color de texto corregido a blanco para contraste */
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;
  margin-top: 20px;

  &:hover {
    background-color: #16a085;
    color: white;
  }
`;

const HomePage: React.FC = () => {
  return (
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
          ingreso básico pasivo a largo plazo a sus miembros a través de shares
          (acciones) que generan recompensas diarias en Hive Power.
        </p>
        <p>
          Te conviertes en miembro (o apadrinas a alguien más) enviando HIVE o
          HBD a la cuenta @steembasicincome con un memo específico. Cada share
          que posees (o que tiene tu apadrinado) contribuye a un ingreso pasivo
          diario, incentivando la participación y la curación en la cadena.
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
          Esta herramienta ha sido diseñada para automatizar y guiar gran parte
          de este proceso, haciéndolo accesible incluso si eres nuevo
          apadrinando.
        </p>
        <p>
          Te ayuda a buscar usuarios, verificar su estado de membresía,
          encontrar posts recientes, generar el memo necesario para la
          transacción y te asiste en la creación y publicación del comentario de
          onboarding, todo en un solo lugar.
        </p>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Cómo Funciona (Paso a Paso)</StyledSectionTitle>
        <p>Usar esta herramienta es fácil. Sigue estos pasos:</p>
        <ol>
          <li>
            <strong>Busca el Usuario:</strong> Ve a la sección "Onboard Usuario"
            y usa el buscador para encontrar el nombre de Hive de la persona que
            quieres apadrinar.
          </li>
          <li>
            <strong>Verificación de Membresía:</strong> La aplicación verificará
            automáticamente si el usuario ya es miembro de HSBI.
          </li>
          <li>
            <strong>Selecciona un Post:</strong> Si el usuario no es miembro, la
            aplicación te mostrará una lista de sus posts recientes. Elige el
            post donde quieras dejar el comentario de notificación.
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
            <strong>Realiza la Transacción:</strong> Se te proporcionará el memo
            exacto y la cantidad que debes enviar a @steembasicincome usando
            Hive Keychain para apadrinar al usuario.
          </li>
          <li>
            <strong>Publica el Comentario:</strong> Una vez confirmada la
            transacción, la aplicación te guiará para publicar el comentario de
            notificación en el post que elegiste.
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

      {/* Sección: Sobre Nosotros / Contacto (Opcional) */}
    </StyledHomePage>
  );
};

export default HomePage;

import { beBaseUrl } from "../components/BackendStatusBar";
import { HttpError, post } from "./RequestsApi";

//TODO refactor / DRY

export interface BackendVerifyResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface BackendChallengeResponse {
  challenge: string;
}

export const verifyUser = async (
  username: string,
  signature: string
): Promise<BackendVerifyResponse> => {
  const baseUrl = beBaseUrl;
  const route = "/auth/verify";
  const bodyData = {
    username,
    signature,
  };

  try {
    const result = await post(baseUrl, route, bodyData);
    return result;
  } catch (error: any) {
    console.error("Ocurrió un error al hacer la petición:", route, error);

    if (error instanceof HttpError) {
      console.error(
        "Error HTTP:",
        error.response.status,
        error.response.statusText
      );
      console.error("Cuerpo del error del servidor:", error.body);
      // No manejamos la redirección aquí, solo logueamos.
      // La acción de redirección (o mostrar un mensaje UI) debe ir en el componente React.
    } else {
      console.error("Error de red o desconocido:", error.message);
    }
    throw error;
  }
};

export const getChallenge = async (
  username: string
): Promise<BackendChallengeResponse> => {
  const baseUrl = beBaseUrl;
  const route = "/auth/challenge";
  const bodyData = {
    username,
  };

  try {
    const result = await post(baseUrl, route, bodyData);
    return result;
  } catch (error: any) {
    console.error("Ocurrió un error al hacer la petición:", route, error);

    if (error instanceof HttpError) {
      console.error(
        "Error HTTP:",
        error.response.status,
        error.response.statusText
      );
      console.error("Cuerpo del error del servidor:", error.body);
      // No manejamos la redirección aquí, solo logueamos.
      // La acción de redirección (o mostrar un mensaje UI) debe ir en el componente React.
    } else {
      console.error("Error de red o desconocido:", error.message);
    }
    throw error;
  }
};

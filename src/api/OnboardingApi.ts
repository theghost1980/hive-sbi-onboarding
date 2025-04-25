import { HttpError } from "../classes/http.class";
import { beBaseUrl } from "../components/BackendStatusBar";
import { get, post } from "./RequestsApi";

/**
 * Añade una nueva entrada de onboarding via API.
 * @param baseUrl - La URL base del API.
 * @param onboarderUsername - Nombre de usuario del onboarder.
 * @param onboardedUsername - Nombre de usuario del onboarded.
 * @param token - Token de autorización Bearer.
 * @returns Una Promesa que se resuelve con los datos de la respuesta si es exitosa.
 * @throws HttpError si la API devuelve un error (4xx/5xx).
 * @throws Error si hay un problema de red o de fetch.
 */
export const addOnboardingEntry = async (
  //TODO define later on what to use if only "export const Module = {functions}"???
  onboarderUsername: string,
  onboardedUsername: string,
  amount: string,
  memo: string,
  token: string
): Promise<any> => {
  const baseUrl = beBaseUrl;
  const route = "/crud/add";
  const bodyData = {
    onboarder: onboarderUsername,
    onboarded: onboardedUsername,
    amount: amount,
    memo: memo,
  };

  try {
    console.log(`Intentando añadir entry para onboarded: ${onboardedUsername}`);
    const result = await post(baseUrl, route, bodyData, token);
    console.log("Petición exitosa:", route, result);
    return result; // Devuelve el resultado exitoso
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

export const getOnboarded = async (
  //TODO define later on what to use if only "export const Module = {functions}"???
  username: string,
  token: string
): Promise<any> => {
  const baseUrl = beBaseUrl;
  const route = "/query/onboarded-by-username";
  const bodyData = {
    username,
  };

  try {
    console.log(`Buscando onboarded: ${username}`);
    const result = await get(baseUrl, route, bodyData, token);
    console.log("Petición exitosa:", route, result);
    return result; // Devuelve el resultado exitoso
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

//TODO add more as needed

import { HttpError } from "../classes/http.class";
import { beBaseUrl } from "../components/BackendStatusBar";
import { get, post, put } from "./RequestsApi";

//TODO JSDocs for each function/utility at the end of the MVP

export const addOnboardingEntry = async (
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

export const getAllOnboarded = async (token: string): Promise<any> => {
  const baseUrl = beBaseUrl;
  const route = "/query/getAll";

  try {
    console.log(`Buscando all onboarded!`);
    const result = await get(baseUrl, route, undefined, token);
    console.log("Petición exitosa:", route, result);
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

export const editCommentPermlinkOnboardingEntry = async (
  onboarder: string,
  onboarded: string,
  comment_permlink: string,
  token: string
): Promise<any> => {
  const baseUrl = beBaseUrl;
  const route = "/crud/edit";
  const bodyData = {
    onboarder,
    onboarded,
    comment_permlink,
  };

  try {
    console.log(
      `Intentando editar comment_permlink entry para onboarded: ${onboarded} cl:${comment_permlink}`
    );
    const result = await put(baseUrl, route, bodyData, token);
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

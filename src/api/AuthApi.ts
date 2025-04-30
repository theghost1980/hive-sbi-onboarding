import {
  beBaseUrl,
  GET_CHALLENGE_ROUTE,
  VERIFY_USER_ROUTE,
} from "../config/constants";
import { HttpError, post } from "./RequestsApi";

export interface BackendVerifyResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface BackendChallengeResponse {
  challenge: string;
}

const request = async <T>(
  route: string,
  bodyData: any,
  method: "POST"
): Promise<T> => {
  const url = `${beBaseUrl}${route}`;

  try {
    if (method === "POST") {
      const result: T = await post(beBaseUrl, route, bodyData);
      return result;
    } else {
      throw new Error(`Method ${method} not supported`);
    }
  } catch (error: any) {
    console.error("Ocurrió un error al hacer la petición:", route, error);
    if (error instanceof HttpError) {
      console.error(
        "Error HTTP:",
        error.response.status,
        error.response.statusText
      );
      console.error("Cuerpo del error del servidor:", error.body);
    } else {
      console.error("Error de red o desconocido:", error.message);
    }
    throw error;
  }
};

export const verifyUser = async (
  username: string,
  signature: string
): Promise<BackendVerifyResponse> => {
  const bodyData = {
    username,
    signature,
  };
  return request<BackendVerifyResponse>(VERIFY_USER_ROUTE, bodyData, "POST");
};

export const getChallenge = async (
  username: string
): Promise<BackendChallengeResponse> => {
  const bodyData = {
    username,
  };
  return request<BackendChallengeResponse>(
    GET_CHALLENGE_ROUTE,
    bodyData,
    "POST"
  );
};

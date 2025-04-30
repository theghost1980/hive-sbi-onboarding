import { beBaseUrl, JWT_TOKEN_STORAGE_KEY } from "../config/constants";
import { LocalStorageUtils } from "../utils/localstorage.utils";

export class HttpError extends Error {
  response: Response;
  body: any;

  constructor(message: string, response: Response, body: any) {
    super(message);
    this.response = response;
    this.body = body;
  }
}

export class BackendApi {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  private async request<T>(
    route: string,
    bodyData: any,
    method: "POST" | "GET" | "PUT" | "DELETE",
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${route}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (requireAuth) {
      const token = LocalStorageUtils.getValue(JWT_TOKEN_STORAGE_KEY);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("No token found");
      }
    }

    try {
      let response: Response;
      if (method === "POST") {
        response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(bodyData),
        });
      } else if (method === "GET") {
        response = await fetch(url, {
          method: "GET",
          headers: headers,
        });
      } else if (method === "PUT") {
        response = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(bodyData),
        });
      } else if (method === "DELETE") {
        response = await fetch(url, {
          method: "DELETE",
          headers: headers,
          body: JSON.stringify(bodyData),
        });
      } else {
        throw new Error(`Method ${method} not supported`);
      }

      const body = await response.json();

      if (!response.ok) {
        throw new HttpError(
          `HTTP error! status: ${response.status}`,
          response,
          body
        );
      }
      return body;
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
  }

  async post<T>(
    route: string,
    bodyData: any,
    requireAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(route, bodyData, "POST", requireAuth);
  }

  /**
   * Note: requireAuth true by default, will try to get local token
   */
  async get<T>(route: string, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(route, null, "GET", requireAuth);
  }

  async put<T>(
    route: string,
    bodyData: any,
    requireAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(route, bodyData, "PUT", requireAuth);
  }

  async remove<T>(
    route: string,
    bodyData: any,
    requireAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(route, bodyData, "DELETE", requireAuth);
  }
}
const backendApi = new BackendApi(beBaseUrl!);

export default backendApi;

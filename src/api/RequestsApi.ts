export class HttpError extends Error {
  response: Response;
  body: any;

  constructor(response: Response, body: any, message?: string) {
    super(message || `HTTP error ${response.status}`);
    this.name = "HttpError";
    this.response = response;
    this.body = body;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Realiza una petición HTTP genérica.
 * @param method - Método HTTP (GET, POST, PUT, DELETE, PATCH).
 * @param baseUrl - La URL base del API (ej: 'https://miapi.com').
 * @param route - La ruta específica (ej: '/usuarios' o '/productos/123'). Debe empezar con '/'.
 * @param data - Opcional. Datos a enviar. Para POST/PUT/PATCH, va en el cuerpo (JSON). Para GET/DELETE, se añade como query parameters a la URL. Debe ser un objeto plano.
 * @param token - Opcional. Token de autorización Bearer.
 * @returns Una Promesa que se resuelve con la respuesta JSON del backend si es exitosa (código 2xx con cuerpo).
 * @throws HttpError si la respuesta del servidor no es exitosa (código fuera de 2xx).
 * @throws Error si hay un problema de red, al parsear JSON (en éxito o error), o si el cuerpo exitoso está vacío inesperadamente.
 */
export const apiRequest = async <
  TResult = any,
  TData extends object | undefined = undefined
>(
  method: HttpMethod,
  baseUrl: string,
  route: string,
  data?: TData,
  token?: string
): Promise<TResult> => {
  let url = `${baseUrl}${route}`;
  const headers: HeadersInit = {};
  let body: BodyInit | null | undefined = undefined;

  const isBodyMethod =
    method === "POST" || method === "PUT" || method === "PATCH";
  const isGetOrDelete = method === "GET" || method === "DELETE";

  if (data) {
    if (isBodyMethod) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    } else if (isGetOrDelete) {
      const queryParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, String(item)));
          } else if (typeof value === "object") {
            queryParams.append(key, String(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
      // Opciones adicionales: credentials, mode, cache, signal (para cancelar), etc.
      // signal: abortSignal // Si implementas cancelación con AbortController
    });

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = await response.text();
        } catch {
          errorBody = "Failed to read response body";
        }
      }
      throw new HttpError(
        response,
        errorBody,
        `HTTP error ${method} ${url}: ${response.status} ${response.statusText}`
      );
    }

    try {
      const text = await response.text();
      if (!text) {
        return null as TResult;
      }
      return JSON.parse(text) as TResult;
    } catch (jsonError: any) {
      console.error(
        `Failed to parse JSON response from ${url} (status: ${response.status}):`,
        jsonError
      );
      throw new Error(
        `Invalid JSON response from ${url}: ${jsonError.message}`
      );
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Realiza una petición GET.
 * @param baseUrl - URL base.
 * @param route - Ruta.
 * @param data - Datos (van como query params).
 * @param token - Token.
 * @returns Promesa con respuesta JSON.
 * @throws Errores de apiRequest.
 */
export const get = <
  TResult = any,
  TData extends object | undefined = undefined
>(
  baseUrl: string,
  route: string,
  data?: TData,
  token?: string
): Promise<TResult> => apiRequest("GET", baseUrl, route, data, token);

/**
 * Realiza una petición POST.
 * @param baseUrl - URL base.
 * @param route - Ruta.
 * @param data - Datos (van en el cuerpo JSON).
 * @param token - Token.
 * @returns Promesa con respuesta JSON.
 * @throws Errores de apiRequest.
 */
export const post = <TResult = any, TData extends object = object>(
  baseUrl: string,
  route: string,
  data: TData,
  token?: string
): Promise<TResult> => apiRequest("POST", baseUrl, route, data, token);

export const put = <TResult = any, TData extends object = object>(
  baseUrl: string,
  route: string,
  data: TData,
  token?: string
): Promise<TResult> => apiRequest("PUT", baseUrl, route, data, token);

// Opcional: Añade funciones para otros métodos si las necesitas
/*
  export const put = <TResult = any, TData extends object = object>(
      baseUrl: string, route: string, data: TData, token?: string
  ): Promise<TResult> => apiRequest('PUT', baseUrl, route, data, token);
  
  export const del = <TResult = any, TData extends object | undefined = undefined>( // DELETE puede no llevar cuerpo
      baseUrl: string, route: string, data?: TData, token?: string
  ): Promise<TResult> => apiRequest('DELETE', baseUrl, route, data, token);
  
  export const patch = <TResult = any, TData extends object = object>(
      baseUrl: string, route: string, data: TData, token?: string
  ): Promise<TResult> => apiRequest('PATCH', baseUrl, route, data, token);
  */

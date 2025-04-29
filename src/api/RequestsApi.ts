// src/utils/api.ts (o el nombre de archivo que prefieras)

// Mantenemos la clase HttpError, quizás con menos comentarios si lo deseas
export class HttpError extends Error {
  response: Response;
  body: any; // Puede ser JSON parseado o texto

  constructor(response: Response, body: any, message?: string) {
    super(message || `HTTP error ${response.status}`);
    this.name = "HttpError";
    this.response = response;
    this.body = body;
  }
}

// Definimos los métodos HTTP que nuestra función manejará
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"; // Añade otros si los necesitas

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
>( // Uso de genéricos para tipado de resultado y datos
  method: HttpMethod,
  baseUrl: string,
  route: string,
  data?: TData, // Datos a enviar, opcionales
  token?: string
): Promise<TResult> => {
  // La promesa resuelve con el tipo TResult
  let url = `${baseUrl}${route}`; // Construimos la URL inicial
  const headers: HeadersInit = {}; // Inicializamos los headers
  let body: BodyInit | null | undefined = undefined; // El cuerpo de la petición

  // Determinamos si el método usa cuerpo (POST, PUT, PATCH) o query params (GET, DELETE)
  const isBodyMethod =
    method === "POST" || method === "PUT" || method === "PATCH";
  const isGetOrDelete = method === "GET" || method === "DELETE";

  // --- Manejo de Datos (Cuerpo vs Query Params) ---
  if (data) {
    if (isBodyMethod) {
      // Para métodos con cuerpo, añadimos Content-Type y serializamos los datos a JSON
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    } else if (isGetOrDelete) {
      // Para GET/DELETE, convertimos los datos a query parameters
      const queryParams = new URLSearchParams();
      // Recorremos el objeto de datos y añadimos cada par clave-valor
      Object.entries(data).forEach(([key, value]) => {
        // URLSearchParams se encarga de codificar correctamente las claves y valores
        // Ojo: Esto maneja objetos planos y arrays de primitivos. Objetos anidados complejos requieren más lógica o una librería (ej: 'qs').
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, String(item))); // Añadir múltiples veces para arrays
          } else if (typeof value === "object") {
            // Si es un objeto no-array, intenta stringificarlo (puede resultar en "[object Object]") o ajusta la lógica
            queryParams.append(key, String(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        // Añadimos los query parameters a la URL. Manejamos si la URL ya tiene otros params.
        url = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    }
    // Otros métodos (HEAD, OPTIONS) generalmente no usan ni cuerpo ni query params de esta forma estándar
  }

  // --- Manejo del Token de Autorización ---
  // Si se proporciona un token, añadimos el header de Autorización (aplicable a la mayoría de métodos si se requiere autenticación)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // --- Realizar la Petición con Fetch ---
  try {
    const response = await fetch(url, {
      method: method, // Usamos el método pasado como parámetro
      headers: headers,
      body: body, // Usamos el cuerpo preparado (será undefined/null para GET/DELETE sin datos)
      // Opciones adicionales: credentials, mode, cache, signal (para cancelar), etc.
      // signal: abortSignal // Si implementas cancelación con AbortController
    });

    // --- Manejo de Errores HTTP (códigos fuera de 2xx) ---
    if (!response.ok) {
      let errorBody: any;
      // Intentamos leer el cuerpo de la respuesta de error para más detalles
      try {
        errorBody = await response.json(); // Intentamos como JSON primero
      } catch {
        try {
          errorBody = await response.text(); // Si falla, leemos como texto plano
        } catch {
          errorBody = "Failed to read response body"; // Si no se puede leer
        }
      }
      // Lanzamos nuestro error personalizado con la respuesta y el cuerpo del error
      throw new HttpError(
        response,
        errorBody,
        `HTTP error ${method} ${url}: ${response.status} ${response.statusText}`
      );
    }

    // --- Manejo de Respuesta Exitosa (códigos 2xx) ---
    // Intentamos leer el cuerpo de la respuesta como JSON.
    // Ojo: Algunas respuestas exitosas (ej: 204 No Content) no tienen cuerpo.
    // response.json() puede fallar si el cuerpo está vacío o no es JSON válido.
    try {
      // Leemos el cuerpo como texto primero para comprobar si está vacío
      const text = await response.text();
      if (!text) {
        // Si el cuerpo está vacío (ej: 204 No Content), retornamos null o undefined (depende de lo que esperes)
        // Aquí retornamos null, puedes ajustarlo a undefined si TResult lo permite
        return null as TResult;
      }
      // Si no está vacío, intentamos parsearlo como JSON
      return JSON.parse(text) as TResult;
    } catch (jsonError: any) {
      // Este catch se activa si response.text() funciona pero JSON.parse(text) falla
      // Esto indica que la respuesta fue 2xx pero el cuerpo no es JSON válido
      console.error(
        `Failed to parse JSON response from ${url} (status: ${response.status}):`,
        jsonError
      );
      // Lanzamos un nuevo error para indicar que falló el parseo JSON en una respuesta exitosa
      throw new Error(
        `Invalid JSON response from ${url}: ${jsonError.message}`
      );
    }
  } catch (error) {
    // --- Manejo de Errores de Red o Errores Lanzados Arriba (HttpError, Error de Parseo) ---
    // La función HttpError ya loguea el error. El error de parseo también tiene info.
    // Aquí simplemente relanzamos el error para que quien LLAMÓ a apiRequest lo maneje.
    throw error;
  }
};

// --- Funciones Auxiliares para Métodos Comunes ---
// Estas funciones hacen que usar apiRequest sea más cómodo para GET y POST

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

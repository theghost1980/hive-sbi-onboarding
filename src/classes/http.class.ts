export class HttpError extends Error {
  response: Response;
  body: any;

  constructor(response: Response, body: any, message?: string) {
    super(message || `HTTP error ${response.status}`);

    this.name = "HttpError";
    this.response = response;
    this.body = body;

    // Esto es útil para depuración, aunque puede no ser necesario en todos los entornos
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, HttpError);
    // }
  }
}

/**
 * Realiza una petición POST a una ruta específica.
 * @param baseUrl - La URL base del API (ej: 'https://miapi.com').
 * @param route - La ruta específica (ej: '/usuarios/crear'). Debe empezar con '/'.
 * @param bodyData - El objeto con los datos a enviar en el cuerpo de la petición (se serializará a JSON).
 * @param token - Opcional. El token de autorización Bearer.
 * @returns Una Promesa que se resuelve con la respuesta JSON del backend si es exitosa (código 2xx).
 * @throws HttpError si la respuesta del servidor no es exitosa (código fuera de 2xx).
 * @throws Error si hay un problema de red u otro error de fetch.
 */
export const postRequest = async (
  baseUrl: string,
  route: string,
  bodyData: any, // TODO add types
  token?: string // Marca el token como opcional si no siempre se usa
): Promise<any> => {
  // TODO types needed?
  const url = `${baseUrl}${route}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch (jsonError) {
        try {
          errorBody = await response.text();
        } catch (textError) {
          errorBody = "No se pudo leer el cuerpo de la respuesta de error.";
        }
      }
      throw new HttpError(
        response,
        errorBody,
        `Error en la petición POST a ${url}: ${response.status} ${response.statusText}`
      );
    }

    try {
      return await response.json();
    } catch (jsonError) {
      console.error(`Error al parsear la respuesta JSON de ${url}:`, jsonError);
      throw new Error(`Respuesta inválida (no es JSON) de ${url}`);
    }
  } catch (error) {
    console.error(`Fallo al realizar la petición POST a ${url}:`, error);
    throw error;
  }
};

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { config } from "../config/config";
// Ya no necesitamos importar 'jsonwebtoken'

// Define el tipo para el usuario autenticado (la estructura que tu backend retornará)
interface AuthUser {
  username: string;
  role: string; // O los campos que tu endpoint /validate-token retorne // Añade aquí cualquier otro campo que tu backend devuelva (ej: id, email, etc.)
}

// Define el tipo para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoadingAuth: boolean; // Añadimos un estado para indicar si la validación inicial está en curso
  setAuth(user: AuthUser, token: string): void; // Función para establecer el estado tras login exitoso
  logout(): void; // Función para cerrar sesión
}

export const JWT_TOKEN_STORAGE_KEY = "jwt_token"; // Clave para localStorage

// Crea el contexto con valores por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Componente Proveedor de Autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  // Estado para controlar si la validación inicial del token ha terminado
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Inicializa a true

  // Función para cerrar sesión (igual que antes)
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY); // Eliminar token // TODO: Redirigir al login o a la página de inicio (esto se haría normalmente en el componente que usa logout)
  };

  // Función para establecer el estado después del login exitoso (llamada desde tu componente de login)
  const setAuth = (userData: AuthUser, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(JWT_TOKEN_STORAGE_KEY, token); // Guardar token
  }; // Efecto para cargar y validar el estado de autenticación al iniciar la app

  useEffect(() => {
    const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);

    // Función asíncrona para validar el token con el backend
    const validateTokenWithBackend = async (storedToken: string) => {
      setIsLoadingAuth(true); // Iniciamos el estado de carga

      try {
        // *** Realiza la llamada API a tu endpoint /validate-token ***
        // Asumimos que tu endpoint es '/api/auth/validate-token'
        // Asumimos que espera el token en la cabecera Authorization: Bearer <token>
        const response = await fetch(
          `${config.backend.remote}/auth/validate-token`,
          {
            // Ajusta la URL si es diferente
            method: "POST", // O 'POST' si tu backend lo espera en el cuerpo
            headers: {
              Authorization: `Bearer ${storedToken}`, // Envía el token aquí
              "Content-Type": "application/json", // Si envías cuerpo (GET no suele tenerlo)
            },
            // Si tu backend espera el token en el cuerpo (menos común para validación GET):
            // body: JSON.stringify({ token: storedToken }),
          }
        );

        // Verificar la respuesta del backend
        if (response.ok) {
          // Si el backend retorna un status 2xx (ej: 200 OK), el token es válido
          const userData: AuthUser = await response.json(); // Asume que el backend retorna los datos del usuario
          // Establecer el estado de autenticación con los datos del backend
          setUser(userData); // Usa los datos recibidos del backend
          setIsAuthenticated(true);
          console.log("Token validated successfully via backend.");
        } else {
          // Si el backend retorna un status de error (ej: 401 Unauthorized, 403 Forbidden, 404 Not Found si no existe usuario del token)
          console.warn(
            `Token validation failed via backend. Status: ${response.status}`
          );
          logout();
        }
      } catch (error) {
        // Manejar errores de red o cualquier otro error durante la llamada API
        console.error("Error during backend token validation API call:", error);
        logout(); // Si la llamada falla, asumimos que el token no es válido o el backend no responde
      } finally {
        setIsLoadingAuth(false); // Terminamos el estado de carga, sin importar el resultado
      }
    };

    // --- Lógica al montar el componente ---
    if (token) {
      // Si se encuentra un token en localStorage, validarlo con el backend
      validateTokenWithBackend(token);
    } else {
      // Si no se encuentra ningún token, el usuario no está autenticado.
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false); // No hay token, no hay carga de validación
    }

    // Este efecto solo se ejecuta una vez al montar el proveedor.
  }, []); // Dependencias vacías

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoadingAuth, // Incluimos el estado de carga en el contexto
    setAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

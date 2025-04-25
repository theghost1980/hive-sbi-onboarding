import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { beBaseUrl } from "../components/BackendStatusBar";
interface AuthUser {
  username: string;
  role: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoadingAuth: boolean;
  setAuth(user: AuthUser, token: string): void;
  logout(): void;
}

export const JWT_TOKEN_STORAGE_KEY = "jwt_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
    // TODO: Redirigir al login o a la página de inicio (esto se haría normalmente en el componente que usa logout)
  };

  const setAuth = (userData: AuthUser, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(JWT_TOKEN_STORAGE_KEY, token);
  };

  useEffect(() => {
    const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);

    const validateTokenWithBackend = async (storedToken: string) => {
      setIsLoadingAuth(true); // Iniciamos el estado de carga

      try {
        const response = await fetch(`${beBaseUrl}/auth/validate-token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

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

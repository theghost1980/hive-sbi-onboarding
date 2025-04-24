// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// Asume que tienes un hook o contexto para saber si el usuario está autenticado
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta según tu estructura

interface ProtectedRouteProps {
  // Puedes añadir lógica para roles si necesitas proteger rutas solo para ciertos usuarios
  // requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (
  {
    /* requiredRole */
  }
) => {
  // Usa tu lógica de autenticación aquí
  const { isAuthenticated, user } = useAuth(); // Obtén el estado de autenticación

  // Si el usuario no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // Reemplaza '/login' con la ruta a tu página de login
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderizar las rutas hijas
  // Puedes añadir aquí lógica para verificar roles si usas requiredRole
  // if (requiredRole && user?.role !== requiredRole) {
  //   return <Navigate to="/unauthorized" replace />; // Redirigir a página de no autorizado
  // }

  // Outlet renderiza la ruta anidada (las rutas dentro de <ProtectedRoute>)
  return <Outlet />;
};

export default ProtectedRoute;

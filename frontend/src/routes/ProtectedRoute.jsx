/* === RUTAS DE BACKEND ===
Define las URLs expuestas de la API para este módulo.
Aplica los middlewares de protección (como la validación de tokens JWT) antes de ceder el control al Controlador. */
// src/routes/ProtectedRoute.jsx
import React, { useEffect } from 'react'; // 👈 Importa useEffect
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/shared/contexts';

const ProtectedRoute = ({
  children,
  requireStaff = true,
  disallowStaff = false,
  staffRedirectTo = "/login",
}) => {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();

  // ✅ NUEVO: Limpiar el historial para evitar volver a la tienda
  // ⚠️ IMPORTANTE: Este hook debe estar AQUÍ ARRIBA, antes de cualquier "return"
  useEffect(() => {
    if (requireStaff && isStaff) {
      // Reemplaza la entrada actual en el historial con la URL actual
      // Esto evita que el botón "Atrás" regrese a páginas anteriores (como la tienda)
      window.history.replaceState({}, '', window.location.href);
    }
  }, [requireStaff, isStaff, location.pathname]);

  // Ahora sí puedes tener tus returns condicionales
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#F5C81B'
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (disallowStaff && isStaff) {
    return <Navigate to={staffRedirectTo} replace />;
  }

  // Si requiere ser Staff y no lo es, denegar
  if (requireStaff && !isStaff) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
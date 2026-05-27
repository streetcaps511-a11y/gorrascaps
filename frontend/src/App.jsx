// src/App.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SearchProvider,
  CartProvider,
  useAuth, // 👈 Importamos el contexto de autenticación
} from "./features/shared/contexts";
import { Header, Footer } from "./features/shared/services";
import AppRoutes from "./routes/AppRoutes";

/**
⚡ APLICACIÓN PRINCIPAL
Estructura limpia y organizada.
*/
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 👈 Hook para redirigir
  const { user, isStaff } = useAuth(); // 👈 Obtenemos si es admin

  // 🛡️ GUARDIA DE RUTAS: Evita que el admin vuelva a la tienda
  useEffect(() => {
    // Si el usuario es admin (isStaff) y la URL actual es la tienda (/) o el login (/login)
    if (isStaff && (location.pathname === '/' || location.pathname === '/login')) {
      console.log("🛡️ Guardia activado: Bloqueando retorno a tienda");
      // Lo devolvemos al admin inmediatamente y reemplazamos el historial
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, isStaff, navigate]); // Se ejecuta cada vez que cambia la ruta

  // Decide si mostrar el header (Tienda) o no (Admin/Login)
  const showHeader =
    !location.pathname.startsWith("/admin") &&
    location.pathname !== "/login" &&
    location.pathname !== "/reset-password";

  return (
    <div className="app-root-container">
      {showHeader && <Header />}
      <main className="app-main-content">
        <AppRoutes />
      </main>
      {showHeader && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </SearchProvider>
  );
}
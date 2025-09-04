import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { ConfigProvider } from "./context/ConfigContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ConfigProvider>
            <App />
          </ConfigProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);

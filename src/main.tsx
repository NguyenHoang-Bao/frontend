import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
// Thêm dấu ! (Non-null assertion) để đảm bảo thẻ root luôn tồn tại

// Khai báo mã Client ID từ Google Cloud Console
const GOOGLE_CLIENT_ID =
  "237683305659-mv2f4c61lghtdahblnffl6f6tbn6p66m.apps.googleusercontent.com";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CartProvider>
        <App />
      </CartProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

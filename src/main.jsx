import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/authContext.jsx";
import { CartProvider } from "./context/cartContext.jsx";
import { WishlistProvider } from "./context/wishlistContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
            <Toaster position="top-right" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

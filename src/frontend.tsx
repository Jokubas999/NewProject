/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
// bun add router
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import SettingsPage from "./pages/settings";
import CreateListingPage from "./pages/createListing";
import ListingPage from "./pages/listings";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/register" element={<RegisterPage />}/>
        <Route path="/settings" element={<SettingsPage />}/>
        <Route path="/create-listing" element={<CreateListingPage />}/>
        <Route path="/listing/:id" element={<ListingPage />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
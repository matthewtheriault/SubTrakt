import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// In a plain browser (vite dev without Tauri), fake the backend so the UI
// can be worked on. Tree-shaken out of production builds.
if (import.meta.env.DEV && !("__TAURI_INTERNALS__" in window)) {
  const { installDevBrowserMock } = await import("./devBrowserMock");
  installDevBrowserMock();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

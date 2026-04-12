import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Analytics from "./Analytics";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Analytics />
  </StrictMode>
);
class PreviewSocket {readyState=3; onopen:any;onmessage:any;onclose:any;onerror:any;send(){} close(){} addEventListener(){} removeEventListener(){}}
(window as any).PreviewSocket=PreviewSocket;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

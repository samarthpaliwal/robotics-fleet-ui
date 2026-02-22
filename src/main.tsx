import React from "react";
import ReactDOM from "react-dom/client";
import { RobotProvider } from "./store/RobotContext";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RobotProvider>
      <App />
    </RobotProvider>
  </React.StrictMode>
);

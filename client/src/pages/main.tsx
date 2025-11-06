import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import GAListener from "../GAListener";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GAListener />
    <App />
  </React.StrictMode>,
);

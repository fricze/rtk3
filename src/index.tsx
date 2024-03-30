import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { api } from "./app/services/posts";
import { ChakraProvider } from "@chakra-ui/react";
import "./global.css";

import { BrowserRouter } from "react-router-dom";
import { ApiProvider } from "@reduxjs/toolkit/query/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ApiProvider api={api}>
      <ChakraProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ApiProvider>
  </React.StrictMode>,
);

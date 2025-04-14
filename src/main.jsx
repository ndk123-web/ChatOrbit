import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import SessionProvider from "./sessionProvider/myContext.jsx";
import { RouterProvider } from "react-router";

import Router from "./routes/route.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={Router} />
    </SessionProvider>
  </StrictMode>
);

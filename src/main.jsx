import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/login.jsx";
import Chat from "./components/Chat.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path : '/signup',
    element : <Signup />
  },
  {
    path : '/chat',
    element : <Chat />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}>
      
    </RouterProvider>
  </StrictMode>
);

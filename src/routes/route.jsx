import { createBrowserRouter, RouterProvider } from "react-router";

import App from "../App";
import Login from "../components/login";
import Signup from "../components/Signup";
import Chat from "../components/Chat";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);

export default Router;

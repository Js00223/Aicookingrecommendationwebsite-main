import { RouterProvider, Routes } from "react-router";
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}

import { Navigate, Route, Routes } from "react-router";
import AdminPage from "./pages/AdminPage";
import JoinPage from "./pages/JoinPage";
import NotFoundPage from "./pages/NotFoundPage";
import ScreenPage from "./pages/ScreenPage";
import SessionPage from "./pages/SessionPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/join" replace />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/s/:code" element={<SessionPage />} />
      <Route path="/screen/:code" element={<ScreenPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

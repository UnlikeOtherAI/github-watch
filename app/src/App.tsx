import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Setup } from "./pages/Setup";
import { Login } from "./pages/Login";
import { useUser } from "./hooks/useUser";

export function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117]">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[#8b949e]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="setup" element={<Setup />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

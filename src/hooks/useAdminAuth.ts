import { useCallback, useState } from "react";
import { adminLogin } from "../api/admin";
import { clearAdminToken, getAdminToken, saveAdminToken } from "../lib/storage";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());

  const login = useCallback(async (password: string) => {
    const newToken = await adminLogin(password);
    saveAdminToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    setToken(null);
  }, []);

  return { token, isAuthenticated: token !== null, login, logout };
}

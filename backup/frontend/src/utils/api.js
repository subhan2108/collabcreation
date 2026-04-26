import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { requireAuth, token } = useAuth();

  const apiFetch = async (url, options = {}) => {

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    // 🔥 MAIN FIX
    if (res.status === 401) {
      requireAuth(); // 👈 popup login
      throw new Error("Unauthorized");
    }

    return res;
  };

  return apiFetch;
};

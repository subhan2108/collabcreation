import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // logged-in user
  const [role, setRole] = useState(null); // 'creator' or 'brand'
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    const guest = localStorage.getItem("guest") === "true";

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedRole) setRole(storedRole);
    setIsGuest(guest);
  }, []);

  const login = (userData, role) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", role);
    localStorage.removeItem("guest");

    setUser(userData);
    setRole(role);
    setIsGuest(false);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
    setIsGuest(false);
  };

  const continueAsGuest = (guestRole) => {
    localStorage.setItem("guest", "true");
    localStorage.setItem("role", guestRole);
    localStorage.removeItem("user");

    setUser(null);
    setRole(guestRole);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isGuest, login, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

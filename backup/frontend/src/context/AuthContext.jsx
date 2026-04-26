import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [token, setToken] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const timerRef = useRef(null);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    setRole(null);
    setSession(null);
    setIsGuest(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (user || session) {
      timerRef.current = setTimeout(() => {
        console.log("Auto-logout due to inactivity");
        logout();
      }, AUTO_LOGOUT_TIME);
    }
  }, [user, session, logout]);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        const storedRole = localStorage.getItem("role");
        if (storedRole) setRole(storedRole);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        const storedRole = localStorage.getItem("role");
        if (storedRole) setRole(storedRole);
      } else {
        setUser(null);
        setToken(null);
        setRole(null);
      }
    });

    // 3. Check for guest
    const guest = localStorage.getItem("guest") === "true";
    const storedRole = localStorage.getItem("role");
    setIsGuest(guest);
    if (guest && storedRole) setRole(storedRole);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user || session) {
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach((event) => window.removeEventListener(event, resetTimer));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [user, session, resetTimer]);

  const login = (userData, userRole) => {
    localStorage.setItem("role", userRole);
    localStorage.removeItem("guest");
    setUser(userData);
    setRole(userRole);
    setIsGuest(false);
  };

  const continueAsGuest = (guestRole) => {
    localStorage.setItem("guest", "true");
    localStorage.setItem("role", guestRole);
    setUser(null);
    setRole(guestRole);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, token, isGuest, login, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
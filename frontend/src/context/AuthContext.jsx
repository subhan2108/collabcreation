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
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setRole(data.role);
        localStorage.setItem("role", data.role);
      } else {
        // Fallback to metadata if profile record doesn't exist yet
        const { data: { user } } = await supabase.auth.getUser();
        const metaRole = user?.user_metadata?.role;
        if (metaRole) {
          setRole(metaRole);
          localStorage.setItem("role", metaRole);
        }
      }
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setLoading(false);
      return null;
    }
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    setRole(null);
    setSession(null);
    setToken(null);
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
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setToken(null);
        setRole(null);
        setLoading(false);
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

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
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
      value={{ user, session, role, token, isGuest, loading, login, signup, logout, continueAsGuest, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
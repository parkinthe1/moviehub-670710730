import { createContext, useContext, useEffect, useState } from 'react';
import {
  login as loginApi,
  register as registerApi,
  getMe
} from '../api/backend';

const AuthContext = createContext(null);

const TOKEN_KEY = 'moviehub.token';
const MEMBER_KEY = 'moviehub.member';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [member, setMember] = useState(() => {
    const saved = localStorage.getItem(MEMBER_KEY);

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe(token);
        setMember(data.member || data);
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(MEMBER_KEY);
        setToken(null);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, [token]);

  async function login(email, password) {
    const data = await loginApi(email, password);

    setToken(data.token);
    setMember(data.member);

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(data.member));

    return data;
  }

  async function register(email, password, displayName) {
    const data = await registerApi(email, password, displayName);
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
    setToken(null);
    setMember(null);
  }

  const value = {
    token,
    member,
    loading,
    isLoggedIn: Boolean(token && member),
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
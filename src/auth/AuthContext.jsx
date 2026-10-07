import { createContext, useContext, useEffect, useState } from 'react';
import {
  login as loginApi,
  register as registerApi,
  getMe
} from '../api/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('moviehub_token')
  );

  const [member, setMember] = useState(() => {
    const saved = localStorage.getItem('moviehub_member');

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ตรวจสอบ token ที่เก็บไว้ตอนเปิดเว็บ
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
        // token ใช้ไม่ได้แล้ว
        localStorage.removeItem('moviehub_token');
        localStorage.removeItem('moviehub_member');

        setToken(null);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, [token]);

  // Login
  async function login(email, password) {
    const data = await loginApi(email, password);

    setToken(data.token);
    setMember(data.member);

    localStorage.setItem('moviehub_token', data.token);
    localStorage.setItem(
      'moviehub_member',
      JSON.stringify(data.member)
    );

    return data;
  }

  // Register
  async function register(email, password, displayName) {
    const data = await registerApi(
      email,
      password,
      displayName
    );

    return data;
  }

  // Logout
  function logout() {
    localStorage.removeItem('moviehub_token');
    localStorage.removeItem('moviehub_member');

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
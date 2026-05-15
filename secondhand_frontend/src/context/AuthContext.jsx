import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi, saveTokens, clearTokens, getToken } from "../services/index";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (token && token !== 'undefined' && token !== 'null') {
      setUser({
        username: localStorage.getItem('username') || 'user',
      });
    } else {
      clearTokens();
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);

    console.log('LOGIN RESPONSE:', data);

    const access =
      data.access ||
      data.access_token ||
      data.token ||
      data.tokens?.access;

    const refresh =
      data.refresh ||
      data.refresh_token ||
      data.tokens?.refresh;

    if (!access) {
      throw new Error('Access token not found in login response');
    }

    saveTokens(access, refresh);
    localStorage.setItem('username', username);

    const fakeUser = { username };
    setUser(fakeUser);

    return fakeUser;
  };

  const register = async (formData) => {
    const data = await authApi.register(formData);

    console.log('REGISTER RESPONSE:', data);

    const access =
      data.access ||
      data.access_token ||
      data.token ||
      data.tokens?.access;

    const refresh =
      data.refresh ||
      data.refresh_token ||
      data.tokens?.refresh;

    if (!access) {
      throw new Error('Access token not found in register response');
    }

    saveTokens(access, refresh);
    localStorage.setItem('username', formData.username);

    const fakeUser = { username: formData.username };
    setUser(fakeUser);

    return fakeUser;
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('username');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
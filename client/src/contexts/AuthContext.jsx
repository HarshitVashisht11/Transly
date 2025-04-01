import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };
  
  // Register function
  const register = async (userData) => {
    const response = await authApi.register(userData);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

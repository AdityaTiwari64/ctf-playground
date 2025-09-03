"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          localStorage.removeItem("user");
        }
      }
    }

    setLoading(false);
  }, []);

  // Don't render children until client-side hydration is complete
  if (!isClient) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          loading: true,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

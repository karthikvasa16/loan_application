import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../config/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async (tokenToVerify = null) => {
    try {
      const token = tokenToVerify || localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await apiClient.post('/api/auth/verify');
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  // Inactivity Timer
  useEffect(() => {
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    if (!isAuthenticated || isRemembered) return;

    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes
    let inactivityTimer;

    const logoutUser = () => {
      logout();
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password, rememberMe });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      // Check if account doesn't exist
      if (error.response?.status === 404 && error.response?.data?.accountNotFound) {
        return {
          success: false,
          error: error.response.data.error,
          accountNotFound: true
        };
      }

      const errorMessage = error.response?.data?.error ||
        (error.message?.includes('Network') ? 'Unable to connect to server. Please check your connection.' : 'Login failed');
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '***' });
      const response = await apiClient.post('/api/auth/register', userData);
      console.log('Registration response:', response.data);

      // Don't auto-login on registration - user needs to verify email first
      // Just return success with message
      return {
        success: true,
        message: response.data.message || 'Registration successful! Please check your email to verify your account.',
        requiresVerification: response.data.requiresVerification || false
      };
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });

      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        // Special handling for email errors
        if (error.response.data.emailError) {
          errorMessage = error.response.data.error;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network') || !error.response) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running on port 5000.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid registration data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during registration. Please try again later.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (googleToken, name, email, picture) => {
    try {
      const response = await apiClient.post('/api/auth/google', {
        googleToken,
        name,
        email,
        picture
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      // Check if user needs to register (404 - user doesn't exist)
      if (error.response?.status === 404 && error.response?.data?.requiresRegistration) {
        return {
          success: false,
          error: error.response.data.error,
          requiresRegistration: true,
          email: email // Pass email for pre-filling registration
        };
      }

      // Check if email needs verification (403 - user exists but not verified)
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        return {
          success: false,
          error: error.response.data.error,
          requiresVerification: true
        };
      }

      const errorMessage = error.response?.data?.error ||
        (error.message?.includes('Network') ? 'Unable to connect to server. Please check your connection.' : 'Google login failed');
      return { success: false, error: errorMessage };
    }
  };

  const registerWithGoogle = async (googleToken, name, email, picture) => {
    try {
      console.log('🔵 Calling /api/auth/google/register with:', {
        email,
        name,
        hasToken: !!googleToken,
        tokenLength: googleToken?.length,
        hasPicture: !!picture
      });

      const response = await apiClient.post('/api/auth/google/register', {
        googleToken,
        name,
        email,
        picture
      });

      console.log('✅ Google registration response:', response.data);

      // Don't auto-login on registration - user needs to verify email first
      return {
        success: true,
        message: response.data.message || 'Registration successful! Please check your email to verify your account.',
        requiresVerification: response.data.requiresVerification || false
      };
    } catch (error) {
      console.error('❌ Google registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      let errorMessage = 'Google registration failed. Please try again.';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message?.includes('Network') || !error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid registration data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during Google registration. Please try again later.';
      }

      return { success: false, error: errorMessage };
    }
  };



  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post('/api/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update local user state
        setUser(prevUser => ({
          ...prevUser,
          picture: response.data.picture
        }));
        return { success: true, picture: response.data.picture };
      }
      return { success: false, error: 'Failed to update profile picture' };
    } catch (error) {
      console.error('Profile picture update error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    loading,
    verifyToken,
    updateProfilePicture
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

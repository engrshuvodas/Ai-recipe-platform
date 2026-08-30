import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, recipeAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('recipe_companion_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    try {
      const res = await authAPI.login({ emailOrUsername, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('recipe_companion_token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('recipe_companion_token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success(`Welcome to Recipe Companion, ${userData.name}!`);
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('recipe_companion_token');
    setToken(null);
    setUser(null);
    toast.info('You have signed out.');
  };

  const updateUser = async (updatedFields) => {
    try {
      const res = await authAPI.updateProfile(updatedFields);
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      return { success: false, message: err.message };
    }
  };

  const toggleSaveRecipe = async (recipeId) => {
    if (!user) {
      toast.info('Please log in to save recipes');
      return false;
    }

    try {
      const res = await recipeAPI.toggleBookmark(recipeId);
      const isSaved = res.data.saved;
      
      setUser((prev) => {
        if (!prev) return prev;
        const currentSaved = Array.isArray(prev.savedRecipes) ? prev.savedRecipes : [];
        const updated = isSaved
          ? [...currentSaved, recipeId]
          : currentSaved.filter((id) => (typeof id === 'string' ? id : id._id) !== recipeId);
        return { ...prev, savedRecipes: updated };
      });

      toast.success(isSaved ? 'Recipe saved to your favorites!' : 'Recipe removed from favorites');
      return isSaved;
    } catch (err) {
      toast.error(err.message || 'Failed to save recipe');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        toggleSaveRecipe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (credentialResponse: any) => Promise<boolean>;
  fetchUserProfile: (email: string) => Promise<any>;
  updateUserProfile: (profile: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
  profileComplete: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start and fetch profile to set profileComplete
    const initializeUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Fetch profile and update profileComplete
        const profile = await fetchUserProfile(userData.email);
        if (profile) {
          setUser(userData);
          const isComplete = checkProfileComplete();
          setProfileComplete(isComplete);
        } else {
          // User not found in DB, clear localStorage and force login
          localStorage.removeItem('user');
          setUser(null);
          setProfileComplete(false);
        }
      }
      setLoading(false);
    };
    initializeUser();
  }, []);



  const fetchUserProfile = async (email: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/${encodeURIComponent(email)}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (profile: any) => {
    try {
      console.log('[updateUserProfile] Sending profile to backend:', profile);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) {
        // Try to parse error message from server
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to update profile';
        console.error('[updateUserProfile] Backend error:', errorData);
        throw new Error(errorMessage);
      }
      const result = await response.json();
      // After updating, check if profile is now complete and update state
      const updatedProfile = result.profile || profile;
      const isComplete = checkProfileComplete();
      setProfileComplete(isComplete);
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const checkProfileComplete = (): boolean => {
    // Profile completion constraint removed: always return true
    return true;
  };

  // Google OAuth login handler
  const loginWithGoogle = async (credentialResponse: any): Promise<boolean> => {
    try {
      setLoading(true);
      // Parse Google credential
      const { credential } = credentialResponse;
      if (!credential) return false;
      // Decode JWT to get user info (for demo, in production verify on backend)
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const googleUser = JSON.parse(jsonPayload);
      const userData = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        role: 'user',
        avatar: googleUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${googleUser.email}`
      };
      console.log('[loginWithGoogle] Decoded Google user:', googleUser);
      console.log('[loginWithGoogle] userData to send:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Always fetch profile from backend after login
      let profile = await fetchUserProfile(userData.email);
      if (!profile) {
        await updateUserProfile(userData);
        profile = userData;
      }
      const isComplete = checkProfileComplete();
      setProfileComplete(isComplete);
      return true;
    } catch (error) {
      console.error('[Auth] Google login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfileComplete(false);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loginWithGoogle,
    logout,
    loading,
    profileComplete,
    fetchUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

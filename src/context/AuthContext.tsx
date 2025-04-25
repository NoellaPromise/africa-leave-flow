import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'manager' | 'admin';
  profilePicture: string;
  department: string;
  provider?: 'email' | 'microsoft' | string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => void;
}

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = '29cc5c6d-ab79-41f9-b440-9e4495a53fc5'; // Replace with your client ID
const MICROSOFT_REDIRECT_URI = `${window.location.origin}/login`;
const MICROSOFT_TENANT = 'common';
const MICROSOFT_GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@ist.com',
    password: 'password',
    role: 'staff' as const,
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@ist.com',
    password: 'password',
    role: 'manager' as const,
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@ist.com',
    password: 'password',
    role: 'admin' as const,
    profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'HR'
  },
  {
    id: '4',
    name: 'Microsoft User',
    email: 'microsoft@ist.com',
    password: '',
    role: 'staff' as const,
    profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'IT',
    provider: 'microsoft' as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for Microsoft auth callback
  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code && window.location.pathname === '/login') {
        try {
          setIsLoading(true);
          toast.info('Processing Microsoft login...');
          
          // Simulate getting user profile from Microsoft Graph API
          // In production, this would be a secure backend call
          const userInfo = {
            id: `ms-${Date.now()}`,
            name: 'Microsoft User',
            email: 'user@microsoft.com',
            role: 'staff' as const,
            profilePicture: '', // We'll update this with the actual picture
            department: 'External',
            provider: 'microsoft'
          };

          // Get user's profile photo
          try {
            const photoUrl = `${MICROSOFT_GRAPH_ENDPOINT}/me/photo/$value`;
            const response = await fetch(photoUrl);
            if (response.ok) {
              const blob = await response.blob();
              userInfo.profilePicture = URL.createObjectURL(blob);
            } else {
              // Use a default avatar if no photo is available
              userInfo.profilePicture = `https://i.pravatar.cc/150?u=${userInfo.id}`;
            }
          } catch (error) {
            console.error('Error fetching profile photo:', error);
            userInfo.profilePicture = `https://i.pravatar.cc/150?u=${userInfo.id}`;
          }

          // Clean URL and set user
          window.history.replaceState({}, document.title, '/login');
          setUser(userInfo);
          localStorage.setItem('lms-user', JSON.stringify(userInfo));
          toast.success(`Welcome, ${userInfo.name}!`);
          navigate('/dashboard');
        } catch (error) {
          toast.error('Error processing Microsoft login');
          console.error('Microsoft auth error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleMicrosoftCallback();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 1000));

      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword as User);
      localStorage.setItem('lms-user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      setIsLoading(true);
      
      // Generate state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ms_auth_state', state);
      
      // Construct Microsoft authentication URL with required scopes
      const microsoftAuthUrl = 
        `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent('openid profile email User.Read')}` +
        `&state=${state}` + 
        `&prompt=select_account`;
      
      // Redirect to Microsoft login
      window.location.href = microsoftAuthUrl;
    } catch (error) {
      toast.error('Microsoft login failed. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lms-user');
    localStorage.removeItem('session_id');
    // Keep the MS demo data for convenience
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithMicrosoft,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

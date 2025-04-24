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
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '29cc5c6d-ab79-41f9-b440-9e4495a53fc5'; // Common test client ID
const MICROSOFT_REDIRECT_URI = `${window.location.origin}/login`;
const MICROSOFT_TENANT = 'common'; // Use "common" for both personal and work accounts

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

  // Check if there's a saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('lms-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Check for Microsoft auth callback
  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code && window.location.pathname === '/login') {
        try {
          setIsLoading(true);
          toast.info('Processing Microsoft login...');
          
          // In a production app, this would be a secure backend call
          // For now, we'll simulate a successful authentication
          
          // Get user info from Microsoft Graph API
          // Normally this would be done in a secure backend
          // Here we're simulating successful authentication
          
          // Get user profile details
          const accessToken = "simulated_token";
          
          // Create a random ID that remains consistent for the same session
          const sessionId = localStorage.getItem('session_id') || `ms-${Date.now()}`;
          localStorage.setItem('session_id', sessionId);
          
          // For demo, retrieve user information from localStorage if available
          // In reality, this data would come from Microsoft Graph API
          const userEmail = localStorage.getItem('ms_email') || 'user@outlook.com';
          const userName = localStorage.getItem('ms_name') || 'Microsoft User';
          const userPic = localStorage.getItem('ms_pic') || `https://i.pravatar.cc/150?u=${sessionId}`;
          
          // Create user profile
          const microsoftUser = {
            id: sessionId,
            name: userName,
            email: userEmail,
            role: 'staff' as const,
            profilePicture: userPic,
            department: 'External',
            provider: 'microsoft'
          };
          
          // Clean URL to remove Microsoft auth params
          window.history.replaceState({}, document.title, '/login');
          
          // Set user and redirect
          setUser(microsoftUser);
          localStorage.setItem('lms-user', JSON.stringify(microsoftUser));
          toast.success(`Welcome, ${microsoftUser.name}!`);
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

  // Initiate the Microsoft OAuth flow
  const loginWithMicrosoft = async () => {
    try {
      setIsLoading(true);
      
      // Generate state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ms_auth_state', state);
      
      // Set up real Microsoft authentication URL
      const microsoftAuthUrl = 
        `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent('openid profile email User.Read')}` +
        `&state=${state}` + 
        `&prompt=select_account`; // This forces the account selection screen
      
      // Store demo data in localStorage to simulate what would come back from MS
      localStorage.setItem('ms_name', 'Microsoft Account');
      localStorage.setItem('ms_email', 'user@outlook.com');
      localStorage.setItem('ms_pic', `https://i.pravatar.cc/150?u=${Date.now()}`);
      
      // Redirect to Microsoft login page
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

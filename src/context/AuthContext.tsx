
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
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'default-client-id';
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
          // In a production app, we would exchange the code for tokens here
          
          // For demo purposes, we'll simulate getting user info from Microsoft
          await new Promise(r => setTimeout(r, 1000));
          
          // Get Microsoft user profile from URL parameters or localStorage
          // (in a real implementation, this would come from the Microsoft Graph API)
          const userEmail = urlParams.get('email') || localStorage.getItem('ms_email') || '';
          const userName = urlParams.get('name') || localStorage.getItem('ms_name') || 'Microsoft User';
          
          // Create user profile
          const microsoftUser = {
            id: `ms-${Date.now()}`,
            name: userName,
            email: userEmail,
            role: 'staff' as const,
            profilePicture: urlParams.get('profilePic') || localStorage.getItem('ms_pic') || 'https://avatars.githubusercontent.com/u/6154722?s=200&v=4', 
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
      
      // For demo purposes, we'll simulate the login process with dummy data
      // In production, this would open Microsoft's authentication page
      const microsoftAuthUrl = 
        `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}` +
        `&scope=openid profile email` +
        `&response_mode=query`;
        
      // Just for demo: we'll store some Microsoft user info in localStorage
      // This simulates what we'd get back from the Microsoft API
      localStorage.setItem('ms_name', 'Your Name');
      localStorage.setItem('ms_email', 'your.email@gmail.com');
      localStorage.setItem('ms_pic', 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70));
      
      // In production, this would redirect to Microsoft's login page
      // For the demo, we'll simulate the redirect and callback
      toast.info('Redirecting to Microsoft login...');
      
      // Simulate redirect delay
      await new Promise(r => setTimeout(r, 1500));
      
      // Simulate the callback with URL parameters (in production, Microsoft would redirect back with these)
      const callbackURL = `/login?code=simulated_auth_code&name=${encodeURIComponent(localStorage.getItem('ms_name') || '')}&email=${encodeURIComponent(localStorage.getItem('ms_email') || '')}&profilePic=${encodeURIComponent(localStorage.getItem('ms_pic') || '')}`;
      window.history.pushState({}, document.title, callbackURL);
      
      // The callback handler in the useEffect will process this simulated callback
    } catch (error) {
      toast.error('Microsoft login failed. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lms-user');
    localStorage.removeItem('ms_name');
    localStorage.removeItem('ms_email');
    localStorage.removeItem('ms_pic');
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

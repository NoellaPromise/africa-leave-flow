
import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from './SidebarProvider';
import { cn } from '@/lib/utils';
import { LeaveDataProvider } from '@/context/LeaveDataContext';

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOpen } = useSidebar();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-light"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <LeaveDataProvider>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div 
          className={cn(
            "flex flex-col flex-1 transition-all duration-300",
            isOpen ? "ml-64" : "ml-16"
          )}
        >
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </LeaveDataProvider>
  );
};

export default Layout;

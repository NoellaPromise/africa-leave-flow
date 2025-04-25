import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarProvider';
import { useAuth } from '@/context/AuthContext';
import { Calendar, FileText, Home, Users, Settings, Clock, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
  const { isOpen } = useSidebar();
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        'hover:bg-teal-light/10 hover:text-teal-medium',
        isActive 
          ? 'bg-teal-light/15 text-teal-medium font-medium' 
          : 'text-gray-700 dark:text-gray-300'
      )}
    >
      <div className="text-inherit">{icon}</div>
      {isOpen && <span>{label}</span>}
    </NavLink>
  );
};

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <aside
      className={cn(
        'h-screen fixed top-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {isOpen ? (
          <h1 className="text-xl font-bold text-teal-medium">
            Africa HR
          </h1>
        ) : (
          <span className="text-xl font-bold text-teal-medium">AHR</span>
        )}
      </div>
      
      <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
        <SidebarLink to="/dashboard/leave-application" icon={<FileText size={20} />} label="Apply for Leave" />
        <SidebarLink to="/dashboard/leave-history" icon={<Clock size={20} />} label="Leave History" />
        <SidebarLink to="/dashboard/team-calendar" icon={<Calendar size={20} />} label="Team Calendar" />
        
        {(user.role === 'manager' || user.role === 'admin') && (
          <SidebarLink to="/dashboard/leave-approvals" icon={<List size={20} />} label="Approvals" />
        )}
        
        {user.role === 'admin' && (
          <SidebarLink to="/dashboard/admin" icon={<Settings size={20} />} label="Admin Panel" />
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.role}</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size={isOpen ? "default" : "icon"} 
          onClick={logout}
          className="w-full"
        >
          {isOpen ? 'Logout' : '👋'}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

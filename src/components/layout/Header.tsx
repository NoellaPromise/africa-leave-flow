
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarProvider';
import { useAuth } from '@/context/AuthContext';
import { Menu, Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { toggle } = useSidebar();
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <header className="h-16 w-full flex items-center justify-between px-4 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggle} className="mr-4">
          <Menu size={20} />
        </Button>
        <h1 className="text-lg font-semibold hidden sm:block">Leave Management System</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col">
                <p className="font-medium">Leave request approved</p>
                <p className="text-sm text-gray-500">Your leave request for Apr 25-30 has been approved</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <p className="font-medium">New leave policies</p>
                <p className="text-sm text-gray-500">HR has updated the leave policies. Please review them.</p>
                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden sm:inline-block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

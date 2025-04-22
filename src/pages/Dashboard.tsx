
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLeaveData } from '@/context/LeaveDataContext';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Calendar as CalendarIcon, FileText, Clock, Check, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Helper function to safely format dates
const formatDate = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return isValid(dateObj) ? format(dateObj, 'MMM d, yyyy') : 'Invalid date';
};

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserLeaveBalance, getUserLeaveApplications, getPublicHolidays } = useLeaveData();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const leaveBalance = getUserLeaveBalance(user.id);
  const applications = getUserLeaveApplications(user.id);
  const publicHolidays = getPublicHolidays();
  
  // Get the three most recent applications
  const recentApplications = [...applications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);
  
  // Calculate stats
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;
  
  // Prepare data for pie chart
  const annualLeaveBalance = leaveBalance?.annual || 0;
  const totalAnnualLeave = 20; // Default total days
  const usedAnnualLeave = totalAnnualLeave - annualLeaveBalance;
  
  const pieData = [
    { name: 'Available', value: annualLeaveBalance },
    { name: 'Used', value: usedAnnualLeave }
  ];
  
  const COLORS = ['#8884d8', '#82ca9d'];
  
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const isPublicHoliday = (date: Date | undefined) => {
    if (!date) return false;
    
    return publicHolidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return isValid(holidayDate) && holidayDate.getDate() === date.getDate() && 
             holidayDate.getMonth() === date.getMonth() &&
             holidayDate.getFullYear() === date.getFullYear();
    });
  };
  
  const getHolidayName = (date: Date | undefined) => {
    if (!date) return null;
    
    const holiday = publicHolidays.find(h => {
      const holidayDate = new Date(h.date);
      return isValid(holidayDate) && holidayDate.getDate() === date.getDate() && 
             holidayDate.getMonth() === date.getMonth() &&
             holidayDate.getFullYear() === date.getFullYear();
    });
    return holiday ? holiday.name : null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <Button 
          onClick={() => navigate('/leave-application')}
          className="bg-purple-light hover:bg-purple-dark"
        >
          Apply for Leave
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leave Balance</CardTitle>
            <CardDescription>Annual leave available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-500">
                You have <span className="font-bold text-purple-light">{leaveBalance?.annual || 0} days</span> of annual leave remaining
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>Upcoming holidays and events</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                  className="pointer-events-auto"
                  modifiers={{
                    holiday: (date) => isPublicHoliday(date),
                  }}
                  modifiersStyles={{
                    holiday: { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                  }}
                />
              </PopoverContent>
            </Popover>
            
            {date && isPublicHoliday(date) && (
              <div className="mt-2 p-2 bg-red-50 rounded-md">
                <p className="text-sm text-red-700 font-medium">Public Holiday</p>
                <p className="text-sm text-red-600">{getHolidayName(date)}</p>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Upcoming Holidays</h4>
              <div className="space-y-2">
                {publicHolidays
                  .filter(holiday => {
                    const holidayDate = new Date(holiday.date);
                    return isValid(holidayDate) && holidayDate >= new Date();
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return isValid(dateA) && isValid(dateB) ? 
                      dateA.getTime() - dateB.getTime() : 0;
                  })
                  .slice(0, 3)
                  .map((holiday, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{holiday.name}</span>
                      <Badge variant="outline">
                        {isValid(new Date(holiday.date)) ? 
                          format(new Date(holiday.date), 'MMM d') : 'Invalid date'}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leave Applications</CardTitle>
            <CardDescription>Status of your requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 p-3 rounded-md text-center">
                <p className="text-blue-700 text-sm mb-1">Pending</p>
                <p className="text-2xl font-bold text-blue-800">{pendingCount}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-green-700 text-sm mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-800">{approvedCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-md text-center">
                <p className="text-red-700 text-sm mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
              </div>
            </div>
            
            <h4 className="text-sm font-medium mb-2">Recent Applications</h4>
            <div className="space-y-2">
              {recentApplications.length > 0 ? (
                recentApplications.map((app, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {app.status === 'pending' && <Clock className="text-blue-500 h-5 w-5" />}
                        {app.status === 'approved' && <Check className="text-green-500 h-5 w-5" />}
                        {app.status === 'rejected' && <X className="text-red-500 h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{app.leaveType} Leave</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(app.startDate)} - {formatDate(app.endDate)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        app.status === 'pending' && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                        app.status === 'approved' && "bg-green-100 text-green-800 hover:bg-green-100",
                        app.status === 'rejected' && "bg-red-100 text-red-800 hover:bg-red-100",
                      )}
                      variant="outline"
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent applications</p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/leave-history')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View All Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

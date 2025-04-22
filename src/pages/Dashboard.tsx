
import { useAuth } from '@/context/AuthContext';
import { useLeaveData, LeaveType } from '@/context/LeaveDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, FileText, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const LeaveBalanceCard = () => {
  const { user } = useAuth();
  const { getUserLeaveBalance } = useLeaveData();
  
  if (!user) return null;
  
  const balance = getUserLeaveBalance(user.id);
  if (!balance) return null;
  
  const leaveTypes: { type: keyof typeof balance, label: string, color: string }[] = [
    { type: 'annual', label: 'Annual Leave', color: 'bg-blue-500' },
    { type: 'sick', label: 'Sick Leave', color: 'bg-red-500' },
    { type: 'compassionate', label: 'Compassionate', color: 'bg-purple-500' },
    { type: 'study', label: 'Study Leave', color: 'bg-green-500' },
  ];
  
  // For maternity/paternity, show only the relevant one based on demo data
  const parentalLeaveType = user.id === '2' ? 
    { type: 'maternity' as const, label: 'Maternity Leave', color: 'bg-pink-500' } : 
    { type: 'paternity' as const, label: 'Paternity Leave', color: 'bg-indigo-500' };
  
  leaveTypes.push(parentalLeaveType);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock size={18} />
          Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaveTypes.map((leaveType) => (
            <div key={leaveType.type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{leaveType.label}</span>
                <span className="font-medium">{balance[leaveType.type]} days</span>
              </div>
              <Progress value={(balance[leaveType.type] / 20) * 100} className={leaveType.color} />
            </div>
          ))}
          
          {balance.carryOver > 0 && (
            <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-2 rounded-md dark:bg-yellow-950 dark:text-gray-300">
              You have {balance.carryOver} days carried over from last year.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingLeavesCard = () => {
  const { leaveApplications } = useLeaveData();
  const today = new Date();
  const nextMonth = addDays(today, 30);
  
  const upcomingLeaves = leaveApplications
    .filter(leave => 
      leave.status === 'approved' && 
      (isAfter(leave.startDate, today) || isAfter(leave.endDate, today)) &&
      isBefore(leave.startDate, nextMonth)
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar size={18} />
          Upcoming Team Leaves
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingLeaves.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming leaves in the next 30 days
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{leave.employeeName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{leave.leaveType} Leave</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  <span className="text-xs">Approved</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Link to="/team-calendar">
            <Button variant="outline" size="sm" className="w-full">
              View Full Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const HolidaysCard = () => {
  const { holidays } = useLeaveData();
  const today = new Date();
  const nextSixMonths = addDays(today, 180);
  
  const upcomingHolidays = holidays
    .filter(holiday => 
      isAfter(holiday.date, today) && 
      isBefore(holiday.date, nextSixMonths)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar size={18} />
          Upcoming Holidays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingHolidays.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming holidays in the next 6 months
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{holiday.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(holiday.date, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center">
                  {holiday.isNational && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      National
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LeaveStatusCard = () => {
  const { user } = useAuth();
  const { getUserLeaveApplications } = useLeaveData();
  
  if (!user) return null;
  
  const applications = getUserLeaveApplications(user.id);
  
  const pending = applications.filter(app => app.status === 'pending').length;
  const approved = applications.filter(app => app.status === 'approved').length;
  const rejected = applications.filter(app => app.status === 'rejected').length;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText size={18} />
          Your Leave Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-md p-3 text-center dark:bg-orange-950">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pending}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-green-50 rounded-md p-3 text-center dark:bg-green-950">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approved}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-red-50 rounded-md p-3 text-center dark:bg-red-950">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejected}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Rejected</p>
          </div>
        </div>
        
        <div className="mt-4">
          <Link to="/leave-history">
            <Button variant="outline" size="sm" className="w-full">
              View Leave History
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const PendingApprovalsCard = () => {
  const { user } = useAuth();
  const { getPendingApprovals } = useLeaveData();
  
  if (!user || user.role === 'staff') return null;
  
  const pendingApprovals = getPendingApprovals(user.id);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText size={18} />
          Pending Approvals
        </CardTitle>
        <CardDescription>
          Requests waiting for your approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No pending approvals
          </p>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{approval.employeeName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(approval.startDate, "MMM d")} - {format(approval.endDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{approval.leaveType} Leave</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {pendingApprovals.length > 0 && (
          <div className="mt-4">
            <Link to="/leave-approvals">
              <Button variant="outline" size="sm" className="w-full">
                View All Approvals
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActionsCard = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          <Link to="/leave-application">
            <Button variant="default" size="lg" className="w-full bg-purple-light hover:bg-purple-dark">
              Apply for Leave
            </Button>
          </Link>
          <Link to="/team-calendar">
            <Button variant="outline" size="lg" className="w-full">
              View Team Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const currentDate = new Date();
  const greeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting()}, {user.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your leave management overview for {format(currentDate, 'MMMM yyyy')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LeaveStatusCard />
            <QuickActionsCard />
          </div>
          <UpcomingLeavesCard />
          <PendingApprovalsCard />
        </div>
        
        <div className="space-y-6">
          <LeaveBalanceCard />
          <HolidaysCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

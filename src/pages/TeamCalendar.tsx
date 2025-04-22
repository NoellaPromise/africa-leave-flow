import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useLeaveData } from '@/context/LeaveDataContext';
import { format, isWeekend, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DayClickEventHandler } from "react-day-picker";

type FilterType = 'all' | 'department' | 'approved';

interface CustomDayProps {
  date: Date;
  displayMonth?: Date;
  activeModifiers?: Record<string, boolean>;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: DayClickEventHandler;
  onMouseEnter?: (date: Date, event: React.MouseEvent) => void;
  onKeyDown?: (date: Date, event: React.KeyboardEvent) => void;
}

const TeamCalendar = () => {
  const { user } = useAuth();
  const { leaveApplications, getPublicHolidays } = useLeaveData();
  const [date, setDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  if (!user) return null;
  
  const allApplications = leaveApplications;
  const publicHolidays = getPublicHolidays();
  
  const filteredApplications = allApplications.filter(app => {
    if (filterType === 'all') return true;
    if (filterType === 'department') return app.department === user.department;
    if (filterType === 'approved') return app.status === 'approved';
    return true;
  });
  
  const selectedMonthApplications = filteredApplications.filter(app => {
    const startDate = new Date(app.startDate);
    const endDate = new Date(app.endDate);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return (
      (startDate <= lastDayOfMonth && startDate >= firstDayOfMonth) || 
      (endDate <= lastDayOfMonth && endDate >= firstDayOfMonth) ||
      (startDate <= firstDayOfMonth && endDate >= lastDayOfMonth)
    );
  });
  
  const applicationsByEmployee = selectedMonthApplications.reduce((acc, app) => {
    if (!acc[app.employeeId]) {
      acc[app.employeeId] = {
        id: app.employeeId,
        name: app.employeeName,
        department: app.department,
        applications: []
      };
    }
    acc[app.employeeId].applications.push(app);
    return acc;
  }, {} as Record<string, { id: string; name: string; department: string; applications: typeof selectedMonthApplications }> );
  
  const isOnLeave = (employeeId: string, date: Date) => {
    return selectedMonthApplications.some(app => 
      app.employeeId === employeeId && 
      app.status === 'approved' &&
      new Date(app.startDate) <= date && 
      new Date(app.endDate) >= date
    );
  };
  
  const getLeaveType = (employeeId: string, date: Date) => {
    const leave = selectedMonthApplications.find(app => 
      app.employeeId === employeeId && 
      app.status === 'approved' &&
      new Date(app.startDate) <= date && 
      new Date(app.endDate) >= date
    );
    return leave ? leave.leaveType : null;
  };
  
  const renderLegend = () => (
    <div className="flex flex-wrap gap-3 mt-3">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-purple-light"></div>
        <span className="text-xs">Annual Leave</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs">Sick Leave</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="text-xs">Other Leave</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs">Public Holiday</span>
      </div>
    </div>
  );
  
  const isPublicHoliday = (date: Date) => {
    return publicHolidays.some(holiday => 
      isSameDay(new Date(holiday.date), date)
    );
  };
  
  const getHolidayName = (date: Date) => {
    const holiday = publicHolidays.find(h => 
      isSameDay(new Date(h.date), date)
    );
    return holiday ? holiday.name : null;
  };
  
  const renderDay = (props: CustomDayProps) => {
    const { date } = props;
    
    if (!date) return null;

    const isWeekendDay = isWeekend(date);
    const isHoliday = isPublicHoliday(date);
    
    const employeesOnLeave = Object.values(applicationsByEmployee)
      .filter(employee => isOnLeave(employee.id, date))
      .map(employee => ({
        id: employee.id,
        name: employee.name,
        leaveType: getLeaveType(employee.id, date) || 'unknown'
      }));
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            {...props}
            className={cn(
              props.className,
              isWeekendDay ? 'bg-gray-50' : '',
              isHoliday ? 'bg-red-100' : '',
              employeesOnLeave.length > 0 ? 'border-2 border-purple-light rounded-md' : ''
            )}
          >
            <div className="relative">
              {props.children}
              {employeesOnLeave.length > 0 && (
                <div className="absolute bottom-0 inset-x-0 flex justify-center">
                  <Badge variant="outline" className="text-[0.6rem] px-1 py-0">
                    {employeesOnLeave.length}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 pointer-events-auto">
          <div className="space-y-2">
            <div className="font-medium">{format(date, 'MMMM dd, yyyy')}</div>
            
            {isHoliday && (
              <div className="bg-red-50 p-2 rounded-md">
                <div className="text-sm font-medium text-red-800">
                  Public Holiday: {getHolidayName(date)}
                </div>
              </div>
            )}
            
            {employeesOnLeave.length > 0 ? (
              <div className="space-y-1">
                <div className="text-sm font-medium">Team members on leave:</div>
                {employeesOnLeave.map((employee, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1 border-b">
                    <span>{employee.name}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        employee.leaveType === 'annual' && 'bg-purple-50 text-purple-800',
                        employee.leaveType === 'sick' && 'bg-blue-50 text-blue-800',
                        !['annual', 'sick'].includes(employee.leaveType) && 'bg-yellow-50 text-yellow-800'
                      )}
                    >
                      {employee.leaveType}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No team members on leave</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Calendar</h1>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leaves</SelectItem>
              <SelectItem value="department">My Department</SelectItem>
              <SelectItem value="approved">Approved Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Tabs defaultValue="calendar" className="w-[200px]" onValueChange={(value) => setView(value as 'calendar' | 'list')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {view === 'calendar' ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Leave Schedule</CardTitle>
            <CardDescription>
              View team leave calendar and plan accordingly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border pointer-events-auto"
              components={{
                Day: renderDay
              }}
            />
            {renderLegend()}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Leave Schedule</CardTitle>
            <CardDescription>
              List view of all leaves for {format(date, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMonthApplications.length > 0 ? (
                  selectedMonthApplications.map((app, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {app.employeeName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{app.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{app.department}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            app.leaveType === 'annual' && 'bg-purple-50 text-purple-800',
                            app.leaveType === 'sick' && 'bg-blue-50 text-blue-800',
                            !['annual', 'sick'].includes(app.leaveType) && 'bg-yellow-50 text-yellow-800'
                          )}
                        >
                          {app.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{format(new Date(app.startDate), 'MMM d')}</span>
                          <span>-</span>
                          <span>{format(new Date(app.endDate), 'MMM d')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            app.status === 'pending' && 'bg-yellow-50 text-yellow-800',
                            app.status === 'approved' && 'bg-green-50 text-green-800',
                            app.status === 'rejected' && 'bg-red-50 text-red-800'
                          )}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No leave applications found for the selected criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setDate(new Date())}
              >
                <CalendarIcon className="h-4 w-4" />
                Reset to Current Month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamCalendar;

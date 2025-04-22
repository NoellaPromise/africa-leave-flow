
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLeaveData } from '@/context/LeaveDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  addMonths, 
  format, 
  isSameDay, 
  isWithinInterval, 
  parseISO, 
  startOfMonth, 
  endOfMonth 
} from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, List, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TeamCalendar = () => {
  const { user } = useAuth();
  const { leaveApplications, holidays } = useLeaveData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [department, setDepartment] = useState<string>('all');
  
  if (!user) return null;
  
  // Filter approved leaves
  const approvedLeaves = leaveApplications.filter(leave => 
    leave.status === 'approved' && 
    (department === 'all' || leave.department === department)
  );
  
  // Get leaves and holidays for the selected month
  const monthStart = selectedMonth ? startOfMonth(selectedMonth) : startOfMonth(new Date());
  const monthEnd = selectedMonth ? endOfMonth(selectedMonth) : endOfMonth(new Date());

  const leavesInMonth = approvedLeaves.filter(leave => 
    isWithinInterval(leave.startDate, { start: monthStart, end: monthEnd }) || 
    isWithinInterval(leave.endDate, { start: monthStart, end: monthEnd })
  );
  
  const holidaysInMonth = holidays.filter(holiday => 
    isWithinInterval(holiday.date, { start: monthStart, end: monthEnd })
  );
  
  // Get leaves and holidays for the selected date
  const leavesOnDate = selectedDate ? 
    approvedLeaves.filter(leave => 
      isWithinInterval(selectedDate, { start: leave.startDate, end: leave.endDate })
    ) : [];
  
  const holidayOnDate = selectedDate ? 
    holidays.find(holiday => isSameDay(holiday.date, selectedDate)) : undefined;
  
  const dayHasEvent = (day: Date) => {
    return approvedLeaves.some(leave => 
      isWithinInterval(day, { start: leave.startDate, end: leave.endDate })
    ) || holidays.some(holiday => isSameDay(holiday.date, day));
  };
  
  const getLeaveColor = (leaveType: string) => {
    switch (leaveType.toLowerCase()) {
      case 'annual':
        return 'bg-blue-500';
      case 'sick':
        return 'bg-red-500';
      case 'maternity':
      case 'paternity':
        return 'bg-pink-500';
      case 'compassionate':
        return 'bg-purple-500';
      case 'unpaid':
        return 'bg-gray-500';
      case 'study':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View upcoming leaves and holidays
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="HR">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex rounded-md overflow-hidden">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('calendar')}
              className={cn(
                "rounded-r-none",
                view === 'calendar' ? 'bg-purple-light hover:bg-purple-dark' : ''
              )}
            >
              <CalendarIcon size={18} />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('list')}
              className={cn(
                "rounded-l-none",
                view === 'list' ? 'bg-purple-light hover:bg-purple-dark' : ''
              )}
            >
              <List size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Team Leave Calendar</CardTitle>
            <CardDescription>
              View when team members are on leave
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === 'calendar' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                className="rounded-md border pointer-events-auto"
                modifiersClassNames={{
                  selected: 'bg-purple-light text-white hover:bg-purple-light hover:text-white',
                }}
                modifiers={{
                  hasEvent: (day) => dayHasEvent(day),
                }}
                components={{
                  DayContent: ({ day }) => {
                    const hasHoliday = holidays.some(holiday => isSameDay(holiday.date, day));
                    const hasLeave = approvedLeaves.some(leave => 
                      isWithinInterval(day, { start: leave.startDate, end: leave.endDate })
                    );
                    
                    return (
                      <div className="relative h-full w-full p-2">
                        <div className="text-center">{format(day, 'd')}</div>
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                          {hasHoliday && (
                            <div className="h-1 w-1 rounded-full bg-red-500"></div>
                          )}
                          {hasLeave && (
                            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                    );
                  },
                }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMonth(addMonths(selectedMonth || new Date(), -1))}
                  >
                    Previous Month
                  </Button>
                  <h3 className="text-xl font-semibold">
                    {format(selectedMonth || new Date(), 'MMMM yyyy')}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMonth(addMonths(selectedMonth || new Date(), 1))}
                  >
                    Next Month
                  </Button>
                </div>
                
                <Tabs defaultValue="leaves">
                  <TabsList className="mb-4">
                    <TabsTrigger value="leaves">Team Leaves</TabsTrigger>
                    <TabsTrigger value="holidays">Holidays</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="leaves">
                    {leavesInMonth.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No leaves scheduled for this month
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leavesInMonth.map((leave) => (
                          <div key={leave.id} className="flex items-start justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                                <AvatarFallback>{leave.employeeName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.employeeName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span 
                                    className={cn(
                                      "inline-block w-2 h-2 rounded-full mr-1",
                                      getLeaveColor(leave.leaveType)
                                    )}
                                  ></span>
                                  <span className="text-xs capitalize">{leave.leaveType} Leave</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="holidays">
                    {holidaysInMonth.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No holidays scheduled for this month
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {holidaysInMonth.map((holiday) => (
                          <div key={holiday.id} className="flex items-start justify-between border-b pb-3">
                            <div>
                              <p className="font-medium">{holiday.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(holiday.date, "EEEE, MMMM d, yyyy")}
                              </p>
                            </div>
                            {holiday.isNational && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                National
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              Details for the selected date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                Select a date to view details
              </div>
            ) : (
              <div className="space-y-6">
                {holidayOnDate && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-600 flex items-center gap-2">
                      <CalendarIcon size={16} />
                      Holiday
                    </h3>
                    <div className="bg-red-50 p-3 rounded-md dark:bg-red-950">
                      <p className="font-medium">{holidayOnDate.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {holidayOnDate.isNational ? 'National Holiday' : 'Company Holiday'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CalendarIcon size={16} />
                    Team Members on Leave
                  </h3>
                  
                  {leavesOnDate.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No team members on leave on this date
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {leavesOnDate.map((leave) => (
                        <div key={leave.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                            <AvatarFallback>{leave.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leave.employeeName}</p>
                            <div className="flex items-center">
                              <span 
                                className={cn(
                                  "inline-block w-2 h-2 rounded-full mr-1",
                                  getLeaveColor(leave.leaveType)
                                )}
                              ></span>
                              <span className="text-xs capitalize">{leave.leaveType} Leave</span>
                            </div>
                            <p className="text-xs text-gray-500">{leave.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Legend</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-xs">Annual Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-xs">Sick Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-pink-500"></span>
                      <span className="text-xs">Parental Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                      <span className="text-xs">Compassionate</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamCalendar;

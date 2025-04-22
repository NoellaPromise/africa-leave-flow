
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Download, Upload, Users, FileText, Calendar as CalendarIcon2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useLeaveData } from '@/context/LeaveDataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminPanel = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage leave types, policies, and generate reports
        </p>
      </div>
      
      <Tabs defaultValue="reports">
        <TabsList className="mb-6">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        
        <TabsContent value="leave-types">
          <LeaveTypesTab />
        </TabsContent>
        
        <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ReportsTab = () => {
  const [reportType, setReportType] = useState('employee');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [department, setDepartment] = useState('all');
  
  const handleGenerateReport = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    toast.success('Report generated successfully!');
    // In a real app, this would generate and download a report
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Create reports based on different criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">By Employee</SelectItem>
                <SelectItem value="department">By Department</SelectItem>
                <SelectItem value="leave-type">By Leave Type</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className={cn("pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleGenerateReport}
              className="w-full bg-purple-light hover:bg-purple-dark"
            >
              <Download size={16} className="mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>
              Common reports for quick access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Users size={16} className="mr-2" />
              Employee Leave Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText size={16} className="mr-2" />
              Leave Balance Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon2 size={16} className="mr-2" />
              Monthly Leave Overview
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download size={16} className="mr-2" />
              Export All Leave Data
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import employee data or leave information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full justify-start"
              >
                <Upload size={16} className="mr-2" />
                Select File
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: CSV, Excel
            </p>
            <Button variant="outline" className="w-full justify-start">
              <Upload size={16} className="mr-2" />
              Import Employee Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LeaveTypesTab = () => {
  const leaveTypes = [
    { id: 'annual', name: 'Annual Leave', days: 20, accrual: 1.67, carryForward: 5, requiresDocument: false },
    { id: 'sick', name: 'Sick Leave', days: 10, accrual: 0.83, carryForward: 0, requiresDocument: true },
    { id: 'compassionate', name: 'Compassionate Leave', days: 5, accrual: 0, carryForward: 0, requiresDocument: false },
    { id: 'maternity', name: 'Maternity Leave', days: 90, accrual: 0, carryForward: 0, requiresDocument: true },
    { id: 'paternity', name: 'Paternity Leave', days: 10, accrual: 0, carryForward: 0, requiresDocument: false },
    { id: 'study', name: 'Study Leave', days: 10, accrual: 0, carryForward: 0, requiresDocument: true },
    { id: 'unpaid', name: 'Unpaid Leave', days: 0, accrual: 0, carryForward: 0, requiresDocument: false },
  ];
  
  const [editingType, setEditingType] = useState<string | null>(null);
  
  const handleEdit = (id: string) => {
    setEditingType(id);
    toast.info(`Editing ${id} - This would open an edit form in a real app`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Leave Types</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage the different types of leave available to employees
          </p>
        </div>
        <Button className="bg-purple-light hover:bg-purple-dark">
          Add Leave Type
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 font-medium">Leave Type</th>
                  <th className="py-4 px-6 font-medium">Default Days</th>
                  <th className="py-4 px-6 font-medium">Monthly Accrual</th>
                  <th className="py-4 px-6 font-medium">Carry Forward</th>
                  <th className="py-4 px-6 font-medium">Requires Document</th>
                  <th className="py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((type) => (
                  <tr key={type.id} className="border-b">
                    <td className="py-4 px-6 font-medium">{type.name}</td>
                    <td className="py-4 px-6">{type.days} days</td>
                    <td className="py-4 px-6">{type.accrual} days/month</td>
                    <td className="py-4 px-6">{type.carryForward} days max</td>
                    <td className="py-4 px-6">
                      {type.requiresDocument ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(type.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Accrual Rules</CardTitle>
            <CardDescription>
              Configure how leave days accrue over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accrual-frequency">Accrual Frequency</Label>
              <Select defaultValue="monthly">
                <SelectTrigger id="accrual-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prorate">Prorate for New Joiners</Label>
                <Switch id="prorate" defaultChecked />
              </div>
              <p className="text-sm text-gray-500">
                Automatically adjust leave balance for employees who join mid-year
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="expire">Expire Unused Leave</Label>
                <Switch id="expire" defaultChecked />
              </div>
              <p className="text-sm text-gray-500">
                Unused leave days exceeding carry forward limit will expire at year end
              </p>
            </div>
            
            <Button variant="outline" className="mt-2 w-full">
              Save Accrual Settings
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Policy Configuration</CardTitle>
            <CardDescription>
              Set organization-wide leave policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="early-request">Require Early Request</Label>
                <Switch id="early-request" defaultChecked />
              </div>
              <p className="text-sm text-gray-500">
                Leave requests must be submitted at least 3 days in advance
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="concurrent-leave">Limit Concurrent Leave</Label>
                <Switch id="concurrent-leave" defaultChecked />
              </div>
              <p className="text-sm text-gray-500">
                Limit the number of employees on leave at the same time
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-consecutive">Maximum Consecutive Days</Label>
              <Input 
                id="max-consecutive" 
                type="number" 
                defaultValue="15" 
                min="1" 
                max="90"
              />
              <p className="text-sm text-gray-500">
                Maximum number of consecutive days for annual leave
              </p>
            </div>
            
            <Button variant="outline" className="mt-2 w-full">
              Save Policy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const HolidaysTab = () => {
  const { holidays } = useLeaveData();
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState<Date | undefined>(undefined);
  const [isNational, setIsNational] = useState(true);
  
  const handleAddHoliday = () => {
    if (!newHolidayName || !newHolidayDate) {
      toast.error('Please provide both name and date for the holiday');
      return;
    }
    
    toast.success(`Holiday "${newHolidayName}" added successfully!`);
    // In a real app, this would add the holiday to the database
    
    // Reset form
    setNewHolidayName('');
    setNewHolidayDate(undefined);
    setIsNational(true);
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Add Holiday</CardTitle>
          <CardDescription>
            Add new public or company holidays
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holiday-name">Holiday Name</Label>
            <Input
              id="holiday-name"
              placeholder="e.g. New Year's Day"
              value={newHolidayName}
              onChange={(e) => setNewHolidayName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="holiday-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newHolidayDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newHolidayDate ? (
                    format(newHolidayDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newHolidayDate}
                  onSelect={setNewHolidayDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-national"
              checked={isNational}
              onCheckedChange={setIsNational}
            />
            <Label htmlFor="is-national">National Holiday</Label>
          </div>
          
          <Button 
            onClick={handleAddHoliday}
            className="w-full mt-2 bg-purple-light hover:bg-purple-dark"
          >
            Add Holiday
          </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Holiday Calendar</CardTitle>
          <CardDescription>
            View and manage holidays for the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {holidays
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((holiday) => (
                <div key={holiday.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(holiday.date, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {holiday.isNational && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        National
                      </span>
                    )}
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            
            {holidays.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No holidays configured yet
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <Download size={16} className="mr-2" />
              Export Holiday Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsTab = () => {
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure when and how notifications are sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <p className="text-sm text-gray-500">
              Send email notifications for leave requests and approvals
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-notifications">Reminder Notifications</Label>
              <Switch id="reminder-notifications" defaultChecked />
            </div>
            <p className="text-sm text-gray-500">
              Send reminders for pending approvals
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger id="reminder-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSaveSettings}
            className="w-full mt-2 bg-purple-light hover:bg-purple-dark"
          >
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>
              Configure approval chain and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-levels">Approval Levels</Label>
              <Select defaultValue="single">
                <SelectTrigger id="approval-levels">
                  <SelectValue placeholder="Select approval levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Level</SelectItem>
                  <SelectItem value="dual">Dual Level</SelectItem>
                  <SelectItem value="escalation">With Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-approval">Auto-approve Short Leaves</Label>
                <Switch id="auto-approval" defaultChecked />
              </div>
              <p className="text-sm text-gray-500">
                Automatically approve leave requests of 1 day or less
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="escalation-time">Escalation Time (hours)</Label>
              <Input 
                id="escalation-time" 
                type="number" 
                defaultValue="48" 
                min="1" 
                max="120"
              />
              <p className="text-sm text-gray-500">
                Escalate to next level if no response within this time
              </p>
            </div>
            
            <Button variant="outline" className="w-full mt-2">
              Save Workflow Settings
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure general system settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year-start">Leave Year Start Month</Label>
              <Select defaultValue="1">
                <SelectTrigger id="year-start">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">System Timezone</Label>
              <Select defaultValue="gmt+2">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmt+2">GMT+2</SelectItem>
                  <SelectItem value="gmt+3">GMT+3</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekend-days">Include Weekends in Leave</Label>
                <Switch id="weekend-days" />
              </div>
              <p className="text-sm text-gray-500">
                Count weekends when calculating leave duration
              </p>
            </div>
            
            <Button variant="outline" className="w-full mt-2">
              Save System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;

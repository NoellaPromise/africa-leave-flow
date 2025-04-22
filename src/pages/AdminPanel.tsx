import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLeaveData } from '@/context/LeaveDataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Download, Pencil, Plus, Upload, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const departmentOptions = [
  'All Departments',
  'Engineering',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Sales',
  'Legal'
];

const ApplicationsTab = () => {
  const { getAllLeaveApplications } = useLeaveData();
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchTerm, setSearchTerm] = useState('');
  
  const allApplications = getAllLeaveApplications();
  
  const filteredApplications = allApplications.filter(app => {
    const matchesDepartment = selectedDepartment === 'All Departments' || app.department === selectedDepartment;
    const matchesSearch = 
      app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDepartment && matchesSearch;
  });
  
  const handleDownloadReport = () => {
    toast.success('Report downloaded successfully');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[300px]"
          />
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline"
          onClick={handleDownloadReport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app, index) => (
              <TableRow key={index}>
                <TableCell>{app.employeeName}</TableCell>
                <TableCell>{app.department}</TableCell>
                <TableCell>{app.leaveType}</TableCell>
                <TableCell>
                  {format(new Date(app.startDate), 'MMM d, yyyy')} - {format(new Date(app.endDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {app.isHalfDay ? '0.5 day' : `${Math.round((new Date(app.endDate).getTime() - new Date(app.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`}
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
                <TableCell>
                  {isValid(new Date(app.appliedDate)) 
                    ? format(new Date(app.appliedDate), 'MMM d, yyyy')
                    : format(new Date(app.createdAt), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No leave applications found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const EmployeesTab = () => {
  const { getTeamMembers } = useLeaveData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const employees = getTeamMembers();
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[300px]"
        />
        
        <Button className="flex items-center gap-2 bg-purple-light hover:bg-purple-dark">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Annual Leave Balance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.position || emp.role}</TableCell>
                <TableCell>{emp.leaveBalance?.annual || 0} days</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No employees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const SettingsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 0, 31)
  });
  const [autoApproval, setAutoApproval] = useState(false);
  const [notifyManagers, setNotifyManagers] = useState(true);
  
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Leave Balance Reset</h3>
        <div>
          <Label htmlFor="reset-date">Annual reset date range</Label>
          <div className="flex mt-1.5 w-full max-w-sm items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="reset-date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: new Date(2025, 0, 1), to: new Date(2025, 0, 31) })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Approval Settings</h3>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="auto-approval" className="flex-1">Enable automatic approval for annual leave</Label>
          <Switch
            id="auto-approval"
            checked={autoApproval}
            onCheckedChange={setAutoApproval}
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="notify-managers" className="flex-1">Notify managers about new leave applications</Label>
          <Switch
            id="notify-managers"
            checked={notifyManagers}
            onCheckedChange={setNotifyManagers}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import/Export</h3>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export All Data
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={handleSaveSettings}
        className="bg-purple-light hover:bg-purple-dark"
      >
        Save Settings
      </Button>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Leave Applications</CardTitle>
              <CardDescription>
                Manage all leave applications across the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsTab />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage employee profiles and leave balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeesTab />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure leave policies and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

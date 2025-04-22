
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLeaveData, LeaveType } from '@/context/LeaveDataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const leaveTypes = [
  { id: 'annual', label: 'Annual Leave', requiresDoc: false, requiresReason: false },
  { id: 'sick', label: 'Sick Leave', requiresDoc: true, requiresReason: true },
  { id: 'compassionate', label: 'Compassionate Leave', requiresDoc: false, requiresReason: true },
  { id: 'maternity', label: 'Maternity Leave', requiresDoc: true, requiresReason: false },
  { id: 'paternity', label: 'Paternity Leave', requiresDoc: false, requiresReason: false },
  { id: 'study', label: 'Study Leave', requiresDoc: true, requiresReason: true },
  { id: 'unpaid', label: 'Unpaid Leave', requiresDoc: false, requiresReason: true },
];

const LeaveApplication = () => {
  const { user } = useAuth();
  const { createLeaveApplication, getUserLeaveBalance, calculateLeaveDuration } = useLeaveData();
  const navigate = useNavigate();
  
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  
  if (!user) return null;
  
  const selectedLeaveTypeConfig = leaveTypes.find(lt => lt.id === leaveType);
  const balance = getUserLeaveBalance(user.id);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, we would upload these files to a server
    // For demo, we'll just store the file names
    const newDocuments = Array.from(files).map(file => file.name);
    setDocuments([...documents, ...newDocuments]);
    
    // Reset the input
    e.target.value = '';
  };
  
  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (selectedLeaveTypeConfig?.requiresReason && !reason) {
      toast.error(`A reason is required for ${selectedLeaveTypeConfig.label}`);
      return;
    }
    
    if (selectedLeaveTypeConfig?.requiresDoc && documents.length === 0) {
      toast.error(`Supporting document is required for ${selectedLeaveTypeConfig.label}`);
      return;
    }
    
    const duration = calculateLeaveDuration(startDate, endDate, isHalfDay);
    
    if (leaveType === 'annual' && balance && duration > balance.annual) {
      toast.error(`You don't have enough annual leave balance. Available: ${balance.annual} days, Requested: ${duration} days`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      createLeaveApplication({
        employeeId: user.id,
        employeeName: user.name,
        leaveType,
        startDate,
        endDate,
        reason,
        isHalfDay,
        documents,
        department: user.department
      });
      
      toast.success('Leave application submitted successfully!');
      navigate('/leave-history');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Apply for Leave</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit a new leave request
        </p>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Leave Application Form</CardTitle>
          <CardDescription>
            Fill in the details to request time off
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type</Label>
              <Select
                value={leaveType}
                onValueChange={(value) => setLeaveType(value as LeaveType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {leaveType === 'annual' && balance && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available balance: <span className="font-medium">{balance.annual} days</span>
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : date < new Date())}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="half-day"
                checked={isHalfDay}
                onCheckedChange={setIsHalfDay}
              />
              <Label htmlFor="half-day">Half day leave</Label>
            </div>
            
            {startDate && endDate && !isHalfDay && (
              <div className="bg-blue-50 p-3 rounded-md dark:bg-blue-900">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Leave duration: <strong>{calculateLeaveDuration(startDate, endDate, isHalfDay)} days</strong> (excluding weekends and holidays)
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center">
                Reason
                {selectedLeaveTypeConfig?.requiresReason && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for leave (optional for some leave types)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={selectedLeaveTypeConfig?.requiresReason}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documents" className="flex items-center">
                Supporting Documents
                {selectedLeaveTypeConfig?.requiresDoc && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              
              <div className="flex items-center gap-2">
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('documents')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload Document
                </Button>
                <p className="text-sm text-gray-500">
                  {documents.length === 0 
                    ? 'No documents uploaded' 
                    : `${documents.length} document(s) uploaded`}
                </p>
              </div>
              
              {documents.length > 0 && (
                <div className="mt-2 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md dark:bg-gray-800">
                      <span className="text-sm truncate">{doc}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-light hover:bg-purple-dark"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LeaveApplication;

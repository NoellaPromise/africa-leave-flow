
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLeaveData } from '@/context/LeaveDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LeaveApprovals = () => {
  const { user } = useAuth();
  const { leaveApplications, updateLeaveStatus } = useLeaveData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [approverNotes, setApproverNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [currentTab, setCurrentTab] = useState('pending');
  
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return <Navigate to="/" />;
  }
  
  // In a real app, we would filter by the manager's department or team
  const filteredApplications = leaveApplications.filter(app => 
    (currentTab === 'pending' ? app.status === 'pending' : 
     currentTab === 'approved' ? app.status === 'approved' : 
     currentTab === 'rejected' ? app.status === 'rejected' : true) &&
    (app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     app.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
     format(app.startDate, 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAction = () => {
    if (!selectedLeave || !action) return;
    
    updateLeaveStatus(selectedLeave, action === 'approve' ? 'approved' : 'rejected', approverNotes);
    
    toast.success(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    setSelectedLeave(null);
    setApproverNotes('');
    setAction(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave Approvals</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage leave requests from your team
        </p>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Manage leave applications from your team members
              </CardDescription>
            </div>
            
            <div className="flex items-center border rounded-md pl-3 w-full sm:w-auto">
              <Search size={18} className="text-gray-500" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search by name, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={currentTab}>
              {filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No leave requests found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchTerm 
                      ? "No results match your search criteria" 
                      : `There are no ${currentTab === 'all' ? '' : currentTab + ' '}leave requests to display`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 font-medium">Employee</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Duration</th>
                        <th className="py-3 px-4 font-medium">Days</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Applied On</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                                <AvatarFallback>{app.employeeName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{app.employeeName}</p>
                                <p className="text-xs text-gray-500">{app.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">{app.leaveType}</td>
                          <td className="py-3 px-4">
                            {format(app.startDate, 'MMM dd')} - {format(app.endDate, 'MMM dd, yyyy')}
                          </td>
                          <td className="py-3 px-4">{app.isHalfDay ? '0.5' : (
                            Math.ceil((app.endDate.getTime() - app.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                          )}</td>
                          <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                          <td className="py-3 px-4">{format(app.createdAt, 'MMM dd, yyyy')}</td>
                          <td className="py-3 px-4">
                            {app.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => {
                                    setSelectedLeave(app.id);
                                    setAction('approve');
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => {
                                    setSelectedLeave(app.id);
                                    setAction('reject');
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedLeave} onOpenChange={(open) => {
        if (!open) {
          setSelectedLeave(null);
          setApproverNotes('');
          setAction(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Are you sure you want to approve this leave request?'
                : 'Are you sure you want to reject this leave request?'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments"
                value={approverNotes}
                onChange={(e) => setApproverNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedLeave(null);
                setApproverNotes('');
                setAction(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant={action === 'approve' ? 'default' : 'destructive'}
              className={action === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
              onClick={handleAction}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveApprovals;

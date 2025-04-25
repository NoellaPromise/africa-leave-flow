import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LeaveHistory as LeaveHistoryType } from '@/types/leaveHistory';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const LeaveHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const { data: leaveHistory, isLoading, error } = useQuery({
    queryKey: ['leaveHistory', user?.id],
    queryFn: async () => {
      const response = await axios.get<LeaveHistoryType[]>(`${API_URL}/leaves`);
      return response.data;
    },
    enabled: !!user,
  });
  
  if (!user) return null;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-medium"></div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load leave history');
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500">Failed to load leave history</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  const filteredApplications = leaveHistory?.filter(app => 
    app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(parseISO(app.startDate), 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
  
  const handleCancelRequest = async () => {
    if (!selectedLeave) return;
    
    try {
      await axios.post(`${API_URL}/leaves/${selectedLeave}/cancel`, { reason: cancelReason });
      toast.success('Leave request cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel leave request');
    } finally {
      setSelectedLeave(null);
      setCancelReason('');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your leave requests
          </p>
        </div>
        
        <Link to="/dashboard/leave-application">
          <Button className="bg-teal-medium hover:bg-teal-dark">
            Apply for Leave
          </Button>
        </Link>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Your Leave Requests</CardTitle>
              <CardDescription>
                All your leave applications and their status
              </CardDescription>
            </div>
            
            <div className="flex items-center border rounded-md pl-3 w-full sm:w-auto">
              <Search size={18} className="text-gray-500" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No leave requests found</h3>
              <p className="text-gray-500 mt-1 text-center">
                {searchTerm 
                  ? "No results match your search criteria" 
                  : "You haven't submitted any leave requests yet"}
              </p>
              
              {!searchTerm && (
                <Link to="/dashboard/leave-application" className="mt-4">
                  <Button className="bg-teal-medium hover:bg-teal-dark">
                    Apply for Leave
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">From</th>
                    <th className="py-3 px-4 font-medium">To</th>
                    <th className="py-3 px-4 font-medium">Days</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Applied On</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b">
                      <td className="py-3 px-4 capitalize">{app.reason}</td>
                      <td className="py-3 px-4">{format(parseISO(app.startDate), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-4">{format(parseISO(app.endDate), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-4">{app.isHalfDay ? '0.5' : (
                        Math.ceil((parseISO(app.endDate).getTime() - parseISO(app.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                      )}</td>
                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                      <td className="py-3 px-4">{format(parseISO(app.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {app.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setSelectedLeave(app.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download size={14} className="mr-1" />
                            Export
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedLeave} onOpenChange={(open) => {
        if (!open) {
          setSelectedLeave(null);
          setCancelReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for cancellation (optional)
              </label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedLeave(null);
                setCancelReason('');
              }}
            >
              Keep Request
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelRequest}
            >
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveHistory;

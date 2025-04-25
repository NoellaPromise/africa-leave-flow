
export interface LeaveHistory {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  duration: number;
  halfDay: boolean;
  reason: string;
  status: string;
  approverComments: string;
  documentId: number;
  createdAt: string;
  updatedAt: string;
  managerId: number;
}

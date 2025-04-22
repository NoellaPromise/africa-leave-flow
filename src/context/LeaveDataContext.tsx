import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addMonths, differenceInCalendarDays, addYears, isAfter, isBefore, startOfDay } from 'date-fns';

export type LeaveType = 
  | 'annual' 
  | 'sick' 
  | 'maternity' 
  | 'paternity' 
  | 'unpaid' 
  | 'compassionate'
  | 'study';

export type LeaveStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected'
  | 'cancelled';

export type LeaveApplication = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  isHalfDay: boolean;
  documents?: string[];
  approverNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  appliedDate: Date;
  approvedBy?: string;
  department: string;
};

export type LeaveBalance = {
  userId: string;
  annual: number;
  sick: number;
  compassionate: number;
  maternity: number;
  paternity: number;
  study: number;
  unpaid: number;
  carryOver: number;
  total?: number;
};

export type Holiday = {
  id: string;
  name: string;
  date: Date;
  isNational: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  position: string;
  leaveBalance: { annual: number };
  avatar?: string;
};

interface LeaveDataContextType {
  leaveApplications: LeaveApplication[];
  leaveBalances: LeaveBalance[];
  holidays: Holiday[];
  createLeaveApplication: (application: Omit<LeaveApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'appliedDate'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, approverNotes?: string) => void;
  cancelLeaveApplication: (id: string) => void;
  getUserLeaveBalance: (userId: string) => LeaveBalance | undefined;
  getUserLeaveApplications: (userId: string) => LeaveApplication[];
  getPendingApprovals: (managerId: string) => LeaveApplication[];
  calculateLeaveDuration: (startDate: Date, endDate: Date, isHalfDay: boolean) => number;
  getPublicHolidays: () => Holiday[];
  getAllLeaveApplications: () => LeaveApplication[];
  getTeamMembers: () => TeamMember[];
}

const initialLeaveApplications: LeaveApplication[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    leaveType: 'annual',
    startDate: new Date(2025, 4, 25),
    endDate: new Date(2025, 4, 30),
    reason: 'Family vacation',
    status: 'approved',
    isHalfDay: false,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 16),
    appliedDate: new Date(2025, 3, 15),
    approvedBy: '2',
    department: 'Engineering'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Doe',
    leaveType: 'sick',
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 2),
    reason: 'Not feeling well',
    status: 'pending',
    isHalfDay: false,
    createdAt: new Date(2025, 4, 30),
    updatedAt: new Date(2025, 4, 30),
    appliedDate: new Date(2025, 4, 30),
    department: 'Engineering'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Jane Smith',
    leaveType: 'annual',
    startDate: new Date(2025, 5, 10),
    endDate: new Date(2025, 5, 20),
    reason: 'Summer holiday',
    status: 'pending',
    isHalfDay: false,
    createdAt: new Date(2025, 4, 25),
    updatedAt: new Date(2025, 4, 25),
    appliedDate: new Date(2025, 4, 25),
    department: 'Engineering'
  }
];

const initialLeaveBalances: LeaveBalance[] = [
  {
    userId: '1',
    annual: 18,
    sick: 10,
    compassionate: 5,
    maternity: 0,
    paternity: 10,
    study: 5,
    unpaid: 0,
    carryOver: 2
  },
  {
    userId: '2',
    annual: 15,
    sick: 10,
    compassionate: 5,
    maternity: 90,
    paternity: 0,
    study: 5,
    unpaid: 0,
    carryOver: 5
  },
  {
    userId: '3',
    annual: 20,
    sick: 10,
    compassionate: 5,
    maternity: 0,
    paternity: 10,
    study: 5, 
    unpaid: 0,
    carryOver: 0
  }
];

const initialHolidays: Holiday[] = [
  {
    id: '1',
    name: 'New Year\'s Day',
    date: new Date(2025, 0, 1),
    isNational: true
  },
  {
    id: '2',
    name: 'National Heroes Day',
    date: new Date(2025, 1, 1),
    isNational: true
  },
  {
    id: '3',
    name: 'Good Friday',
    date: new Date(2025, 3, 18),
    isNational: true
  },
  {
    id: '4',
    name: 'Easter Monday',
    date: new Date(2025, 3, 21),
    isNational: true
  },
  {
    id: '5',
    name: 'Labor Day',
    date: new Date(2025, 4, 1),
    isNational: true
  },
  {
    id: '6',
    name: 'Liberation Day',
    date: new Date(2025, 6, 4),
    isNational: true
  },
  {
    id: '7',
    name: 'Umuganura Day',
    date: new Date(2025, 7, 2),
    isNational: true
  },
  {
    id: '8',
    name: 'Independence Day',
    date: new Date(2025, 6, 1),
    isNational: true
  },
  {
    id: '9',
    name: 'Christmas Day',
    date: new Date(2025, 11, 25),
    isNational: true
  },
  {
    id: '10',
    name: 'Boxing Day',
    date: new Date(2025, 11, 26),
    isNational: true
  }
];

const initialTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@ist.com',
    department: 'Engineering',
    role: 'Developer',
    position: 'Senior Developer',
    leaveBalance: { annual: 18 }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@ist.com',
    department: 'Engineering',
    role: 'Manager',
    position: 'Team Lead',
    leaveBalance: { annual: 15 }
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@ist.com',
    department: 'HR',
    role: 'HR Specialist',
    position: 'HR Manager',
    leaveBalance: { annual: 20 }
  }
];

const LeaveDataContext = createContext<LeaveDataContextType | undefined>(undefined);

export const LeaveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(initialLeaveApplications);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(initialLeaveBalances);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  useEffect(() => {
    const savedApplications = localStorage.getItem('lms-applications');
    const savedBalances = localStorage.getItem('lms-balances');
    const savedHolidays = localStorage.getItem('lms-holidays');
    const savedTeamMembers = localStorage.getItem('lms-team-members');

    if (savedApplications) {
      const parsed = JSON.parse(savedApplications);
      setLeaveApplications(parsed.map((app: any) => ({
        ...app,
        startDate: new Date(app.startDate),
        endDate: new Date(app.endDate),
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt),
        appliedDate: new Date(app.appliedDate)
      })));
    }

    if (savedBalances) {
      setLeaveBalances(JSON.parse(savedBalances));
    }

    if (savedHolidays) {
      const parsed = JSON.parse(savedHolidays);
      setHolidays(parsed.map((holiday: any) => ({
        ...holiday,
        date: new Date(holiday.date)
      })));
    }

    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lms-applications', JSON.stringify(leaveApplications));
  }, [leaveApplications]);

  useEffect(() => {
    localStorage.setItem('lms-balances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('lms-holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('lms-team-members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const calculateLeaveDuration = (startDate: Date, endDate: Date, isHalfDay: boolean): number => {
    if (isHalfDay) return 0.5;
    
    let days = differenceInCalendarDays(endDate, startDate) + 1;
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        days -= 1;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const holidaysInRange = holidays.filter(holiday => 
      isAfter(holiday.date, startOfDay(startDate)) && 
      isBefore(holiday.date, endDate)
    );
    
    days -= holidaysInRange.length;
    
    return Math.max(0, days);
  };

  const createLeaveApplication = (application: Omit<LeaveApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'appliedDate'>) => {
    const now = new Date();
    const newApplication: LeaveApplication = {
      ...application,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      appliedDate: now
    };
    
    setLeaveApplications(prev => [...prev, newApplication]);
    
    return newApplication;
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, approverNotes?: string) => {
    setLeaveApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { 
              ...app, 
              status, 
              approverNotes: approverNotes || app.approverNotes, 
              updatedAt: new Date() 
            } 
          : app
      )
    );
  };

  const cancelLeaveApplication = (id: string) => {
    setLeaveApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, status: 'cancelled', updatedAt: new Date() } 
          : app
      )
    );
  };

  const getUserLeaveBalance = (userId: string) => {
    return leaveBalances.find(balance => balance.userId === userId);
  };

  const getUserLeaveApplications = (userId: string) => {
    return leaveApplications.filter(app => app.employeeId === userId);
  };

  const getPendingApprovals = (managerId: string) => {
    return leaveApplications.filter(app => app.status === 'pending');
  };

  const getPublicHolidays = () => {
    return holidays;
  };

  const getAllLeaveApplications = () => {
    return leaveApplications;
  };

  const getTeamMembers = () => {
    return teamMembers;
  };

  return (
    <LeaveDataContext.Provider 
      value={{
        leaveApplications,
        leaveBalances,
        holidays,
        createLeaveApplication,
        updateLeaveStatus,
        cancelLeaveApplication,
        getUserLeaveBalance,
        getUserLeaveApplications,
        getPendingApprovals,
        calculateLeaveDuration,
        getPublicHolidays,
        getAllLeaveApplications,
        getTeamMembers
      }}
    >
      {children}
    </LeaveDataContext.Provider>
  );
};

export const useLeaveData = () => {
  const context = useContext(LeaveDataContext);
  if (context === undefined) {
    throw new Error('useLeaveData must be used within a LeaveDataProvider');
  }
  return context;
};

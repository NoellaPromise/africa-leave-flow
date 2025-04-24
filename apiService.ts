// interface DataType {
//   id: number;
//   name: string;
// }

// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"; // Use environment variable or default

// export const getData = async (): Promise<DataType> => {
//   try {
//     const response = await axios.get(`${API_URL}/test`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     throw error;
//   }
// };

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Leave Application Endpoints
export const applyForLeave = async (leaveApplication) => {
    try {
        const response = await axios.post(`${API_URL}/leaves/apply`, leaveApplication);
        return response.data;
    } catch (error) {
        console.error('Error applying for leave:', error);
        throw error;
    }
};

export const getLeaveApplications = async () => {
    try {
        const response = await axios.get(`${API_URL}/leaves`);
        return response.data;
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        throw error;
    }
};

export const getLeaveApplicationById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/leaves/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching leave application:', error);
        throw error;
    }
};

export const updateLeaveApplication = async (id, leaveApplication) => {
    try {
        const response = await axios.put(`${API_URL}/leaves/${id}`, leaveApplication);
        return response.data;
    } catch (error) {
        console.error('Error updating leave application:', error);
        throw error;
    }
};

export const deleteLeaveApplication = async (id) => {
    try {
        await axios.delete(`${API_URL}/leaves/${id}`);
    } catch (error) {
        console.error('Error deleting leave application:', error);
        throw error;
    }
};

// Employee Endpoints
export const getDashboardData = async (employeeId) => {
    try {
        const response = await axios.get(`${API_URL}/employee/dashboard`, { params: { employeeId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

export const getLeaveBalance = async (employeeId) => {
    try {
        const response = await axios.get(`${API_URL}/employee/leave-balance`, { params: { employeeId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching leave balance:', error);
        throw error;
    }
};

// Admin Endpoints
export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/users`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const getLeaveTypes = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/leave-types`);
        return response.data;
    } catch (error) {
        console.error('Error fetching leave types:', error);
        throw error;
    }
};

export const createLeaveType = async (leaveType) => {
    try {
        const response = await axios.post(`${API_URL}/admin/leave-types`, leaveType);
        return response.data;
    } catch (error) {
        console.error('Error creating leave type:', error);
        throw error;
    }
};

// Manager Endpoints
export const getPendingApprovals = async () => {
    try {
        const response = await axios.get(`${API_URL}/manager/pending-approvals`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
    }
};

export const approveLeave = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/manager/approve/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error approving leave:', error);
        throw error;
    }
};

export const rejectLeave = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/manager/reject/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error rejecting leave:', error);
        throw error;
    }
};
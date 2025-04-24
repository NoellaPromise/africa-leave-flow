
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/layout/SidebarProvider";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import LeaveApplication from "./pages/LeaveApplication";
import LeaveApprovals from "./pages/LeaveApprovals";
import LeaveHistory from "./pages/LeaveHistory";
import TeamCalendar from "./pages/TeamCalendar";
import AdminPanel from "./pages/AdminPanel";
import Layout from "./components/layout/Layout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route
                  path="leave-application"
                  element={<LeaveApplication />}
                />
                <Route path="leave-approvals" element={<LeaveApprovals />} />
                <Route path="leave-history" element={<LeaveHistory />} />
                <Route path="team-calendar" element={<TeamCalendar />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Preserved Pages
import Dashboard from "./pages/Dashboard.jsx";
import Team from "./pages/Team.jsx";
import Attendance from "./pages/Attendance.jsx";
import Reports from "./pages/Reports.jsx";
import Organization from "./pages/Organization.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import Settings from "./pages/Settings.jsx";

// Leave Tracker Module
import LeaveTrackerLayout from "./pages/leave/LeaveTrackerLayout.jsx";
import MyLeave from "./pages/leave/MyLeave.jsx";
import LeaveBalance from "./pages/leave/LeaveBalance.jsx";
import ApplyLeave from "./pages/leave/ApplyLeave.jsx";
import TeamLeave from "./pages/leave/TeamLeave.jsx";
import LeaveCalendar from "./pages/leave/LeaveCalendar.jsx";

// Operations Module
import OperationsLayout from "./pages/operations/OperationsLayout.jsx";
import Employees from "./pages/operations/Employees.jsx";
import Onboarding from "./pages/operations/Onboarding.jsx";
import Offboarding from "./pages/operations/Offboarding.jsx";
import HrServices from "./pages/operations/HrServices.jsx";
import EmployeeRequests from "./pages/operations/EmployeeRequests.jsx";

// Configuration Module
import ConfigurationLayout from "./pages/configuration/ConfigurationLayout.jsx";
import GeneralConfig from "./pages/configuration/GeneralConfig.jsx";
import EmployeeConfig from "./pages/configuration/EmployeeConfig.jsx";
import AttendanceConfig from "./pages/configuration/AttendanceConfig.jsx";
import LeaveConfig from "./pages/configuration/LeaveConfig.jsx";
import WorkflowsConfig from "./pages/configuration/WorkflowsConfig.jsx";
import RolesPermissionsConfig from "./pages/configuration/RolesPermissionsConfig.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            {/* Preserved Core Navigation */}
            <Route index element={<Dashboard />} />
            <Route path="team" element={<Team />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="organization" element={<Organization />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />

            {/* 1. Leave Tracker Module */}
            <Route path="leave-tracker" element={<LeaveTrackerLayout />}>
              <Route index element={<Navigate to="my-leave" replace />} />
              <Route path="my-leave" element={<MyLeave />} />
              <Route path="balance" element={<LeaveBalance />} />
              <Route path="apply" element={<ApplyLeave />} />
              <Route path="team" element={<TeamLeave />} />
              <Route path="calendar" element={<LeaveCalendar />} />
            </Route>

            {/* 2. Operations Module */}
            <Route path="operations" element={<OperationsLayout />}>
              <Route index element={<Navigate to="employees" replace />} />
              <Route path="employees" element={<Employees />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="offboarding" element={<Offboarding />} />
              <Route path="hr-services" element={<HrServices />} />
              <Route path="employee-requests" element={<EmployeeRequests />} />
            </Route>

            {/* 3. Configuration Module */}
            <Route path="configuration" element={<ConfigurationLayout />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralConfig />} />
              <Route path="employee" element={<EmployeeConfig />} />
              <Route path="attendance" element={<AttendanceConfig />} />
              <Route path="leave" element={<LeaveConfig />} />
              <Route path="workflows" element={<WorkflowsConfig />} />
              <Route path="roles-permissions" element={<RolesPermissionsConfig />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

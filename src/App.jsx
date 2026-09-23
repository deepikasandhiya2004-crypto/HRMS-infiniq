import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Team from "./pages/Team.jsx";
import Attendance from "./pages/Attendance.jsx";
import Settings from "./pages/Settings.jsx";

// Leave Tracker
import LeaveTrackerLayout from "./pages/leave/LeaveTrackerLayout.jsx";
import MyLeave from "./pages/leave/MyLeave.jsx";
import LeaveBalance from "./pages/leave/LeaveBalance.jsx";
import ApplyLeave from "./pages/leave/ApplyLeave.jsx";
import TeamLeave from "./pages/leave/TeamLeave.jsx";
import LeaveCalendar from "./pages/leave/LeaveCalendar.jsx";

// Operations
import OperationsLayout from "./pages/operations/OperationsLayout.jsx";
import Employees from "./pages/operations/Employees.jsx";
import Onboarding from "./pages/operations/Onboarding.jsx";
import Offboarding from "./pages/operations/Offboarding.jsx";
import HrServices from "./pages/operations/HrServices.jsx";
import EmployeeRequests from "./pages/operations/EmployeeRequests.jsx";

// Configuration
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
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* Existing modules */}
              <Route index element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="settings" element={<Settings />} />

              {/* Leave Tracker */}
              <Route path="leave-tracker" element={<LeaveTrackerLayout />}>
                <Route
                  index
                  element={<Navigate to="my-leave" replace />}
                />
                <Route path="my-leave" element={<MyLeave />} />
                <Route path="balance" element={<LeaveBalance />} />
                <Route path="apply" element={<ApplyLeave />} />
                <Route path="team" element={<TeamLeave />} />
                <Route path="calendar" element={<LeaveCalendar />} />
              </Route>

              {/* Operations */}
              <Route path="operations" element={<OperationsLayout />}>
                <Route
                  index
                  element={<Navigate to="employees" replace />}
                />
                <Route path="employees" element={<Employees />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="offboarding" element={<Offboarding />} />
                <Route path="hr-services" element={<HrServices />} />
                <Route
                  path="employee-requests"
                  element={<EmployeeRequests />}
                />
              </Route>

              {/* Configuration */}
              <Route
                path="configuration"
                element={<ConfigurationLayout />}
              >
                <Route
                  index
                  element={<Navigate to="general" replace />}
                />
                <Route path="general" element={<GeneralConfig />} />
                <Route path="employee" element={<EmployeeConfig />} />
                <Route
                  path="attendance"
                  element={<AttendanceConfig />}
                />
                <Route path="leave" element={<LeaveConfig />} />
                <Route path="workflows" element={<WorkflowsConfig />} />
                <Route
                  path="roles-permissions"
                  element={<RolesPermissionsConfig />}
                />
              </Route>

              {/* Fallback */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
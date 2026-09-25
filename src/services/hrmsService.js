import api from "./api.js";

const statusLabel = (status) => {
  if (!status) return status;

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const mapLeave = (leave) => ({
  ...leave,
  leaveType: leave.leave_type ?? leave.leaveType,
  leaveCode: leave.leave_code ?? leave.leaveCode,
  fromDate: leave.from_date ?? leave.fromDate,
  toDate: leave.to_date ?? leave.toDate,
  halfDay: leave.half_day ?? leave.halfDay,
  halfDaySession: leave.half_day_session ?? leave.halfDaySession,
  appliedDate: leave.created_at ?? leave.appliedDate,
  employeeId: leave.employee_code ?? leave.employeeId,
  employeeName: leave.employee_name ?? leave.employeeName,
  attachment: leave.attachment_url ?? leave.attachment,
  approver: leave.approver_name ?? leave.approver,
  remarks: leave.review_note ?? leave.remarks,
  status: statusLabel(leave.status),
});

const mapBalance = (balance) => ({
  ...balance,
  leaveTypeId: balance.leave_type_id,
  code: balance.code,
  name: balance.name,
  allocated: Number(balance.allocated ?? 0),
  used: Number(balance.used ?? 0),
  pending: Number(balance.pending ?? 0),
  available: Number(balance.available ?? 0),
  halfDayAllowed: balance.half_day_allowed,
  attachmentRequired: balance.attachment_required,
});

const mapEmployee = (employee) => ({
  ...employee,
  employeeId: employee.employee_id ?? employee.employeeId,
  name: employee.full_name ?? employee.name,

  department:
    employee.department_name ??
    employee.department ??
    "",

  designation:
    employee.designation_name ??
    employee.designation ??
    "",

  reportingManager:
    employee.manager_name ??
    employee.reporting_manager_name ??
    employee.reportingManager ??
    "",

  joiningDate:
    employee.joined_on ??
    employee.joining_date ??
    employee.joiningDate ??
    "",

  employmentType:
    employee.employment_type ??
    employee.employmentType ??
    "",

  status:
    employee.status === "active"
      ? "Active"
      : employee.status === "inactive"
        ? "Inactive"
        : employee.status ?? "",

  personal: employee.personal ?? {
    email: employee.email ?? "",
    phone: employee.phone ?? "",
  },

  emergency: employee.emergency ?? {},
});
const mapOnboarding = (item) => ({
  ...item,
  employeeName: item.employee_name ?? item.employeeName,
  employeeId: item.employee_id ?? item.employeeId,
  stageIndex: item.stage_index ?? item.stageIndex,
  currentStage: item.current_stage ?? item.currentStage,
});

const mapOffboarding = (item) => ({
  ...item,
  employeeName: item.employee_name ?? item.employeeName,
  employeeId: item.employee_id ?? item.employeeId,
  stageIndex: item.stage_index ?? item.stageIndex,
  currentStage: item.current_stage ?? item.currentStage,
});

const mapHrService = (item) => ({
  ...item,
  employeeId: item.employee_id ?? item.employeeId,
  employeeName: item.employee_name ?? item.employeeName,
  serviceType: item.service_type ?? item.serviceType,
  submittedDate: item.created_at ?? item.submittedDate,
  assignedTo: item.assigned_to ?? item.assignedTo,
  attachmentUrl: item.attachment_url ?? item.attachmentUrl,
  resolutionNotes:
    item.resolution_notes ?? item.resolutionNotes,
  status: statusLabel(item.status),
  priority: statusLabel(item.priority),
});

const mapEmployeeRequest = (item) => ({
  ...item,
  employeeId: item.employee_id ?? item.employeeId,
  employeeName: item.employee_name ?? item.employeeName,
  submittedDate: item.created_at ?? item.submittedDate,
  assignedTo: item.assigned_to ?? item.assignedTo,
  status: statusLabel(item.status),
  priority: statusLabel(item.priority),
  thread: item.thread ?? [],
});

const CONFIG_CATEGORY_MAP = {
  permissions: "roles_permissions",
};

const backendConfigCategory = (category) =>
  CONFIG_CATEGORY_MAP[category] ?? category;

export const hrmsService = {
  // ==================== LEAVE TRACKER ====================

  async getLeaveBalances() {
    const response = await api.get("/leave/balances");
    return (response.data.balances ?? []).map(mapBalance);
  },
async getLeaveTypes() {
  const response = await api.get("/leave/types");
  return response.data.leaveTypes ?? response.data.types ?? [];
},
  async getMyLeaves() {
    const response = await api.get("/leave/my");
    return (response.data.leaves ?? []).map(mapLeave);
  },

  async applyLeave(payload) {
    const balances = await this.getLeaveBalances();

    const selectedBalance = balances.find(
      (balance) =>
        balance.code === payload.leaveCode ||
        balance.name?.toLowerCase() === payload.leaveType?.toLowerCase()
    );

    if (!selectedBalance?.leaveTypeId) {
      throw new Error("Leave type is not configured.");
    }

    const response = await api.post("/leave/apply", {
      leave_type_id: selectedBalance.leaveTypeId,
      from_date: payload.fromDate,
      to_date: payload.toDate,
      days: Number(payload.days),
      half_day: Boolean(payload.halfDay),
      half_day_session: payload.halfDay
        ? payload.halfDaySession
        : null,
      reason: payload.reason,
      attachment_url: payload.attachment ?? null,
    });

    return mapLeave(response.data.leave);
  },

  async cancelLeave(leaveId) {
    const response = await api.post(`/leave/${leaveId}/cancel`);
    return mapLeave(response.data.leave);
  },

  async getTeamLeaves() {
    const response = await api.get("/leave/team");
    return (response.data.requests ?? []).map(mapLeave);
  },

  async approveLeave(leaveId, remarks = "") {
    const response = await api.post(`/leave/${leaveId}/review`, {
      decision: "approved",
      review_note: remarks,
    });

    return mapLeave(response.data.request);
  },

  async rejectLeave(leaveId, reason) {
    if (!reason?.trim()) {
      throw new Error("Rejection reason is required");
    }

    const response = await api.post(`/leave/${leaveId}/review`, {
      decision: "rejected",
      review_note: reason,
    });

    return mapLeave(response.data.request);
  },

  // ==================== OPERATIONS ====================

  async getEmployees() {
    const response = await api.get("/operations/employees");
    return (response.data.employees ?? []).map(mapEmployee);
  },

  async getEmployeeById(id) {
    const employees = await this.getEmployees();
    return employees.find((employee) => employee.id === id) ?? null;
  },

  async createEmployee(payload) {
  const backendPayload = {
    employee_code:
      payload.employee_code?.trim() ||
      payload.employeeCode?.trim() ||
      `EMP-${Date.now()}`,

    full_name:
      payload.full_name?.trim() ||
      payload.name?.trim(),

    email:
      payload.email?.trim().toLowerCase(),

    role:
      payload.role || "employee",

    department:
      payload.department || null,

    designation:
      payload.designation || null,

    manager_id:
      payload.manager_id ??
      payload.managerId ??
      null,

    joined_on:
      payload.joined_on ||
      payload.joiningDate ||
      null,

    phone:
      payload.phone?.trim() || null,
  };

  if (!backendPayload.full_name || !backendPayload.email) {
    throw new Error("Name and email are required");
  }

  console.log(
    "Creating employee:",
    backendPayload
  );

  const response = await api.post(
    "/operations/employees",
    backendPayload
  );

  return mapEmployee(response.data.employee);
},

  async updateEmployee(id, updates) {
    const response = await api.patch(
      `/operations/employees/${id}`,
      updates
    );

    return mapEmployee(response.data.employee);
  },

  async toggleEmployeeStatus(id, newStatus) {
    const response = await api.patch(
      `/operations/employees/${id}`,
      { status: newStatus }
    );

    return mapEmployee(response.data.employee);
  },

  async getOnboarding() {
    const response = await api.get("/operations/onboarding");
    return (response.data.onboarding ?? []).map(mapOnboarding);
  },

  async advanceOnboardingStage(id, stageIndex, notes) {
    const response = await api.patch(
      `/operations/onboarding/${id}`,
      {
        stage_index: Number(stageIndex) + 1,
        notes,
      }
    );

    return mapOnboarding(response.data.onboarding);
  },

  async getOffboarding() {
    const response = await api.get("/operations/offboarding");
    return (response.data.offboarding ?? []).map(mapOffboarding);
  },

  async updateOffboardingStage(id, nextStageIndex, remarks) {
    const response = await api.patch(
      `/operations/offboarding/${id}`,
      {
        stage_index: nextStageIndex,
        remarks,
      }
    );

    return mapOffboarding(response.data.offboarding);
  },

  async getHrServices() {
    const response = await api.get("/operations/hr-services");
    return (response.data.services ?? []).map(mapHrService);
  },

  async createHrServiceRequest(payload) {
    const response = await api.post(
      "/operations/hr-services",
      {
        service_type: payload.serviceType,
        priority: payload.priority,
        purpose: payload.purpose,
        attachment_url: payload.attachment ?? null,
        assigned_to: payload.assignedTo,
      }
    );

    return mapHrService(response.data.ticket);
  },

  async updateHrServiceStatus(
    id,
    status,
    notes = "",
    assignedTo
  ) {
    const response = await api.patch(
      `/operations/hr-services/${id}`,
      {
        status,
        resolution_notes: notes,
        assigned_to: assignedTo,
      }
    );

    return mapHrService(response.data.ticket);
  },

  async getEmployeeRequests() {
    const response = await api.get("/operations/requests");
    return (response.data.requests ?? []).map(mapEmployeeRequest);
  },

  async createEmployeeRequest(payload) {
    const response = await api.post(
      "/operations/requests",
      {
        category: payload.category,
        subject: payload.subject,
        priority: payload.priority,
        description: payload.description,
      }
    );

    return mapEmployeeRequest(response.data.request);
  },

  async addRequestReply(
    id,
    sender,
    role,
    message,
    newStatus
  ) {
    const response = await api.post(
      `/operations/requests/${id}/reply`,
      {
        sender,
        role,
        message,
        status: newStatus,
      }
    );

    return mapEmployeeRequest(response.data.request);
  },

  // ==================== CONFIGURATION ====================

  async getConfig(section) {
    const category = backendConfigCategory(section);

    const response = await api.get(
      `/configuration/${category}`
    );

    return response.data.config ?? null;
  },

  async saveConfig(section, data) {
    const category = backendConfigCategory(section);

    const response = await api.put(
      `/configuration/${category}`,
      {
        config: data,
      }
    );

    return response.data.config ?? null;
  },

  async resetConfig(section) {
    /*
     * There is no reset endpoint in the current backend.
     * Reset must not invent or restore configuration values.
     * Returning the current backend configuration keeps the
     * operation data-safe until a reset endpoint is implemented.
     */
    return this.getConfig(section);
  },
};
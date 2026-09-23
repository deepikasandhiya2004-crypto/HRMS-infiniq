import {
  INITIAL_LEAVE_BALANCES,
  INITIAL_MY_LEAVES,
  INITIAL_TEAM_LEAVES,
  INITIAL_EMPLOYEES,
  INITIAL_ONBOARDING,
  INITIAL_OFFBOARDING,
  INITIAL_HR_SERVICES,
  INITIAL_EMPLOYEE_REQUESTS,
  INITIAL_CONFIG,
} from "./mockData.js";

// Storage keys
const KEYS = {
  LEAVE_BALANCES: "infiniq_hrms_leave_balances",
  MY_LEAVES: "infiniq_hrms_my_leaves",
  TEAM_LEAVES: "infiniq_hrms_team_leaves",
  EMPLOYEES: "infiniq_hrms_employees",
  ONBOARDING: "infiniq_hrms_onboarding",
  OFFBOARDING: "infiniq_hrms_offboarding",
  HR_SERVICES: "infiniq_hrms_hr_services",
  EMPLOYEE_REQUESTS: "infiniq_hrms_employee_requests",
  CONFIG: "infiniq_hrms_config",
};

// Helpers
function getStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("hrms_storage_change", { detail: { key } }));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

export const hrmsService = {
  // ==================== LEAVE TRACKER ====================
  async getLeaveBalances() {
    return getStore(KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);
  },

  async getMyLeaves() {
    return getStore(KEYS.MY_LEAVES, INITIAL_MY_LEAVES);
  },

  async applyLeave(payload) {
    const leaves = getStore(KEYS.MY_LEAVES, INITIAL_MY_LEAVES);
    const balances = getStore(KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);

    const newId = `LV-${new Date().getFullYear()}-${String(leaves.length + 1).padStart(3, "0")}`;
    const newLeave = {
      id: newId,
      employeeId: payload.employeeId || "EMP-1004",
      employeeName: payload.employeeName || "Aarav Sharma",
      department: payload.department || "Engineering",
      leaveType: payload.leaveType,
      leaveCode: payload.leaveCode || "CL",
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      days: Number(payload.days),
      halfDay: !!payload.halfDay,
      halfDaySession: payload.halfDaySession || null,
      reason: payload.reason,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      approver: payload.approver || "Vikram Malhotra",
      remarks: "Pending manager review",
      attachment: payload.attachment || null,
      approvalTimeline: [
        {
          step: "Submitted",
          by: payload.employeeName || "Aarav Sharma",
          date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "completed",
        },
        { step: "Manager Review", by: payload.approver || "Vikram Malhotra", date: "Pending", status: "current" },
      ],
    };

    // Update balances: increment pending, decrement available
    const updatedBalances = balances.map((b) => {
      if (b.name.toLowerCase() === payload.leaveType.toLowerCase() || b.code === payload.leaveCode) {
        return {
          ...b,
          pending: b.pending + Number(payload.days),
          available: Math.max(0, b.available - Number(payload.days)),
        };
      }
      return b;
    });

    const updatedLeaves = [newLeave, ...leaves];
    setStore(KEYS.MY_LEAVES, updatedLeaves);
    setStore(KEYS.LEAVE_BALANCES, updatedBalances);

    // Also add to team leaves
    const teamLeaves = getStore(KEYS.TEAM_LEAVES, INITIAL_TEAM_LEAVES);
    setStore(KEYS.TEAM_LEAVES, [newLeave, ...teamLeaves]);

    return newLeave;
  },

  async cancelLeave(leaveId) {
    const leaves = getStore(KEYS.MY_LEAVES, INITIAL_MY_LEAVES);
    const balances = getStore(KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);

    const target = leaves.find((l) => l.id === leaveId);
    if (!target) throw new Error("Leave record not found");
    if (target.status !== "Pending") throw new Error("Only pending leaves can be cancelled");

    const updatedLeaves = leaves.map((l) =>
      l.id === leaveId ? { ...l, status: "Cancelled", remarks: "Cancelled by employee" } : l
    );

    // Restore balances
    const updatedBalances = balances.map((b) => {
      if (b.name.toLowerCase() === target.leaveType.toLowerCase() || b.code === target.leaveCode) {
        return {
          ...b,
          pending: Math.max(0, b.pending - target.days),
          available: b.available + target.days,
        };
      }
      return b;
    });

    setStore(KEYS.MY_LEAVES, updatedLeaves);
    setStore(KEYS.LEAVE_BALANCES, updatedBalances);

    const teamLeaves = getStore(KEYS.TEAM_LEAVES, INITIAL_TEAM_LEAVES);
    setStore(
      KEYS.TEAM_LEAVES,
      teamLeaves.map((l) => (l.id === leaveId ? { ...l, status: "Cancelled" } : l))
    );

    return true;
  },

  async getTeamLeaves() {
    return getStore(KEYS.TEAM_LEAVES, INITIAL_TEAM_LEAVES);
  },

  async approveLeave(leaveId, remarks = "Approved by manager") {
    const teamLeaves = getStore(KEYS.TEAM_LEAVES, INITIAL_TEAM_LEAVES);
    const target = teamLeaves.find((l) => l.id === leaveId);
    if (!target) throw new Error("Leave request not found");

    const updated = teamLeaves.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status: "Approved",
            remarks,
            approvalTimeline: [
              ...(l.approvalTimeline || []),
              { step: "Manager Approval", by: "Manager", date: "Just now", status: "completed" },
            ],
          }
        : l
    );

    setStore(KEYS.TEAM_LEAVES, updated);

    // Update in my leaves if belongs to Aarav
    const myLeaves = getStore(KEYS.MY_LEAVES, INITIAL_MY_LEAVES);
    if (myLeaves.some((l) => l.id === leaveId)) {
      setStore(
        KEYS.MY_LEAVES,
        myLeaves.map((l) => (l.id === leaveId ? { ...l, status: "Approved", remarks } : l))
      );
      // Adjust balance from pending to used
      const balances = getStore(KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);
      const updatedBalances = balances.map((b) => {
        if (b.name.toLowerCase() === target.leaveType.toLowerCase() || b.code === target.leaveCode) {
          return {
            ...b,
            pending: Math.max(0, b.pending - target.days),
            used: b.used + target.days,
          };
        }
        return b;
      });
      setStore(KEYS.LEAVE_BALANCES, updatedBalances);
    }

    return true;
  },

  async rejectLeave(leaveId, reason) {
    if (!reason || !reason.trim()) throw new Error("Rejection reason is required");

    const teamLeaves = getStore(KEYS.TEAM_LEAVES, INITIAL_TEAM_LEAVES);
    const target = teamLeaves.find((l) => l.id === leaveId);
    if (!target) throw new Error("Leave request not found");

    const updated = teamLeaves.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status: "Rejected",
            remarks: reason,
            approvalTimeline: [
              ...(l.approvalTimeline || []),
              { step: "Manager Rejected", by: "Manager", date: "Just now", status: "rejected" },
            ],
          }
        : l
    );

    setStore(KEYS.TEAM_LEAVES, updated);

    // Update in my leaves and refund pending balance
    const myLeaves = getStore(KEYS.MY_LEAVES, INITIAL_MY_LEAVES);
    if (myLeaves.some((l) => l.id === leaveId)) {
      setStore(
        KEYS.MY_LEAVES,
        myLeaves.map((l) => (l.id === leaveId ? { ...l, status: "Rejected", remarks: reason } : l))
      );
      const balances = getStore(KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES);
      const updatedBalances = balances.map((b) => {
        if (b.name.toLowerCase() === target.leaveType.toLowerCase() || b.code === target.leaveCode) {
          return {
            ...b,
            pending: Math.max(0, b.pending - target.days),
            available: b.available + target.days,
          };
        }
        return b;
      });
      setStore(KEYS.LEAVE_BALANCES, updatedBalances);
    }

    return true;
  },

  // ==================== OPERATIONS ====================
  async getEmployees() {
    return getStore(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  async getEmployeeById(id) {
    const list = getStore(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    return list.find((e) => e.id === id) || null;
  },

  async createEmployee(payload) {
    const employees = getStore(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const nextId = `EMP-${1000 + employees.length + 1}`;
    const newEmp = {
      id: nextId,
      name: payload.name,
      avatar:
        payload.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      department: payload.department,
      designation: payload.designation,
      location: payload.location || "Bangalore (HQ)",
      employmentType: payload.employmentType || "Full-Time",
      joiningDate: payload.joiningDate || new Date().toISOString().split("T")[0],
      reportingManager: payload.reportingManager || "Vikram Malhotra",
      status: payload.status || "Active",
      personal: {
        dob: payload.dob || "1995-01-01",
        gender: payload.gender || "Other",
        phone: payload.phone || "+91 99000 00000",
        email: payload.email || `${payload.name.toLowerCase().replace(/\s+/g, ".")}@infiniq.com`,
        address: payload.address || "Bangalore, India",
      },
      emergency: {
        name: payload.emergencyName || "Family Contact",
        relation: payload.emergencyRelation || "Kin",
        phone: payload.emergencyPhone || "+91 99000 11111",
        address: payload.emergencyAddress || payload.address || "Bangalore",
      },
      documents: [
        { name: "Offer_Letter.pdf", type: "Offer", size: "1.1 MB", date: new Date().toISOString().split("T")[0] },
      ],
      leaveSummary: { total: 30, available: 25, used: 5, pending: 0 },
      attendanceSummary: { present: 22, absent: 0, late: 0, leave: 0 },
    };

    setStore(KEYS.EMPLOYEES, [newEmp, ...employees]);
    return newEmp;
  },

  async updateEmployee(id, updates) {
    const employees = getStore(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const updated = employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp));
    setStore(KEYS.EMPLOYEES, updated);
    return true;
  },

  async toggleEmployeeStatus(id, newStatus) {
    const employees = getStore(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const updated = employees.map((emp) => (emp.id === id ? { ...emp, status: newStatus } : emp));
    setStore(KEYS.EMPLOYEES, updated);
    return true;
  },

  async getOnboarding() {
    return getStore(KEYS.ONBOARDING, INITIAL_ONBOARDING);
  },

  async advanceOnboardingStage(id, stageIndex, notes) {
    const list = getStore(KEYS.ONBOARDING, INITIAL_ONBOARDING);
    const stageNames = [
      "Employee Information",
      "Documents",
      "Verification",
      "IT/Asset Setup",
      "HR Setup",
      "Final Approval",
      "Completed",
    ];

    const updated = list.map((item) => {
      if (item.id !== id) return item;
      const nextIndex = Math.min(7, stageIndex + 1);
      const isCompleted = nextIndex === 7;
      const progress = Math.round((nextIndex / 7) * 100);

      const stages = item.stages.map((st) => {
        if (st.id === stageIndex) return { ...st, status: "completed", notes: notes || st.notes };
        if (st.id === nextIndex) return { ...st, status: isCompleted ? "completed" : "in_progress" };
        return st;
      });

      return {
        ...item,
        stageIndex: nextIndex,
        currentStage: stageNames[nextIndex - 1],
        progress,
        status: isCompleted ? "Completed" : "In Progress",
        stages,
      };
    });

    setStore(KEYS.ONBOARDING, updated);
    return true;
  },

  async getOffboarding() {
    return getStore(KEYS.OFFBOARDING, INITIAL_OFFBOARDING);
  },

  async updateOffboardingStage(id, nextStageIndex, remarks) {
    const list = getStore(KEYS.OFFBOARDING, INITIAL_OFFBOARDING);
    const stageNames = [
      "Resignation",
      "Manager Approval",
      "HR Review",
      "Asset Return",
      "Clearance",
      "Exit Interview",
      "Final Settlement",
      "Completed",
    ];

    const updated = list.map((item) => {
      if (item.id !== id) return item;
      const idx = Math.min(8, nextStageIndex);
      const isCompleted = idx === 8;
      const progress = Math.round((idx / 8) * 100);

      const stages = item.stages.map((st) => {
        if (st.id < idx) return { ...st, status: "completed" };
        if (st.id === idx) return { ...st, status: isCompleted ? "completed" : "in_progress" };
        return st;
      });

      return {
        ...item,
        stageIndex: idx,
        currentStage: stageNames[idx - 1],
        progress,
        status: isCompleted ? "Completed" : "In Progress",
        stages,
      };
    });

    setStore(KEYS.OFFBOARDING, updated);
    return true;
  },

  async getHrServices() {
    return getStore(KEYS.HR_SERVICES, INITIAL_HR_SERVICES);
  },

  async createHrServiceRequest(payload) {
    const list = getStore(KEYS.HR_SERVICES, INITIAL_HR_SERVICES);
    const nextId = `HRS-${new Date().getFullYear()}-${String(list.length + 301).padStart(3, "0")}`;
    const newReq = {
      id: nextId,
      employeeId: payload.employeeId || "EMP-1004",
      employeeName: payload.employeeName || "Aarav Sharma",
      serviceType: payload.serviceType,
      submittedDate: new Date().toISOString().split("T")[0],
      assignedTo: payload.assignedTo || "Priya Nair",
      priority: payload.priority || "Medium",
      status: "New",
      purpose: payload.purpose,
      attachmentUrl: payload.attachment || null,
      resolutionNotes: "",
    };

    setStore(KEYS.HR_SERVICES, [newReq, ...list]);
    return newReq;
  },

  async updateHrServiceStatus(id, status, notes = "", assignedTo) {
    const list = getStore(KEYS.HR_SERVICES, INITIAL_HR_SERVICES);
    const updated = list.map((req) =>
      req.id === id
        ? {
            ...req,
            status,
            resolutionNotes: notes || req.resolutionNotes,
            assignedTo: assignedTo || req.assignedTo,
          }
        : req
    );
    setStore(KEYS.HR_SERVICES, updated);
    return true;
  },

  async getEmployeeRequests() {
    return getStore(KEYS.EMPLOYEE_REQUESTS, INITIAL_EMPLOYEE_REQUESTS);
  },

  async createEmployeeRequest(payload) {
    const list = getStore(KEYS.EMPLOYEE_REQUESTS, INITIAL_EMPLOYEE_REQUESTS);
    const nextId = `REQ-${new Date().getFullYear()}-${String(list.length + 401).padStart(3, "0")}`;
    const newReq = {
      id: nextId,
      employeeId: payload.employeeId || "EMP-1004",
      employeeName: payload.employeeName || "Aarav Sharma",
      category: payload.category,
      subject: payload.subject,
      priority: payload.priority || "Medium",
      status: "Open",
      submittedDate: new Date().toISOString().split("T")[0],
      assignedTo: payload.assignedTo || "IT & Operations Helpdesk",
      description: payload.description,
      thread: [
        {
          sender: payload.employeeName || "Aarav Sharma",
          role: "Employee",
          time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: payload.description,
        },
      ],
    };

    setStore(KEYS.EMPLOYEE_REQUESTS, [newReq, ...list]);
    return newReq;
  },

  async addRequestReply(id, sender, role, message, newStatus) {
    const list = getStore(KEYS.EMPLOYEE_REQUESTS, INITIAL_EMPLOYEE_REQUESTS);
    const updated = list.map((req) => {
      if (req.id !== id) return req;
      const newThread = [
        ...req.thread,
        {
          sender,
          role,
          time: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message,
        },
      ];
      return {
        ...req,
        status: newStatus || req.status,
        thread: newThread,
      };
    });
    setStore(KEYS.EMPLOYEE_REQUESTS, updated);
    return true;
  },

  // ==================== CONFIGURATION ====================
  async getConfig(section) {
    const all = getStore(KEYS.CONFIG, INITIAL_CONFIG);
    return section ? all[section] : all;
  },

  async saveConfig(section, data) {
    const all = getStore(KEYS.CONFIG, INITIAL_CONFIG);
    const updated = {
      ...all,
      [section]: {
        ...all[section],
        ...data,
      },
    };
    setStore(KEYS.CONFIG, updated);
    return updated[section];
  },

  async resetConfig(section) {
    const all = getStore(KEYS.CONFIG, INITIAL_CONFIG);
    if (section && INITIAL_CONFIG[section]) {
      all[section] = JSON.parse(JSON.stringify(INITIAL_CONFIG[section]));
      setStore(KEYS.CONFIG, all);
      return all[section];
    }
    setStore(KEYS.CONFIG, JSON.parse(JSON.stringify(INITIAL_CONFIG)));
    return INITIAL_CONFIG;
  },
};

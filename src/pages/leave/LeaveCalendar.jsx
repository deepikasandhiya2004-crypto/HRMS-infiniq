import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Palmtree,
  Users,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import FilterDropdown from "../../components/common/FilterDropdown.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function LeaveCalendar() {
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 21)); // September 2026
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'

  // Filters
  const [deptFilter, setDeptFilter] = useState("");
  const [empFilter, setEmpFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Event Inspection Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    hrmsService.getTeamLeaves().then(setTeamLeaves);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nxt = new Date(currentDate);
      nxt.setDate(nxt.getDate() + 7);
      setCurrentDate(nxt);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 21));
  };

  // Unique filters
  const departments = useMemo(
    () => Array.from(new Set(teamLeaves.map((l) => l.department).filter(Boolean))),
    [teamLeaves]
  );
  const employees = useMemo(
    () => Array.from(new Set(teamLeaves.map((l) => l.employeeName).filter(Boolean))),
    [teamLeaves]
  );

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return teamLeaves.filter((l) => {
      const matchesDept = !deptFilter || l.department === deptFilter;
      const matchesEmp = !empFilter || l.employeeName === empFilter;
      const matchesType = !typeFilter || l.leaveType === typeFilter;
      const matchesStatus = !statusFilter || l.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesDept && matchesEmp && matchesType && matchesStatus;
    });
  }, [teamLeaves, deptFilter, empFilter, typeFilter, statusFilter]);

  // Generate days for Month View
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        monthOffset: -1,
        dateString: `${year}-${String(month).padStart(2, "0")}-${String(prevMonthDays - i).padStart(2, "0")}`,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        monthOffset: 0,
        dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    // Next month padding to fill full grid (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        monthOffset: 1,
        dateString: `${year}-${String(month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    return days;
  }, [year, month]);

  // Match events to a date string (YYYY-MM-DD)
  const getEventsForDate = (dateStr) => {
    return filteredLeaves.filter((l) => {
      return dateStr >= l.fromDate && dateStr <= l.toDate;
    });
  };

  const getLeaveColor = (type) => {
    switch (type) {
      case "Casual Leave":
        return { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" };
      case "Sick Leave":
        return { bg: "bg-orange-100 text-orange-800 border-orange-300", dot: "bg-orange-500" };
      case "Earned Leave":
        return { bg: "bg-purple-100 text-purple-800 border-purple-300", dot: "bg-purple-500" };
      case "Compensatory Off":
        return { bg: "bg-blue-100 text-blue-800 border-blue-300", dot: "bg-blue-500" };
      default:
        return { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" };
    }
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-[#00373A] transition"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-[#00373A] hover:bg-white rounded-lg transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-[#00373A] transition"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h2 className="text-base font-extrabold text-[#00373A]">
            {monthNames[month]} {year}
          </h2>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === "month" ? "bg-white text-[#00373A] shadow-sm" : "text-slate-500"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-2.5 py-1 transition ${
                viewMode === "week" ? "bg-white text-[#00373A] shadow-sm" : "text-slate-500"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Department"
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments}
          />
          <FilterDropdown
            label="Employee"
            value={empFilter}
            onChange={setEmpFilter}
            options={employees}
          />
          <FilterDropdown
            label="Leave Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={["Casual Leave", "Sick Leave", "Earned Leave", "Compensatory Off", "Optional / Holiday"]}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["Pending", "Approved"]}
          />
        </div>
      </div>

      {/* CALENDAR GRID CONTAINER */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#00373A]/10 shadow-sm">
        {/* DAYS OF WEEK HEADER */}
        <div className="grid grid-cols-7 border-b border-[#00373A]/10 bg-[#00373A]/[0.03] text-center text-xs font-bold uppercase tracking-wider text-[#00373A]/60 py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* DAYS CELLS */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#00373A]/5 bg-white">
          {calendarDays.map((d, index) => {
            const dayEvents = getEventsForDate(d.dateString);
            const isToday = d.dateString === "2026-09-21";
            const isCurrentMonth = d.monthOffset === 0;

            return (
              <div
                key={index}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth ? "bg-slate-50/50 opacity-40" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-[#00373A] text-white"
                        : isCurrentMonth
                        ? "text-[#00373A]"
                        : "text-slate-400"
                    }`}
                  >
                    {d.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayEvents.length} {dayEvents.length === 1 ? "leave" : "leaves"}
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="mt-1.5 space-y-1 flex-1">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const colors = getLeaveColor(ev.leaveType);
                    const isPending = ev.status === "Pending";

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`group flex items-center justify-between rounded-lg px-2 py-1 text-[11px] font-bold border transition cursor-pointer ${
                          colors.bg
                        } ${isPending ? "border-dashed opacity-85" : "shadow-xs"}`}
                        title={`${ev.employeeName} (${ev.leaveType}) - ${ev.status}`}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                          <span className="truncate">{ev.employeeName}</span>
                        </div>
                        <span className="text-[9px] font-semibold opacity-75 ml-1">
                          {isPending ? "⏳" : "✓"}
                        </span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="block text-center text-[10px] font-extrabold text-[#00373A]/60">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          title="Leave Calendar Event"
          onClose={() => setSelectedEvent(null)}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-[#00373A]">
                  {selectedEvent.employeeName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEvent.employeeId} • {selectedEvent.department}
                </p>
              </div>
              <StatusBadge status={selectedEvent.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400">Leave Type</span>
                <p className="font-bold text-[#00373A] mt-0.5">{selectedEvent.leaveType}</p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400">Duration</span>
                <p className="font-bold text-[#00373A] mt-0.5">
                  {selectedEvent.days} {selectedEvent.days === 1 ? "Day" : "Days"}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400">From Date</span>
                <p className="font-bold text-[#00373A] mt-0.5">{selectedEvent.fromDate}</p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400">To Date</span>
                <p className="font-bold text-[#00373A] mt-0.5">{selectedEvent.toDate}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Reason</span>
              <p className="mt-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedEvent.reason}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

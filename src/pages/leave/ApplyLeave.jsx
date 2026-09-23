import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  Send,
  Palmtree,
  Info,
  X,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const [balances, setBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
 const [leaveCode, setLeaveCode] = useState(
  searchParams.get("type") || ""
);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [halfDay, setHalfDay] = useState(false);
 const [halfDaySession, setHalfDaySession] = useState("");
  const [reason, setReason] = useState("");
 const [approver, setApprover] = useState("");
  const [attachment, setAttachment] = useState(null);

  // Errors state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    hrmsService.getLeaveBalances().then((data) => {
      setBalances(data);
      setLoadingBalances(false);
    });
  }, []);

  // Selected leave type details
  const selectedType = useMemo(() => {
    return balances.find((b) => b.code === leaveCode) || balances[0];
  }, [balances, leaveCode]);

  // Calculate requested duration (days)
  const requestedDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (end < start) return 0;

    if (halfDay) return 0.5;

    // Working days calculation (Monday - Friday)
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [fromDate, toDate, halfDay]);

  // Projected balance after application
  const projectedRemaining = useMemo(() => {
    if (!selectedType) return 0;
    return selectedType.available - requestedDays;
  }, [selectedType, requestedDays]);

  // Validate form
  const validateForm = () => {
    const errs = {};

    if (!fromDate) errs.fromDate = "From date is required";
    if (!toDate) errs.toDate = "To date is required";

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (end < start) {
        errs.toDate = "To date cannot be before From date";
      }
    }

    if (requestedDays <= 0 && fromDate && toDate) {
      errs.duration = "Selected date range contains 0 working days";
    }

    if (selectedType && requestedDays > selectedType.available) {
      errs.balance = `Insufficient ${selectedType.name} balance. Requested: ${requestedDays}, Available: ${selectedType.available}`;
    }

    if (!reason.trim()) {
      errs.reason = "Please provide a reason for your leave request";
    } else if (reason.trim().length < 8) {
      errs.reason = "Reason must be at least 8 characters long";
    }

  if (selectedType?.attachmentRequired && !attachment) {
  errs.attachment = "Supporting document is required";
}
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await hrmsService.applyLeave({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        leaveType: selectedType.name,
        leaveCode: selectedType.code,
        fromDate,
        toDate,
        days: requestedDays,
        halfDay,
         halfDaySession : null,
        reason,
        attachment: attachment ? attachment.name : null,
      });

      toast.success("Leave application submitted successfully! Initial status: Pending");
      navigate("/leave-tracker/my-leave");
    } catch (err) {
      toast.error(err.message || "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  // Simulated file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      if (errors.attachment) {
        setErrors((prev) => ({ ...prev, attachment: null }));
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00DC46]/20 text-[#00373A]">
            <Palmtree size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#00373A]">New Leave Application</h2>
            <p className="text-xs text-slate-500">
              Submit your time-off request for supervisor review and approval
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT TWO COLUMNS: FORM FIELDS */}
        <div className="md:col-span-2 space-y-5 rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm">
          {/* LEAVE TYPE */}
          <div>
            <label className="block text-xs font-bold text-[#00373A] mb-1.5">
              Select Leave Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {balances.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setLeaveCode(b.code);
                    if (errors.balance) setErrors((prev) => ({ ...prev, balance: null }));
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                    leaveCode === b.code
                      ? "border-[#00373A] bg-[#00373A]/5 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-[#00373A]">{b.name}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 mt-1">
                    {b.available} days left
                  </span>
                </button>
              ))}
            </div>
            {errors.balance && (
              <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertTriangle size={14} /> {errors.balance}
              </p>
            )}
          </div>

          {/* DATES ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    if (!toDate || toDate < e.target.value) {
                      setToDate(e.target.value);
                    }
                    if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: null }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-[#00373A] shadow-sm focus:border-[#00373A] focus:outline-none focus:ring-2 focus:ring-[#00373A]/10"
                />
              </div>
              {errors.fromDate && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.fromDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1.5">
                To Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: null }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-[#00373A] shadow-sm focus:border-[#00373A] focus:outline-none focus:ring-2 focus:ring-[#00373A]/10"
                />
              </div>
              {errors.toDate && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.toDate}</p>
              )}
            </div>
          </div>

          {/* HALF DAY OPTION */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="halfDay"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
              />
              <label htmlFor="halfDay" className="text-xs font-bold text-[#00373A] cursor-pointer">
                Apply as Half-Day Leave
              </label>
            </div>

            {halfDay && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Session:</span>
                <select
                  value={halfDaySession}
                  onChange={(e) => setHalfDaySession(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-[#00373A] font-semibold focus:outline-none"
                >
                  {halfDay && (
  <p className="text-[11px] text-slate-500">
    Half-day session will use the value configured by the leave workflow.
  </p>
)}
                </select>
              </div>
            )}
          </div>

          {/* REASON TEXTAREA */}
          <div>
            <label className="block text-xs font-bold text-[#00373A] mb-1.5">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) setErrors((prev) => ({ ...prev, reason: null }));
              }}
              placeholder="Provide a clear explanation for your absence and handoff details..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-[#00373A] shadow-sm focus:border-[#00373A] focus:outline-none focus:ring-2 focus:ring-[#00373A]/10"
            />
            {errors.reason && (
              <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.reason}</p>
            )}
          </div>

          {/* APPROVER & ATTACHMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1.5">
                Reporting Approver
              </label>
              <select
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-[#00373A] shadow-sm focus:outline-none"
              ></select>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-500">
  Determined by the configured workflow
</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1.5">
                Supporting Document / Medical Slip
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-2.5 text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                <FileUp size={16} className="text-[#00373A]" />
                <span className="truncate">
                  {attachment ? attachment.name : "Attach PDF, JPG (Max 5MB)"}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
              {attachment && (
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="mt-1 text-[10px] text-rose-600 hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Remove attachment
                </button>
              )}
              {errors.attachment && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.attachment}</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC BALANCE CALCULATOR */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#00373A] border-b border-slate-100 pb-3">
              Balance Impact Preview
            </h3>

            {/* Selected Leave Type badge */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Selected Type</span>
              <span className="font-bold text-[#00373A]">{selectedType?.name}</span>
            </div>

            {/* Current Available */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Available Quota</span>
              <span className="font-bold text-emerald-600">
                {selectedType?.available} Days
              </span>
            </div>

            {/* Requested Days */}
            <div className="flex items-center justify-between text-xs border-t border-dashed border-slate-200 pt-3">
              <span className="text-slate-500">Requested Days</span>
              <span className="font-extrabold text-lg text-[#00373A]">
                {requestedDays} {requestedDays === 1 ? "Day" : "Days"}
              </span>
            </div>

            {/* Remaining Balance */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Projected Remaining
                </span>
                <p
                  className={`text-base font-extrabold ${
                    projectedRemaining < 0 ? "text-rose-600" : "text-[#00373A]"
                  }`}
                >
                  {projectedRemaining} Days
                </p>
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  projectedRemaining < 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {projectedRemaining < 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              </div>
            </div>

            {projectedRemaining < 0 && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
                <strong>Notice:</strong> Your requested leave exceeds your available quota. Application cannot be submitted.
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || projectedRemaining < 0 || requestedDays <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00373A] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#00373A]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              <span>{submitting ? "Submitting..." : "Submit Leave Application"}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#00373A]/5 p-4 text-xs text-slate-600 border border-[#00373A]/10 space-y-2">
            <h4 className="font-bold text-[#00373A] flex items-center gap-1.5">
              <Info size={14} className="text-[#00373A]" />
              Submission Guidelines
            </h4>
            <p className="text-[11px] leading-relaxed">
              Once submitted, your application will appear under <strong>My Leave</strong> with an initial status of <strong>Pending</strong>. Once submitted, your application will appear under <strong>My Leave</strong>.
Review routing is determined by the configured workflow.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

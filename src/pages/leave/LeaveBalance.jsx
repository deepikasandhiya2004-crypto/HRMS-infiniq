import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Palmtree,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarCheck,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { hrmsService } from "../../services/hrmsService.js";
import StatCard from "../../components/common/StatCard.jsx";

export default function LeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalances();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("leave")) loadBalances();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadBalances() {
    try {
      setLoading(true);
      const data = await hrmsService.getLeaveBalances();
      setBalances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Summary totals
  const totalAllocated = balances.reduce((acc, b) => acc + b.allocated, 0);
  const totalUsed = balances.reduce((acc, b) => acc + b.used, 0);
  const totalPending = balances.reduce((acc, b) => acc + b.pending, 0);
  const totalAvailable = balances.reduce((acc, b) => acc + b.available, 0);

  // Chart data
  const chartData = balances.map((b) => ({
    name: b.name,
    value: b.used,
    color: b.color || "#00DC46",
  }));

  return (
    <div className="space-y-6">
      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Quota"
          value={`${totalAllocated} Days`}
          subtitle="Calendar year 2026 allocation"
          icon={CalendarCheck}
          accentColor="#00373A"
        />
        <StatCard
          title="Available Balance"
          value={`${totalAvailable} Days`}
          subtitle="Ready to be requested"
          icon={CheckCircle2}
          accentColor="#00DC46"
        />
        <StatCard
          title="Used Leaves"
          value={`${totalUsed} Days`}
          subtitle="Absences taken to date"
          icon={Palmtree}
          accentColor="#FF6A3D"
        />
        <StatCard
          title="Pending Approval"
          value={`${totalPending} Days`}
          subtitle="Under supervisor review"
          icon={Clock}
          accentColor="#7C3AED"
        />
      </div>

      {/* INDIVIDUAL LEAVE TYPE CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#00373A]">
              Leave Entitlements by Category
            </h2>
            <p className="text-xs text-[#00373A]/60">
              Detailed tracking of allocated, utilized, pending, and remaining balances per leave policy
            </p>
          </div>
          <Link
            to="/leave-tracker/apply"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00373A] hover:underline"
          >
            <PlusCircle size={15} />
            <span>Apply from balance</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {balances.map((type) => {
            const usagePercent = Math.round((type.used / type.allocated) * 100) || 0;
            const remainingPercent = Math.round((type.available / type.allocated) * 100) || 0;

            return (
              <div
                key={type.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <h3 className="text-sm font-extrabold text-[#00373A]">{type.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-5">
                        Code: {type.code}
                      </span>
                    </div>

                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-extrabold"
                      style={{
                        backgroundColor: `${type.color}15`,
                        color: type.color,
                      }}
                    >
                      {type.available} Available
                    </span>
                  </div>

                  {/* Policy Description */}
                  <p className="mt-2.5 text-xs text-slate-500 line-clamp-2">
                    {type.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                      <span>Utilized ({type.used})</span>
                      <span>Allocated ({type.allocated})</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${usagePercent}%`,
                          backgroundColor: type.color,
                        }}
                        title={`Used: ${type.used} days`}
                      />
                      {type.pending > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all opacity-80"
                          style={{
                            width: `${(type.pending / type.allocated) * 100}%`,
                          }}
                          title={`Pending: ${type.pending} days`}
                        />
                      )}
                    </div>
                  </div>

                  {/* 4-Cell Metric Grid */}
                  <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Allocated
                      </span>
                      <p className="text-sm font-extrabold text-[#00373A]">{type.allocated}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Used
                      </span>
                      <p className="text-sm font-extrabold text-[#00373A]">{type.used}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Pending
                      </span>
                      <p className="text-sm font-extrabold text-amber-600">{type.pending}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Available
                      </span>
                      <p className="text-sm font-extrabold text-emerald-600">{type.available}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Annual accrual</span>
                  <Link
                    to={`/leave-tracker/apply?type=${type.code}`}
                    className="font-bold text-[#00373A] hover:underline"
                  >
                    Apply {type.code} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VISUAL UTILIZATION BREAKDOWN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#00373A]">Usage Distribution</h3>
            <p className="text-xs text-slate-500">Share of consumed leaves by leave type</p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#00373A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
            {balances.map((b) => (
              <div key={b.id} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="font-semibold text-slate-700">{b.code} ({b.used})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
          <h3 className="text-sm font-extrabold text-[#00373A]">
            Leave Policy Rules & Guidelines
          </h3>
          <p className="text-xs text-slate-500">Corporate guidelines governing leave accrual and usage</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
              <h4 className="font-bold text-[#00373A] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00DC46]" />
                Carry-Forward Rules
              </h4>
              <p className="mt-1 text-slate-600 text-[11px]">
                Up to 30 Earned Leaves (EL) and 5 Sick Leaves (SL) can be carried forward into the next fiscal year. Casual Leaves (CL) lapse on Dec 31st.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
              <h4 className="font-bold text-[#00373A] flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                Minimum Notice Period
              </h4>
              <p className="mt-1 text-slate-600 text-[11px]">
                Earned leaves longer than 3 days require a minimum 7 days prior notice. Casual leaves require 24 hours prior submission.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
              <h4 className="font-bold text-[#00373A] flex items-center gap-1.5">
                <AlertCircle size={14} className="text-blue-500" />
                Medical Prescriptions
              </h4>
              <p className="mt-1 text-slate-600 text-[11px]">
                Sick leaves exceeding 2 consecutive days require a medical practitioner certificate or prescription attachment.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
              <h4 className="font-bold text-[#00373A] flex items-center gap-1.5">
                <Palmtree size={14} className="text-purple-500" />
                Encashment Eligibility
              </h4>
              <p className="mt-1 text-slate-600 text-[11px]">
                Earned leaves accumulated beyond 30 days are eligible for year-end salary encashment per basic wage calculation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

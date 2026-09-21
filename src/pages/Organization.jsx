import React from "react";
import { Building2, Users, MapPin, Award, CheckCircle2 } from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";

export default function Organization() {
  const departments = [
    { name: "Executive Leadership", head: "Deepika Sandhiya", count: 3, location: "Global HQ (Bangalore)" },
    { name: "Engineering", head: "Vikram Malhotra", count: 18, location: "Bangalore (HQ)" },
    { name: "UI/UX Design", head: "Ananya Roy", count: 6, location: "Mumbai Branch & Remote" },
    { name: "Human Resources", head: "Priya Nair", count: 4, location: "Bangalore (HQ)" },
    { name: "Finance & Accounts", head: "Sneha Patel", count: 5, location: "Bangalore (HQ)" },
    { name: "Sales & Marketing", head: "Devansh Mehta", count: 9, location: "Bangalore (HQ)" },
    { name: "Operations & IT", head: "Karthik Raja", count: 4, location: "Bangalore (HQ)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#00373A]">Organization Structure</h1>
        <p className="mt-1 text-xs text-[#00373A]/60">
          INFiniq Technologies corporate departments, leadership hierarchy, and facilities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Departments" value="7" icon={Building2} accentColor="#00DC46" />
        <StatCard title="Office Locations" value="3 Global Hubs" icon={MapPin} accentColor="#00373A" />
        <StatCard title="Total Workforce" value="49 Employees" icon={Users} accentColor="#7C3AED" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#00373A]/5 p-2 text-[#00373A]">
                <Building2 size={20} />
              </span>
              <span className="text-xs font-bold rounded-full bg-[#00DC46]/20 text-[#00373A] px-2.5 py-1">
                {d.count} Members
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#00373A]">{d.name}</h3>
              <p className="text-xs text-[#00373A]/60 mt-0.5">Head: <strong className="text-[#00373A]">{d.head}</strong></p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin size={13} />
              <span>{d.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

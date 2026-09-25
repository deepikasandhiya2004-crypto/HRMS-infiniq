import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  MapPin,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000/api/organization";

export default function OrgStructure() {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);

  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrganization = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        departmentsResponse,
        teamsResponse,
        designationsResponse,
        locationsResponse,
      ] = await Promise.all([
        fetch(`${API}/departments`),
        fetch(`${API}/teams`),
        fetch(`${API}/designations`),
        fetch(`${API}/locations`),
      ]);

      if (
        !departmentsResponse.ok ||
        !teamsResponse.ok ||
        !designationsResponse.ok ||
        !locationsResponse.ok
      ) {
        throw new Error("Failed to load organization data");
      }

      const departmentsData = await departmentsResponse.json();
      const teamsData = await teamsResponse.json();
      const designationsData = await designationsResponse.json();
      const locationsData = await locationsResponse.json();

      setDepartments(departmentsData.departments || []);
      setTeams(teamsData.teams || []);
      setDesignations(designationsData.designations || []);
      setLocations(locationsData.locations || []);

      setExpanded({ company: true });
    } catch (err) {
      console.error("ORGANIZATION LOAD ERROR:", err);
      setError("Could not load organization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const toggleNode = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getTeamsForDepartment = (department) => {
    return teams.filter(
      (team) =>
        team.department_id === department.id ||
        team.department_name === department.name
    );
  };

  const getDesignationsForTeam = (team) => {
    return designations.filter(
      (designation) =>
        designation.team_id === team.id ||
        designation.team_name === team.name
    );
  };

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
              Organization
            </p>

            <h1 className="mt-1 text-2xl font-black text-primary">
              Organization Structure
            </h1>

            <p className="mt-1 text-sm text-primary/60">
              View your company hierarchy, departments, teams and designations.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrganization}
            className="flex items-center gap-2 rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/[0.03]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Company"
            value="1"
            icon={Building2}
          />

          <SummaryCard
            label="Departments"
            value={departments.length}
            icon={Users}
          />

          <SummaryCard
            label="Teams"
            value={teams.length}
            icon={Users}
          />

          <SummaryCard
            label="Designations"
            value={designations.length}
            icon={BriefcaseBusiness}
          />
        </div>

        {/* Hierarchy */}
        <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">

          <div className="border-b border-primary/10 px-6 py-4">
            <h2 className="text-sm font-bold text-primary">
              Company Hierarchy
            </h2>

            <p className="mt-1 text-xs text-primary/50">
              Data is loaded directly from the organization database.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-primary/50">
              Loading organization...
            </div>
          ) : (
            <div className="p-6">

              {/* COMPANY */}
              <TreeRow
                id="company"
                name="INFINIQ"
                type="Company"
                icon={Building2}
                level={0}
                hasChildren={departments.length > 0}
                expanded={expanded}
                toggleNode={toggleNode}
              />

              {expanded.company &&
                departments.map((department) => {
                  const departmentTeams =
                    getTeamsForDepartment(department);

                  return (
                    <React.Fragment key={`department-${department.id}`}>

                      {/* DEPARTMENT */}
                      <TreeRow
                        id={`department-${department.id}`}
                        name={department.name}
                        type="Department"
                        icon={Users}
                        level={1}
                        hasChildren={departmentTeams.length > 0}
                        expanded={expanded}
                        toggleNode={toggleNode}
                      />

                      {/* TEAMS */}
                      {expanded[`department-${department.id}`] &&
                        departmentTeams.map((team) => {
                          const teamDesignations =
                            getDesignationsForTeam(team);

                          return (
                            <React.Fragment key={`team-${team.id}`}>

                              <TreeRow
                                id={`team-${team.id}`}
                                name={team.name}
                                type="Team"
                                icon={Users}
                                level={2}
                                hasChildren={teamDesignations.length > 0}
                                expanded={expanded}
                                toggleNode={toggleNode}
                              />

                              {/* DESIGNATIONS */}
                              {expanded[`team-${team.id}`] &&
                                teamDesignations.map((designation) => (
                                  <TreeRow
                                    key={`designation-${designation.id}`}
                                    id={`designation-${designation.id}`}
                                    name={designation.name}
                                    type="Designation"
                                    icon={BriefcaseBusiness}
                                    level={3}
                                    hasChildren={false}
                                    expanded={expanded}
                                    toggleNode={toggleNode}
                                  />
                                ))}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}

              {/* LOCATIONS */}
              {locations.length > 0 && (
                <>
                  <TreeRow
                    id="locations"
                    name="Locations"
                    type="Locations"
                    icon={MapPin}
                    level={1}
                    hasChildren={locations.length > 0}
                    expanded={expanded}
                    toggleNode={toggleNode}
                  />

                  {expanded.locations &&
                    locations.map((location) => (
                      <TreeRow
                        key={`location-${location.id}`}
                        id={`location-${location.id}`}
                        name={location.name}
                        type="Location"
                        icon={MapPin}
                        level={2}
                        hasChildren={false}
                        expanded={expanded}
                        toggleNode={toggleNode}
                      />
                    ))}
                </>
              )}

              {departments.length === 0 &&
                teams.length === 0 &&
                designations.length === 0 && (
                  <div className="py-8 text-center text-sm text-primary/50">
                    No organization data found.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* =========================
   TREE ROW
========================= */

function TreeRow({
  id,
  name,
  type,
  icon: Icon,
  level,
  hasChildren,
  expanded,
  toggleNode,
}) {
  const isExpanded = expanded[id];

  return (
    <div
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-primary/[0.03]"
      style={{
        marginLeft: `${level * 34}px`,
      }}
    >
      {/* Expand */}
      <button
        type="button"
        disabled={!hasChildren}
        onClick={() => hasChildren && toggleNode(id)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          hasChildren
            ? "text-primary/50 hover:bg-primary/10 hover:text-primary"
            : "text-transparent"
        }`}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronRight size={15} />
          )
        ) : (
          <span className="text-primary/30">•</span>
        )}
      </button>

      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
        <Icon size={17} />
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-primary">
          {name}
        </p>

        <p className="text-[11px] text-primary/45">
          {type}
        </p>
      </div>

      {/* Badge */}
      <span className="hidden rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary/60 sm:inline-flex">
        {type}
      </span>
    </div>
  );
}


/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary/40">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-primary">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
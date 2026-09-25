const filteredEmployees = useMemo(() => {
  const q = search.trim().toLowerCase();

  return employees.filter((e) => {
    const name = String(e.name ?? "").toLowerCase();
    const id = String(e.id ?? "").toLowerCase();
    const employeeId = String(e.employeeId ?? "").toLowerCase();
    const designation = String(e.designation ?? "").toLowerCase();
    const email = String(e.personal?.email ?? e.email ?? "").toLowerCase();
    const department = String(e.department ?? "").toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      id.includes(q) ||
      employeeId.includes(q) ||
      designation.includes(q) ||
      email.includes(q) ||
      department.includes(q);

    const matchesDepartment =
      !deptFilter || e.department === deptFilter;

    const matchesStatus =
      !statusFilter || e.status === statusFilter;

    const matchesType =
      !typeFilter || e.employmentType === typeFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesType
    );
  });
}, [employees, search, deptFilter, statusFilter, typeFilter]);
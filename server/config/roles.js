// Roles that can see and manage every employee, not just their own team
export const ALL_SCOPE_ROLES = ['hr_manager', 'hr_executive', 'founder_admin', 'super_admin'];

// Roles that can review (approve / reject) requests
export const REVIEWER_ROLES = ['manager', ...ALL_SCOPE_ROLES];
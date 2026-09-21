-- Managers / HR / Admin (manager_id illa)
INSERT INTO employees (employee_code, full_name, email, role, department, designation, joined_on) VALUES
  ('EMP001', 'Arun Kumar',  'arun@infiniq.test',   'manager',       'Design',     'Design Lead', '2024-01-15'),
  ('EMP002', 'Meena Rao',   'meena@infiniq.test',  'hr_manager',    'HR',         'HR Manager',  '2023-06-01'),
  ('EMP003', 'Karthik S',   'karthik@infiniq.test','founder_admin', 'Management', 'Founder',     '2022-01-01')
ON CONFLICT (email) DO NOTHING;

-- Design Team (manager = EMP001)
INSERT INTO employees (employee_code, full_name, email, role, department, designation, manager_id, joined_on) VALUES
  ('EMP004', 'Iniya',    'iniya@infiniq.test',    'employee', 'Design', 'UI/UX Designer',   (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2025-02-10'),
  ('EMP005', 'Deepika',  'deepika@infiniq.test',  'employee', 'Design', 'Developer',        (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2025-03-03'),
  ('EMP006', 'Divya',    'divya@infiniq.test',    'employee', 'Design', 'Marketing Intern', (SELECT id FROM employees WHERE employee_code = 'EMP001'), '2026-06-01')
ON CONFLICT (email) DO NOTHING;
import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import requireRole from '../middleware/requireRole.js';
import { ALL_SCOPE_ROLES, REVIEWER_ROLES } from '../config/roles.js';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  getOnboardingList,
  createOnboarding,
  updateOnboarding,
  getOffboardingList,
  createOffboarding,
  updateOffboarding,
  getHrServices,
  createHrService,
  updateHrService,
  getEmployeeRequests,
  createEmployeeRequest,
  addRequestReply,
  updateEmployeeRequest,
} from '../controllers/operations.controller.js';

const router = Router();

router.use(currentUser);

const hrOnly = requireRole(...ALL_SCOPE_ROLES);
const reviewers = requireRole(...REVIEWER_ROLES);

// 1. Employees
router.get('/employees', getEmployees);
router.post('/employees', hrOnly, createEmployee);
router.patch('/employees/:id', hrOnly, updateEmployee);

// 2. Onboarding
router.get('/onboarding', reviewers, getOnboardingList);
router.post('/onboarding', hrOnly, createOnboarding);
router.patch('/onboarding/:id', hrOnly, updateOnboarding);

// 3. Offboarding
router.get('/offboarding', reviewers, getOffboardingList);
router.post('/offboarding', reviewers, createOffboarding);
router.patch('/offboarding/:id', reviewers, updateOffboarding);

// 4. HR Services
router.get('/hr-services', getHrServices);
router.post('/hr-services', createHrService);
router.patch('/hr-services/:id', hrOnly, updateHrService);

// 5. Employee Requests
router.get('/requests', getEmployeeRequests);
router.post('/requests', createEmployeeRequest);
router.post('/requests/:id/reply', addRequestReply);
router.patch('/requests/:id', reviewers, updateEmployeeRequest);

export default router;

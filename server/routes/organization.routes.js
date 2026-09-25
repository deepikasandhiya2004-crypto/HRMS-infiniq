import express from "express";
import {
  getDepartments,
  createDepartment,
   getDesignations,
  createDesignation,
   getLocations,
  createLocation,
  getTeams,
createTeam,
getOrgStructure,
} from "../controllers/organization.controller.js";

const router = express.Router();

router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.get("/designations", getDesignations);
router.post("/designations", createDesignation);
router.get("/locations", getLocations);
router.post("/locations", createLocation);
router.get("/teams", getTeams);
router.post("/teams", createTeam);
router.get("/structure", getOrgStructure);

export default router;
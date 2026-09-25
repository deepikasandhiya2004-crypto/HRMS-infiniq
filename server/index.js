import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import attendanceRoutes from './routes/attendance.routes.js';
import teamRoutes from './routes/team.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import meRoutes from './routes/me.routes.js';
import authRoutes from './routes/auth.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import operationsRoutes from './routes/operations.routes.js';
import configurationRoutes from './routes/configuration.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import organizationRoutes from "./routes/organization.routes.js";
import auditRoutes from "./routes/audit.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);
app.use('/api/reports', reportsRoutes);
app.use("/api/audit", auditRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/me', meRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/configuration', configurationRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/audit-logs", auditRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import pool from '../db.js';
import leaveRoutes from '../routes/leave.routes.js';
import operationsRoutes from '../routes/operations.routes.js';
import configurationRoutes from '../routes/configuration.routes.js';

const app = express();
app.use(express.json());

app.use('/api/leave', leaveRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/configuration', configurationRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, status: 'PASS' });
      console.log(`PASS: ${name}`);
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
      console.error(`FAIL: ${name}: ${err.message}`);
    }
  }

  // 1. Leave Tracker Tests
  await test('Leave: GET /api/leave/types (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/types`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.types)) throw new Error('Expected data.types array');
  });

  await test('Leave: GET /api/leave/balances (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/balances`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.balances)) throw new Error('Expected data.balances array');
  });

  await test('Leave: GET /api/leave/my (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/my`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.leaves)) throw new Error('Expected data.leaves array');
  });

  await test('Leave: GET /api/leave/team (employee - expect 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/team`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('Leave: GET /api/leave/team (manager - expect 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/team`, {
      headers: { 'x-employee-id': '1' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.requests)) throw new Error('Expected data.requests array');
  });

  await test('Leave: GET /api/leave/calendar (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/leave/calendar`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.leaves)) throw new Error('Expected data.leaves array');
  });

  // 2. Operations Tests
  await test('Operations: GET /api/operations/employees (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/employees`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.employees)) throw new Error('Expected data.employees array');
  });

  await test('Operations: POST /api/operations/employees (employee - expect 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/employees`, {
      method: 'POST',
      headers: { 'x-employee-id': '4', 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Test' }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Operations: POST /api/operations/employees (HR - validation check on empty payload, expect 400)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/employees`, {
      method: 'POST',
      headers: { 'x-employee-id': '2', 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('Operations: GET /api/operations/onboarding (manager)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/onboarding`, {
      headers: { 'x-employee-id': '1' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.onboarding)) throw new Error('Expected data.onboarding array');
  });

  await test('Operations: GET /api/operations/offboarding (manager)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/offboarding`, {
      headers: { 'x-employee-id': '1' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.offboarding)) throw new Error('Expected data.offboarding array');
  });

  await test('Operations: GET /api/operations/hr-services (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/hr-services`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.services)) throw new Error('Expected data.services array');
  });

  await test('Operations: GET /api/operations/requests (employee)', async () => {
    const res = await fetch(`${baseUrl}/api/operations/requests`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.requests)) throw new Error('Expected data.requests array');
  });

  // 3. Configuration Tests
  await test('Configuration: GET /api/configuration/general (employee - unconfigured returns null)', async () => {
    const res = await fetch(`${baseUrl}/api/configuration/general`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.category !== 'general') throw new Error('Expected category "general"');
  });

  await test('Configuration: PUT /api/configuration/general (employee - expect 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/configuration/general`, {
      method: 'PUT',
      headers: { 'x-employee-id': '4', 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'test' }),
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Configuration: PUT /api/configuration/general (HR - update config)', async () => {
    const res = await fetch(`${baseUrl}/api/configuration/general`, {
      method: 'PUT',
      headers: { 'x-employee-id': '2', 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: 'Asia/Kolkata' }),
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.config?.timezone !== 'Asia/Kolkata') throw new Error('Failed to update config');
  });

  await test('Configuration: GET /api/configuration/general (employee - reads saved config)', async () => {
    const res = await fetch(`${baseUrl}/api/configuration/general`, {
      headers: { 'x-employee-id': '4' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.config?.timezone !== 'Asia/Kolkata') throw new Error('Expected timezone Asia/Kolkata');
  });

  console.log('\n--- Test Summary ---');
  const passed = results.filter((r) => r.status === 'PASS').length;
  console.log(`Passed: ${passed}/${results.length}`);
  if (passed === results.length) {
    console.log('ALL MEMBER 2 BACKEND TESTS PASSED SUCCESSFULLY!');
  }

  server.close();
  await pool.end();
  process.exit(passed === results.length ? 0 : 1);
});

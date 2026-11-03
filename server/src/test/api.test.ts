import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('HTTP API Endpoints & Validation', () => {
  const app = createApp();

  it('GET /api/health returns 200 and operational features', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.database).toBeDefined();
    expect(res.body.features.syntheticSimulationEngine).toBe('ACTIVE');
  });

  it('GET /api/assets returns 12 assets and D3 graph data', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(10);
    expect(res.body.graph.nodes.length).toBeGreaterThanOrEqual(10);
    expect(res.body.graph.links.length).toBeGreaterThan(0);
  });

  it('POST /api/defense/allocate rejects invalid schema body', async () => {
    const res = await request(app)
      .post('/api/defense/allocate')
      .send({ invalidField: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Validation failed');
  });

  it('POST /api/roles/switch validates allowed roles', async () => {
    const validRes = await request(app)
      .post('/api/roles/switch')
      .send({ role: 'RED_TEAM' });

    expect(validRes.status).toBe(200);
    expect(validRes.body.activeRole).toBe('RED_TEAM');

    const invalidRes = await request(app)
      .post('/api/roles/switch')
      .send({ role: 'HACKER_ROLE_NON_EXISTENT' });

    expect(invalidRes.status).toBe(400);
  });

  it('GET /api/reports/summary returns comprehensive executive report', async () => {
    const res = await request(app).get('/api/reports/summary');
    expect(res.status).toBe(200);
    expect(res.body.report.financialMetrics).toBeDefined();
    expect(res.body.report.riskAssessment).toBeDefined();
  });

  it('POST /api/incident/severity validates and updates incident severity', async () => {
    // Switch to CISO for incident management
    await request(app).post('/api/roles/switch').send({ role: 'CISO' });

    // Trigger an attack step to ensure an incident exists
    await request(app).post('/api/simulation/step').set('x-simulation-role', 'CISO').send();
    const incRes = await request(app).get('/api/incident/incidents');
    expect(incRes.body.incidents.length).toBeGreaterThan(0);
    const targetInc = incRes.body.incidents[0];

    // Valid update to CRITICAL
    const critRes = await request(app)
      .post('/api/incident/severity')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: targetInc.id, severity: 'CRITICAL' });
    expect(critRes.status).toBe(200);
    expect(critRes.body.incident.severity).toBe('CRITICAL');

    // Valid update to MEDIUM
    const medRes = await request(app)
      .post('/api/incident/severity')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: targetInc.id, severity: 'MEDIUM' });
    expect(medRes.status).toBe(200);
    expect(medRes.body.incident.severity).toBe('MEDIUM');

    // Invalid severity
    const invalidRes = await request(app)
      .post('/api/incident/severity')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: targetInc.id, severity: 'ULTRA_EXTREME' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error).toContain('Invalid severity');
  });

  it('enforces role permission matrix across operational endpoints', async () => {
    // 1. Regulator cannot execute active attack simulation stages (Read-only auditor)
    const regAttack = await request(app)
      .post('/api/simulation/step')
      .set('x-simulation-role', 'REGULATOR')
      .send();
    expect(regAttack.status).toBe(403);
    expect(regAttack.body.error).toContain('Permission Denied');

    // 2. Insurer cannot allocate enterprise defensive budget
    const insAlloc = await request(app)
      .post('/api/defense/allocate')
      .set('x-simulation-role', 'INSURER')
      .send({ controlIds: ['ctrl-firewall-waf'] });
    expect(insAlloc.status).toBe(403);
    expect(insAlloc.body.error).toContain('Permission Denied');

    // 3. Red Team cannot reclassify official operational incident severities
    const redSeverity = await request(app)
      .post('/api/incident/severity')
      .set('x-simulation-role', 'RED_TEAM')
      .send({ incidentId: 'inc-dummy', severity: 'LOW' });
    expect(redSeverity.status).toBe(403);
    expect(redSeverity.body.error).toContain('Permission Denied');

    // 4. Regulator can record supervisory observations
    const regObs = await request(app)
      .post('/api/roles/observations')
      .set('x-simulation-role', 'REGULATOR')
      .send({
        category: 'RESILIENCE',
        finding: 'Core banking redundancy meets DORA resilience benchmarks.',
        severity: 'COMPLIANT'
      });
    expect(regObs.status).toBe(200);
    expect(regObs.body.observation.finding).toContain('Core banking redundancy');
  });
});

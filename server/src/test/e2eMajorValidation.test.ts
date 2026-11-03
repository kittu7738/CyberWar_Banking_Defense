import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { ATTACK_SCENARIOS } from '../simulation/attacks.js';
import { NIST_IR_STAGES } from '../simulation/incidentResponse.js';

describe('Major E2E Full-Platform Verification Suite', () => {
  const app = createApp();

  it('1. Verifies system health, features, and in-memory architecture', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.features.syntheticSimulationEngine).toBe('ACTIVE');
    expect(res.body.features.d3NetworkTopology).toBe('SUPPORTED');
    expect(res.body.features.defenseKnapsackOptimizer).toBe('ACTIVE');
    expect(res.body.features.nistIncidentResponseEngine).toBe('ACTIVE');
    expect(res.body.features.systemicRiskAssessment).toBe('ACTIVE');
  });

  it('2. Verifies banking infrastructure and D3 network topology graph structure', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(12);
    expect(res.body.assets.length).toBe(12);
    expect(res.body.graph.nodes.length).toBe(12);
    expect(res.body.graph.links.length).toBeGreaterThanOrEqual(14);

    // Verify all assets have valid operational metadata
    for (const asset of res.body.assets) {
      expect(asset.id).toBeDefined();
      expect(asset.name).toBeDefined();
      expect(asset.tier).toBeDefined();
      expect(asset.criticality).toBeDefined();
      expect(asset.healthScore).toBeGreaterThanOrEqual(0);
      expect(asset.healthScore).toBeLessThanOrEqual(100);
      expect(asset.rtoHours).toBeGreaterThan(0);
      expect(asset.rpoHours).toBeGreaterThan(0);
      expect(asset.financialExposureEstimate).toBeGreaterThan(0);
    }
  });

  it('3. Verifies defense allocation, budget constraints, and knapsack optimization', async () => {
    // Switch to CISO for defense allocation
    await request(app).post('/api/roles/switch').send({ role: 'CISO' });

    // 3a. Get initial state
    const initialRes = await request(app).get('/api/simulation/state');
    expect(initialRes.status).toBe(200);
    const totalBudget = initialRes.body.state.budget.total;
    expect(totalBudget).toBe(1000000);

    // 3b. Optimize defense budget
    const optRes = await request(app)
      .post('/api/defense/optimize')
      .set('x-simulation-role', 'CISO')
      .send({ budget: 600000 });
    expect(optRes.status).toBe(200);
    expect(optRes.body.success).toBe(true);
    expect(optRes.body.optimization.totalCostUSD).toBeLessThanOrEqual(600000);
    expect(optRes.body.optimization.recommendedControlIds.length).toBeGreaterThan(0);

    // 3c. Allocate exact valid subset
    const validControls = ['ctrl-firewall-waf', 'ctrl-edr-xdr', 'ctrl-siem-soc'];
    const allocRes = await request(app)
      .post('/api/defense/allocate')
      .set('x-simulation-role', 'CISO')
      .send({ controlIds: validControls });
    expect(allocRes.status).toBe(200);
    expect(allocRes.body.success).toBe(true);
    expect(allocRes.body.budget.remaining).toBe(totalBudget - allocRes.body.budget.spent);

    // 3d. Reject budget overflow
    const allControlIds = initialRes.body.state.controls.map((c: any) => c.id);
    const overflowRes = await request(app)
      .post('/api/defense/allocate')
      .set('x-simulation-role', 'CISO')
      .send({ controlIds: allControlIds });
    expect(overflowRes.status).toBe(400);
    expect(overflowRes.body.error).toContain('exceeds available capital');
  });

  it('4. Runs synthetic attack scenarios wave-by-wave and verifies health invariants', async () => {
    // Switch to RED_TEAM role to execute attacks
    await request(app).post('/api/roles/switch').send({ role: 'RED_TEAM' });

    for (const scenario of ATTACK_SCENARIOS) {
      // Select scenario
      const selRes = await request(app)
        .post('/api/simulation/select-scenario')
        .set('x-simulation-role', 'RED_TEAM')
        .send({ scenarioId: scenario.id });
      expect(selRes.status).toBe(200);
      expect(selRes.body.scenario.id).toBe(scenario.id);

      // Execute all stages for this scenario
      for (let s = 0; s < scenario.stages.length; s++) {
        const stepRes = await request(app)
          .post('/api/simulation/step')
          .set('x-simulation-role', 'RED_TEAM')
          .send();
        expect(stepRes.status).toBe(200);
        expect(stepRes.body.event).toBeDefined();
        expect(stepRes.body.event.targetAssetId).toBeDefined();

        // INVARIANT CHECK: No asset with 0% health may remain DEGRADED or HEALTHY
        const stateRes = await request(app).get('/api/simulation/state');
        for (const asset of stateRes.body.state.assets) {
          if (asset.healthScore === 0) {
            expect(asset.operationalStatus).not.toBe('DEGRADED');
            expect(asset.operationalStatus).not.toBe('HEALTHY');
            expect(['COMPROMISED', 'OFFLINE']).toContain(asset.operationalStatus);
          }
        }
      }
    }
  });

  it('5. Verifies incident response lifecycle: severity selection, acknowledge, contain, recover', async () => {
    // Switch to CISO for incident triage
    await request(app).post('/api/roles/switch').send({ role: 'CISO' });

    const incListRes = await request(app).get('/api/incident/incidents');
    expect(incListRes.status).toBe(200);
    expect(incListRes.body.incidents.length).toBeGreaterThan(0);

    const testIncident = incListRes.body.incidents[0];

    // 5a. Test all 4 severity levels directly on the incident
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
    for (const sev of severities) {
      const updateRes = await request(app)
        .post('/api/incident/severity')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: testIncident.id, severity: sev });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.incident.severity).toBe(sev);
      expect(updateRes.body.state.overallRiskScore).toBeGreaterThan(0);
    }

    // 5b. Acknowledge incident
    const ackRes = await request(app)
      .post('/api/incident/acknowledge')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: testIncident.id });
    expect(ackRes.status).toBe(200);
    expect(ackRes.body.incident.status).toBe('ACKNOWLEDGED');

    // 5c. Contain incident
    const containRes = await request(app)
      .post('/api/incident/contain')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: testIncident.id });
    expect(containRes.status).toBe(200);
    expect(containRes.body.incident.status).toBe('CONTAINED');
    expect(containRes.body.incident.containedAt).toBeDefined();

    // 5d. Recover incident
    const recRes = await request(app)
      .post('/api/incident/recover')
      .set('x-simulation-role', 'CISO')
      .send({ incidentId: testIncident.id });
    expect(recRes.status).toBe(200);
    expect(recRes.body.incident.status).toBe('RECOVERED');
    expect(recRes.body.incident.recoveredAt).toBeDefined();
  });

  it('6. Verifies NIST IR drill execution through all 5 stages', async () => {
    for (let stageNum = 1; stageNum <= NIST_IR_STAGES.length; stageNum++) {
      const stageConfig = NIST_IR_STAGES[stageNum - 1];
      const recommendedOption = stageConfig.options.find(o => o.pointsAwarded > 0) || stageConfig.options[0];

      const irRes = await request(app)
        .post('/api/incident/decision')
        .send({
          stageNumber: stageNum,
          optionId: recommendedOption.id
        });

      expect(irRes.status).toBe(200);
      expect(irRes.body.evaluation).toBeDefined();
      expect(irRes.body.scorecard).toBeDefined();
      expect(irRes.body.irProgress.completedStages).toContain(stageNum);
    }

    // Final drill progress
    const finalState = await request(app).get('/api/simulation/state');
    expect(finalState.body.state.irProgress.isFinished).toBe(true);
    expect(finalState.body.state.irProgress.totalScore).toBeGreaterThan(0);
  });

  it('7. Verifies multi-role perspectives, observations, reports and exports', async () => {
    // 7a. Regulator submits supervisory observation
    const obsRes = await request(app)
      .post('/api/roles/observations')
      .set('x-simulation-role', 'REGULATOR')
      .send({
        category: 'GOVERNANCE',
        finding: 'Periodic automated recovery drill executed with acceptable RTO.',
        severity: 'COMPLIANT'
      });
    expect(obsRes.status).toBe(200);
    expect(obsRes.body.observation.id).toBeDefined();

    // 7b. Retrieve observations
    const getObsRes = await request(app).get('/api/roles/observations');
    expect(getObsRes.status).toBe(200);
    expect(getObsRes.body.observations.length).toBeGreaterThan(0);

    // 7c. Reports summary
    const repRes = await request(app).get('/api/reports/summary');
    expect(repRes.status).toBe(200);
    expect(repRes.body.report.financialMetrics.budgetTotalUSD).toBe(1000000);
    expect(repRes.body.report.riskAssessment.overallRiskScore).toBeGreaterThan(0);
    expect(repRes.body.report.executiveLessonsLearned.length).toBeGreaterThan(0);

    // 7d. JSON and CSV report downloads
    const jsonExp = await request(app).get('/api/reports/export/json');
    expect(jsonExp.status).toBe(200);
    expect(jsonExp.headers['content-type']).toContain('application/json');

    const csvExp = await request(app).get('/api/reports/export/csv');
    expect(csvExp.status).toBe(200);
    expect(csvExp.headers['content-type']).toContain('text/csv');
  });

  it('8. Verifies multi-round progression, audit history preservation, and clean reset', async () => {
    // Advance round
    const advRes = await request(app)
      .post('/api/simulation/advance-round')
      .set('x-simulation-role', 'CISO')
      .send();
    expect(advRes.status).toBe(200);
    expect(advRes.body.roundSummary.roundNumber).toBe(1);
    expect(advRes.body.nextRoundNumber).toBe(2);

    // Reset simulation
    const resetRes = await request(app)
      .post('/api/simulation/reset')
      .set('x-simulation-role', 'CISO')
      .send({ budget: 1000000 });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.state.currentRound).toBe(1);
    expect(resetRes.body.state.budget.total).toBe(1000000);
    expect(resetRes.body.state.roundsHistory.length).toBeGreaterThan(0);
  });
});

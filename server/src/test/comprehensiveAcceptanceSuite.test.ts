import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { ATTACK_SCENARIOS } from '../simulation/attacks.js';
import { INITIAL_BANKING_ASSETS } from '../simulation/assets.js';
import { INITIAL_DEFENSIVE_CONTROLS } from '../simulation/defenseControls.js';
import { NIST_IR_STAGES } from '../simulation/incidentResponse.js';

describe('Autonomous Comprehensive Acceptance & Invariant Test Suite', () => {
  const app = createApp();

  beforeEach(async () => {
    // Reset simulation to clean baseline before each test
    await request(app).post('/api/roles/switch').send({ role: 'CISO' });
    await request(app).post('/api/simulation/full-reset').set('x-simulation-role', 'CISO').send();
  });

  describe('A. Application, Navigation & Health', () => {
    it('verifies server health check and architectural feature flags', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toContain('Cyberwar Banking Defense');
      expect(res.body.features.syntheticSimulationEngine).toBe('ACTIVE');
      expect(res.body.features.d3NetworkTopology).toBe('SUPPORTED');
      expect(res.body.features.defenseKnapsackOptimizer).toBe('ACTIVE');
      expect(res.body.features.nistIncidentResponseEngine).toBe('ACTIVE');
      expect(res.body.features.systemicRiskAssessment).toBe('ACTIVE');
    });

    it('rejects invalid routes with standard 404', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      expect(res.status).toBe(404);
    });
  });

  describe('B. Five Role Perspectives & RBAC Enforcement', () => {
    it('validates switching to all 5 allowed roles and rejects invalid roles', async () => {
      const validRoles = ['CISO', 'RED_TEAM', 'REGULATOR', 'INSURER', 'INFRA_OFFICER'] as const;
      for (const role of validRoles) {
        const res = await request(app).post('/api/roles/switch').send({ role });
        expect(res.status).toBe(200);
        expect(res.body.activeRole).toBe(role);
        expect(res.body.activeRoleDetails.role).toBe(role);
      }

      const invalidRes = await request(app).post('/api/roles/switch').send({ role: 'SUPER_ADMIN' });
      expect(invalidRes.status).toBe(400);
    });

    it('enforces RBAC matrix: unauthorized actions return 403 Forbidden', async () => {
      // 1. REGULATOR cannot trigger attack simulation steps
      const regAttack = await request(app)
        .post('/api/simulation/step')
        .set('x-simulation-role', 'REGULATOR')
        .send();
      expect(regAttack.status).toBe(403);
      expect(regAttack.body.error).toContain('Permission Denied');

      // 2. INSURER cannot allocate enterprise security budget
      const insAlloc = await request(app)
        .post('/api/defense/allocate')
        .set('x-simulation-role', 'INSURER')
        .send({ controlIds: ['ctrl-firewall-waf'] });
      expect(insAlloc.status).toBe(403);
      expect(insAlloc.body.error).toContain('Permission Denied');

      // 3. RED_TEAM cannot reclassify official incident severities
      const redSev = await request(app)
        .post('/api/incident/severity')
        .set('x-simulation-role', 'RED_TEAM')
        .send({ incidentId: 'inc-test', severity: 'LOW' });
      expect(redSev.status).toBe(403);
      expect(redSev.body.error).toContain('Permission Denied');

      // 4. RED_TEAM cannot execute AI knapsack defense optimization
      const redOpt = await request(app)
        .post('/api/defense/optimize')
        .set('x-simulation-role', 'RED_TEAM')
        .send({ budget: 500000 });
      expect(redOpt.status).toBe(403);

      // 5. REGULATOR cannot reset simulation campaigns
      const regReset = await request(app)
        .post('/api/simulation/reset')
        .set('x-simulation-role', 'REGULATOR')
        .send({ budget: 1000000 });
      expect(regReset.status).toBe(403);

      // 6. REGULATOR is permitted to submit supervisory observation
      const regObs = await request(app)
        .post('/api/roles/observations')
        .set('x-simulation-role', 'REGULATOR')
        .send({
          category: 'RESILIENCE',
          finding: 'Core ledger RTO verified within DORA compliance standards.',
          severity: 'COMPLIANT'
        });
      expect(regObs.status).toBe(200);
      expect(regObs.body.observation.finding).toContain('Core ledger RTO');
    });
  });

  describe('C. Attack Simulation & All 6 Scenarios', () => {
    it('rejects invalid scenario IDs with 400', async () => {
      const res = await request(app)
        .post('/api/simulation/select-scenario')
        .set('x-simulation-role', 'RED_TEAM')
        .send({ scenarioId: 'non-existent-attack-vector' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('not found');
    });

    it('executes each of the 6 cyberwar scenarios wave-by-wave and maintains health invariants', async () => {
      for (const scenario of ATTACK_SCENARIOS) {
        // Reset state for clean scenario run
        await request(app).post('/api/simulation/full-reset').set('x-simulation-role', 'CISO').send();

        // Select scenario
        const selRes = await request(app)
          .post('/api/simulation/select-scenario')
          .set('x-simulation-role', 'RED_TEAM')
          .send({ scenarioId: scenario.id });
        expect(selRes.status).toBe(200);
        expect(selRes.body.scenario.id).toBe(scenario.id);

        let initialExposure = 0;
        for (let step = 0; step < scenario.stages.length; step++) {
          const stepRes = await request(app)
            .post('/api/simulation/step')
            .set('x-simulation-role', 'RED_TEAM')
            .send();
          expect(stepRes.status).toBe(200);
          expect(stepRes.body.event).toBeDefined();
          expect(stepRes.body.event.targetAssetId).toBeDefined();

          // Invariant Check: 0% health must be COMPROMISED or OFFLINE, never DEGRADED or HEALTHY
          for (const asset of stepRes.body.state.assets) {
            if (asset.healthScore === 0) {
              expect(asset.operationalStatus).not.toBe('DEGRADED');
              expect(asset.operationalStatus).not.toBe('HEALTHY');
              expect(['COMPROMISED', 'OFFLINE']).toContain(asset.operationalStatus);
            }
          }
        }

        // Stepping after all stages completed does not create duplicate events in timeline
        const completedRes = await request(app)
          .post('/api/simulation/step')
          .set('x-simulation-role', 'RED_TEAM')
          .send();
        expect(completedRes.status).toBe(200);
        expect(completedRes.body.completed).toBe(true);

        const stateRes = await request(app).get('/api/simulation/state');
        // Total logged events should not exceed stage count
        expect(stateRes.body.state.eventsLog.length).toBeLessThanOrEqual(scenario.stages.length);
      }
    });

    it('demonstrates defensive efficacy: deploying controls significantly reduces financial damage', async () => {
      // 1. Run DDoS unmitigated
      await request(app).post('/api/simulation/select-scenario').set('x-simulation-role', 'RED_TEAM').send({ scenarioId: 'ddos-surge' });
      const unmitigatedStep1 = await request(app).post('/api/simulation/step').set('x-simulation-role', 'RED_TEAM').send();
      const unmitigatedLoss = unmitigatedStep1.body.event.financialImpactUSD;

      // 2. Reset and deploy Anti-DDoS WAF
      await request(app).post('/api/simulation/full-reset').set('x-simulation-role', 'CISO').send();
      await request(app).post('/api/defense/allocate').set('x-simulation-role', 'CISO').send({ controlIds: ['ctrl-firewall-waf'] });
      await request(app).post('/api/simulation/select-scenario').set('x-simulation-role', 'RED_TEAM').send({ scenarioId: 'ddos-surge' });
      const mitigatedStep1 = await request(app).post('/api/simulation/step').set('x-simulation-role', 'RED_TEAM').send();
      const mitigatedLoss = mitigatedStep1.body.event.financialImpactUSD;

      expect(mitigatedLoss).toBeLessThan(unmitigatedLoss);
      expect(mitigatedStep1.body.event.mitigationSucceeded).toBe(true);
    });
  });

  describe('D. Defense Allocation & Knapsack Optimization', () => {
    it('tracks budget correctly on selection, prevents exceeding $1,000,000, and evaluates ROI', async () => {
      const stateRes = await request(app).get('/api/simulation/state');
      const totalBudget = stateRes.body.state.budget.total;
      expect(totalBudget).toBe(1000000);

      // Select valid controls
      const selected = ['ctrl-firewall-waf', 'ctrl-edr-xdr', 'ctrl-siem-soc'];
      const allocRes = await request(app)
        .post('/api/defense/allocate')
        .set('x-simulation-role', 'CISO')
        .send({ controlIds: selected });
      expect(allocRes.status).toBe(200);
      expect(allocRes.body.success).toBe(true);
      expect(allocRes.body.budget.spent).toBe(120000 + 140000 + 160000); // 420,000
      expect(allocRes.body.budget.remaining).toBe(580000);

      // Deselect (allocate empty set)
      const clearRes = await request(app)
        .post('/api/defense/allocate')
        .set('x-simulation-role', 'CISO')
        .send({ controlIds: [] });
      expect(clearRes.status).toBe(200);
      expect(clearRes.body.budget.spent).toBe(0);
      expect(clearRes.body.budget.remaining).toBe(1000000);

      // Reject overflow
      const allIds = INITIAL_DEFENSIVE_CONTROLS.map(c => c.id);
      const overflowRes = await request(app)
        .post('/api/defense/allocate')
        .set('x-simulation-role', 'CISO')
        .send({ controlIds: allIds });
      expect(overflowRes.status).toBe(400);
      expect(overflowRes.body.error).toContain('exceeds available capital');
    });

    it('executes knapsack optimization within custom budget cap', async () => {
      const optRes = await request(app)
        .post('/api/defense/optimize')
        .set('x-simulation-role', 'CISO')
        .send({ budget: 500000 });
      expect(optRes.status).toBe(200);
      expect(optRes.body.success).toBe(true);
      expect(optRes.body.optimization.totalCostUSD).toBeLessThanOrEqual(500000);
      expect(optRes.body.optimization.recommendedControlIds.length).toBeGreaterThan(0);
      expect(optRes.body.optimization.riskReductionScore).toBeGreaterThan(0);
    });
  });

  describe('E. Incident Response Lifecycle & NIST 5-Stage Drill', () => {
    it('manages incident lifecycle: severity reclassification, acknowledge, contain, recover', async () => {
      // Trigger attack to generate incident
      await request(app).post('/api/simulation/select-scenario').set('x-simulation-role', 'RED_TEAM').send({ scenarioId: 'ransomware-lateral' });
      await request(app).post('/api/simulation/step').set('x-simulation-role', 'RED_TEAM').send();

      const incRes = await request(app).get('/api/incident/incidents');
      expect(incRes.body.incidents.length).toBeGreaterThan(0);
      const inc = incRes.body.incidents[0];

      // Severity update
      const sevRes = await request(app)
        .post('/api/incident/severity')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: inc.id, severity: 'CRITICAL' });
      expect(sevRes.status).toBe(200);
      expect(sevRes.body.incident.severity).toBe('CRITICAL');

      // Acknowledge
      const ackRes = await request(app)
        .post('/api/incident/acknowledge')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: inc.id });
      expect(ackRes.status).toBe(200);
      expect(ackRes.body.incident.status).toBe('ACKNOWLEDGED');

      // Contain
      const containRes = await request(app)
        .post('/api/incident/contain')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: inc.id });
      expect(containRes.status).toBe(200);
      expect(containRes.body.incident.status).toBe('CONTAINED');

      // Recover
      const recRes = await request(app)
        .post('/api/incident/recover')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: inc.id });
      expect(recRes.status).toBe(200);
      expect(recRes.body.incident.status).toBe('RECOVERED');

      // Invalid recovery attempt
      const invalidRec = await request(app)
        .post('/api/incident/recover')
        .set('x-simulation-role', 'CISO')
        .send({ incidentId: 'non-existent-inc-999' });
      expect(invalidRec.status).toBe(400);
    });

    it('completes all 5 stages of the NIST incident response drill and evaluates scorecard', async () => {
      for (let s = 1; s <= NIST_IR_STAGES.length; s++) {
        const stage = NIST_IR_STAGES[s - 1];
        const bestOption = stage.options.find(o => o.pointsAwarded > 0) || stage.options[0];

        const drillRes = await request(app)
          .post('/api/incident/decision')
          .send({ stageNumber: s, optionId: bestOption.id });
        expect(drillRes.status).toBe(200);
        expect(drillRes.body.evaluation).toBeDefined();
        expect(drillRes.body.irProgress.completedStages).toContain(s);
      }

      const scoreRes = await request(app).get('/api/incident/scorecard');
      expect(scoreRes.status).toBe(200);
      expect(scoreRes.body.scorecard.totalScore).toBeGreaterThan(0);
      expect(scoreRes.body.scorecard.stageResults.length).toBe(NIST_IR_STAGES.length);
    });
  });

  describe('F. Banking Infrastructure & Network Topology Invariants', () => {
    it('verifies all 12 assets and checks dependency graph cross-reference consistency', async () => {
      const res = await request(app).get('/api/assets');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(12);

      const assetIds = new Set(res.body.assets.map((a: any) => a.id));
      for (const link of res.body.graph.links) {
        expect(assetIds.has(link.source)).toBe(true);
        expect(assetIds.has(link.target)).toBe(true);
      }
    });
  });

  describe('G. Risk Analysis, Reporting & File Exports', () => {
    it('generates executive report with correct metrics and provides valid JSON and CSV downloads', async () => {
      const summaryRes = await request(app).get('/api/reports/summary');
      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.report.financialMetrics.budgetTotalUSD).toBe(1000000);
      expect(summaryRes.body.report.riskAssessment.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(summaryRes.body.report.riskAssessment.overallRiskScore).toBeLessThanOrEqual(100);

      // JSON export
      const jsonRes = await request(app).get('/api/reports/export/json');
      expect(jsonRes.status).toBe(200);
      expect(jsonRes.headers['content-type']).toContain('application/json');
      expect(jsonRes.body.exportVersion).toBe('1.0');
      expect(jsonRes.body.sessionState).toBeDefined();

      // CSV export
      const csvRes = await request(app).get('/api/reports/export/csv');
      expect(csvRes.status).toBe(200);
      expect(csvRes.headers['content-type']).toContain('text/csv');
      expect(csvRes.text).toContain('Round,Step,Timestamp,Scenario,TargetAsset,Severity');
    });

    it('advances multi-round session, saves round audit history, and resets cleanly', async () => {
      // Step simulation to generate round data
      const selRes = await request(app).post('/api/simulation/select-scenario').set('x-simulation-role', 'RED_TEAM').send({ scenarioId: 'supply-chain-compromise' });
      expect(selRes.status).toBe(200);
      expect(selRes.body.scenario.id).toBe('supply-chain-compromise');
      await request(app).post('/api/simulation/step').set('x-simulation-role', 'RED_TEAM').send();

      // Advance round
      const advRes = await request(app).post('/api/simulation/advance-round').set('x-simulation-role', 'CISO').send();
      expect(advRes.status).toBe(200);
      expect(advRes.body.roundSummary.roundNumber).toBe(1);
      expect(advRes.body.nextRoundNumber).toBe(2);

      // Verify round summary stored
      const stateRes = await request(app).get('/api/simulation/state');
      expect(stateRes.body.state.roundsHistory.length).toBeGreaterThanOrEqual(1);
      const latestRound = stateRes.body.state.roundsHistory[stateRes.body.state.roundsHistory.length - 1];
      expect(latestRound.scenarioId).toBe('supply-chain-compromise');

      // Reset preserves audit history
      const prevCount = stateRes.body.state.roundsHistory.length;
      const resetRes = await request(app).post('/api/simulation/reset').set('x-simulation-role', 'CISO').send({ budget: 1000000 });
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.state.currentRound).toBe(1);
      expect(resetRes.body.state.roundsHistory.length).toBe(prevCount);
    });
  });
});

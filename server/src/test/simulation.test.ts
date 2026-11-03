import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationManager } from '../simulation/simulationManager.js';
import { ATTACK_SCENARIOS } from '../simulation/attacks.js';

describe('SimulationManager Engine', () => {
  let sim: SimulationManager;

  beforeEach(() => {
    sim = new SimulationManager(1000000);
  });

  it('initializes with healthy assets, 6 scenarios, and 0 events', () => {
    const state = sim.getState();
    expect(state.assets.length).toBeGreaterThanOrEqual(10);
    expect(state.operationalHealth).toBe(100);
    expect(state.currentRound).toBe(1);
    expect(state.eventsLog.length).toBe(0);
    expect(state.incidents.length).toBe(0);
    expect(state.budget.total).toBe(1000000);
    expect(ATTACK_SCENARIOS.length).toBe(6);
    const vectors = ATTACK_SCENARIOS.map(s => s.vector);
    expect(vectors).toContain('DDOS');
    expect(vectors).toContain('RANSOMWARE');
    expect(vectors).toContain('DATA_BREACH');
    expect(vectors).toContain('INSIDER_THREAT');
    expect(vectors).toContain('SUPPLY_CHAIN');
    expect(vectors).toContain('INFRASTRUCTURE_DISRUPTION');
  });

  it('enforces budget limits during defense allocation', () => {
    const allControlIds = sim.getState().controls.map(c => c.id);
    const allocResult = sim.allocateBudget(allControlIds);

    expect(allocResult.success).toBe(false);
    expect(allocResult.error).toContain('exceeds available capital');

    const validSubset = ['ctrl-firewall-waf', 'ctrl-network-segmentation'];
    const validResult = sim.allocateBudget(validSubset);
    expect(validResult.success).toBe(true);
    expect(validResult.spent).toBe(270000);
    expect(validResult.remaining).toBe(730000);
  });

  it('steps through deterministic attack stages and records events', () => {
    sim.selectScenario('ddos-surge');

    const step1 = sim.stepSimulation();
    expect(step1.completed).toBe(false);
    expect(step1.stageIndex).toBe(1);
    expect(step1.event.targetAssetId).toBe('asset-online-banking');
    expect(sim.getState().eventsLog.length).toBe(1);

    const step2 = sim.stepSimulation();
    expect(step2.stageIndex).toBe(2);
    expect(sim.getState().eventsLog.length).toBe(2);
  });

  it('creates incidents and supports acknowledge, contain, and recover lifecycle', () => {
    sim.selectScenario('ransomware-lateral');
    sim.stepSimulation();

    const incidents = sim.getState().incidents;
    expect(incidents.length).toBeGreaterThan(0);
    const incId = incidents[0].id;

    // Acknowledge
    const acked = sim.acknowledgeIncident(incId);
    expect(acked.status).toBe('ACKNOWLEDGED');

    // Contain
    const contained = sim.containIncident(incId);
    expect(contained.status).toBe('CONTAINED');
    expect(contained.containedAt).toBeDefined();

    // Recover
    const recovered = sim.recoverIncident(incId);
    expect(recovered.status).toBe('RECOVERED');
    expect(recovered.recoveredAt).toBeDefined();
  });

  it('advances round, preserves history, and transitions scenario', () => {
    sim.selectScenario('supply-chain-compromise');
    sim.stepSimulation();
    sim.stepSimulation();

    const advanceResult = sim.advanceRound();
    expect(advanceResult.roundSummary.roundNumber).toBe(1);
    expect(advanceResult.nextRoundNumber).toBe(2);
    expect(sim.getState().roundsHistory.length).toBe(1);
    expect(sim.getState().currentRound).toBe(2);
  });

  it('resets simulation while preserving rounds history audit trail', () => {
    sim.stepSimulation();
    sim.advanceRound();
    expect(sim.getState().roundsHistory.length).toBe(1);

    sim.resetSimulation(1000000);
    const state = sim.getState();
    expect(state.currentRound).toBe(1);
    expect(state.eventsLog.length).toBe(0);
    expect(state.roundsHistory.length).toBe(1);
  });

  it('updates incident severity individually and dynamically recalculates systemic risk', () => {
    sim.selectScenario('ddos-surge');
    sim.stepSimulation(); // Creates incident 1
    sim.stepSimulation(); // Creates incident 2

    const incidents = sim.getState().incidents;
    expect(incidents.length).toBeGreaterThanOrEqual(2);
    const inc1 = incidents[0];
    const inc2 = incidents[1];

    // Change inc1 to CRITICAL
    const initialRisk = sim.getState().overallRiskScore;
    const updatedInc1 = sim.updateIncidentSeverity(inc1.id, 'CRITICAL');
    expect(updatedInc1.severity).toBe('CRITICAL');
    expect(sim.getState().incidents.find(i => i.id === inc1.id)?.severity).toBe('CRITICAL');

    // inc2 severity must remain untouched
    expect(sim.getState().incidents.find(i => i.id === inc2.id)?.severity).toBe(inc2.severity);

    // Downgrade inc1 to LOW
    sim.updateIncidentSeverity(inc1.id, 'LOW');
    expect(sim.getState().incidents.find(i => i.id === inc1.id)?.severity).toBe('LOW');

    // Acknowledging and containing must preserve the selected severity
    sim.acknowledgeIncident(inc1.id);
    expect(sim.getState().incidents.find(i => i.id === inc1.id)?.severity).toBe('LOW');

    sim.containIncident(inc1.id);
    expect(sim.getState().incidents.find(i => i.id === inc1.id)?.severity).toBe('LOW');
  });

  it('guarantees that 0% asset health transitions to COMPROMISED or OFFLINE, never staying DEGRADED', () => {
    // Select scenario and simulate unmitigated waves until asset health reaches 0%
    const onlineBanking = sim.getState().assets.find(a => a.id === 'asset-online-banking');
    expect(onlineBanking).toBeDefined();

    // Artificially reduce health to 0% with status DEGRADED to test invariant enforcement
    if (onlineBanking) {
      onlineBanking.healthScore = 0;
      onlineBanking.operationalStatus = 'DEGRADED';
    }

    // Step simulation or trigger recalculation
    sim.stepSimulation();

    // Verify online banking is COMPROMISED or OFFLINE, never DEGRADED at 0% health
    const updatedAsset = sim.getState().assets.find(a => a.id === 'asset-online-banking');
    expect(updatedAsset?.healthScore).toBe(0);
    expect(updatedAsset?.operationalStatus).not.toBe('DEGRADED');
    expect(['COMPROMISED', 'OFFLINE']).toContain(updatedAsset?.operationalStatus);

    // Verify containIncident restores non-zero baseline health when transitioning to DEGRADED
    const inc = sim.getState().incidents.find(i => i.affectedAssetId === 'asset-online-banking');
    if (inc) {
      sim.containIncident(inc.id);
      const containedAsset = sim.getState().assets.find(a => a.id === 'asset-online-banking');
      if (containedAsset?.operationalStatus === 'DEGRADED') {
        expect(containedAsset.healthScore).toBeGreaterThan(0);
      }
    }
  });
});

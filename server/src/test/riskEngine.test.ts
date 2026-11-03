import { describe, it, expect } from 'vitest';
import { RiskEngine } from '../simulation/riskEngine.js';
import { INITIAL_BANKING_ASSETS } from '../simulation/assets.js';
import { INITIAL_DEFENSIVE_CONTROLS } from '../simulation/defenseControls.js';

describe('RiskEngine & Propagation Model', () => {
  it('calculates systemic cyber risk score and valid risk level', () => {
    const assessment = RiskEngine.assessSystemicRisk(INITIAL_BANKING_ASSETS, []);

    expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(0);
    expect(assessment.overallRiskScore).toBeLessThanOrEqual(100);
    expect(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).toContain(assessment.riskLevel);
    expect(assessment.scoringMethodology.formula).toBeDefined();
    expect(assessment.illustrativeFinancialExposure.disclaimer).toContain('DISCLAIMER');
  });

  it('reduces propagation risk when network segmentation is active', () => {
    const withoutControls = RiskEngine.assessSystemicRisk(INITIAL_BANKING_ASSETS, []);
    const segmentationCtrl = INITIAL_DEFENSIVE_CONTROLS.filter(c => c.id === 'ctrl-network-segmentation');
    const withSegmentation = RiskEngine.assessSystemicRisk(INITIAL_BANKING_ASSETS, segmentationCtrl);

    expect(withSegmentation.overallRiskScore).toBeLessThan(withoutControls.overallRiskScore);
    expect(withSegmentation.concentrationRiskScore).toBeLessThan(withoutControls.concentrationRiskScore);
  });

  it('calculates blast radius reachability via BFS dependency traversal', () => {
    const blastRadius = RiskEngine.calculateBlastRadius('asset-online-banking', INITIAL_BANKING_ASSETS);
    expect(blastRadius).toContain('asset-online-banking');
    expect(blastRadius.length).toBeGreaterThanOrEqual(1);
  });

  it('identifies single points of failure in banking infrastructure', () => {
    const assessment = RiskEngine.assessSystemicRisk(INITIAL_BANKING_ASSETS, []);
    const spofs = assessment.concentrationNodes.filter(n => n.isSinglePointOfFailure);

    expect(spofs.length).toBeGreaterThan(0);
    const spofIds = spofs.map(s => s.assetId);
    expect(spofIds).toContain('asset-core-banking');
  });
});

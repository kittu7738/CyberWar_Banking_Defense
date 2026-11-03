import { describe, it, expect } from 'vitest';
import { DefenseOptimizer } from '../simulation/defenseOptimizer.js';
import { INITIAL_DEFENSIVE_CONTROLS } from '../simulation/defenseControls.js';
import { INITIAL_BANKING_ASSETS } from '../simulation/assets.js';

describe('DefenseOptimizer Algorithm', () => {
  it('calculates diminishing vector mitigation with multi-layer controls', () => {
    const controls = INITIAL_DEFENSIVE_CONTROLS.filter(c =>
      ['ctrl-firewall-waf', 'ctrl-siem-soc'].includes(c.id)
    );
    const mitigation = DefenseOptimizer.calculateVectorMitigation(controls);

    expect(mitigation.DDOS).toBeGreaterThan(0.8);
    expect(mitigation.DDOS).toBeLessThanOrEqual(0.95);
    expect(mitigation.RANSOMWARE).toBeGreaterThan(0);
  });

  it('computes systemic coverage percentage based on asset criticality', () => {
    const activeControls = INITIAL_DEFENSIVE_CONTROLS.slice(0, 3);
    const coverage = DefenseOptimizer.calculateAssetCoverage(activeControls, INITIAL_BANKING_ASSETS);

    expect(coverage).toBeGreaterThan(0);
    expect(coverage).toBeLessThanOrEqual(100);
  });

  it('runs greedy knapsack optimization within budget limit', () => {
    const budget = 500000;
    const result = DefenseOptimizer.optimizeAllocation(
      INITIAL_DEFENSIVE_CONTROLS,
      budget,
      INITIAL_BANKING_ASSETS
    );

    expect(result.totalCostUSD).toBeLessThanOrEqual(budget);
    expect(result.remainingBudgetUSD).toBeGreaterThanOrEqual(0);
    expect(result.recommendedControlIds.length).toBeGreaterThan(0);
    expect(result.residualRiskScore).toBeLessThan(result.initialRiskScore);
    expect(result.riskReductionScore).toBeGreaterThan(0);
    expect(result.algorithmDescription.name).toContain('Knapsack');
  });

  it('detects over-budget allocations when evaluating user selection', () => {
    // Select all controls which sum up to ~1.2M with a 300k budget
    const allIds = INITIAL_DEFENSIVE_CONTROLS.map(c => c.id);
    const smallBudget = 200000;

    const evaluation = DefenseOptimizer.evaluateUserAllocation(
      allIds,
      INITIAL_DEFENSIVE_CONTROLS,
      smallBudget,
      INITIAL_BANKING_ASSETS
    );

    expect(evaluation.isOverBudget).toBe(true);
    expect(evaluation.remainingBudgetUSD).toBeLessThan(0);
  });
});

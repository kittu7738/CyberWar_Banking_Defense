import { BankingAsset, DefensiveControl, AttackVector, CriticalityLevel } from '../types/index.js';

export interface OptimizationResult {
  recommendedControlIds: string[];
  totalCostUSD: number;
  budgetUSD: number;
  remainingBudgetUSD: number;
  budgetUtilizationPercent: number;
  riskReductionScore: number; // 0 to 100
  initialRiskScore: number;
  residualRiskScore: number;
  coveragePercent: number;
  vectorMitigationScores: Record<AttackVector, number>;
  selectedControlsSummary: {
    id: string;
    name: string;
    cost: number;
    marginalUtility: number;
    roiScore: number;
    reason: string;
  }[];
  algorithmDescription: {
    name: string;
    formulation: string;
    assumptions: string[];
    timeComplexity: string;
  };
}

const CRITICALITY_WEIGHTS: Record<CriticalityLevel, number> = {
  CRITICAL: 3.5,
  HIGH: 2.2,
  MODERATE: 1.4,
  LOW: 1.0
};

const VECTOR_BASE_WEIGHTS: Record<AttackVector, number> = {
  RANSOMWARE: 0.25,
  DATA_BREACH: 0.23,
  DDOS: 0.16,
  SUPPLY_CHAIN: 0.14,
  INSIDER_THREAT: 0.12,
  INFRASTRUCTURE_DISRUPTION: 0.10
};

export class DefenseOptimizer {
  /**
   * Calculates overall aggregate mitigation across attack vectors given a set of active controls.
   * Uses a probabilistic multi-layer defense model: Mitigated_Risk = 1 - product(1 - 0.82 * effectiveness)
   * to account for overlapping controls and diminishing returns.
   */
  public static calculateVectorMitigation(
    activeControls: DefensiveControl[]
  ): Record<AttackVector, number> {
    const vectors: AttackVector[] = [
      'DDOS',
      'RANSOMWARE',
      'DATA_BREACH',
      'INSIDER_THREAT',
      'SUPPLY_CHAIN',
      'INFRASTRUCTURE_DISRUPTION'
    ];

    const result: Record<AttackVector, number> = {
      DDOS: 0,
      RANSOMWARE: 0,
      DATA_BREACH: 0,
      INSIDER_THREAT: 0,
      SUPPLY_CHAIN: 0,
      INFRASTRUCTURE_DISRUPTION: 0
    };

    const INDEPENDENCE_FACTOR = 0.82; // Accounting for realistic control correlation / common mode failure

    for (const vector of vectors) {
      let unmitigatedFraction = 1.0;
      for (const ctrl of activeControls) {
        const eff = ctrl.effectiveness[vector] || 0;
        if (eff > 0) {
          unmitigatedFraction *= (1 - eff * INDEPENDENCE_FACTOR);
        }
      }
      // Residual protection capped at 95% (never 100% zero risk in cybersecurity)
      const mitigation = Math.min(0.95, 1.0 - unmitigatedFraction);
      result[vector] = Math.round(mitigation * 100) / 100;
    }

    return result;
  }

  /**
   * Calculates the systemic coverage percentage across all banking assets
   */
  public static calculateAssetCoverage(
    activeControls: DefensiveControl[],
    assets: BankingAsset[]
  ): number {
    if (assets.length === 0 || activeControls.length === 0) return 0;

    let totalCriticalityPoints = 0;
    let coveredCriticalityPoints = 0;

    for (const asset of assets) {
      const weight = CRITICALITY_WEIGHTS[asset.criticality] || 1.0;
      totalCriticalityPoints += weight;

      // Check if any active control applies to this asset type
      const applicableControls = activeControls.filter(c =>
        c.eligibleAssetTypes.includes(asset.type)
      );

      if (applicableControls.length > 0) {
        // Partial or full coverage depending on control depth
        const depthFactor = Math.min(1.0, applicableControls.length / 3);
        coveredCriticalityPoints += weight * depthFactor;
      }
    }

    return Math.round((coveredCriticalityPoints / totalCriticalityPoints) * 100);
  }

  /**
   * Calculates systemic risk score (0 - 100) based on active controls and assets
   */
  public static computeSystemRiskScore(
    activeControls: DefensiveControl[],
    assets: BankingAsset[]
  ): number {
    const vectorMitigations = this.calculateVectorMitigation(activeControls);

    // Weighted average across vectors
    let weightedMitigation = 0;
    for (const [vector, weight] of Object.entries(VECTOR_BASE_WEIGHTS)) {
      weightedMitigation += (vectorMitigations[vector as AttackVector] || 0) * weight;
    }

    // Base vulnerability average across critical assets
    let totalVuln = 0;
    let totalWeight = 0;
    for (const asset of assets) {
      const w = CRITICALITY_WEIGHTS[asset.criticality];
      totalVuln += asset.vulnerabilityLevel * w;
      totalWeight += w;
    }
    const avgWeightedVuln = totalWeight > 0 ? totalVuln / totalWeight : 40;

    // Base risk without defenses: calibrated to typical enterprise baseline 75/100
    const baselineRisk = Math.min(95, Math.max(30, avgWeightedVuln * 1.6));

    // Residual risk after multi-layer mitigation
    const residualRisk = Math.max(12, baselineRisk * (1 - weightedMitigation * 0.85));

    return Math.round(residualRisk * 10) / 10;
  }

  /**
   * Budget-constrained Greedy Knapsack Optimization with Diminishing Returns
   */
  public static optimizeAllocation(
    availableControls: DefensiveControl[],
    budgetUSD: number,
    assets: BankingAsset[]
  ): OptimizationResult {
    const baselineRisk = this.computeSystemRiskScore([], assets);

    let currentBudgetRemaining = budgetUSD;
    const selectedControls: DefensiveControl[] = [];
    const controlSummary: OptimizationResult['selectedControlsSummary'] = [];

    // Iterative greedy selection: at each step, pick the control with highest Marginal ROI
    const candidatePool = [...availableControls];

    while (candidatePool.length > 0) {
      let bestCandidateIndex = -1;
      let highestRoi = -1;
      let bestMarginalUtility = 0;

      for (let i = 0; i < candidatePool.length; i++) {
        const candidate = candidatePool[i];

        if (candidate.cost <= currentBudgetRemaining) {
          // Compute marginal risk reduction if we were to add this candidate
          const hypotheticalSet = [...selectedControls, candidate];
          const riskBefore = this.computeSystemRiskScore(selectedControls, assets);
          const riskAfter = this.computeSystemRiskScore(hypotheticalSet, assets);
          const marginalReduction = Math.max(0.1, riskBefore - riskAfter);

          // Return on Investment per $10k spent
          const roi = (marginalReduction / candidate.cost) * 10000;

          if (roi > highestRoi) {
            highestRoi = roi;
            bestCandidateIndex = i;
            bestMarginalUtility = marginalReduction;
          }
        }
      }

      if (bestCandidateIndex !== -1 && highestRoi > 0) {
        const chosen = candidatePool.splice(bestCandidateIndex, 1)[0];
        selectedControls.push(chosen);
        currentBudgetRemaining -= chosen.cost;

        controlSummary.push({
          id: chosen.id,
          name: chosen.name,
          cost: chosen.cost,
          marginalUtility: Math.round(bestMarginalUtility * 100) / 100,
          roiScore: Math.round(highestRoi * 100) / 100,
          reason: `High risk deflection against critical vectors with favorable cost-to-protection ratio ($${chosen.cost.toLocaleString()}).`
        });
      } else {
        // No affordable candidate can be added within remaining budget
        break;
      }
    }

    const residualRisk = this.computeSystemRiskScore(selectedControls, assets);
    const riskReduction = Math.round((baselineRisk - residualRisk) * 10) / 10;
    const totalCost = budgetUSD - currentBudgetRemaining;
    const vectorMitigations = this.calculateVectorMitigation(selectedControls);
    const coverage = this.calculateAssetCoverage(selectedControls, assets);

    return {
      recommendedControlIds: selectedControls.map(c => c.id),
      totalCostUSD: totalCost,
      budgetUSD,
      remainingBudgetUSD: currentBudgetRemaining,
      budgetUtilizationPercent: Math.round((totalCost / budgetUSD) * 100),
      initialRiskScore: baselineRisk,
      residualRiskScore: residualRisk,
      riskReductionScore: riskReduction,
      coveragePercent: coverage,
      vectorMitigationScores: vectorMitigations,
      selectedControlsSummary: controlSummary,
      algorithmDescription: {
        name: 'Marginal Submodular Knapsack Optimization (Greedy Heuristic with Diminishing Returns)',
        formulation: 'Maximize R(S) = BaselineRisk - ResidualRisk(S) subject to Sum(Cost(c_i)) <= Budget, using multi-layer probabilistic defense model: P(Breach) = Prod(1 - 0.82 * eff(c, v)).',
        assumptions: [
          'Budget is strictly finite and non-fungible across quarters.',
          'Controls exhibit submodular diminishing marginal returns when stacked against identical attack vectors.',
          'Asset criticality weights scale exponentially: Critical (3.5x), High (2.2x), Moderate (1.4x), Low (1.0x).',
          'Cyber insurance provides financial risk transfer and regulatory defense but does not eliminate operational downtime.'
        ],
        timeComplexity: 'O(k * n) where n is candidate controls and k is budget capacity steps.'
      }
    };
  }

  /**
   * Evaluates a user-selected arbitrary set of controls against budget and calculates outcome metrics
   */
  public static evaluateUserAllocation(
    selectedControlIds: string[],
    allControls: DefensiveControl[],
    budgetUSD: number,
    assets: BankingAsset[]
  ) {
    const activeControls = allControls.filter(c => selectedControlIds.includes(c.id));
    const totalCost = activeControls.reduce((sum, c) => sum + c.cost, 0);
    const remaining = budgetUSD - totalCost;
    const isOverBudget = remaining < 0;

    const initialRisk = this.computeSystemRiskScore([], assets);
    const residualRisk = this.computeSystemRiskScore(activeControls, assets);
    const riskReduction = Math.round((initialRisk - residualRisk) * 10) / 10;
    const coverage = this.calculateAssetCoverage(activeControls, assets);
    const vectorMitigations = this.calculateVectorMitigation(activeControls);

    return {
      selectedControlIds,
      totalCostUSD: totalCost,
      budgetUSD,
      remainingBudgetUSD: remaining,
      isOverBudget,
      initialRiskScore: initialRisk,
      residualRiskScore: residualRisk,
      riskReductionScore: riskReduction,
      coveragePercent: coverage,
      vectorMitigationScores: vectorMitigations,
      controlsCount: activeControls.length
    };
  }
}

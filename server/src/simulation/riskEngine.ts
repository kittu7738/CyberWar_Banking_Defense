import { BankingAsset, DefensiveControl, RiskLevel, Incident } from '../types/index.js';

export interface PropagationPath {
  sourceAssetId: string;
  targetAssetId: string;
  sourceName: string;
  targetName: string;
  propagationRisk: number; // 0 to 100
  mitigatingControls: string[];
  vulnerabilityFactor: number;
}

export interface ConcentrationRiskNode {
  assetId: string;
  assetName: string;
  criticality: string;
  dependentCount: number;
  dependencyCount: number;
  centralityScore: number; // 0 to 100
  isSinglePointOfFailure: boolean;
  cascadingImpactScore: number;
}

export interface SystemicRiskAssessment {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  resilienceScore: number; // 0 to 100
  concentrationRiskScore: number; // 0 to 100
  thirdPartyDependencyRiskScore: number; // 0 to 100
  blastRadiusAverage: number; // Average number of assets compromised in cascade
  propagationPaths: PropagationPath[];
  concentrationNodes: ConcentrationRiskNode[];
  criticalPath: string[];
  illustrativeFinancialExposure: {
    potentialDailyLossUSD: number;
    businessInterruptionEstimateUSD: number;
    regulatoryFineExposureUSD: number;
    totalIllustrativeExposureUSD: number;
    disclaimer: string;
  };
  scoringMethodology: {
    formula: string;
    description: string;
    parameters: Record<string, string>;
  };
}

export class RiskEngine {
  /**
   * Evaluates the systemic cyber risk across all interconnected banking assets
   */
  public static assessSystemicRisk(
    assets: BankingAsset[],
    activeControls: DefensiveControl[],
    incidents: Incident[] = []
  ): SystemicRiskAssessment {
    const assetMap = new Map<string, BankingAsset>();
    for (const a of assets) {
      assetMap.set(a.id, a);
    }

    const hasSegmentation = activeControls.some(c => c.id === 'ctrl-network-segmentation');
    const hasEDR = activeControls.some(c => c.id === 'ctrl-edr-xdr');
    const hasPAM = activeControls.some(c => c.id === 'ctrl-pam-vault');
    const hasFirewall = activeControls.some(c => c.id === 'ctrl-firewall-waf');
    const hasBackups = activeControls.some(c => c.id === 'ctrl-backup-recovery');

    // 1. Analyze Propagation Paths and Cascading Blast Radius
    const propagationPaths: PropagationPath[] = [];
    const concentrationNodes: ConcentrationRiskNode[] = [];

    let totalReachability = 0;

    for (const asset of assets) {
      const dependents = asset.dependents || [];
      const dependencies = asset.dependencies || [];

      // Degree centrality calculation
      const centralityScore = Math.min(
        100,
        Math.round(((dependents.length * 2 + dependencies.length) / (assets.length * 1.5)) * 100)
      );

      const isSPOF = (dependents.length >= 3 && asset.criticality === 'CRITICAL') ||
        (asset.type === 'CORE_BANKING' || asset.type === 'IDENTITY');

      const cascadingImpact = Math.round(
        (asset.criticality === 'CRITICAL' ? 40 : asset.criticality === 'HIGH' ? 25 : 10) +
        dependents.length * 15
      );

      concentrationNodes.push({
        assetId: asset.id,
        assetName: asset.name,
        criticality: asset.criticality,
        dependentCount: dependents.length,
        dependencyCount: dependencies.length,
        centralityScore,
        isSinglePointOfFailure: isSPOF,
        cascadingImpactScore: Math.min(100, cascadingImpact)
      });

      // Blast radius traversal
      const reachable = this.calculateBlastRadius(asset.id, assets);
      totalReachability += reachable.length;

      // Direct propagation paths to dependents
      for (const depId of dependents) {
        const depAsset = assetMap.get(depId);
        if (depAsset) {
          let attenuation = 1.0;
          const mitigating: string[] = [];

          if (hasSegmentation) {
            attenuation *= 0.45;
            mitigating.push('Zero-Trust Network Segmentation');
          }
          if (hasEDR) {
            attenuation *= 0.65;
            mitigating.push('Endpoint Detection & Response');
          }
          if (hasPAM && (asset.tier === 'DATA_SECURE' || depAsset.tier === 'DATA_SECURE')) {
            attenuation *= 0.60;
            mitigating.push('Privileged Access Management');
          }

          // Crossing DMZ to internal tier requires higher traversal effort
          if (asset.tier === 'DMZ' && depAsset.tier !== 'DMZ') {
            if (hasFirewall) {
              attenuation *= 0.50;
              mitigating.push('Next-Gen Edge Firewall');
            }
          }

          const rawPropagationRisk = Math.round(
            ((asset.vulnerabilityLevel + depAsset.vulnerabilityLevel) / 2) * attenuation
          );

          propagationPaths.push({
            sourceAssetId: asset.id,
            targetAssetId: depAsset.id,
            sourceName: asset.name,
            targetName: depAsset.name,
            propagationRisk: Math.min(95, Math.max(5, rawPropagationRisk)),
            mitigatingControls: mitigating,
            vulnerabilityFactor: Math.round((depAsset.vulnerabilityLevel / 100) * 10) / 10
          });
        }
      }
    }

    // Sort concentration nodes by centrality
    concentrationNodes.sort((a, b) => b.centralityScore - a.centralityScore);

    // 2. Concentration Risk Score
    const spofCount = concentrationNodes.filter(n => n.isSinglePointOfFailure).length;
    const avgCentrality = concentrationNodes.reduce((acc, n) => acc + n.centralityScore, 0) / concentrationNodes.length;
    let concentrationRiskScore = Math.min(98, Math.round(avgCentrality * 0.8 + spofCount * 12));
    if (hasSegmentation) concentrationRiskScore = Math.max(20, Math.round(concentrationRiskScore * 0.72));

    // 3. Third-Party Dependency Risk
    const thirdPartyAssets = assets.filter(a => a.tier === 'THIRD_PARTY' || a.type === 'THIRD_PARTY_SERVICE');
    let thirdPartyRisk = 50;
    if (thirdPartyAssets.length > 0) {
      const avgThirdPartyVuln = thirdPartyAssets.reduce((sum, a) => sum + a.vulnerabilityLevel, 0) / thirdPartyAssets.length;
      thirdPartyRisk = Math.min(95, Math.round(avgThirdPartyVuln * 1.5));
    }
    if (hasBackups) thirdPartyRisk = Math.max(15, Math.round(thirdPartyRisk * 0.65));

    // 4. Overall Cyber Risk Score
    // Formula: OverallRisk = 0.35 * AvgVuln + 0.25 * ConcentrationRisk + 0.20 * ThirdPartyRisk + 0.20 * StatusDegradation
    const avgVuln = assets.reduce((sum, a) => sum + a.vulnerabilityLevel, 0) / assets.length;
    
    // Status degradation factor
    const degradedAssets = assets.filter(a => a.operationalStatus !== 'HEALTHY');
    const degradationScore = Math.min(100, (degradedAssets.length / assets.length) * 100 * 1.8);

    const rawOverallRisk = (
      0.30 * avgVuln +
      0.25 * concentrationRiskScore +
      0.15 * thirdPartyRisk +
      0.30 * (degradationScore > 0 ? degradationScore : avgVuln * 0.9)
    );

    // Active Incidents Impact: severity weighting of active incidents
    let incidentRiskWeight = 0;
    for (const inc of incidents) {
      if (inc.status === 'RECOVERED') continue;
      const isContained = inc.status === 'CONTAINED';
      const factor = isContained ? 0.35 : 1.0;
      const sev = inc.severity;
      if (sev === 'CRITICAL') incidentRiskWeight += 6 * factor;
      else if (sev === 'HIGH') incidentRiskWeight += 4 * factor;
      else if (sev === 'MEDIUM' || (sev as string) === 'MODERATE') incidentRiskWeight += 2 * factor;
      else if (sev === 'LOW') incidentRiskWeight += 1 * factor;
    }
    const incidentRiskPenalty = Math.min(25, Math.round(incidentRiskWeight));

    // Apply control dampening
    const controlDampener = Math.min(0.60, activeControls.length * 0.06);
    const overallRiskScore = Math.min(99, Math.max(10, Math.round(rawOverallRisk * (1 - controlDampener) + incidentRiskPenalty)));

    const riskLevel: RiskLevel = 
      overallRiskScore >= 75 ? 'CRITICAL' :
      overallRiskScore >= 50 ? 'HIGH' :
      overallRiskScore >= 25 ? 'MODERATE' : 'LOW';

    // 5. Resilience Score (Inverse of Risk adjusted for recovery capabilities)
    const backupMultiplier = hasBackups ? 1.3 : 0.8;
    const resilienceScore = Math.min(100, Math.max(10, Math.round((100 - overallRiskScore * 0.85) * backupMultiplier * 0.95)));

    // 6. Critical Path: High-value chain from DMZ entry to Core Banking ledger
    const criticalPath = [
      'asset-online-banking',
      'asset-internal-api',
      'asset-core-banking',
      'asset-customer-db',
      'asset-settlement-swift'
    ];

    // 7. Illustrative Financial Exposure Calculations
    const baselineExposure = assets.reduce((sum, a) => sum + a.financialExposureEstimate, 0);
    const riskFactor = overallRiskScore / 100;

    const potentialDailyLossUSD = Math.round((baselineExposure * 0.04) * riskFactor);
    const businessInterruptionEstimateUSD = Math.round((baselineExposure * 0.08) * riskFactor);
    const regulatoryFineExposureUSD = Math.round((baselineExposure * 0.05) * (riskLevel === 'CRITICAL' ? 1.0 : riskLevel === 'HIGH' ? 0.5 : 0.15));
    const totalIllustrativeExposureUSD = potentialDailyLossUSD + businessInterruptionEstimateUSD + regulatoryFineExposureUSD;

    return {
      overallRiskScore,
      riskLevel,
      resilienceScore,
      concentrationRiskScore,
      thirdPartyDependencyRiskScore: thirdPartyRisk,
      blastRadiusAverage: Math.round((totalReachability / assets.length) * 10) / 10,
      propagationPaths,
      concentrationNodes,
      criticalPath,
      illustrativeFinancialExposure: {
        potentialDailyLossUSD,
        businessInterruptionEstimateUSD,
        regulatoryFineExposureUSD,
        totalIllustrativeExposureUSD,
        disclaimer: 'DISCLAIMER: Financial exposure metrics are synthetic, deterministic model estimates derived from asset criticality weights and risk coefficients for educational simulation purposes. They do not constitute actual real-world actuarial or financial forecasts.'
      },
      scoringMethodology: {
        formula: 'OverallRisk = (0.30 * AvgVuln + 0.25 * ConcentrationRisk + 0.15 * ThirdPartyRisk + 0.30 * StatusDegradation) * (1 - ControlDampener)',
        description: 'Multi-tiered graph-theoretic cyber resilience assessment integrating node vulnerability, dependency topology, single-points-of-failure, and multi-layer mitigation depth.',
        parameters: {
          'AvgVuln': 'Weighted mean of endpoint CVE vulnerabilities across critical banking assets (0-100)',
          'ConcentrationRisk': 'Centrality and single-point-of-failure (SPOF) exposure within interconnected microservices',
          'ThirdPartyRisk': 'Upstream dependency on cloud SaaS payment processors and external clearinghouses',
          'ControlDampener': 'Cumulative risk attenuation provided by active defense-in-depth controls (up to 60%)'
        }
      }
    };
  }

  /**
   * BFS blast radius calculator from a source asset
   */
  public static calculateBlastRadius(startAssetId: string, assets: BankingAsset[]): string[] {
    const assetMap = new Map(assets.map(a => [a.id, a]));
    const visited = new Set<string>();
    const queue: string[] = [startAssetId];

    visited.add(startAssetId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const asset = assetMap.get(currentId);
      if (asset) {
        for (const depId of asset.dependents) {
          if (!visited.has(depId)) {
            visited.add(depId);
            queue.push(depId);
          }
        }
      }
    }

    return Array.from(visited);
  }
}

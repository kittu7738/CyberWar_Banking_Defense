export type RiskLevel = 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type OperationalStatus = 'HEALTHY' | 'DEGRADED' | 'COMPROMISED' | 'OFFLINE' | 'RECOVERING';

export type AssetType = 
  | 'APPLICATION' 
  | 'CORE_BANKING' 
  | 'DATABASE' 
  | 'GATEWAY' 
  | 'IDENTITY' 
  | 'FRAUD_SYSTEM' 
  | 'ATM_NETWORK' 
  | 'BACKUP_SYSTEM' 
  | 'THIRD_PARTY_SERVICE'
  | 'SETTLEMENT';

export type CriticalityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface BankingAsset {
  id: string;
  name: string;
  type: AssetType;
  criticality: CriticalityLevel;
  vulnerabilityLevel: number; // 0 to 100
  operationalStatus: OperationalStatus;
  healthScore: number; // 0 to 100
  ipSubnet: string;
  tier: 'EXTERNAL' | 'DMZ' | 'APPLICATION' | 'DATA_SECURE' | 'THIRD_PARTY';
  description: string;
  dependencies: string[];
  dependents: string[];
  appliedControls: string[];
  financialExposureEstimate: number;
  rtoHours: number;
  rpoHours: number;
  currentThreatExposure: number;
}

export type AttackVector = 
  | 'DDOS' 
  | 'RANSOMWARE' 
  | 'DATA_BREACH' 
  | 'INSIDER_THREAT' 
  | 'SUPPLY_CHAIN'
  | 'INFRASTRUCTURE_DISRUPTION';

export interface DefensiveControl {
  id: string;
  name: string;
  category: 'PERIMETER' | 'IDENTITY' | 'ENDPOINT' | 'DATA' | 'GOVERNANCE' | 'RESILIENCE' | 'RISK_TRANSFER';
  cost: number;
  description: string;
  eligibleAssetTypes: AssetType[];
  effectiveness: Record<AttackVector, number>; // Mitigation percentage (0.0 to 1.0)
  limitations: string;
  operationalOverhead: string;
  mitigationFormula: string;
  active: boolean;
}

export interface AttackStage {
  step: number;
  timeOffset: string;
  phase: string;
  targetAssetId: string;
  secondaryAssetIds?: string[];
  action: string;
  relevantControlIds: string[];
  unmitigatedImpact: {
    status: OperationalStatus;
    healthDrop: number;
    financialLoss: number;
    dataExposedRecords?: number;
  };
  mitigatedImpact: {
    status: OperationalStatus;
    healthDrop: number;
    financialLoss: number;
    dataExposedRecords?: number;
  };
  mitigationThreshold: number;
}

export interface AttackScenario {
  id: string;
  name: string;
  vector: AttackVector;
  threatActor: string;
  severity: RiskLevel;
  objective: string;
  narrative: string;
  initialTargetAssetId: string;
  cascadingPotential: string;
  regulatoryImpact: string;
  stages: AttackStage[];
}

export interface SimulationEvent {
  id: string;
  roundNumber: number;
  step: number;
  timestamp: string;
  scenarioId: string;
  targetAssetId: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  title: string;
  narrative: string;
  defensesEvaluated: {
    controlId: string;
    controlName: string;
    effectivenessContribution: number;
    active: boolean;
  }[];
  mitigationSucceeded: boolean;
  totalMitigationRate: number;
  resultingStatus: OperationalStatus;
  healthDelta: number;
  financialImpactUSD: number;
  lessonsLearned: string;
}

export interface Incident {
  id: string;
  title: string;
  scenarioId: string;
  affectedAssetId: string;
  affectedAssetName: string;
  severity: RiskLevel;
  status: 'DETECTED' | 'ACKNOWLEDGED' | 'CONTAINED' | 'RECOVERED';
  evidence: string;
  detectedAt: string;
  containedAt?: string;
  recoveredAt?: string;
  mitigatedByControls: string[];
}

export interface IRDecisionOption {
  id: string;
  text: string;
  rationale: string;
  operationalImpact: string;
  rtoImpactHours: number;
  riskReductionScore: number;
  financialCostUSD: number;
  compliancePenaltyUSD: number;
  pointsAwarded: number;
  feedback: string;
}

export interface IRDecisionStage {
  stageNumber: number;
  stageName: 'Preparation' | 'Detection and Analysis' | 'Containment' | 'Eradication' | 'Recovery' | 'Post-Incident Review';
  context: string;
  promptQuestion: string;
  options: IRDecisionOption[];
}

export interface IRScorecard {
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalFinancialCostUSD: number;
  totalCompliancePenaltiesUSD: number;
  netRtoDeltaHours: number;
  netRiskReduction: number;
  stageResults: {
    stageNumber: number;
    stageName: string;
    chosenOptionId: string;
    chosenOptionText: string;
    points: number;
    feedback: string;
  }[];
  cisoExecutiveSummary: string;
}

export interface SupervisoryObservation {
  id: string;
  timestamp: string;
  examinerName: string;
  category: 'GOVERNANCE' | 'RESILIENCE' | 'INCIDENT_RESPONSE' | 'CAPITAL_ADEQUACY' | 'THIRD_PARTY';
  finding: string;
  severity: 'MATTER_REQUIRING_ATTENTION' | 'RECOMMENDATION' | 'DEFICIENCY' | 'COMPLIANT';
  actionRequired: string;
  status: 'OPEN' | 'IN_REVIEW' | 'REMEDIATED';
}

export interface UserRoleInfo {
  role: 'CISO' | 'RED_TEAM' | 'REGULATOR' | 'INSURER' | 'INFRA_OFFICER';
  title: string;
  viewFocus: string;
  keyMetrics: string[];
  permissions: string[];
  scoringPriorities: string;
}

export interface RoundSummary {
  roundNumber: number;
  scenarioId: string;
  scenarioName: string;
  vector: AttackVector;
  timestamp: string;
  initialRisk: number;
  residualRisk: number;
  budgetAllocatedUSD: number;
  operationalHealthEnd: number;
  financialDamageUSD: number;
  eventsCount: number;
  defensesEffectiveCount: number;
  defensesBypassedCount: number;
  irScore: number;
  keyTakeaway: string;
}

export interface SimulationState {
  sessionId: string;
  currentRound: number;
  maxRounds: number;
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  assets: BankingAsset[];
  controls: DefensiveControl[];
  activeScenario: AttackScenario | null;
  currentStageIndex: number;
  eventsLog: SimulationEvent[];
  incidents: Incident[];
  roundsHistory: RoundSummary[];
  irProgress: {
    scenarioId: string | null;
    currentStageNumber: number;
    completedStages: number[];
    decisionsMade: {
      stageNumber: number;
      chosenOptionId: string;
      score: number;
    }[];
    totalScore: number;
    isFinished: boolean;
  };
  operationalHealth: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  businessContinuityStatus: 'NORMAL' | 'DEGRADED_OPERATIONS' | 'FAILOVER_ACTIVE' | 'CRITICAL_DISRUPTION';
  activeRole: 'CISO' | 'RED_TEAM' | 'REGULATOR' | 'INSURER' | 'INFRA_OFFICER';
  supervisoryObservations: SupervisoryObservation[];
}

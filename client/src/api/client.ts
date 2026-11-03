import { 
  SimulationState, 
  BankingAsset, 
  DefensiveControl, 
  AttackScenario, 
  SimulationEvent, 
  Incident,
  RoundSummary, 
  IRDecisionStage, 
  IRScorecard, 
  SystemicRiskAssessment, 
  UserRoleInfo,
  RiskLevel
} from '../types/index.js';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const currentRole = localStorage.getItem('cyberwar_user_role') || 'CISO';
  const headers = {
    'Content-Type': 'application/json',
    'X-Simulation-Role': currentRole,
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; version: string; database: any }>('/health'),

  // Assets
  getAssets: () => request<{ success: boolean; count: number; assets: BankingAsset[]; graph: { nodes: any[]; links: any[] } }>('/assets'),
  getAsset: (id: string) => request<{ success: boolean; asset: BankingAsset; appliedControls: DefensiveControl[]; dependents: any[]; dependencies: any[] }>(`/assets/${id}`),

  // Simulation State & Controls
  getState: () => request<{ success: boolean; state: SimulationState }>('/simulation/state'),
  getScenarios: () => request<{ success: boolean; scenarios: AttackScenario[] }>('/simulation/scenarios'),
  selectScenario: (scenarioId: string) => request<{ success: boolean; scenario: AttackScenario; state: SimulationState }>('/simulation/select-scenario', {
    method: 'POST',
    body: JSON.stringify({ scenarioId })
  }),
  stepSimulation: () => request<{ success: boolean; event: SimulationEvent; completed: boolean; stageIndex: number; totalStages: number; state: SimulationState }>('/simulation/step', {
    method: 'POST'
  }),
  advanceRound: () => request<{ success: boolean; roundSummary: RoundSummary; nextRoundNumber: number; isSessionComplete: boolean; state: SimulationState }>('/simulation/advance-round', {
    method: 'POST'
  }),
  resetSimulation: (budget?: number) => request<{ success: boolean; message: string; state: SimulationState }>('/simulation/reset', {
    method: 'POST',
    body: JSON.stringify({ budget })
  }),
  fullReset: () => request<{ success: boolean; message: string; state: SimulationState }>('/simulation/full-reset', {
    method: 'POST'
  }),

  // Defense
  getDefenseControls: () => request<{ success: boolean; budget: any; controls: DefensiveControl[] }>('/defense/controls'),
  allocateDefense: (controlIds: string[]) => request<{ success: boolean; budget: any; evaluation: any; overallRiskScore: number }>('/defense/allocate', {
    method: 'POST',
    body: JSON.stringify({ controlIds })
  }),
  optimizeDefense: (budget?: number) => request<{ success: boolean; optimization: any }>('/defense/optimize', {
    method: 'POST',
    body: JSON.stringify({ budget })
  }),
  evaluateDefense: (controlIds: string[]) => request<{ success: boolean; evaluation: any }>('/defense/evaluate', {
    method: 'POST',
    body: JSON.stringify({ controlIds })
  }),

  // Incidents
  getIncidents: () => request<{ success: boolean; count: number; incidents: Incident[] }>('/incident/incidents'),
  acknowledgeIncident: (incidentId: string) => request<{ success: boolean; incident: Incident; state: SimulationState }>('/incident/acknowledge', {
    method: 'POST',
    body: JSON.stringify({ incidentId })
  }),
  containIncident: (incidentId: string) => request<{ success: boolean; incident: Incident; state: SimulationState }>('/incident/contain', {
    method: 'POST',
    body: JSON.stringify({ incidentId })
  }),
  recoverIncident: (incidentId: string) => request<{ success: boolean; incident: Incident; state: SimulationState }>('/incident/recover', {
    method: 'POST',
    body: JSON.stringify({ incidentId })
  }),
  updateIncidentSeverity: (incidentId: string, severity: RiskLevel) => request<{ success: boolean; incident: Incident; state: SimulationState }>('/incident/severity', {
    method: 'POST',
    body: JSON.stringify({ incidentId, severity })
  }),

  // Incident Response (NIST Drill)
  getIRStages: () => request<{ success: boolean; stages: IRDecisionStage[]; progress: any }>('/incident/stages'),
  submitIRDecision: (stageNumber: number, optionId: string) => request<{ success: boolean; evaluation: any; scorecard: IRScorecard; irProgress: any }>('/incident/decision', {
    method: 'POST',
    body: JSON.stringify({ stageNumber, optionId })
  }),
  getIRScorecard: () => request<{ success: boolean; scorecard: IRScorecard; progress: any }>('/incident/scorecard'),
  resetIR: () => request<{ success: boolean; message: string; progress: any }>('/incident/reset', {
    method: 'POST'
  }),

  // Systemic Risk
  getSystemicRisk: () => request<{ success: boolean; assessment: SystemicRiskAssessment; activeControlsCount: number; degradedAssetsCount: number }>('/risk/systemic'),
  getCriticalPath: () => request<{ success: boolean; criticalPath: string[]; concentrationNodes: any[]; spofCount: number }>('/risk/critical-path'),

  // Reports
  getReportSummary: () => request<{ success: boolean; report: any }>('/reports/summary'),
  getExportJsonUrl: () => `${BASE_URL}/reports/export/json`,
  getExportCsvUrl: () => `${BASE_URL}/reports/export/csv`,

  // Roles
  getRoles: () => request<{ success: boolean; activeRole: string; activeRoleDetails: UserRoleInfo; roles: UserRoleInfo[]; demoNotice: string }>('/roles'),
  switchRole: (role: string) => request<{ success: boolean; activeRole: string; activeRoleDetails: UserRoleInfo }>('/roles/switch', {
    method: 'POST',
    body: JSON.stringify({ role })
  }),
  getObservations: () => request<{ success: boolean; count: number; observations: any[] }>('/roles/observations'),
  addObservation: (obs: { category: string; finding: string; severity?: string; actionRequired?: string; examinerName?: string }) => request<{ success: boolean; observation: any; state: SimulationState }>('/roles/observations', {
    method: 'POST',
    body: JSON.stringify(obs)
  }),
  calculateUnderwriting: (policyLimit?: number, deductible?: number) => request<{
    success: boolean;
    policyLimit: number;
    deductible: number;
    totalExposure: number;
    totalSimulatedLoss: number;
    netClaimPayout: number;
    retainedBankLoss: number;
    lossRatioPct: number;
    warrantyCompliancePct: number;
    underwritingTier: string;
  }>('/roles/underwrite', {
    method: 'POST',
    body: JSON.stringify({ policyLimit, deductible })
  })
};

import { Request, Response, NextFunction } from 'express';
import { UserRoleInfo } from '../types/index.js';
import { simulationManager } from '../simulation/index.js';

export type SimulationRole = 'CISO' | 'RED_TEAM' | 'REGULATOR' | 'INSURER' | 'INFRA_OFFICER';

export const ROLE_DEFINITIONS: Record<SimulationRole, UserRoleInfo> = {
  CISO: {
    role: 'CISO',
    title: 'Chief Information Security Officer (CISO)',
    viewFocus: 'Enterprise cyber resilience, budget ROI, residual risk reduction, executive board governance',
    keyMetrics: ['Cyber Risk Score', 'Active Incidents', 'Budget Utilization', 'Mitigation Coverage'],
    permissions: ['VIEW_ALL', 'ALLOCATE_BUDGET', 'RUN_SIMULATION', 'MANAGE_INCIDENTS', 'RESET_SIMULATION', 'CONFIGURE_SCENARIO'],
    scoringPriorities: 'Minimize residual systemic risk while optimizing security capital expenditure and maintaining uptime SLAs.'
  },
  RED_TEAM: {
    role: 'RED_TEAM',
    title: 'Adversary Simulation Lead (Red Team)',
    viewFocus: 'Exploitation vectors, vulnerability chains, defense evasion, lateral movement paths',
    keyMetrics: ['Defense Bypass Rate', 'Attack Surface Exposure', 'Active Threat Vector', 'Stage Progression'],
    permissions: ['VIEW_ALL', 'CONFIGURE_SCENARIO', 'RUN_SIMULATION', 'RESET_SIMULATION'],
    scoringPriorities: 'Discover defense gaps, test bypass limits, and identify architectural single points of failure.'
  },
  REGULATOR: {
    role: 'REGULATOR',
    title: 'Financial Supervisory Authority / Bank Examiner',
    viewFocus: 'Statutory resilience, systemic risk, service availability, supervisory audit trail, customer impact',
    keyMetrics: ['Systemic Availability', 'Fine Exposure ($)', 'RTO Compliance', 'Active Disruption Count'],
    permissions: ['VIEW_ALL', 'EXPORT_AUDIT_LOG', 'RECORD_OBSERVATIONS', 'GENERATE_OVERSIGHT_REPORT'],
    scoringPriorities: 'Statutory adherence, uninterrupted essential banking services, and verified RTO/RPO disaster recovery.'
  },
  INSURER: {
    role: 'INSURER',
    title: 'Cyber Risk Underwriter (Cyber Insurance Carrier)',
    viewFocus: 'Loss actuarial curves, probable maximum loss (PML), claim severity, security control warranties',
    keyMetrics: ['Probable Max Loss ($)', 'Business Interruption ($)', 'Policy Loss Ratio', 'Warranty Index'],
    permissions: ['VIEW_ALL', 'INSPECT_FINANCIAL_EXPOSURE', 'EXPORT_REPORTS', 'UNDERWRITE_POLICY'],
    scoringPriorities: 'Ensure security controls meet underwriting warranty thresholds to limit catastrophic insurance claim payouts.'
  },
  INFRA_OFFICER: {
    role: 'INFRA_OFFICER',
    title: 'Critical Infrastructure & Business Continuity Director',
    viewFocus: 'Core banking uptime, interbank settlement continuity, hot-site failover latency, RTO/RPO thresholds',
    keyMetrics: ['Core Service Availability', 'Disaster Recovery Readiness', 'RTO/RPO SLA Adherence', 'Cascading Blast Radius'],
    permissions: ['VIEW_ALL', 'TRIGGER_FAILOVER', 'RUN_CONTINUITY_DRILL', 'MANAGE_INCIDENTS'],
    scoringPriorities: 'Preserve real-time ledger settlement capabilities and prevent cascading outages across interbank payment rails.'
  }
};

export function roleMiddleware(req: Request, res: Response, next: NextFunction) {
  const roleHeader = (req.headers['x-simulation-role'] as string) || simulationManager.getState().activeRole || 'CISO';
  const role = ROLE_DEFINITIONS[roleHeader as SimulationRole] ? (roleHeader as SimulationRole) : 'CISO';
  (req as any).userRole = ROLE_DEFINITIONS[role];
  next();
}

export function requireRole(allowedRoles: SimulationRole[], actionDescription: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roleHeader = (req.headers['x-simulation-role'] as string) || simulationManager.getState().activeRole || 'CISO';
    const currentRole = (roleHeader ? roleHeader.toUpperCase() : 'CISO') as SimulationRole;

    if (!allowedRoles.includes(currentRole)) {
      const roleDef = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.CISO;
      return res.status(403).json({
        success: false,
        error: `Permission Denied: Role [${roleDef.title}] is not permitted to ${actionDescription}. Allowed role(s): ${allowedRoles.map(r => ROLE_DEFINITIONS[r]?.title || r).join(', ')}.`
      });
    }
    next();
  };
}

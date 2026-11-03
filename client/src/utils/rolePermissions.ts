export type RoleId = 'CISO' | 'RED_TEAM' | 'REGULATOR' | 'INSURER' | 'INFRA_OFFICER';

export interface RoleCapability {
  canAllocateBudget: boolean;
  canExecuteAttacks: boolean;
  canConfigureScenarios: boolean;
  canManageIncidents: boolean;
  canRecordObservations: boolean;
  canUnderwrite: boolean;
  canTriggerFailover: boolean;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
}

export const ROLE_CAPABILITIES: Record<RoleId, RoleCapability> = {
  CISO: {
    canAllocateBudget: true,
    canExecuteAttacks: true,
    canConfigureScenarios: true,
    canManageIncidents: true,
    canRecordObservations: true,
    canUnderwrite: true,
    canTriggerFailover: true,
    title: 'Chief Information Security Officer',
    badge: 'COMMANDER',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff'
  },
  RED_TEAM: {
    canAllocateBudget: false,
    canExecuteAttacks: true,
    canConfigureScenarios: true,
    canManageIncidents: false,
    canRecordObservations: false,
    canUnderwrite: false,
    canTriggerFailover: false,
    title: 'Adversary Simulation Lead',
    badge: 'RED TEAM',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2'
  },
  REGULATOR: {
    canAllocateBudget: false,
    canExecuteAttacks: false,
    canConfigureScenarios: false,
    canManageIncidents: false,
    canRecordObservations: true,
    canUnderwrite: false,
    canTriggerFailover: false,
    title: 'Financial Supervisory Authority',
    badge: 'SUPERVISORY / AUDIT',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff'
  },
  INSURER: {
    canAllocateBudget: false,
    canExecuteAttacks: false,
    canConfigureScenarios: false,
    canManageIncidents: false,
    canRecordObservations: false,
    canUnderwrite: true,
    canTriggerFailover: false,
    title: 'Cyber Risk Underwriter',
    badge: 'ACTUARIAL RISK',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb'
  },
  INFRA_OFFICER: {
    canAllocateBudget: false,
    canExecuteAttacks: true, // BC/DR drill
    canConfigureScenarios: false,
    canManageIncidents: true, // Containment and recovery
    canRecordObservations: false,
    canUnderwrite: false,
    canTriggerFailover: true,
    title: 'Business Continuity Director',
    badge: 'RESILIENCE / CONTINUITY',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5'
  }
};

import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { ROLE_DEFINITIONS, SimulationRole } from '../middleware/roleAuth.js';
import { validateBody, RoleSwitchSchema } from '../middleware/validator.js';

const router = Router();

// GET /api/roles - All role profiles and current active role
router.get('/', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  res.json({
    success: true,
    activeRole: state.activeRole,
    activeRoleDetails: ROLE_DEFINITIONS[state.activeRole],
    roles: Object.values(ROLE_DEFINITIONS),
    demoNotice: 'DEMO ACCESS CONTROL: In this educational simulation platform, roles adjust permissions, view priorities, and audit criteria. Production implementations integrate enterprise SAML/OAuth2 with backend policy enforcement.'
  });
});

// POST /api/roles/switch - Switch role
router.post('/switch', validateBody(RoleSwitchSchema), (req: Request, res: Response) => {
  const { role } = req.body;
  const targetRole = role as SimulationRole;
  simulationManager.setActiveRole(targetRole);

  res.json({
    success: true,
    message: `Switched perspective to ${ROLE_DEFINITIONS[targetRole].title}`,
    activeRole: targetRole,
    activeRoleDetails: ROLE_DEFINITIONS[targetRole]
  });
});

// GET /api/roles/observations - Get bank examiner supervisory observations
router.get('/observations', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  res.json({
    success: true,
    count: state.supervisoryObservations.length,
    observations: state.supervisoryObservations
  });
});

// POST /api/roles/observations - Add a bank examiner supervisory observation
router.post('/observations', (req: Request, res: Response) => {
  try {
    const { examinerName, category, finding, severity, actionRequired } = req.body;
    if (!finding || !category) {
      return res.status(400).json({ success: false, error: 'Finding and category are required' });
    }
    const observation = simulationManager.addSupervisoryObservation({
      examinerName: examinerName || 'Supervisory Examiner',
      category: category || 'RESILIENCE',
      finding,
      severity: severity || 'RECOMMENDATION',
      actionRequired: actionRequired || 'Address during next operational resilience cycle.',
      status: 'OPEN'
    });
    res.json({
      success: true,
      observation,
      state: simulationManager.getState()
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/roles/underwrite - Actuarial policy calculation for Insurer role
router.post('/underwrite', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const policyLimit = req.body.policyLimit ? Number(req.body.policyLimit) : 5000000;
  const deductible = req.body.deductible ? Number(req.body.deductible) : 250000;

  const totalExposure = state.assets.reduce((sum, a) => sum + a.financialExposureEstimate, 0);
  const totalSimulatedLoss = state.eventsLog.reduce((sum, e) => sum + e.financialImpactUSD, 0);

  // Covered claim = min(policyLimit, max(0, totalSimulatedLoss - deductible))
  const netClaimPayout = Math.min(policyLimit, Math.max(0, totalSimulatedLoss - deductible));
  const retainedBankLoss = Math.min(totalSimulatedLoss, deductible) + Math.max(0, totalSimulatedLoss - deductible - policyLimit);
  const lossRatioPct = totalSimulatedLoss > 0 ? Math.round((netClaimPayout / policyLimit) * 100) : 0;

  // Control warranty compliance: % of 10 controls active
  const activeControls = state.controls.filter(c => c.active);
  const warrantyCompliancePct = Math.round((activeControls.length / state.controls.length) * 100);

  res.json({
    success: true,
    policyLimit,
    deductible,
    totalExposure,
    totalSimulatedLoss,
    netClaimPayout,
    retainedBankLoss,
    lossRatioPct,
    warrantyCompliancePct,
    underwritingTier: state.riskLevel === 'CRITICAL' ? 'SUBSTANDARD / HIGH RISK' : state.riskLevel === 'HIGH' ? 'STANDARD PLUS SURCHARGE' : 'PREFERRED'
  });
});

export default router;

import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { NIST_IR_STAGES, IncidentResponseManager } from '../simulation/incidentResponse.js';
import { validateBody, IRDecisionSchema } from '../middleware/validator.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = Router();

// GET /api/incident/incidents - Active detected incidents list
router.get('/incidents', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  res.json({
    success: true,
    count: state.incidents.length,
    incidents: state.incidents
  });
});

// POST /api/incident/acknowledge - Acknowledge incident
router.post('/acknowledge', requireRole(['CISO', 'INFRA_OFFICER'], 'acknowledge operational security incidents'), (req: Request, res: Response) => {
  try {
    const { incidentId } = req.body;
    if (!incidentId) return res.status(400).json({ success: false, error: 'incidentId is required' });
    const incident = simulationManager.acknowledgeIncident(incidentId);
    res.json({ success: true, incident, state: simulationManager.getState() });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/incident/contain - Contain incident
router.post('/contain', requireRole(['CISO', 'INFRA_OFFICER'], 'execute incident containment and network isolation'), (req: Request, res: Response) => {
  try {
    const { incidentId } = req.body;
    if (!incidentId) return res.status(400).json({ success: false, error: 'incidentId is required' });
    const incident = simulationManager.containIncident(incidentId);
    res.json({ success: true, incident, state: simulationManager.getState() });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/incident/recover - Recover incident & restore asset
router.post('/recover', requireRole(['CISO', 'INFRA_OFFICER'], 'execute asset recovery and service restoration'), (req: Request, res: Response) => {
  try {
    const { incidentId } = req.body;
    if (!incidentId) return res.status(400).json({ success: false, error: 'incidentId is required' });
    const incident = simulationManager.recoverIncident(incidentId);
    res.json({ success: true, incident, state: simulationManager.getState() });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/incident/severity - Assign incident severity
router.post('/severity', requireRole(['CISO'], 'reclassify operational incident severity'), (req: Request, res: Response) => {
  try {
    const { incidentId, severity } = req.body;
    if (!incidentId || !severity) return res.status(400).json({ success: false, error: 'incidentId and severity are required' });
    const validSeverities = ['LOW', 'MEDIUM', 'MODERATE', 'HIGH', 'CRITICAL'];
    const normalizedSev = String(severity).toUpperCase();
    if (!validSeverities.includes(normalizedSev)) {
      return res.status(400).json({ success: false, error: `Invalid severity '${severity}'. Must be one of LOW, MEDIUM, HIGH, CRITICAL` });
    }
    const incident = simulationManager.updateIncidentSeverity(incidentId, normalizedSev as any);
    res.json({ success: true, incident, state: simulationManager.getState() });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/incident/stages - All 6 NIST IR stages and options
router.get('/stages', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  res.json({
    success: true,
    stages: NIST_IR_STAGES,
    progress: state.irProgress
  });
});

// POST /api/incident/decision - Submit decision for an IR stage
router.post('/decision', validateBody(IRDecisionSchema), (req: Request, res: Response) => {
  try {
    const { stageNumber, optionId } = req.body;
    const result = simulationManager.submitIRDecision(stageNumber, optionId);

    res.json({
      success: true,
      evaluation: result.evaluation,
      scorecard: result.scorecard,
      irProgress: result.irProgress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// GET /api/incident/scorecard - Current scorecard & performance grade
router.get('/scorecard', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const scorecard = IncidentResponseManager.generateScorecard(
    state.irProgress.decisionsMade
  );

  res.json({
    success: true,
    scorecard,
    progress: state.irProgress
  });
});

// POST /api/incident/reset - Reset IR workflow
router.post('/reset', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  state.irProgress = {
    scenarioId: state.activeScenario ? state.activeScenario.id : null,
    currentStageNumber: 1,
    completedStages: [],
    decisionsMade: [],
    totalScore: 0,
    isFinished: false
  };

  res.json({
    success: true,
    message: 'Incident response scenario reset to Stage 1 (Preparation).',
    progress: state.irProgress
  });
});

export default router;

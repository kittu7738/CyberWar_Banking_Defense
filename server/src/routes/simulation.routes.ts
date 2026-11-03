import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { ATTACK_SCENARIOS } from '../simulation/attacks.js';
import { validateBody, SelectScenarioSchema, ResetSimulationSchema } from '../middleware/validator.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = Router();

// GET /api/simulation/state - Full current simulation state
router.get('/state', (req: Request, res: Response) => {
  res.json({
    success: true,
    state: simulationManager.getState()
  });
});

// GET /api/simulation/scenarios - All 5 attack scenarios
router.get('/scenarios', (req: Request, res: Response) => {
  res.json({
    success: true,
    scenarios: ATTACK_SCENARIOS
  });
});

// POST /api/simulation/select-scenario - Set active scenario
router.post('/select-scenario', requireRole(['CISO', 'RED_TEAM'], 'configure target attack scenario'), validateBody(SelectScenarioSchema), (req: Request, res: Response) => {
  try {
    const scenario = simulationManager.selectScenario(req.body.scenarioId);
    res.json({
      success: true,
      scenario,
      state: simulationManager.getState()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/simulation/step - Step forward one stage in active attack scenario
router.post('/step', requireRole(['CISO', 'RED_TEAM', 'INFRA_OFFICER'], 'execute active attack simulation stages'), (req: Request, res: Response) => {
  try {
    const stepResult = simulationManager.stepSimulation();
    res.json({
      success: true,
      event: stepResult.event,
      completed: stepResult.completed,
      stageIndex: stepResult.stageIndex,
      totalStages: stepResult.totalStages,
      state: simulationManager.getState()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/simulation/advance-round - Advance to next round
router.post('/advance-round', requireRole(['CISO', 'RED_TEAM', 'INFRA_OFFICER'], 'advance simulation rounds'), (req: Request, res: Response) => {
  try {
    const result = simulationManager.advanceRound();
    res.json({
      success: true,
      roundSummary: result.roundSummary,
      nextRoundNumber: result.nextRoundNumber,
      isSessionComplete: result.isSessionComplete,
      state: simulationManager.getState()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// POST /api/simulation/reset - Reset current simulation round / session
router.post('/reset', requireRole(['CISO', 'RED_TEAM'], 'reset simulation campaigns'), validateBody(ResetSimulationSchema), (req: Request, res: Response) => {
  const budget = req.body.budget || 1000000;
  const state = simulationManager.resetSimulation(budget);
  res.json({
    success: true,
    message: 'Simulation reset successfully. Audit history preserved.',
    state
  });
});

// POST /api/simulation/full-reset - Clean slate
router.post('/full-reset', requireRole(['CISO', 'RED_TEAM'], 'reset simulation environment'), (req: Request, res: Response) => {
  const state = simulationManager.fullReset();
  res.json({
    success: true,
    message: 'Full simulation environment reset to default baseline.',
    state
  });
});

export default router;

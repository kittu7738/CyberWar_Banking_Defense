import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { DefenseOptimizer } from '../simulation/defenseOptimizer.js';
import { validateBody, AllocateDefenseSchema } from '../middleware/validator.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = Router();

// GET /api/defense/controls - Available defense controls
router.get('/controls', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  res.json({
    success: true,
    budget: state.budget,
    controls: state.controls
  });
});

// POST /api/defense/allocate - Apply selected controls within budget
router.post('/allocate', requireRole(['CISO'], 'allocate enterprise defensive security budget'), validateBody(AllocateDefenseSchema), (req: Request, res: Response) => {
  const { controlIds } = req.body;
  const result = simulationManager.allocateBudget(controlIds);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
      budget: simulationManager.getState().budget
    });
  }

  const state = simulationManager.getState();
  const evaluation = DefenseOptimizer.evaluateUserAllocation(
    controlIds,
    state.controls,
    state.budget.total,
    state.assets
  );

  res.json({
    success: true,
    message: `Allocated $${result.spent.toLocaleString()} across ${controlIds.length} security controls.`,
    budget: state.budget,
    evaluation,
    overallRiskScore: state.overallRiskScore,
    riskLevel: state.riskLevel
  });
});

// POST /api/defense/optimize - Run Knapsack greedy optimization algorithm
router.post('/optimize', requireRole(['CISO'], 'execute AI security budget optimization'), (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const budget = req.body.budget ? Number(req.body.budget) : state.budget.total;

  const result = DefenseOptimizer.optimizeAllocation(
    state.controls,
    budget,
    state.assets
  );

  res.json({
    success: true,
    optimization: result
  });
});

// POST /api/defense/evaluate - Evaluate arbitrary selection without applying
router.post('/evaluate', validateBody(AllocateDefenseSchema), (req: Request, res: Response) => {
  const { controlIds } = req.body;
  const state = simulationManager.getState();

  const evaluation = DefenseOptimizer.evaluateUserAllocation(
    controlIds,
    state.controls,
    state.budget.total,
    state.assets
  );

  res.json({
    success: true,
    evaluation
  });
});

export default router;

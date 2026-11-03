import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { RiskEngine } from '../simulation/riskEngine.js';

const router = Router();

// GET /api/risk/systemic - Detailed systemic risk assessment
router.get('/systemic', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const activeControls = state.controls.filter(c => c.active);
  const assessment = RiskEngine.assessSystemicRisk(state.assets, activeControls);

  res.json({
    success: true,
    assessment,
    activeControlsCount: activeControls.length,
    degradedAssetsCount: state.assets.filter(a => a.operationalStatus !== 'HEALTHY').length
  });
});

// GET /api/risk/critical-path - Concentrated risk nodes and single points of failure
router.get('/critical-path', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const activeControls = state.controls.filter(c => c.active);
  const assessment = RiskEngine.assessSystemicRisk(state.assets, activeControls);

  res.json({
    success: true,
    criticalPath: assessment.criticalPath,
    concentrationNodes: assessment.concentrationNodes,
    spofCount: assessment.concentrationNodes.filter(n => n.isSinglePointOfFailure).length
  });
});

export default router;

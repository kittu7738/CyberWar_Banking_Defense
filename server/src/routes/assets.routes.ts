import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';

const router = Router();

// GET /api/assets - All assets with topology
router.get('/', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const assets = state.assets;

  // Build nodes and links for D3.js visualization
  const nodes = assets.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    criticality: a.criticality,
    vulnerabilityLevel: a.vulnerabilityLevel,
    operationalStatus: a.operationalStatus,
    healthScore: a.healthScore,
    tier: a.tier,
    ipSubnet: a.ipSubnet,
    description: a.description,
    financialExposureEstimate: a.financialExposureEstimate,
    rtoHours: a.rtoHours,
    rpoHours: a.rpoHours,
    appliedControlsCount: a.appliedControls.length
  }));

  const links: { source: string; target: string; relationship: string }[] = [];
  for (const a of assets) {
    for (const depId of a.dependencies) {
      links.push({
        source: a.id,
        target: depId,
        relationship: 'DEPENDS_ON'
      });
    }
  }

  res.json({
    success: true,
    count: assets.length,
    assets,
    graph: {
      nodes,
      links
    }
  });
});

// GET /api/assets/:id - Single asset detail
router.get('/:id', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const asset = state.assets.find(a => a.id === req.params.id);

  if (!asset) {
    return res.status(404).json({
      success: false,
      error: `Asset ${req.params.id} not found`
    });
  }

  const appliedControlsDetails = state.controls.filter(c => asset.appliedControls.includes(c.id));
  const dependentAssets = state.assets.filter(a => asset.dependents.includes(a.id));
  const dependencyAssets = state.assets.filter(a => asset.dependencies.includes(a.id));

  res.json({
    success: true,
    asset,
    appliedControls: appliedControlsDetails,
    dependents: dependentAssets.map(a => ({ id: a.id, name: a.name, status: a.operationalStatus })),
    dependencies: dependencyAssets.map(a => ({ id: a.id, name: a.name, status: a.operationalStatus }))
  });
});

export default router;

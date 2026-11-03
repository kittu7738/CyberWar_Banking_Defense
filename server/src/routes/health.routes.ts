import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../db/connection.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    status: 'UP',
    service: 'Cyberwar Banking Defense Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    database: dbStatus,
    features: {
      syntheticSimulationEngine: 'ACTIVE',
      d3NetworkTopology: 'SUPPORTED',
      defenseKnapsackOptimizer: 'ACTIVE',
      nistIncidentResponseEngine: 'ACTIVE',
      systemicRiskAssessment: 'ACTIVE'
    }
  });
});

export default router;

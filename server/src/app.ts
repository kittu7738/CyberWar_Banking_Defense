import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { roleMiddleware } from './middleware/roleAuth.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import assetsRoutes from './routes/assets.routes.js';
import defenseRoutes from './routes/defense.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import riskRoutes from './routes/risk.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import rolesRoutes from './routes/roles.routes.js';

export function createApp(): Express {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Simulation-Role']
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use(roleMiddleware);

  // Health route
  app.use('/api/health', healthRoutes);

  // API Domain Routes
  app.use('/api/assets', assetsRoutes);
  app.use('/api/defense', defenseRoutes);
  app.use('/api/simulation', simulationRoutes);
  app.use('/api/incident', incidentRoutes);
  app.use('/api/risk', riskRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/roles', rolesRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed for request payload',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

export const AllocateDefenseSchema = z.object({
  controlIds: z.array(z.string().min(1)).min(0)
});

export const SelectScenarioSchema = z.object({
  scenarioId: z.string().min(1)
});

export const IRDecisionSchema = z.object({
  stageNumber: z.number().int().min(1).max(6),
  optionId: z.string().min(1)
});

export const RoleSwitchSchema = z.object({
  role: z.enum(['CISO', 'RED_TEAM', 'REGULATOR', 'INSURER', 'INFRA_OFFICER'])
});

export const ResetSimulationSchema = z.object({
  budget: z.number().positive().optional()
});

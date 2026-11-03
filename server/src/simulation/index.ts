import { SimulationManager } from './simulationManager.js';
import { config } from '../config.js';

export const simulationManager = new SimulationManager(config.defaultBudget);

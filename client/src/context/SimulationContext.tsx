import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SimulationState, SimulationEvent, RoundSummary, AttackScenario, Incident, RiskLevel } from '../types/index.js';
import { api } from '../api/client.js';

interface SimulationContextType {
  state: SimulationState | null;
  loading: boolean;
  error: string | null;
  refreshState: () => Promise<void>;
  stepSimulation: () => Promise<{ event: SimulationEvent; completed: boolean }>;
  advanceRound: () => Promise<{ roundSummary: RoundSummary; nextRoundNumber: number; isSessionComplete: boolean }>;
  selectScenario: (scenarioId: string) => Promise<AttackScenario>;
  allocateControls: (controlIds: string[]) => Promise<void>;
  optimizeBudget: () => Promise<any>;
  acknowledgeIncident: (incidentId: string) => Promise<Incident>;
  containIncident: (incidentId: string) => Promise<Incident>;
  recoverIncident: (incidentId: string) => Promise<Incident>;
  updateIncidentSeverity: (incidentId: string, severity: RiskLevel) => Promise<Incident>;
  resetSimulation: (budget?: number) => Promise<void>;
  fullReset: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshState = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getState();
      setState(res.state);
    } catch (err: any) {
      console.error('Failed to fetch simulation state:', err);
      setError(err.message || 'Error connecting to simulation engine');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const stepSimulation = async () => {
    try {
      const res = await api.stepSimulation();
      setState(res.state);
      return { event: res.event, completed: res.completed };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const advanceRound = async () => {
    try {
      const res = await api.advanceRound();
      setState(res.state);
      return {
        roundSummary: res.roundSummary,
        nextRoundNumber: res.nextRoundNumber,
        isSessionComplete: res.isSessionComplete
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const selectScenario = async (scenarioId: string) => {
    try {
      const res = await api.selectScenario(scenarioId);
      setState(res.state);
      return res.scenario;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const allocateControls = async (controlIds: string[]) => {
    try {
      await api.allocateDefense(controlIds);
      await refreshState();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const optimizeBudget = async () => {
    try {
      const res = await api.optimizeDefense();
      await refreshState();
      return res.optimization;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const acknowledgeIncident = async (incidentId: string) => {
    try {
      const res = await api.acknowledgeIncident(incidentId);
      setState(res.state);
      return res.incident;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const containIncident = async (incidentId: string) => {
    try {
      const res = await api.containIncident(incidentId);
      setState(res.state);
      return res.incident;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const recoverIncident = async (incidentId: string) => {
    try {
      const res = await api.recoverIncident(incidentId);
      setState(res.state);
      return res.incident;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateIncidentSeverity = async (incidentId: string, severity: RiskLevel) => {
    const normalizedSev: RiskLevel = severity === 'MODERATE' ? 'MEDIUM' : severity;

    // Optimistically update the single incident immediately in local state
    setState(prev => {
      if (!prev) return prev;
      const updatedIncidents = prev.incidents.map(inc =>
        inc.id === incidentId ? { ...inc, severity: normalizedSev } : inc
      );
      return {
        ...prev,
        incidents: updatedIncidents
      };
    });

    try {
      const res = await api.updateIncidentSeverity(incidentId, normalizedSev);
      setState(res.state);
      return res.incident;
    } catch (err: any) {
      await refreshState();
      setError(err.message);
      throw err;
    }
  };

  const resetSimulation = async (budget?: number) => {
    try {
      const res = await api.resetSimulation(budget);
      setState(res.state);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const fullReset = async () => {
    try {
      const res = await api.fullReset();
      setState(res.state);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        state,
        loading,
        error,
        refreshState,
        stepSimulation,
        advanceRound,
        selectScenario,
        allocateControls,
        optimizeBudget,
        acknowledgeIncident,
        containIncident,
        recoverIncident,
        updateIncidentSeverity,
        resetSimulation,
        fullReset
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

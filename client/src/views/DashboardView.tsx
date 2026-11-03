import React, { useState } from 'react';
import {
  Box,
  Alert,
  Button
} from '@mui/material';
import { useSimulation } from '../context/SimulationContext.js';
import { useRole } from '../context/RoleContext.js';
import { CisoPerspective } from '../components/Dashboard/CisoPerspective.js';
import { RedTeamPerspective } from '../components/Dashboard/RedTeamPerspective.js';
import { RegulatorPerspective } from '../components/Dashboard/RegulatorPerspective.js';
import { InsurerPerspective } from '../components/Dashboard/InsurerPerspective.js';
import { InfraOfficerPerspective } from '../components/Dashboard/InfraOfficerPerspective.js';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { state, stepSimulation, selectScenario, optimizeBudget } = useSimulation();
  const { activeRole } = useRole();
  const [ddosRunning, setDdosRunning] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!state) return null;

  // Quick 1-click DDoS simulation for CISO perspective
  const handleTriggerDDoS = async () => {
    try {
      setDdosRunning(true);
      await selectScenario('ddos-surge');
      const res = await stepSimulation();
      setActionMessage(`DDoS Wave Triggered: ${res.event.title} - Operational Health: ${state.operationalHealth}%`);
    } catch (err: any) {
      console.error('DDoS trigger error:', err);
      setActionMessage(`Drill Error: ${err.message}`);
    } finally {
      setDdosRunning(false);
    }
  };

  const handleQuickOptimize = async () => {
    try {
      await optimizeBudget();
      setActionMessage('Defense budget optimized: controls deployed to maximize systemic risk reduction.');
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Optimizer Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Global Health Disruption Alert Banner */}
      {state.operationalHealth < 75 && (
        <Alert
          severity="error"
          sx={{ mb: 3, bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
          action={
            <Button color="error" size="small" variant="outlined" onClick={() => onNavigate('incident')} sx={{ fontWeight: 700 }}>
              Respond to Incident
            </Button>
          }
        >
          CRITICAL ALERT: Operational health degraded to {state.operationalHealth}%. Active cyber attack propagation detected across core banking services.
        </Alert>
      )}

      {/* Action Notification Banner */}
      {actionMessage && (
        <Alert
          severity="info"
          sx={{ mb: 3, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
          onClose={() => setActionMessage(null)}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Render Perspective according to Active Role */}
      {activeRole === 'CISO' && (
        <CisoPerspective
          state={state}
          onNavigate={onNavigate}
          onTriggerDDoS={handleTriggerDDoS}
          onQuickOptimize={handleQuickOptimize}
          ddosRunning={ddosRunning}
        />
      )}

      {activeRole === 'RED_TEAM' && (
        <RedTeamPerspective
          state={state}
          onNavigate={onNavigate}
          onMessage={(msg) => setActionMessage(msg)}
        />
      )}

      {activeRole === 'REGULATOR' && (
        <RegulatorPerspective
          state={state}
          onNavigate={onNavigate}
          onMessage={(msg) => setActionMessage(msg)}
        />
      )}

      {activeRole === 'INSURER' && (
        <InsurerPerspective
          state={state}
          onNavigate={onNavigate}
          onMessage={(msg) => setActionMessage(msg)}
        />
      )}

      {activeRole === 'INFRA_OFFICER' && (
        <InfraOfficerPerspective
          state={state}
          onNavigate={onNavigate}
          onMessage={(msg) => setActionMessage(msg)}
        />
      )}
    </Box>
  );
};

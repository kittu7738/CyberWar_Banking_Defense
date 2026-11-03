import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Paper
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import { useSimulation } from '../context/SimulationContext.js';
import { RiskBadge } from '../components/Common/RiskBadge.js';
import { api } from '../api/client.js';
import { AttackScenario } from '../types/index.js';

export const AttackSimulatorView: React.FC = () => {
  const { state, stepSimulation, selectScenario, advanceRound, resetSimulation } = useSimulation();
  const [stepping, setStepping] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);

  useEffect(() => {
    api.getScenarios()
      .then(res => {
        if (res.scenarios) setScenarios(res.scenarios);
      })
      .catch(console.error);
  }, []);

  if (!state) return null;

  const currentScenario = state.activeScenario || scenarios[0];
  const activeScenariosList = scenarios.length > 0 ? scenarios : (currentScenario ? [currentScenario] : []);
  const totalStages = currentScenario ? currentScenario.stages.length : 4;
  const currentStageIndex = state.currentStageIndex;
  const isScenarioCompleted = currentStageIndex >= totalStages;
  const stageProgressPct = Math.min(100, Math.round((currentStageIndex / totalStages) * 100));

  const handleStep = async () => {
    try {
      setStepping(true);
      const res = await stepSimulation();
      if (res.completed) {
        setStatusMessage(`Scenario "${currentScenario.name}" executed all stages. Review telemetry below.`);
      }
    } catch (err: any) {
      console.error('Error during step:', err);
    } finally {
      setStepping(false);
    }
  };

  const handlePlayAll = async () => {
    try {
      setStepping(true);
      let isDone = isScenarioCompleted;
      while (!isDone) {
        const res = await stepSimulation();
        isDone = res.completed;
      }
      setStatusMessage(`All ${totalStages} attack stages executed.`);
    } catch (err: any) {
      console.error('Error in play all:', err);
    } finally {
      setStepping(false);
    }
  };

  const handleScenarioChange = async (scenarioId: string) => {
    try {
      setStatusMessage(null);
      await selectScenario(scenarioId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvance = async () => {
    try {
      const res = await advanceRound();
      setStatusMessage(`Round ${res.roundSummary.roundNumber} summarized. Advanced to Round ${res.nextRoundNumber}!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Title & Scenario Selector Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon sx={{ color: '#dc2626' }} />
            Cyber Attack Simulator
          </Typography>
        </Box>

        {/* 6 Attack Scenario Chips */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
          {activeScenariosList.map((sc) => {
            const isSelected = currentScenario?.id === sc.id;
            return (
              <Chip
                key={sc.id}
                label={sc.vector.replace('_', ' ')}
                onClick={() => handleScenarioChange(sc.id)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  bgcolor: isSelected ? '#e0f2fe' : 'transparent',
                  borderColor: isSelected ? '#0284c7' : '#cbd5e1',
                  color: isSelected ? '#0284c7' : '#64748b'
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {statusMessage && (
        <Alert severity="info" sx={{ mb: 2.5, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }} onClose={() => setStatusMessage(null)}>
          {statusMessage}
        </Alert>
      )}

      {/* Main Simulation Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Active Scenario Narrative, Controls, & Stages */}
        <Grid item xs={12} lg={7}>
          {/* Scenario Overview Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ACTIVE THREAT VECTOR
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {currentScenario.name}
                  </Typography>
                </Box>
                <RiskBadge level={currentScenario.severity} />
              </Box>

              <Typography variant="caption" sx={{ color: '#0284c7', fontFamily: '"JetBrains Mono", monospace', display: 'block', mb: 1 }}>
                Actor: {currentScenario.threatActor} | Target: {currentScenario.initialTargetAssetId}
              </Typography>

              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.85rem' }}>
                {currentScenario.narrative}
              </Typography>

              {/* Stage Progress Bar */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                    Execution: Stage {currentStageIndex} of {totalStages}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {stageProgressPct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stageProgressPct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #10b981 100%)'
                    }
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isScenarioCompleted || stepping}
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStep}
                  sx={{ fontWeight: 700 }}
                >
                  {stepping ? 'Evaluating...' : isScenarioCompleted ? 'Scenario Completed' : `Execute Stage ${currentStageIndex + 1}`}
                </Button>

                <Button
                  variant="outlined"
                  disabled={isScenarioCompleted || stepping}
                  startIcon={<FastForwardIcon />}
                  onClick={handlePlayAll}
                  sx={{ borderColor: '#0284c7', color: '#0284c7' }}
                >
                  Play All Stages
                </Button>

                {isScenarioCompleted && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAdvance}
                    sx={{ fontWeight: 700 }}
                  >
                    Advance to Round {state.currentRound + 1} →
                  </Button>
                )}

                <Button
                  variant="text"
                  startIcon={<RestartAltIcon />}
                  onClick={() => resetSimulation()}
                  sx={{ color: '#64748b', ml: 'auto' }}
                >
                  Reset
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Planned Attack Stages */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                Scenario Stages & Required Defenses
              </Typography>

              <Stack spacing={1.5}>
                {currentScenario.stages.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <Box
                      key={stage.step}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isCurrent ? '#f0f9ff' : '#ffffff',
                        border: `1px solid ${isCurrent ? '#0284c7' : isDone ? '#a7f3d0' : '#e2e8f0'}`,
                        boxShadow: isCurrent ? '0 0 0 1px #0284c7, 0 4px 14px rgba(2, 132, 199, 0.12)' : 'none',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isDone ? '#10b981' : isCurrent ? '#0284c7' : '#f1f5f9',
                          color: isDone || isCurrent ? '#ffffff' : '#64748b',
                          boxShadow: isCurrent ? '0 0 8px rgba(2, 132, 199, 0.4)' : isDone ? '0 0 6px rgba(16, 185, 129, 0.3)' : 'none',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          flexShrink: 0
                        }}
                      >
                        {isDone ? '✓' : stage.step}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isCurrent ? '#0284c7' : '#0f172a' }}>
                            {stage.phase}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
                            {stage.timeOffset}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.5 }}>
                          {stage.action}
                        </Typography>

                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                          Target: <span style={{ color: '#0f172a', fontWeight: 600 }}>{stage.targetAssetId}</span> | Threshold: <span style={{ color: '#d97706', fontWeight: 700 }}>{(stage.mitigationThreshold * 100).toFixed(0)}%</span>
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Live Event Telemetry Stream */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', maxHeight: 850, overflowY: 'auto' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Live Defense Telemetry
                </Typography>
                <Chip label={`${state.eventsLog.length} Events`} size="small" sx={{ bgcolor: '#f0f9ff', color: '#0284c7', fontWeight: 700 }} />
              </Box>

              {state.eventsLog.length === 0 ? (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                  <ShieldIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                    No simulation events triggered yet in Round {state.currentRound}.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Click "Execute Stage 1" to evaluate your active security controls against incoming threats.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {state.eventsLog.map((evt) => (
                    <Paper
                      key={evt.id}
                      sx={{
                        p: 1.8,
                        bgcolor: '#ffffff',
                        border: `1px solid ${
                          evt.mitigationSucceeded ? '#a7f3d0' : '#fecaca'
                        }`,
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {evt.mitigationSucceeded ? (
                            <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 18 }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                          )}
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: evt.mitigationSucceeded ? '#059669' : '#dc2626' }}>
                            {evt.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={evt.resultingStatus}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: evt.resultingStatus === 'HEALTHY' ? '#ecfdf5' : '#fef2f2',
                            color: evt.resultingStatus === 'HEALTHY' ? '#059669' : '#dc2626'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', mb: 1 }}>
                        {evt.narrative}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5, borderTop: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                          Financial Impact: <span style={{ color: evt.financialImpactUSD > 0 ? '#d97706' : '#059669', fontWeight: 700 }}>${evt.financialImpactUSD.toLocaleString()} USD</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                          {evt.timestamp}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

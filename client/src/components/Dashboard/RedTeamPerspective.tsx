import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HubIcon from '@mui/icons-material/Hub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DnsIcon from '@mui/icons-material/Dns';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { StatCard } from '../Common/StatCard.js';
import { SimulationState } from '../../types/index.js';
import { useSimulation } from '../../context/SimulationContext.js';

interface RedTeamPerspectiveProps {
  state: SimulationState;
  onNavigate: (view: string) => void;
  onMessage: (msg: string) => void;
}

export const RedTeamPerspective: React.FC<RedTeamPerspectiveProps> = ({
  state,
  onNavigate,
  onMessage
}) => {
  const { stepSimulation, selectScenario, resetSimulation } = useSimulation();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    state.activeScenario?.id || 'ddos-surge'
  );
  const [stepping, setStepping] = useState<boolean>(false);
  const [playingAll, setPlayingAll] = useState<boolean>(false);

  // Red team metrics
  const totalSteps = state.eventsLog.length;
  const bypassedSteps = state.eventsLog.filter(e => !e.mitigationSucceeded).length;
  const bypassRate = totalSteps > 0 ? Math.round((bypassedSteps / totalSteps) * 100) : 0;

  // Assets with vulnerability level > 25
  const vulnerableAssets = [...state.assets].sort((a, b) => b.vulnerabilityLevel - a.vulnerabilityLevel);
  const highVulnerabilityCount = state.assets.filter(a => a.vulnerabilityLevel >= 40).length;

  const currentScenario = state.activeScenario;
  const totalStages = currentScenario?.stages.length || 4;
  const stageProgressPct = Math.round((state.currentStageIndex / totalStages) * 100);

  const handleScenarioChange = async (newId: string) => {
    setSelectedScenarioId(newId);
    try {
      await selectScenario(newId);
      onMessage(`Adversary campaign switched to: ${newId.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStepAttack = async () => {
    try {
      setStepping(true);
      const res = await stepSimulation();
      onMessage(`Attack Stage ${res.event.step} executed: ${res.event.title} (${res.event.mitigationSucceeded ? 'Defended' : 'Exploited'})`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setStepping(false);
    }
  };

  const handlePlayAll = async () => {
    try {
      setPlayingAll(true);
      let isDone = state.currentStageIndex >= totalStages;
      while (!isDone) {
        const res = await stepSimulation();
        isDone = res.completed || res.event.step >= totalStages;
      }
      onMessage(`Full attack scenario kill-chain completed.`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setPlayingAll(false);
    }
  };

  const handleResetCampaign = async () => {
    try {
      await resetSimulation(state.budget.total);
      onMessage('Simulation attack surface reset to baseline.');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Box>
      {/* Role Context Header */}
      <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <WhatshotIcon sx={{ color: '#dc2626' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>
              Adversary Simulation Lead (Red Team) • Threat Campaign Command
            </Typography>
          </Box>
        </Box>
        <Chip
          label="SYNTHETIC TESTING ONLY"
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#dc2626', color: '#ffffff' }}
        />
      </Box>

      {/* 4 Red Team Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Defense Bypass Rate"
            value={`${bypassRate}%`}
            subtitle={`${bypassedSteps} of ${totalSteps} stages penetrated`}
            icon={<WarningAmberIcon fontSize="large" />}
            color={bypassRate >= 50 ? '#dc2626' : '#d97706'}
            tooltipText="Percentage of executed attack stages where active defensive controls failed to mitigate disruption."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Exposed Attack Surface"
            value={`${highVulnerabilityCount} Targets`}
            subtitle="Assets with vulnerability ≥ 40%"
            icon={<HubIcon fontSize="large" />}
            color="#ef4444"
            tooltipText="Total banking assets with high attack surface exposure and insufficient mitigation controls."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Threat Vector"
            value={currentScenario?.vector || 'DDOS'}
            subtitle={currentScenario?.name?.split('(')[0] || 'DDoS Surge'}
            icon={<DnsIcon fontSize="large" />}
            color="#b91c1c"
            tooltipText="Current adversary threat profile configured in the simulation engine."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kill-Chain Progress"
            value={`Stage ${state.currentStageIndex} / ${totalStages}`}
            subtitle={state.currentStageIndex >= totalStages ? 'Campaign Completed' : 'Progression Active'}
            icon={<FastForwardIcon fontSize="large" />}
            color="#0ea5e9"
            tooltipText="Sequential progress through the multi-stage attack execution chain."
          />
        </Grid>
      </Grid>

      {/* Attack Console & Actions */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Scenario Progression Panel */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Adversary Campaign Kill-Chain Telemetry
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {currentScenario?.narrative || 'Multi-stage adversary attack execution telemetry.'}
                  </Typography>
                </Box>
                <Chip
                  label={currentScenario?.severity || 'HIGH'}
                  size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>
                    Campaign Stage Completion ({state.currentStageIndex} of {totalStages} Stages)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                    {stageProgressPct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stageProgressPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#fee2e2',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#dc2626'
                    }
                  }}
                />
              </Box>

              {/* Stage Stepper Overview */}
              <Box sx={{ p: 1.5, bgcolor: '#fff1f2', borderRadius: 2, border: '1px solid #fecdd3' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#9f1239', textTransform: 'uppercase' }}>
                  Target Objective
                </Typography>
                <Typography variant="body2" sx={{ color: '#881337', fontWeight: 600, mt: 0.5 }}>
                  {currentScenario?.objective || 'Simulate targeted perimeter saturation to map rate-limiting thresholds.'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#be123c', display: 'block', mt: 0.5 }}>
                  Primary Entry Point: <strong>{currentScenario?.initialTargetAssetId}</strong> • Cascading Potential: {currentScenario?.cascadingPotential}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Red Team Controls */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Attack Execution Controls
              </Typography>

              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Target Attack Scenario</InputLabel>
                  <Select
                    value={selectedScenarioId}
                    label="Target Attack Scenario"
                    onChange={(e) => handleScenarioChange(e.target.value)}
                  >
                    <MenuItem value="ddos-surge">DDoS Volumetric & Layer-7 Surge</MenuItem>
                    <MenuItem value="ransomware-lateral">LockBit Ransomware & Lateral Propagation</MenuItem>
                    <MenuItem value="data-breach-exfiltration">Customer Database SQLi Exfiltration</MenuItem>
                    <MenuItem value="insider-threat-privilege">Rogue Admin Privilege Escalation</MenuItem>
                    <MenuItem value="supply-chain-compromise">SDK Dependency Supply Chain Poisoning</MenuItem>
                    <MenuItem value="infra-disruption-scada">Power & Data Center Disruption</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  disabled={stepping || state.currentStageIndex >= totalStages}
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStepAttack}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  {stepping ? 'Executing Stage...' : state.currentStageIndex >= totalStages ? 'Campaign Finished' : 'Execute Next Stage Wave'}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={playingAll || state.currentStageIndex >= totalStages}
                  startIcon={<FastForwardIcon />}
                  onClick={handlePlayAll}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  {playingAll ? 'Running Kill-Chain...' : 'Play Entire Kill-Chain'}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetCampaign}
                  sx={{ color: '#64748b', borderColor: '#cbd5e1' }}
                >
                  Reset Attack Campaign
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => onNavigate('simulator')}
                  sx={{ color: '#0284c7', fontSize: '0.85rem' }}
                >
                  Open Full Attack Simulator Console →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Target Attack Surface Table & Telemetry Log */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Target Attack Surface & Vulnerability Profile
                </Typography>
                <Chip label="Ordered by Exploitability" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
              </Box>

              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>TARGET ASSET</TableCell>
                      <TableCell>TIER</TableCell>
                      <TableCell align="right">VULNERABILITY</TableCell>
                      <TableCell align="right">STATUS</TableCell>
                      <TableCell align="right">ACTIVE CONTROLS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vulnerableAssets.slice(0, 7).map((asset) => (
                      <TableRow key={asset.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#fef2f2' } }}>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{asset.name}</TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{asset.tier}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${asset.vulnerabilityLevel}%`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: asset.vulnerabilityLevel >= 40 ? '#fef2f2' : '#f0f9ff',
                              color: asset.vulnerabilityLevel >= 40 ? '#dc2626' : '#0284c7'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={asset.healthScore === 0 && (asset.operationalStatus === 'DEGRADED' || asset.operationalStatus === 'HEALTHY') ? 'COMPROMISED' : asset.operationalStatus}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor:
                                asset.operationalStatus === 'HEALTHY' && asset.healthScore > 0 ? '#ecfdf5' :
                                asset.operationalStatus === 'DEGRADED' && asset.healthScore > 0 ? '#fffbeb' :
                                asset.operationalStatus === 'OFFLINE' ? '#f1f5f9' : '#fee2e2',
                              color:
                                asset.operationalStatus === 'HEALTHY' && asset.healthScore > 0 ? '#059669' :
                                asset.operationalStatus === 'DEGRADED' && asset.healthScore > 0 ? '#d97706' :
                                asset.operationalStatus === 'OFFLINE' ? '#475569' : '#dc2626'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: '#64748b' }}>
                          {asset.appliedControls.length} active
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Exploit Telemetry Feed
              </Typography>
              {state.eventsLog.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                    No attack stages stepped yet. Click Execute Next Stage Wave above.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  {state.eventsLog.map((evt) => (
                    <Box
                      key={evt.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `4px solid ${evt.mitigationSucceeded ? '#059669' : '#dc2626'}`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: evt.mitigationSucceeded ? '#059669' : '#dc2626' }}>
                          {evt.mitigationSucceeded ? '🛡️ BLOCKED' : '💥 PENETRATED'}: {evt.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                          {evt.timestamp}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '0.78rem' }}>
                        {evt.narrative}
                      </Typography>
                    </Box>
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

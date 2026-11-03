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
  Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HubIcon from '@mui/icons-material/Hub';
import ShieldIcon from '@mui/icons-material/Shield';
import { StatCard } from '../Common/StatCard.js';
import { RiskBadge } from '../Common/RiskBadge.js';
import { D3NetworkGraph } from '../NetworkGraph/D3NetworkGraph.js';
import { SimulationState, BankingAsset } from '../../types/index.js';

interface CisoPerspectiveProps {
  state: SimulationState;
  onNavigate: (view: string) => void;
  onTriggerDDoS: () => void;
  onQuickOptimize: () => void;
  ddosRunning: boolean;
}

export const CisoPerspective: React.FC<CisoPerspectiveProps> = ({
  state,
  onNavigate,
  onTriggerDDoS,
  onQuickOptimize,
  ddosRunning
}) => {
  const [selectedAsset, setSelectedAsset] = useState<BankingAsset | null>(
    state.assets.length > 0 ? state.assets[0] : null
  );

  const activeIncidents = state.incidents.filter(i => i.status !== 'RECOVERED').length;
  const criticalAssets = state.assets.filter(a => a.criticality === 'CRITICAL');
  const budgetSpent = state.budget.spent;
  const budgetTotal = state.budget.total;
  const budgetPct = Math.round((budgetSpent / budgetTotal) * 100);

  // Active controls mitigation coverage
  const activeControls = state.controls.filter(c => c.active);
  const mitigationCoveragePct = Math.round((activeControls.length / state.controls.length) * 100);

  return (
    <Box>
      {/* Role Context Command Bar */}
      <Box
        sx={{
          mb: 2.5,
          p: 1.75,
          bgcolor: '#ffffff',
          borderRadius: 2.5,
          border: '1px solid #bae6fd',
          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: '#e0f2fe',
              color: '#0284c7'
            }}
          >
            <ShieldIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              CISO Command Deck • Security Operations & Defense Governance
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
              Round {state.currentRound} of {state.maxRounds} • Active Threat Vector: {state.activeScenario?.vector || 'BASELINE'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label="FULL COMMAND AUTHORITY"
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            fontFamily: '"JetBrains Mono", monospace',
            bgcolor: '#0284c7',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
          }}
        />
      </Box>

      {/* CENTRAL VISUAL ANCHOR: Banking Infrastructure Topology & Command Deck */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Central Visualization Anchor: D3 Network Topology */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                px: 2.5,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HubIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Banking Network Topology & Attack Surface
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${state.assets.length} Active Financial Nodes`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    fontFamily: '"JetBrains Mono", monospace',
                    bgcolor: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd'
                  }}
                />
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onNavigate('infrastructure')}
                  sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', p: 0.5 }}
                >
                  Inspect Full Grid →
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, p: 1.5, bgcolor: '#ffffff' }}>
              <D3NetworkGraph
                assets={state.assets}
                selectedAssetId={selectedAsset?.id}
                onSelectAsset={(a) => setSelectedAsset(a)}
                height={460}
              />
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Telemetry Cards & CISO Operational Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* 2x2 Arranged Key Telemetry Matrix */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <StatCard
                  title="Risk Score"
                  value={`${state.overallRiskScore} / 100`}
                  subtitle={`${state.riskLevel} Profile`}
                  color={state.riskLevel === 'CRITICAL' ? '#ef4444' : state.riskLevel === 'HIGH' ? '#f59e0b' : '#0284c7'}
                  tooltipText="Systemic cyber risk score based on asset vulnerabilities and defense mitigations."
                />
              </Grid>

              <Grid item xs={6}>
                <StatCard
                  title="Bank Health"
                  value={`${state.operationalHealth}%`}
                  subtitle={state.businessContinuityStatus.replace('_', ' ')}
                  color={state.operationalHealth >= 80 ? '#10b981' : state.operationalHealth >= 50 ? '#f59e0b' : '#ef4444'}
                  tooltipText="Aggregate operational uptime across all connected banking services."
                />
              </Grid>

              <Grid item xs={6}>
                <StatCard
                  title="Incidents"
                  value={`${activeIncidents} Active`}
                  subtitle={`${state.incidents.length} Total Signals`}
                  color={activeIncidents > 0 ? '#ef4444' : '#10b981'}
                  tooltipText="Active uncontained operational breach signals requiring SOC triage."
                />
              </Grid>

              <Grid item xs={6}>
                <StatCard
                  title="Defense Budget"
                  value={`$${(budgetSpent / 1000).toFixed(0)}k`}
                  subtitle={`${mitigationCoveragePct}% Controls Active`}
                  color="#0284c7"
                  tooltipText="Defensive capital spent out of $1,000,000 fiscal limit."
                />
              </Grid>
            </Grid>

            {/* CISO Operational Command Actions */}
            <Card sx={{ flexGrow: 1, p: 2, border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                CISO Operational Actions
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, fontFamily: '"JetBrains Mono", monospace' }}>
                Authorized Response & Threat Simulation
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  disabled={ddosRunning}
                  startIcon={<PlayArrowIcon />}
                  onClick={onTriggerDDoS}
                  sx={{
                    py: 1.1,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  {ddosRunning ? 'Simulating Wave...' : 'Simulate Authorized DDoS Wave'}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SmartToyIcon />}
                  onClick={onQuickOptimize}
                  sx={{
                    py: 1.1,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  Optimize Defense Budget
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SecurityIcon />}
                  onClick={() => onNavigate('defense')}
                  sx={{ py: 1, borderColor: '#bae6fd', color: '#0284c7', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Configure Defenses →
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SupportAgentIcon />}
                  onClick={() => onNavigate('incident')}
                  sx={{ py: 1, borderColor: '#a7f3d0', color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Triage Active Incidents ({activeIncidents}) →
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* MIDDLE SECTION: Posture Depth & Breach Telemetry Stream */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Defense Depth & Risk Formula */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%', p: 2.5, border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Institutional Cyber Posture & Defense Depth
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Multi-vector mitigation coverage and capital spending efficiency
                </Typography>
              </Box>
              <RiskBadge level={state.riskLevel} score={state.overallRiskScore} size="medium" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                  Budget Utilization: ${budgetSpent.toLocaleString()} / ${budgetTotal.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                  {budgetPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={budgetPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                  Bank Operational Health Index
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    fontFamily: '"JetBrains Mono", monospace',
                    color: state.operationalHealth >= 80 ? '#10b981' : state.operationalHealth >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                >
                  {state.operationalHealth}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={state.operationalHealth}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: state.operationalHealth >= 80 ? '#10b981' : state.operationalHealth >= 50 ? '#f59e0b' : '#ef4444'
                  }
                }}
              />
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                Systemic Threat Mitigation Formula
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7', fontSize: '0.74rem', display: 'block', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                Risk = (0.30 × AvgVuln + 0.25 × SPOF + 0.15 × ThirdParty + 0.30 × Degradation) × (1 - Mitigation) + ThreatPenalty
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Real-Time Breach Telemetry Stream */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', p: 2.5, border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Real-Time Telemetry Stream
              </Typography>
              <Chip
                label={`${state.eventsLog.length} Events`}
                size="small"
                sx={{ fontSize: '0.68rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
              />
            </Box>

            {state.eventsLog.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                  No attack events logged yet in Round {state.currentRound}.
                </Typography>
                <Button size="small" variant="contained" color="error" onClick={onTriggerDDoS} sx={{ fontWeight: 700 }}>
                  Execute Authorized Drill
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.25} sx={{ maxHeight: 290, overflowY: 'auto' }}>
                {state.eventsLog.slice(0, 5).map((evt) => (
                  <Box
                    key={evt.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: `4px solid ${evt.mitigationSucceeded ? '#10b981' : '#ef4444'}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {evt.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
                        {evt.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>
                      {evt.narrative}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* BOTTOM SECTION: Critical Banking Assets Table */}
      <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Critical Financial Infrastructure Assets
          </Typography>
          <Chip
            label={`${criticalAssets.length} Critical Tier`}
            size="small"
            sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 800, fontSize: '0.7rem' }}
          />
        </Box>

        <TableContainer sx={{ maxHeight: 280 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: '#64748b', fontSize: '0.72rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0' } }}>
                <TableCell>ASSET NAME</TableCell>
                <TableCell>TIER</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">HEALTH</TableCell>
                <TableCell align="right">FINANCIAL EXPOSURE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {criticalAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  sx={{
                    '& td': { borderBottom: '1px solid #f1f5f9' },
                    '&:hover': { bgcolor: '#f8fafc' },
                    cursor: 'pointer'
                  }}
                  onClick={() => onNavigate('infrastructure')}
                >
                  <TableCell sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.82rem' }}>
                    {asset.name}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {asset.tier}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={asset.healthScore === 0 && (asset.operationalStatus === 'DEGRADED' || asset.operationalStatus === 'HEALTHY') ? 'COMPROMISED' : asset.operationalStatus}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        bgcolor:
                          asset.operationalStatus === 'HEALTHY' && asset.healthScore > 0 ? '#ecfdf5' :
                          asset.operationalStatus === 'DEGRADED' && asset.healthScore > 0 ? '#fffbeb' :
                          asset.operationalStatus === 'OFFLINE' ? '#f1f5f9' : '#fef2f2',
                        color:
                          asset.operationalStatus === 'HEALTHY' && asset.healthScore > 0 ? '#10b981' :
                          asset.operationalStatus === 'DEGRADED' && asset.healthScore > 0 ? '#f59e0b' :
                          asset.operationalStatus === 'OFFLINE' ? '#475569' : '#ef4444'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    color: asset.healthScore >= 80 ? '#10b981' : asset.healthScore >= 50 ? '#f59e0b' : '#ef4444'
                  }}>
                    {asset.healthScore}%
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>
                    ${(asset.financialExposureEstimate / 1000000).toFixed(1)}M
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

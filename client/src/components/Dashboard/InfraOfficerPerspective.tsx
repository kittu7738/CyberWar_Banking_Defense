import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
import StorageIcon from '@mui/icons-material/Storage';
import HubIcon from '@mui/icons-material/Hub';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { StatCard } from '../Common/StatCard.js';
import { RiskBadge } from '../Common/RiskBadge.js';
import { SimulationState } from '../../types/index.js';
import { FailoverDrillDialog } from './FailoverDrillDialog.js';
import { useSimulation } from '../../context/SimulationContext.js';

interface InfraOfficerPerspectiveProps {
  state: SimulationState;
  onNavigate: (view: string) => void;
  onMessage: (msg: string) => void;
}

export const InfraOfficerPerspective: React.FC<InfraOfficerPerspectiveProps> = ({
  state,
  onNavigate,
  onMessage
}) => {
  const { containIncident, recoverIncident } = useSimulation();
  const [drillOpen, setDrillOpen] = useState<boolean>(false);

  // Core Banking service health
  const coreBankingAsset = state.assets.find(a => a.id === 'asset-core-banking');
  const coreHealth = coreBankingAsset ? coreBankingAsset.healthScore : state.operationalHealth;

  const degradedServices = state.assets.filter(a => a.operationalStatus !== 'HEALTHY');
  const hasImmutableBackup = state.controls.some(c => c.id === 'ctrl-backup-recovery' && c.active);

  // Incidents that can be contained or recovered
  const actionIncidents = state.incidents.filter(i => i.status !== 'RECOVERED');

  const handleQuickContain = async (id: string) => {
    try {
      await containIncident(id);
      onMessage(`Incident ${id} contained. Downstream asset isolated.`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleQuickRecover = async (id: string) => {
    try {
      await recoverIncident(id);
      onMessage(`Incident ${id} recovered. Asset operational status restored.`);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Box>
      {/* Role Context Header */}
      <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#ecfdf5', borderRadius: 2, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <StorageIcon sx={{ color: '#059669' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46' }}>
              Business Continuity Director • Critical Infrastructure Resilience Command
            </Typography>
          </Box>
        </Box>
        <Chip
          label="CONTINUITY COMMAND AUTHORITY"
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#059669', color: '#ffffff' }}
        />
      </Box>

      {/* 4 Continuity Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Core Banking Health"
            value={`${coreHealth}%`}
            subtitle={coreBankingAsset?.operationalStatus || 'HEALTHY'}
            icon={<HealthAndSafetyIcon fontSize="large" />}
            color={coreHealth >= 80 ? '#059669' : coreHealth >= 50 ? '#d97706' : '#dc2626'}
            tooltipText="Real-time operational health of the core ledger and transactional settlement engine."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="DR Failover Readiness"
            value={hasImmutableBackup ? 'STANDBY READY' : 'DEGRADED'}
            subtitle={hasImmutableBackup ? '15m RPO Verified' : 'Backup Control Missing'}
            icon={<StorageIcon fontSize="large" />}
            color={hasImmutableBackup ? '#059669' : '#dc2626'}
            tooltipText="Readiness of secondary disaster recovery standby site for hot failover redirection."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Degraded Services"
            value={`${degradedServices.length} Impacted`}
            subtitle={`${state.assets.length - degradedServices.length} Operating Nominally`}
            icon={<HubIcon fontSize="large" />}
            color={degradedServices.length > 0 ? '#dc2626' : '#059669'}
            tooltipText="Total banking services currently experiencing degraded, compromised, or offline status."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="RTO SLA Adherence"
            value={`${Math.round(((state.assets.length - degradedServices.length) / state.assets.length) * 100)}%`}
            subtitle="Target RTO: ≤ 4.0 Hours"
            icon={<CheckCircleIcon fontSize="large" />}
            color="#0ea5e9"
            tooltipText="Percentage of connected services currently operating within defined RTO and RPO SLA boundaries."
          />
        </Grid>
      </Grid>

      {/* Service Continuity Overview & Director Actions */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Continuity & Resilience Diagnostic */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Critical Service Availability & Interdependency Topology
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Cascading dependency mapping across DMZ, Application, and Core Banking ledgers
                  </Typography>
                </Box>
                <RiskBadge level={state.riskLevel} score={state.overallRiskScore} size="medium" />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Failover Status</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669' }}>
                      {state.businessContinuityStatus.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>RTO Target</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                      4.0 Hours Max
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>RPO Objective</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: hasImmutableBackup ? '#059669' : '#dc2626' }}>
                      {hasImmutableBackup ? '15 Min (Snapshots)' : '24 Hours (Lag)'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', borderRadius: 2, border: '1px solid #a7f3d0' }}>
                <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 800, display: 'block', mb: 0.5 }}>
                  BUSINESS CONTINUITY PROTOCOL
                </Typography>
                <Typography variant="caption" sx={{ color: '#047857', display: 'block', lineHeight: 1.4 }}>
                  In the event of perimeter breach saturation or Core Banking compromise, trigger Hot-Site failover to isolate corrupted data feeds and redirect critical customer payment queues.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Continuity Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Continuity Actions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Service Restoration & Failover
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<StorageIcon />}
                  onClick={() => setDrillOpen(true)}
                  sx={{ py: 1.3, fontWeight: 700 }}
                >
                  Run DR Failover Drill
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HubIcon />}
                  onClick={() => onNavigate('infrastructure')}
                  sx={{ py: 1.2, borderColor: '#059669', color: '#059669', fontWeight: 600 }}
                >
                  Inspect Dependency Graph →
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SupportAgentIcon />}
                  onClick={() => onNavigate('incident')}
                  sx={{ py: 1.2, borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                >
                  Incident Command Console →
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  startIcon={<AssessmentIcon />}
                  onClick={() => onNavigate('reports')}
                  sx={{ color: '#475569', fontSize: '0.85rem' }}
                >
                  Review Continuity History →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Grid & Live Restoration Queue */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Infrastructure Service Continuity Roster
                </Typography>
                <Chip label={`${state.assets.length} Banking Services`} size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
              </Box>

              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>SERVICE NAME</TableCell>
                      <TableCell>TIER</TableCell>
                      <TableCell align="right">RTO</TableCell>
                      <TableCell align="right">DEPENDENTS</TableCell>
                      <TableCell align="right">STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.assets.map((asset) => (
                      <TableRow key={asset.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{asset.name}</TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{asset.tier}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{asset.rtoHours}h</TableCell>
                        <TableCell align="right" sx={{ color: asset.dependents.length >= 3 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                          {asset.dependents.length} downstream
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
                Active Service Restoration Queue ({actionIncidents.length})
              </Typography>
              {actionIncidents.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    All services operating nominally. No active outages requiring continuity failover.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  {actionIncidents.map((inc) => (
                    <Box
                      key={inc.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `4px solid ${inc.status === 'CONTAINED' ? '#0284c7' : '#dc2626'}`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {inc.title}
                        </Typography>
                        <Chip
                          label={inc.status}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            bgcolor: inc.status === 'CONTAINED' ? '#e0f2fe' : '#fee2e2',
                            color: inc.status === 'CONTAINED' ? '#0284c7' : '#dc2626'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem', mb: 1 }}>
                        Target: {inc.affectedAssetName} ({inc.affectedAssetId})
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {inc.status === 'DETECTED' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<BuildIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleQuickContain(inc.id)}
                            sx={{ fontSize: '0.72rem', py: 0.25 }}
                          >
                            Isolate / Contain
                          </Button>
                        )}
                        {inc.status === 'CONTAINED' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleQuickRecover(inc.id)}
                            sx={{ fontSize: '0.72rem', py: 0.25 }}
                          >
                            Restore Service
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Failover Drill Dialog */}
      <FailoverDrillDialog
        open={drillOpen}
        onClose={() => setDrillOpen(false)}
        onExecuted={onMessage}
      />
    </Box>
  );
};

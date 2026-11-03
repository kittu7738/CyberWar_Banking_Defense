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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PolicyIcon from '@mui/icons-material/Policy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { StatCard } from '../Common/StatCard.js';
import { RiskBadge } from '../Common/RiskBadge.js';
import { SimulationState } from '../../types/index.js';
import { RecordObservationDialog } from './RecordObservationDialog.js';
import { api } from '../../api/client.js';

interface RegulatorPerspectiveProps {
  state: SimulationState;
  onNavigate: (view: string) => void;
  onMessage: (msg: string) => void;
}

export const RegulatorPerspective: React.FC<RegulatorPerspectiveProps> = ({
  state,
  onNavigate,
  onMessage
}) => {
  const [obsDialogOpen, setObsDialogOpen] = useState<boolean>(false);

  // Regulatory metrics
  const criticalAssets = state.assets.filter(a => a.criticality === 'CRITICAL');
  const degradedCritical = criticalAssets.filter(a => a.operationalStatus !== 'HEALTHY');
  const uncontainedIncidents = state.incidents.filter(i => i.status !== 'CONTAINED' && i.status !== 'RECOVERED');

  // Estimated regulatory exposure fines
  const totalSimulatedLoss = state.eventsLog.reduce((sum, e) => sum + e.financialImpactUSD, 0);
  const estimatedFine = state.riskLevel === 'CRITICAL' ? 1250000 : state.riskLevel === 'HIGH' ? 450000 : 75000;

  // Backup control verification
  const hasBackupControl = state.controls.some(c => c.id === 'ctrl-backup-recovery' && c.active);
  const rtoComplianceCount = state.assets.filter(a => a.operationalStatus === 'HEALTHY' || a.operationalStatus === 'RECOVERING').length;
  const rtoCompliancePct = Math.round((rtoComplianceCount / state.assets.length) * 100);

  const observations = state.supervisoryObservations || [];

  return (
    <Box>
      {/* Role Context Header */}
      <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f5f3ff', borderRadius: 2, border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <AccountBalanceIcon sx={{ color: '#7c3aed' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5b21b6' }}>
              Financial Supervisory Authority / Bank Examiner • Statutory Oversight
            </Typography>
          </Box>
        </Box>
        <Chip
          label="INDEPENDENT SUPERVISORY AUDIT"
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#7c3aed', color: '#ffffff' }}
        />
      </Box>

      {/* 4 Regulator Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Systemic Service Health"
            value={`${state.operationalHealth}%`}
            subtitle={state.businessContinuityStatus.replace('_', ' ')}
            icon={<HealthAndSafetyIcon fontSize="large" />}
            color={state.operationalHealth >= 80 ? '#059669' : state.operationalHealth >= 50 ? '#d97706' : '#dc2626'}
            tooltipText="Aggregate operational uptime across all regulated essential banking services."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Statutory Fine Exposure"
            value={`$${(estimatedFine / 1000).toFixed(0)}k`}
            subtitle="DORA & SEC Material Disclosure Risk"
            icon={<PolicyIcon fontSize="large" />}
            color={estimatedFine >= 500000 ? '#dc2626' : '#d97706'}
            tooltipText="Modeled statutory non-compliance penalties under financial regulatory guidelines."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="RTO SLA Compliance"
            value={`${rtoCompliancePct}%`}
            subtitle={`${rtoComplianceCount} of ${state.assets.length} services within SLA`}
            icon={<WarningAmberIcon fontSize="large" />}
            color={rtoCompliancePct >= 80 ? '#059669' : '#dc2626'}
            tooltipText="Percentage of assets satisfying Recovery Time Objective (RTO) maximum downtime thresholds."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Breach Disruption"
            value={`${uncontainedIncidents.length} Active`}
            subtitle={`${observations.length} Supervisory Observations`}
            icon={<AccountBalanceIcon fontSize="large" />}
            color={uncontainedIncidents.length > 0 ? '#dc2626' : '#059669'}
            tooltipText="Total uncontained systemic breaches currently impacting financial infrastructure operations."
          />
        </Grid>
      </Grid>

      {/* Compliance Overview & Supervisory Actions */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Compliance Evidence & Resilience Card */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Supervisory Resilience Evaluation & Audit Criteria
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Statutory benchmarks derived from Basel Committee, FFIEC, and EU DORA standards
                  </Typography>
                </Box>
                <RiskBadge level={state.riskLevel} score={state.overallRiskScore} size="medium" />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                      IMMUTABLE BACKUP VERIFICATION
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: hasBackupControl ? '#059669' : '#dc2626', mt: 0.5 }}>
                      {hasBackupControl ? '✓ Control Active (15m RPO Verified)' : '✗ Non-Compliant (Control Missing)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      FFIEC Appendix J / DORA Article 12 compliance requirement.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                      CORE BANKING CONCENTRATION RISK
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: degradedCritical.length === 0 ? '#059669' : '#dc2626', mt: 0.5 }}>
                      {degradedCritical.length === 0 ? '✓ Nominal Operations' : `⚠ ${degradedCritical.length} Critical Services Impacted`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Payment processing and interbank settlement availability.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 1.5, bgcolor: '#f5f3ff', borderRadius: 2, border: '1px solid #ddd6fe' }}>
                <Typography variant="caption" sx={{ color: '#5b21b6', fontWeight: 800, display: 'block', mb: 0.5 }}>
                  REGULATORY NOTICE & SCOPE
                </Typography>
                <Typography variant="caption" sx={{ color: '#4c1d95', display: 'block', lineHeight: 1.4 }}>
                  This application simulates cybersecurity stress-tests for bank governance training. Compliance indicators evaluate simulated state configurations and do not constitute official statutory certifications.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Examiner Primary Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Examiner Oversight Actions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Statutory Inspection & Supervisory Records
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddCommentIcon />}
                  onClick={() => setObsDialogOpen(true)}
                  sx={{
                    py: 1.3,
                    fontWeight: 700,
                    bgcolor: '#7c3aed',
                    '&:hover': { bgcolor: '#6d28d9' }
                  }}
                >
                  Record Supervisory Observation
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={api.getExportJsonUrl()}
                  target="_blank"
                  download="statutory-oversight-audit-report.json"
                  sx={{ py: 1.2, borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 600 }}
                >
                  Download Oversight Audit Package →
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountTreeIcon />}
                  onClick={() => onNavigate('risk')}
                  sx={{ py: 1.2, borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                >
                  Inspect Critical Path Topology →
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  startIcon={<AssessmentIcon />}
                  onClick={() => onNavigate('reports')}
                  sx={{ color: '#475569', fontSize: '0.85rem' }}
                >
                  View Historical Audit Trail →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Assets Compliance & Supervisory Observations Feed */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Supervisory Asset Resilience Grid
                </Typography>
                <Chip label={`${criticalAssets.length} Regulated Assets`} size="small" sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', fontWeight: 800 }} />
              </Box>

              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>REGULATED SERVICE</TableCell>
                      <TableCell>RTO SLA</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell align="right">HEALTH</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criticalAssets.map((asset) => (
                      <TableRow key={asset.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{asset.name}</TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{asset.rtoHours}h Max</TableCell>
                        <TableCell>
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
                                asset.operationalStatus === 'OFFLINE' ? '#f1f5f9' : '#fef2f2',
                              color:
                                asset.operationalStatus === 'HEALTHY' && asset.healthScore > 0 ? '#059669' :
                                asset.operationalStatus === 'DEGRADED' && asset.healthScore > 0 ? '#d97706' :
                                asset.operationalStatus === 'OFFLINE' ? '#475569' : '#dc2626'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: asset.healthScore >= 80 ? '#059669' : '#dc2626' }}>
                          {asset.healthScore}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Supervisory Observations Log ({observations.length})
                </Typography>
                <Button size="small" variant="text" onClick={() => setObsDialogOpen(true)} sx={{ color: '#7c3aed', fontWeight: 700 }}>
                  + Add Finding
                </Button>
              </Box>

              <Stack spacing={1.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {observations.map((obs) => (
                  <Box
                    key={obs.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: `4px solid ${
                        obs.severity === 'MATTER_REQUIRING_ATTENTION' ? '#dc2626' :
                        obs.severity === 'DEFICIENCY' ? '#ea580c' : '#7c3aed'
                      }`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        label={obs.severity.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          bgcolor: obs.severity === 'MATTER_REQUIRING_ATTENTION' ? '#fef2f2' : '#f5f3ff',
                          color: obs.severity === 'MATTER_REQUIRING_ATTENTION' ? '#dc2626' : '#7c3aed'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                        {obs.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem', mt: 0.5 }}>
                      {obs.finding}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      Action: {obs.actionRequired}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Record Observation Dialog */}
      <RecordObservationDialog
        open={obsDialogOpen}
        onClose={() => setObsDialogOpen(false)}
        onSaved={onMessage}
      />
    </Box>
  );
};

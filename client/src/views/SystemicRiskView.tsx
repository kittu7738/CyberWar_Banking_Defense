import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HubIcon from '@mui/icons-material/Hub';
import SecurityIcon from '@mui/icons-material/Security';
import { api } from '../api/client.js';
import { useSimulation } from '../context/SimulationContext.js';
import { SystemicRiskAssessment, AttackVector } from '../types/index.js';
import { StatCard } from '../components/Common/StatCard.js';

export const SystemicRiskView: React.FC = () => {
  const { state } = useSimulation();
  const [assessment, setAssessment] = useState<SystemicRiskAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRisk = async () => {
      try {
        setLoading(true);
        const res = await api.getSystemicRisk();
        setAssessment(res.assessment);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRisk();
  }, [state]);

  if (loading || !assessment || !state) return null;

  const budgetSpent = state.budget.spent;
  const budgetTotal = state.budget.total;
  const budgetUtilization = Math.round((budgetSpent / budgetTotal) * 100);

  // Attack Vector Vulnerability Matrix
  const activeControls = state.controls.filter(c => c.active);
  const vectorNames: AttackVector[] = ['DDOS', 'RANSOMWARE', 'DATA_BREACH', 'INSIDER_THREAT', 'SUPPLY_CHAIN', 'INFRASTRUCTURE_DISRUPTION'];
  
  const vectorProtections: Record<AttackVector, number> = {
    DDOS: 0,
    RANSOMWARE: 0,
    DATA_BREACH: 0,
    INSIDER_THREAT: 0,
    SUPPLY_CHAIN: 0,
    INFRASTRUCTURE_DISRUPTION: 0
  };

  for (const v of vectorNames) {
    let unmitigated = 1.0;
    for (const c of activeControls) {
      const eff = c.effectiveness[v] || 0;
      if (eff > 0) unmitigated *= (1 - eff * 0.82);
    }
    vectorProtections[v] = Math.min(0.95, Math.round((1 - unmitigated) * 100) / 100);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon sx={{ color: '#0284c7' }} />
          Systemic Cyber Risk Analysis
        </Typography>
      </Box>

      {/* Disclaimers Alert */}
      <Alert severity="info" sx={{ mb: 3, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
        {assessment.illustrativeFinancialExposure.disclaimer}
      </Alert>

      {/* Risk Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Systemic Cyber Risk"
            value={`${assessment.overallRiskScore} / 100`}
            subtitle={`${assessment.riskLevel} Profile`}
            icon={<WarningAmberIcon fontSize="large" />}
            color={assessment.riskLevel === 'CRITICAL' ? '#dc2626' : '#0284c7'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resilience Index"
            value={`${assessment.resilienceScore} / 100`}
            subtitle="Recovery & Failover Readiness"
            icon={<HubIcon fontSize="large" />}
            color="#059669"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Concentration Risk"
            value={`${assessment.concentrationRiskScore} / 100`}
            subtitle="Single Points of Failure (SPOF)"
            icon={<AccountTreeIcon fontSize="large" />}
            color="#d97706"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Budget Utilization"
            value={`${budgetUtilization}%`}
            subtitle={`$${budgetSpent.toLocaleString()} Spent of $1M`}
            icon={<SecurityIcon fontSize="large" />}
            color="#0ea5e9"
          />
        </Grid>
      </Grid>

      {/* Vector Vulnerability Matrix */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
            Attack Vector Defense Coverage vs. Residual Exposure
          </Typography>

          <Grid container spacing={2}>
            {vectorNames.map((vec) => {
              const protection = vectorProtections[vec];
              const residual = Math.round((1 - protection) * 100);

              return (
                <Grid item xs={12} sm={6} md={4} key={vec}>
                  <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {vec.replace('_', ' ')}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: protection >= 0.7 ? '#059669' : '#0284c7', fontFamily: '"JetBrains Mono", monospace' }}>
                        {(protection * 100).toFixed(0)}% Defended
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={protection * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: protection >= 0.7 ? '#059669' : protection >= 0.4 ? '#0284c7' : '#d97706'
                        }
                      }}
                    />

                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', mt: 0.5 }}>
                      Residual Threat Exposure: <span style={{ color: residual >= 50 ? '#dc2626' : '#059669', fontWeight: 700 }}>{residual}%</span>
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* SPOF Table & Potential Financial Exposure */}
      <Grid container spacing={3}>
        {/* Concentration Nodes Table */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Concentration Risk Nodes & Single Points of Failure
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Services whose failure causes cascading operational degradation
              </Typography>

              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>ASSET</TableCell>
                      <TableCell>DEPENDENTS</TableCell>
                      <TableCell>CENTRALITY</TableCell>
                      <TableCell>SPOF</TableCell>
                      <TableCell align="right">CASCADE IMPACT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assessment.concentrationNodes.map((n) => (
                      <TableRow key={n.assetId} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>
                          {n.assetName}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
                          {n.dependentCount} downstream
                        </TableCell>
                        <TableCell sx={{ color: '#0284c7', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                          {n.centralityScore}
                        </TableCell>
                        <TableCell>
                          {n.isSinglePointOfFailure ? (
                            <Chip label="SPOF RISK" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '0.65rem' }} />
                          ) : (
                            <Chip label="DISTRIBUTED" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.65rem' }} />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ color: n.cascadingImpactScore >= 50 ? '#dc2626' : '#d97706', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                          {n.cascadingImpactScore} / 100
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Illustrative Potential Loss Model */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Illustrative Potential Loss Model
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Synthetic risk estimation under severe multi-day systemic incident
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Potential Daily Direct Loss</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"JetBrains Mono", monospace' }}>
                    ${assessment.illustrativeFinancialExposure.potentialDailyLossUSD.toLocaleString()} USD
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Business Interruption Estimate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706', fontFamily: '"JetBrains Mono", monospace' }}>
                    ${assessment.illustrativeFinancialExposure.businessInterruptionEstimateUSD.toLocaleString()} USD
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Regulatory Exposure (GDPR/SEC)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#dc2626', fontFamily: '"JetBrains Mono", monospace' }}>
                    ${assessment.illustrativeFinancialExposure.regulatoryFineExposureUSD.toLocaleString()} USD
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Critical Path High-Value Asset Chain:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                {assessment.criticalPath.map((assetId) => (
                  <Chip
                    key={assetId}
                    label={assetId.replace('asset-', '')}
                    size="small"
                    sx={{ bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 700 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

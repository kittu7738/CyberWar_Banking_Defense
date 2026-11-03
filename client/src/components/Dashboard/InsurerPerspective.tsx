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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { StatCard } from '../Common/StatCard.js';
import { RiskBadge } from '../Common/RiskBadge.js';
import { SimulationState } from '../../types/index.js';
import { ActuarialCalculatorDialog } from './ActuarialCalculatorDialog.js';
import { api } from '../../api/client.js';

interface InsurerPerspectiveProps {
  state: SimulationState;
  onNavigate: (view: string) => void;
  onMessage: (msg: string) => void;
}

export const InsurerPerspective: React.FC<InsurerPerspectiveProps> = ({
  state,
  onNavigate,
  onMessage
}) => {
  const [calcOpen, setCalcOpen] = useState<boolean>(false);

  // Insurer metrics
  const totalExposure = state.assets.reduce((sum, a) => sum + a.financialExposureEstimate, 0);
  const totalSimulatedLoss = state.eventsLog.reduce((sum, e) => sum + e.financialImpactUSD, 0);

  const policyLimit = 5000000;
  const deductible = 250000;
  const netClaimPayout = Math.min(policyLimit, Math.max(0, totalSimulatedLoss - deductible));
  const lossRatioPct = totalSimulatedLoss > 0 ? Math.round((netClaimPayout / policyLimit) * 100) : 0;

  const activeControls = state.controls.filter(c => c.active);
  const warrantyCompliancePct = Math.round((activeControls.length / state.controls.length) * 100);

  const estimatedDailyInterruption = Math.round((totalExposure * 0.04) * (state.overallRiskScore / 100));

  return (
    <Box>
      {/* Role Context Header */}
      <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <AccountBalanceWalletIcon sx={{ color: '#d97706' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>
              Cyber Risk Underwriter • Actuarial Modeling & Loss Indemnity
            </Typography>
          </Box>
        </Box>
        <Chip
          label="ACTUARIAL ESTIMATE (NON-BINDING)"
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#d97706', color: '#ffffff' }}
        />
      </Box>

      {/* 4 Insurer Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Insured Exposure"
            value={`$${(totalExposure / 1000000).toFixed(1)}M`}
            subtitle="12 Connected Banking Assets"
            icon={<AccountBalanceWalletIcon fontSize="large" />}
            color="#d97706"
            tooltipText="Aggregated financial exposure value across core banking, database, payment, and ATM rails."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily Interruption Risk"
            value={`$${(estimatedDailyInterruption / 1000).toFixed(0)}k / day`}
            subtitle="Modeled Downtime Interruption"
            icon={<WarningAmberIcon fontSize="large" />}
            color={estimatedDailyInterruption >= 500000 ? '#dc2626' : '#ea580c'}
            tooltipText="Modeled financial interruption cost per operational day degraded under current risk profile."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Modeled Net Claim"
            value={`$${(netClaimPayout / 1000).toFixed(0)}k`}
            subtitle={`$250k Deductible • ${lossRatioPct}% Loss Ratio`}
            icon={<TrendingDownIcon fontSize="large" />}
            color={netClaimPayout > 0 ? '#dc2626' : '#059669'}
            tooltipText="Modeled indemnity payout by insurer after applying self-insured retention deductible."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warranty Control Index"
            value={`${warrantyCompliancePct}%`}
            subtitle={`${activeControls.length} / ${state.controls.length} Warranted Controls Active`}
            icon={<VerifiedUserIcon fontSize="large" />}
            color={warrantyCompliancePct >= 60 ? '#059669' : '#dc2626'}
            tooltipText="Percentage of underwriting security controls verified active to validate policy warranty clauses."
          />
        </Grid>
      </Grid>

      {/* Actuarial Modeling Overview & Underwriter Actions */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Actuarial Exposure Breakdown */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Cyber Underwriting Loss Modeling & Retention Assumptions
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Standard financial institution commercial policy scenario ($5M limit, $250k retention)
                  </Typography>
                </Box>
                <RiskBadge level={state.riskLevel} score={state.overallRiskScore} size="medium" />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Policy Limit</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>$5,000,000</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Retention / Ded.</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0284c7' }}>$250,000</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Modeled Loss</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#dc2626' }}>${(totalSimulatedLoss / 1000).toFixed(0)}k</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Net Payout</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#059669' }}>${(netClaimPayout / 1000).toFixed(0)}k</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 800, display: 'block', mb: 0.5 }}>
                  ACTUARIAL METHODOLOGY & WARRANTY CLAUSES
                </Typography>
                <Typography variant="caption" sx={{ color: '#b45309', display: 'block', lineHeight: 1.4 }}>
                  Warranty clauses require active Immutable Backups, MFA, and Network Segmentation. Failure to maintain warranted controls may trigger policy coverage reservations or claim co-insurance penalties.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Underwriter Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Underwriter Actions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Financial Exposure Analysis & Modeling
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CalculateIcon />}
                  onClick={() => setCalcOpen(true)}
                  sx={{
                    py: 1.3,
                    fontWeight: 700,
                    bgcolor: '#d97706',
                    '&:hover': { bgcolor: '#b45309' }
                  }}
                >
                  Interactive Actuarial Calculator
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={api.getExportCsvUrl()}
                  target="_blank"
                  download="underwriting-exposure-model.csv"
                  sx={{ py: 1.2, borderColor: '#d97706', color: '#d97706', fontWeight: 600 }}
                >
                  Export Actuarial Risk Model (CSV) →
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountTreeIcon />}
                  onClick={() => onNavigate('risk')}
                  sx={{ py: 1.2, borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
                >
                  Inspect Exposure Concentrations →
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => onNavigate('reports')}
                  sx={{ color: '#475569', fontSize: '0.85rem' }}
                >
                  Review Historical Claim Scenarios →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Asset Balance Sheet Exposure Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Banking Asset Balance Sheet & Modeled Loss Distribution
                </Typography>
                <Chip label={`$${(totalExposure / 1000000).toFixed(1)}M Total Value`} size="small" sx={{ bgcolor: '#fffbeb', color: '#d97706', fontWeight: 800 }} />
              </Box>

              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>INSURED ASSET</TableCell>
                      <TableCell>TIER</TableCell>
                      <TableCell align="right">EXPOSURE ESTIMATE</TableCell>
                      <TableCell align="right">DAILY INTERRUPTION</TableCell>
                      <TableCell align="right">WARRANTY CONTROLS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.assets.map((asset) => {
                      const dailyInterruption = Math.round(asset.financialExposureEstimate * 0.04);
                      return (
                        <TableRow key={asset.id} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#fffbeb' } }}>
                          <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{asset.name}</TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{asset.tier}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#0f172a' }}>
                            ${(asset.financialExposureEstimate / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#ea580c' }}>
                            ${(dailyInterruption / 1000).toFixed(0)}k
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${asset.appliedControls.length} Controls`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: asset.appliedControls.length >= 2 ? '#ecfdf5' : '#fef2f2',
                                color: asset.appliedControls.length >= 2 ? '#059669' : '#dc2626'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actuarial Calculator Dialog */}
      <ActuarialCalculatorDialog
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
      />
    </Box>
  );
};

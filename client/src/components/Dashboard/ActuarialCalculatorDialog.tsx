import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Slider
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSimulation } from '../../context/SimulationContext.js';

interface ActuarialCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ActuarialCalculatorDialog: React.FC<ActuarialCalculatorDialogProps> = ({
  open,
  onClose
}) => {
  const { state } = useSimulation();
  const [policyLimit, setPolicyLimit] = useState<number>(5000000);
  const [deductible, setDeductible] = useState<number>(250000);

  if (!state) return null;

  const totalExposure = state.assets.reduce((sum, a) => sum + a.financialExposureEstimate, 0);
  const totalSimulatedLoss = state.eventsLog.reduce((sum, e) => sum + e.financialImpactUSD, 0);

  // Covered claim = min(policyLimit, max(0, totalSimulatedLoss - deductible))
  const netClaimPayout = Math.min(policyLimit, Math.max(0, totalSimulatedLoss - deductible));
  const retainedBankLoss = Math.min(totalSimulatedLoss, deductible) + Math.max(0, totalSimulatedLoss - deductible - policyLimit);
  const lossRatioPct = totalSimulatedLoss > 0 ? Math.round((netClaimPayout / policyLimit) * 100) : 0;

  const activeControls = state.controls.filter(c => c.active);
  const warrantyCompliancePct = Math.round((activeControls.length / state.controls.length) * 100);

  const underwritingTier = 
    state.riskLevel === 'CRITICAL' ? 'SUBSTANDARD / HIGH RISK' :
    state.riskLevel === 'HIGH' ? 'STANDARD PLUS SURCHARGE' :
    warrantyCompliancePct >= 60 ? 'PREFERRED TIER' : 'STANDARD TIER';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
        <CalculateIcon sx={{ color: '#d97706' }} />
        Cyber Insurance Actuarial & Underwriting Model
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
          Model financial exposure, policy claim payouts, and warranty compliance against simulated cyber disruptions. Modeled for illustrative underwriter risk assessment.
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Interactive Sliders */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  Policy Aggregate Limit: ${(policyLimit / 1000000).toFixed(1)}M
                </Typography>
                <Slider
                  value={policyLimit}
                  min={1000000}
                  max={20000000}
                  step={500000}
                  onChange={(e, val) => setPolicyLimit(val as number)}
                  sx={{ color: '#d97706' }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  Self-Insured Retention (Deductible): ${(deductible / 1000).toFixed(0)}k
                </Typography>
                <Slider
                  value={deductible}
                  min={50000}
                  max={2000000}
                  step={50000}
                  onChange={(e, val) => setDeductible(val as number)}
                  sx={{ color: '#0284c7' }}
                />
              </Box>

              <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', p: 1 }}>
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Control Warranty Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {warrantyCompliancePct}% ({activeControls.length} / {state.controls.length} Controls)
                    </Typography>
                    <Chip
                      size="small"
                      label={underwritingTier}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: underwritingTier.includes('SUBSTANDARD') ? '#fef2f2' : '#ecfdf5',
                        color: underwritingTier.includes('SUBSTANDARD') ? '#dc2626' : '#059669'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right: Calculated Claims Breakdown */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Insured Balance Sheet</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ${(totalExposure / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>12 banking assets</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                  <Typography variant="caption" sx={{ color: '#991b1b' }}>Total Simulated Loss</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#dc2626' }}>
                    ${(totalSimulatedLoss / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b91c1c' }}>Disruption damage</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                  <Typography variant="caption" sx={{ color: '#b45309' }}>Retained Bank Loss</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706' }}>
                    ${(retainedBankLoss / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#92400e' }}>Within policy deductible</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', borderRadius: 2, border: '1px solid #a7f3d0' }}>
                  <Typography variant="caption" sx={{ color: '#047857' }}>Net Insurer Claim Payout</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                    ${(netClaimPayout / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#065f46' }}>Loss ratio: {lossRatioPct}%</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f1f5f9', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '0.72rem' }}>
                *ACTUARIAL DISCLAIMER: Modeled figures represent synthetic risk simulation benchmarks for cyber underwriting research and do not constitute binding insurance commitments.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, fontWeight: 700 }}>
          Close Actuarial Summary
        </Button>
      </DialogActions>
    </Dialog>
  );
};

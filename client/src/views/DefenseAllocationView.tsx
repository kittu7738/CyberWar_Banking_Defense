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
  Checkbox,
  LinearProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useSimulation } from '../context/SimulationContext.js';
import { useRole } from '../context/RoleContext.js';
import { DefensiveControl, AttackVector } from '../types/index.js';

export const DefenseAllocationView: React.FC = () => {
  const { state, allocateControls, optimizeBudget } = useSimulation();
  const { activeRole, roleDetails } = useRole();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optimizationData, setOptimizationData] = useState<any | null>(null);
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.controls) {
      setSelectedIds(state.controls.filter(c => c.active).map(c => c.id));
    }
  }, [state?.controls]);

  if (!state) return null;

  const totalBudget = state.budget.total;
  const currentCost = state.controls
    .filter(c => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.cost, 0);
  const remainingBudget = totalBudget - currentCost;
  const isOverBudget = remainingBudget < 0;
  const budgetUtilizationPct = Math.min(100, Math.round((currentCost / totalBudget) * 100));

  // Multi-layer combination model: 1 - prod(1 - 0.82 * eff)
  const calculateCurrentVectorMitigations = (): Record<AttackVector, number> => {
    const vectors: AttackVector[] = ['DDOS', 'RANSOMWARE', 'DATA_BREACH', 'INSIDER_THREAT', 'SUPPLY_CHAIN', 'INFRASTRUCTURE_DISRUPTION'];
    const activeControls = state.controls.filter(c => selectedIds.includes(c.id));
    const res: Record<AttackVector, number> = {
      DDOS: 0,
      RANSOMWARE: 0,
      DATA_BREACH: 0,
      INSIDER_THREAT: 0,
      SUPPLY_CHAIN: 0,
      INFRASTRUCTURE_DISRUPTION: 0
    };

    for (const v of vectors) {
      let unmitigated = 1.0;
      for (const ctrl of activeControls) {
        const eff = ctrl.effectiveness[v] || 0;
        if (eff > 0) unmitigated *= (1 - eff * 0.82);
      }
      res[v] = Math.min(0.95, Math.round((1 - unmitigated) * 100) / 100);
    }
    return res;
  };

  const vectorMitigations = calculateCurrentVectorMitigations();

  const handleToggle = (control: DefensiveControl) => {
    setSaveSuccess(null);
    setSaveError(null);

    const isCurrentlySelected = selectedIds.includes(control.id);

    if (!isCurrentlySelected) {
      // Check budget limit constraint
      if (currentCost + control.cost > totalBudget) {
        setSaveError(`Cannot select "${control.name}": Exceeds remaining budget ($${remainingBudget.toLocaleString()} available, cost is $${control.cost.toLocaleString()}).`);
        return;
      }
      setSelectedIds([...selectedIds, control.id]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== control.id));
    }
  };

  const handleApply = async () => {
    try {
      setSaveError(null);
      await allocateControls(selectedIds);
      setSaveSuccess(`Defense posture applied! $${currentCost.toLocaleString()} allocated across ${selectedIds.length} controls.`);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to apply allocation.');
    }
  };

  const handleResetToBaseline = async () => {
    try {
      setSelectedIds([]);
      await allocateControls([]);
      setSaveSuccess('Defense allocation reset to zero baseline.');
      setSaveError(null);
    } catch (err: any) {
      setSaveError(err.message);
    }
  };

  const handleRunOptimizer = async () => {
    try {
      setOptimizing(true);
      setSaveSuccess(null);
      setSaveError(null);
      const opt = await optimizeBudget();
      setOptimizationData(opt);
      setSelectedIds(opt.recommendedControlIds);
      setSaveSuccess(`Budget optimizer computed optimal defense portfolio ($${opt.totalCostUSD.toLocaleString()} spent, ${opt.recommendedControlIds.length} controls, ${opt.coveragePercent}% asset coverage).`);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Title & Top Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#059669' }} />
            Defensive Resource Allocation & Optimization
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {optimizationData && (
            <Button
              variant="outlined"
              startIcon={<CompareArrowsIcon />}
              onClick={() => setCompareOpen(true)}
              sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
            >
              Compare with Optimal
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<SmartToyIcon />}
            onClick={handleRunOptimizer}
            disabled={optimizing}
            sx={{ fontWeight: 700 }}
          >
            {optimizing ? 'Optimizing...' : 'Optimize Budget'}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<CheckCircleIcon />}
            onClick={handleApply}
            disabled={isOverBudget}
            sx={{ fontWeight: 700 }}
          >
            Apply Allocation
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={handleResetToBaseline}
            sx={{ borderColor: '#cbd5e1', color: '#64748b' }}
          >
            Reset
          </Button>
        </Stack>
      </Box>

      {activeRole !== 'CISO' && (
        <Alert severity="info" sx={{ mb: 2.5, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
          READ-ONLY AUDIT MODE: You are currently viewing as <strong>{roleDetails?.title || activeRole}</strong>. Only Chief Information Security Officer (CISO) is authorized to deploy enterprise security controls. Switch to CISO perspective to modify budget.
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2.5, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }} onClose={() => setSaveSuccess(null)}>
          {saveSuccess}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 2.5, bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Budget Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                TOTAL BUDGET
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"JetBrains Mono", monospace' }}>
                ${totalBudget.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Fixed Fiscal Limit
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                ALLOCATED SPENDING
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284c7', fontFamily: '"JetBrains Mono", monospace' }}>
                ${currentCost.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {selectedIds.length} of {state.controls.length} Controls Selected
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: isOverBudget ? '#dc2626' : '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                REMAINING BUDGET
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: isOverBudget ? '#dc2626' : '#059669',
                  fontFamily: '"JetBrains Mono", monospace'
                }}
              >
                ${remainingBudget.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: isOverBudget ? '#dc2626' : '#64748b', fontWeight: isOverBudget ? 700 : 400 }}>
                {isOverBudget ? 'EXCEEDS BUDGET!' : `${100 - budgetUtilizationPct}% Available`}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                BUDGET UTILIZATION
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"JetBrains Mono", monospace' }}>
                {budgetUtilizationPct}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={budgetUtilizationPct}
                sx={{
                  mt: 0.5,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    background: isOverBudget ? '#dc2626' : 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)'
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Aggregate Vector Protection Strip */}
      <Card sx={{ mb: 3, bgcolor: '#f8fafc' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
            Aggregate Threat Vector Deflection Rates:
          </Typography>
          <Grid container spacing={1.5}>
            {Object.entries(vectorMitigations).map(([vec, rate]) => (
              <Grid item xs={6} sm={4} md={2} key={vec}>
                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', display: 'block' }}>
                    {vec.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: rate >= 0.7 ? '#059669' : rate >= 0.4 ? '#0284c7' : '#d97706', fontFamily: '"JetBrains Mono", monospace' }}>
                    {(rate * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 10 Controls Cards Grid */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
        Available Defense Controls ({state.controls.length})
      </Typography>

      <Grid container spacing={2}>
        {state.controls.map((control) => {
          const isSelected = selectedIds.includes(control.id);
          const wouldExceed = !isSelected && (currentCost + control.cost > totalBudget);

          return (
            <Grid item xs={12} sm={6} md={6} key={control.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: wouldExceed ? 'not-allowed' : 'pointer',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: 2.5,
                  bgcolor: isSelected ? '#f0f9ff' : '#ffffff',
                  opacity: wouldExceed ? 0.65 : 1,
                  boxShadow: isSelected ? '0 0 0 1px #0284c7, 0 8px 20px -4px rgba(2, 132, 199, 0.16)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    borderColor: wouldExceed ? '#e2e8f0' : '#0284c7',
                    boxShadow: wouldExceed ? 'none' : '0 6px 16px rgba(2, 132, 199, 0.14)',
                    transform: wouldExceed ? 'none' : 'translateY(-1px)'
                  }
                }}
                onClick={() => !wouldExceed && handleToggle(control)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Checkbox
                        checked={isSelected}
                        disabled={wouldExceed}
                        onChange={() => handleToggle(control)}
                        sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#0284c7' }, p: 0, mt: 0.2 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                          {control.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700 }}>
                          {control.category}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={`$${(control.cost / 1000).toFixed(0)}k`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"JetBrains Mono", monospace',
                        bgcolor: isSelected ? '#0284c7' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#0f172a'
                      }}
                    />
                  </Box>

                  {/* Vector Mitigation Badges */}
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', my: 1 }}>
                    {Object.entries(control.effectiveness).map(([vec, val]) => (
                      val > 0 ? (
                        <Chip
                          key={vec}
                          label={`${vec.slice(0, 4)}: ${(val * 100).toFixed(0)}%`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: isSelected ? '#e0f2fe' : '#f8fafc',
                            color: val >= 0.7 ? '#059669' : '#0284c7',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                      ) : null
                    ))}
                  </Box>

                  {/* Limitations in concise tooltip */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                      {control.mitigationFormula}
                    </Typography>
                    <Tooltip title={`Limitation: ${control.limitations}`} arrow placement="top">
                      <IconButton size="small" sx={{ p: 0.3, color: '#94a3b8' }}>
                        <HelpOutlineIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Comparison Modal */}
      {optimizationData && (
        <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Current Allocation vs. Optimal Portfolio
            </Typography>
            <IconButton onClick={() => setCompareOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Your Current Selection ({selectedIds.length} Controls)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                    Total Cost: <span style={{ fontWeight: 700, color: '#0f172a' }}>${currentCost.toLocaleString()}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Remaining Budget: <span style={{ fontWeight: 700, color: '#059669' }}>${remainingBudget.toLocaleString()}</span>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7', mb: 1 }}>
                    Recommended Optimal ({optimizationData.recommendedControlIds.length} Controls)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                    Total Cost: <span style={{ fontWeight: 700, color: '#0f172a' }}>${optimizationData.totalCostUSD.toLocaleString()}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Expected Risk Reduction: <span style={{ fontWeight: 700, color: '#0284c7' }}>-{optimizationData.riskReductionScore} pts</span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, fontWeight: 700 }}>
              OPTIMAL CONTROLS INCLUDED:
            </Typography>
            <Stack spacing={1}>
              {optimizationData.selectedControlsSummary.map((s: any) => (
                <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {s.name} (${s.cost.toLocaleString()})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                    ROI Index: {s.roiScore}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCompareOpen(false)} sx={{ color: '#64748b' }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedIds(optimizationData.recommendedControlIds);
                setCompareOpen(false);
              }}
              sx={{ fontWeight: 700 }}
            >
              Adopt Optimal Selection
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

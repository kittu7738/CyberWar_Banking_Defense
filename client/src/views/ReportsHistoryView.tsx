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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FastForwardIcon from '@mui/icons-material/FastForward';
import PrintIcon from '@mui/icons-material/Print';
import { api } from '../api/client.js';
import { useSimulation } from '../context/SimulationContext.js';
import { ConfirmDialog } from '../components/Common/ConfirmDialog.js';

export const ReportsHistoryView: React.FC = () => {
  const { state, advanceRound, resetSimulation } = useSimulation();
  const [report, setReport] = useState<any | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      const res = await api.getReportSummary();
      setReport(res.report);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReport();
  }, [state]);

  const handleDownloadJson = () => {
    window.open(api.getExportJsonUrl(), '_blank');
  };

  const handleDownloadCsv = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAdvance = async () => {
    try {
      const res = await advanceRound();
      setAlertMessage(`Round ${res.roundSummary.roundNumber} summarized and saved. Active round is now Round ${res.nextRoundNumber}.`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetSimulation();
      setResetDialogOpen(false);
      setAlertMessage('Simulation reset to baseline. Historical audit rounds preserved.');
    } catch (err: any) {
      console.error(err);
    }
  };

  if (!state || !report) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* View Title & Export Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#0284c7' }} />
            Simulation History & Incident Reports
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 600 }}
          >
            Print Report
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadJson}
            sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
          >
            Export JSON
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCsv}
            sx={{ borderColor: '#059669', color: '#059669', fontWeight: 600 }}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FastForwardIcon />}
            onClick={handleAdvance}
            sx={{ fontWeight: 700 }}
          >
            Advance Round
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={() => setResetDialogOpen(true)}
            sx={{ fontWeight: 600 }}
          >
            Reset Simulation
          </Button>
        </Stack>
      </Box>

      {alertMessage && (
        <Alert severity="info" sx={{ mb: 3, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }} onClose={() => setAlertMessage(null)}>
          {alertMessage}
        </Alert>
      )}

      {/* Rounds Comparison Table */}
      <Card sx={{ mb: 3.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Simulation Rounds Comparison (Current: Round {state.currentRound} of {state.maxRounds})
            </Typography>
            <Chip
              label={`${state.roundsHistory.length} Archived • Round ${state.currentRound} Active`}
              size="small"
              sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700 }}
            />
          </Box>

          {(() => {
            const currentRoundEvents = state.eventsLog.filter(e => e.roundNumber === state.currentRound);
            const currentDamage = currentRoundEvents.reduce((sum, e) => sum + e.financialImpactUSD, 0);
            const currentEffective = currentRoundEvents.filter(e => e.mitigationSucceeded).length;
            const currentBypassed = currentRoundEvents.filter(e => !e.mitigationSucceeded).length;
            const activeScenario = state.activeScenario || report.activeScenario;

            return (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700 } }}>
                      <TableCell>ROUND</TableCell>
                      <TableCell>VECTOR</TableCell>
                      <TableCell>SCENARIO</TableCell>
                      <TableCell align="right">RESIDUAL RISK</TableCell>
                      <TableCell align="right">DAMAGE ($)</TableCell>
                      <TableCell align="right">DEFENSES DEFLECT/BYPASS</TableCell>
                      <TableCell align="right">IR SCORE</TableCell>
                      <TableCell>KEY TAKEAWAY / STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Archived Completed Rounds */}
                    {state.roundsHistory.map((r) => (
                      <TableRow key={r.roundNumber} sx={{ '& td': { borderBottom: '1px solid #f1f5f9' }, '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, color: '#0284c7' }}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <span>Round {r.roundNumber}</span>
                            <Chip label="ARCHIVED" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669' }} />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={r.vector} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: '#f0f9ff', color: '#0284c7' }} />
                        </TableCell>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>
                          {r.scenarioName}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: r.residualRisk <= 50 ? '#059669' : '#dc2626' }}>
                          {r.residualRisk}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#64748b' }}>
                          ${r.financialDamageUSD.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                          <span style={{ color: '#059669', fontWeight: 700 }}>{r.defensesEffectiveCount}</span> / <span style={{ color: '#dc2626', fontWeight: 700 }}>{r.defensesBypassedCount}</span>
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0284c7', fontWeight: 700 }}>
                          {r.irScore}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {r.keyTakeaway}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Active In-Progress Round Live Row */}
                    <TableRow
                      sx={{
                        bgcolor: '#f0f9ff',
                        '& td': { borderBottom: '1px solid #bae6fd' },
                        '&:hover': { bgcolor: '#e0f2fe' }
                      }}
                    >
                      <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, color: '#0284c7' }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <span>Round {state.currentRound}</span>
                          <Chip
                            label="LIVE ACTIVE"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              bgcolor: '#0284c7',
                              color: '#ffffff'
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activeScenario?.vector || 'PENDING'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: '#ffffff', color: '#0284c7', border: '1px solid #bae6fd' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#0f172a', fontWeight: 700 }}>
                        {activeScenario?.name || 'Active Attack Vector'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, color: state.overallRiskScore <= 50 ? '#059669' : '#dc2626' }}>
                        {state.overallRiskScore}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: currentDamage > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                        ${currentDamage.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <span style={{ color: '#059669', fontWeight: 700 }}>{currentEffective}</span> / <span style={{ color: '#dc2626', fontWeight: 700 }}>{currentBypassed}</span>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#0284c7', fontWeight: 700 }}>
                        {state.irProgress?.totalScore ?? 0}
                      </TableCell>
                      <TableCell sx={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 600 }}>
                        Active telemetry. Click "Advance Round" above to archive into audit trail.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            );
          })()}
        </CardContent>
      </Card>

      {/* Comprehensive Current Session Report */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Executive Incident Overview
              </Typography>

              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Active Attack Vector:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{report.activeScenario?.vector || 'None'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Threat Actor:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>{report.activeScenario?.threatActor || 'None'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Budget Utilization:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    ${report.financialMetrics.budgetSpentUSD.toLocaleString()} / ${report.financialMetrics.budgetTotalUSD.toLocaleString()} ({report.financialMetrics.budgetUtilizationPercent}%)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Cumulative Loss Estimate:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    ${report.financialMetrics.totalEstimatedLossUSD.toLocaleString()} USD
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>IR Drill Grade:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                    Grade {report.incidentResponseEvaluation.grade} ({report.incidentResponseEvaluation.scorePercentage}%)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Strategic Recommendations
              </Typography>

              <Stack spacing={1.5}>
                {report.executiveLessonsLearned.map((lesson: string, idx: number) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #0284c7' }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                      {lesson}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog for Destructive Reset */}
      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset Entire Simulation Session?"
        message="This will reset the banking infrastructure assets, defense allocation, and incident response drill to default baseline. Saved round histories will be preserved in audit records."
        confirmLabel="Confirm Reset"
        confirmColor="error"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetDialogOpen(false)}
      />
    </Box>
  );
};

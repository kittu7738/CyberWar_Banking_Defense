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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Select,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import { api } from '../api/client.js';
import { useSimulation } from '../context/SimulationContext.js';
import { useRole } from '../context/RoleContext.js';
import { IRDecisionStage, IRScorecard, IRDecisionOption, RiskLevel, Incident } from '../types/index.js';

const SEVERITY_THEMES: Record<string, {
  color: string;
  bg: string;
  border: string;
  dot: string;
  label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}> = {
  LOW: {
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    dot: '#10b981',
    label: 'LOW'
  },
  MEDIUM: {
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'MEDIUM'
  },
  MODERATE: {
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'MEDIUM'
  },
  HIGH: {
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    dot: '#f97316',
    label: 'HIGH'
  },
  CRITICAL: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'CRITICAL'
  }
};

export const IncidentResponseView: React.FC = () => {
  const { state, acknowledgeIncident, containIncident, recoverIncident, updateIncidentSeverity } = useSimulation();
  const { activeRole, roleDetails } = useRole();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [stages, setStages] = useState<IRDecisionStage[]>([]);
  const [currentStageNumber, setCurrentStageNumber] = useState<number>(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [lastEvaluation, setLastEvaluation] = useState<any | null>(null);
  const [scorecard, setScorecard] = useState<IRScorecard | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [severityAnchorEl, setSeverityAnchorEl] = useState<{ [id: string]: HTMLElement | null }>({});

  const loadDrillData = async () => {
    try {
      const stagesRes = await api.getIRStages();
      setStages(stagesRes.stages);
      setCurrentStageNumber(stagesRes.progress.currentStageNumber || 1);
      setIsFinished(stagesRes.progress.isFinished || false);

      const scoreRes = await api.getIRScorecard();
      setScorecard(scoreRes.scorecard);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDrillData();
  }, []);

  const incidents = state?.incidents || [];
  const currentStage = stages.find(s => s.stageNumber === currentStageNumber) || stages[0];

  const handleAcknowledge = async (id: string) => {
    try {
      setActionErrorMessage(null);
      await acknowledgeIncident(id);
      setActionMessage('Incident acknowledged. Escalated to Security Operations.');
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage(err.message || 'Failed to acknowledge incident');
    }
  };

  const handleContain = async (id: string) => {
    try {
      setActionErrorMessage(null);
      await containIncident(id);
      setActionMessage('Asset isolated. Lateral propagation halted.');
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage(err.message || 'Failed to contain incident');
    }
  };

  const handleRecover = async (id: string) => {
    try {
      setActionErrorMessage(null);
      await recoverIncident(id);
      setActionMessage('Asset restored from validated state. Operational health recovered.');
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage(err.message || 'Failed to recover incident');
    }
  };

  const handleSeverityChange = async (id: string, sev: RiskLevel) => {
    try {
      setActionErrorMessage(null);
      await updateIncidentSeverity(id, sev);
      setActionMessage(`Incident severity reclassified to ${sev}.`);
    } catch (err: any) {
      console.error(err);
      setActionErrorMessage(err.message || 'Failed to update severity');
    }
  };

  const handleSubmitDrillDecision = async () => {
    if (!selectedOptionId) return;

    try {
      const res = await api.submitIRDecision(currentStageNumber, selectedOptionId);
      setLastEvaluation(res.evaluation);
      setScorecard(res.scorecard);
      setIsFinished(res.irProgress.isFinished);
      if (!res.irProgress.isFinished) {
        setCurrentStageNumber(res.irProgress.currentStageNumber);
      }
      setSelectedOptionId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDrill = async () => {
    try {
      await api.resetIR();
      setLastEvaluation(null);
      setCurrentStageNumber(1);
      setIsFinished(false);
      setSelectedOptionId('');
      const scoreRes = await api.getIRScorecard();
      setScorecard(scoreRes.scorecard);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportAgentIcon sx={{ color: '#059669' }} />
            Incident Response & Management Command
          </Typography>
        </Box>

        {/* Tab Switcher */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            minHeight: 40,
            '& .MuiTab-root': { py: 1, minHeight: 40, fontWeight: 700, fontSize: '0.82rem' }
          }}
        >
          <Tab label={`Active Incidents (${incidents.filter(i => i.status !== 'RECOVERED').length})`} />
          <Tab label="NIST Lifecycle Drill" />
        </Tabs>
      </Box>

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 2.5, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }} onClose={() => setActionMessage(null)}>
          {actionMessage}
        </Alert>
      )}

      {actionErrorMessage && (
        <Alert severity="error" sx={{ mb: 2.5, bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClose={() => setActionErrorMessage(null)}>
          {actionErrorMessage}
        </Alert>
      )}

      {activeRole !== 'CISO' && activeRole !== 'INFRA_OFFICER' && (
        <Alert severity="info" sx={{ mb: 2.5, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
          READ-ONLY AUDIT MODE: You are currently viewing as <strong>{roleDetails?.title || activeRole}</strong>. Operational containment and recovery actions require Incident Commander authority (CISO or Continuity Director).
        </Alert>
      )}

      {/* TAB 0: Active Incident Triage & Management Console */}
      {activeTab === 0 && (
        <Box>
          {incidents.length === 0 ? (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                No Active Incidents Detected
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460, mx: 'auto' }}>
                All banking assets are currently operating nominally. Simulate an attack from the Attack Simulator or Dashboard to test incident containment.
              </Typography>
            </Card>
          ) : (
            <>
              {/* Incident Severity Summary Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5, p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.8rem', mr: 0.5 }}>
                    Incident Severity Triage:
                  </Typography>
                  <Chip
                    size="small"
                    label={`CRITICAL: ${incidents.filter(i => i.severity === 'CRITICAL').length}`}
                    sx={{ bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Chip
                    size="small"
                    label={`HIGH: ${incidents.filter(i => i.severity === 'HIGH').length}`}
                    sx={{ bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Chip
                    size="small"
                    label={`MEDIUM: ${incidents.filter(i => i.severity === 'MEDIUM' || (i.severity as string) === 'MODERATE').length}`}
                    sx={{ bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Chip
                    size="small"
                    label={`LOW: ${incidents.filter(i => i.severity === 'LOW').length}`}
                    sx={{ bgcolor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                </Stack>

                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                  Unresolved: {incidents.filter(i => i.status !== 'RECOVERED').length} / {incidents.length} total
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {incidents.map((inc) => {
                  const isContained = inc.status === 'CONTAINED';
                  const isRecovered = inc.status === 'RECOVERED';
                  const isAcknowledged = inc.status === 'ACKNOWLEDGED';

                  const currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
                    inc.severity === 'MODERATE' ? 'MEDIUM' : (inc.severity as any) || 'MEDIUM';
                  const sevTheme = SEVERITY_THEMES[currentSeverity] || SEVERITY_THEMES.MEDIUM;

                  return (
                    <Grid item xs={12} md={6} key={inc.id}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: 2.5,
                          border: `1px solid ${
                            isRecovered ? '#a7f3d0' : isContained ? '#bae6fd' : sevTheme.border
                          }`,
                          bgcolor: isRecovered ? '#ecfdf5' : '#ffffff',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          '&:hover': {
                            boxShadow: `0 8px 20px -4px ${sevTheme.dot}20`,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.25, mb: 0.5 }}>
                                {inc.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700 }}>
                                Asset: {inc.affectedAssetName} ({inc.affectedAssetId})
                              </Typography>
                            </Box>

                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                              <Chip
                                icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sevTheme.dot, boxShadow: `0 0 5px ${sevTheme.dot}`, ml: 0.75 }} />}
                                label={currentSeverity}
                                size="small"
                                onClick={activeRole === 'CISO' ? (e) => setSeverityAnchorEl(prev => ({ ...prev, [inc.id]: e.currentTarget })) : undefined}
                                title={activeRole === 'CISO' ? "Click to reclassify severity" : `Detected severity: ${currentSeverity}`}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  fontFamily: '"JetBrains Mono", monospace',
                                  bgcolor: sevTheme.bg,
                                  color: sevTheme.color,
                                  border: `1px solid ${sevTheme.border}`,
                                  cursor: activeRole === 'CISO' ? 'pointer' : 'default',
                                  '&:hover': activeRole === 'CISO' ? {
                                    boxShadow: `0 0 0 2px ${sevTheme.border}`
                                  } : {}
                                }}
                              />
                              {activeRole === 'CISO' && (
                                <Menu
                                  anchorEl={severityAnchorEl[inc.id]}
                                  open={Boolean(severityAnchorEl[inc.id])}
                                  onClose={() => setSeverityAnchorEl(prev => ({ ...prev, [inc.id]: null }))}
                                  slotProps={{
                                    paper: {
                                      sx: {
                                        borderRadius: 2,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        border: '1px solid #e2e8f0',
                                        py: 0.5
                                      }
                                    }
                                  }}
                                >
                                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as RiskLevel[]).map(sev => (
                                    <MenuItem
                                      key={sev}
                                      selected={sev === currentSeverity}
                                      onClick={() => {
                                        handleSeverityChange(inc.id, sev);
                                        setSeverityAnchorEl(prev => ({ ...prev, [inc.id]: null }));
                                      }}
                                      sx={{ fontSize: '0.75rem', fontWeight: 700, gap: 1 }}
                                    >
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SEVERITY_THEMES[sev]?.dot || '#94a3b8' }} />
                                      {sev}
                                    </MenuItem>
                                  ))}
                                </Menu>
                              )}
                              <Chip
                                label={inc.status}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  fontFamily: '"JetBrains Mono", monospace',
                                  bgcolor:
                                    isRecovered ? '#d1fae5' : isContained ? '#e0f2fe' : isAcknowledged ? '#fef3c7' : '#fee2e2',
                                  color:
                                    isRecovered ? '#059669' : isContained ? '#0284c7' : isAcknowledged ? '#d97706' : '#dc2626'
                                }}
                              />
                            </Stack>
                          </Box>

                          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 2, minHeight: 36 }}>
                            {inc.evidence}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sevTheme.dot }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', fontFamily: '"JetBrains Mono", monospace' }}>
                                {inc.mitigatedByControls && inc.mitigatedByControls.length > 0
                                  ? `Controls: ${inc.mitigatedByControls.slice(0, 2).join(', ')}`
                                  : 'Defenses: Baseline SOC Telemetry'}
                              </Typography>
                            </Box>

                            <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem' }}>
                              Logged: {inc.detectedAt}
                            </Typography>
                          </Box>

                        <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                        {/* Interactive Containment / Recovery Actions */}
                        <Stack direction="row" spacing={1}>
                          {inc.status === 'DETECTED' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleAcknowledge(inc.id)}
                              sx={{ fontWeight: 700, borderColor: '#0284c7', color: '#0284c7' }}
                            >
                              Acknowledge
                            </Button>
                          )}

                          {!isContained && !isRecovered && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<BuildIcon />}
                              onClick={() => handleContain(inc.id)}
                              sx={{ fontWeight: 700 }}
                            >
                              Contain Incident
                            </Button>
                          )}

                          {isContained && !isRecovered && (
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleRecover(inc.id)}
                              sx={{ fontWeight: 700 }}
                            >
                              Restore & Recover
                            </Button>
                          )}

                          {isRecovered && (
                            <Chip label="Resolved & Restored" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700 }} />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            </>
          )}
        </Box>
      )}

      {/* TAB 1: NIST SP 800-61 Guided Lifecycle Drill */}
      {activeTab === 1 && (
        <Box>
          {/* Stepper Navigation */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Stepper activeStep={currentStageNumber - 1} alternativeLabel>
                {stages.map((stage) => (
                  <Step key={stage.stageNumber} completed={stage.stageNumber < currentStageNumber || isFinished}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-active': { color: '#0284c7' },
                          '&.Mui-completed': { color: '#059669' }
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.75rem' }}>
                        {stage.stageName}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Left Column: Stage Decision Question */}
            <Grid item xs={12} lg={8}>
              {!isFinished ? (
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip
                        label={`STAGE ${currentStage.stageNumber} OF 6: ${currentStage.stageName.toUpperCase()}`}
                        size="small"
                        sx={{ bgcolor: '#f0f9ff', color: '#0284c7', fontWeight: 800 }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, borderLeft: '4px solid #0284c7' }}>
                      {currentStage.context}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                      {currentStage.promptQuestion}
                    </Typography>

                    <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                      <RadioGroup
                        value={selectedOptionId}
                        onChange={(e) => setSelectedOptionId(e.target.value)}
                      >
                        <Stack spacing={1.5}>
                          {currentStage.options.map((option: IRDecisionOption) => {
                            const isSelected = selectedOptionId === option.id;
                            return (
                              <Paper
                                key={option.id}
                                onClick={() => setSelectedOptionId(option.id)}
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  bgcolor: isSelected ? '#f0f9ff' : '#ffffff',
                                  border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                                  borderRadius: 2
                                }}
                              >
                                <FormControlLabel
                                  value={option.id}
                                  control={<Radio sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#0284c7' } }} />}
                                  label={
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                                        {option.text}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                                        {option.rationale}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Cost: <span style={{ color: '#0f172a', fontWeight: 700 }}>${option.financialCostUSD.toLocaleString()}</span> | RTO Impact: <span style={{ color: option.rtoImpactHours <= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>{option.rtoImpactHours > 0 ? `+${option.rtoImpactHours}` : option.rtoImpactHours} hrs</span>
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </Paper>
                            );
                          })}
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!selectedOptionId}
                      onClick={handleSubmitDrillDecision}
                      sx={{ fontWeight: 700, px: 3 }}
                    >
                      Execute Decision & Proceed →
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ mb: 3, border: '1px solid #a7f3d0', bgcolor: '#ecfdf5' }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#059669', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                      Incident Response Drill Completed!
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto', mb: 2 }}>
                      All 6 incident response lifecycle stages executed. Review your score and feedback below.
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={handleResetDrill} sx={{ fontWeight: 700 }}>
                      Restart Drill
                    </Button>
                  </CardContent>
                </Card>
              )}

              {lastEvaluation && (
                <Alert
                  severity={lastEvaluation.isCorrectBestPractice ? 'success' : 'warning'}
                  sx={{
                    mb: 3,
                    bgcolor: lastEvaluation.isCorrectBestPractice ? '#ecfdf5' : '#fffbeb',
                    color: lastEvaluation.isCorrectBestPractice ? '#065f46' : '#92400e',
                    border: `1px solid ${lastEvaluation.isCorrectBestPractice ? '#a7f3d0' : '#fde68a'}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Stage {lastEvaluation.stage.stageNumber} Feedback (+{lastEvaluation.chosenOption.pointsAwarded} pts)
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {lastEvaluation.chosenOption.feedback}
                  </Typography>
                </Alert>
              )}
            </Grid>

            {/* Right Column: Scorecard */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MilitaryTechIcon sx={{ color: '#d97706' }} />
                    Drill Scorecard
                  </Typography>

                  {scorecard && (
                    <>
                      <Box sx={{ textAlign: 'center', py: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                          OVERALL PERFORMANCE GRADE
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 900,
                            fontFamily: '"JetBrains Mono", monospace',
                            color: scorecard.grade.startsWith('A') ? '#059669' : '#0284c7'
                          }}
                        >
                          {scorecard.grade}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700 }}>
                          {scorecard.totalScore} / {scorecard.maxScore} Points ({scorecard.scorePercentage}%)
                        </Typography>
                      </Box>

                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Statutory Penalties:</Typography>
                          <Typography variant="caption" sx={{ color: scorecard.totalCompliancePenaltiesUSD > 0 ? '#dc2626' : '#059669', fontWeight: 800 }}>
                            ${scorecard.totalCompliancePenaltiesUSD.toLocaleString()} USD
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Net RTO Delta:</Typography>
                          <Typography variant="caption" sx={{ color: scorecard.netRtoDeltaHours <= 0 ? '#059669' : '#dc2626', fontWeight: 800 }}>
                            {scorecard.netRtoDeltaHours > 0 ? `+${scorecard.netRtoDeltaHours}` : scorecard.netRtoDeltaHours} hrs
                          </Typography>
                        </Box>
                      </Stack>

                      <Button variant="text" size="small" fullWidth startIcon={<RestartAltIcon />} onClick={handleResetDrill} sx={{ color: '#64748b' }}>
                        Reset Drill
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

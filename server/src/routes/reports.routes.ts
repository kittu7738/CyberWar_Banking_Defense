import { Router, Request, Response } from 'express';
import { simulationManager } from '../simulation/index.js';
import { RiskEngine } from '../simulation/riskEngine.js';
import { IncidentResponseManager } from '../simulation/incidentResponse.js';

const router = Router();

// GET /api/reports/summary - Comprehensive executive incident report
router.get('/summary', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const activeControls = state.controls.filter(c => c.active);
  const systemicRisk = RiskEngine.assessSystemicRisk(state.assets, activeControls);
  const irScorecard = IncidentResponseManager.generateScorecard(state.irProgress.decisionsMade);

  const report = {
    generatedAt: new Date().toISOString(),
    session: {
      id: state.sessionId,
      currentRound: state.currentRound,
      maxRounds: state.maxRounds,
      activeRole: state.activeRole,
      operationalHealth: state.operationalHealth,
      businessContinuityStatus: state.businessContinuityStatus
    },
    activeScenario: state.activeScenario ? {
      id: state.activeScenario.id,
      name: state.activeScenario.name,
      vector: state.activeScenario.vector,
      threatActor: state.activeScenario.threatActor,
      severity: state.activeScenario.severity,
      objective: state.activeScenario.objective,
      narrative: state.activeScenario.narrative,
      regulatoryImpact: state.activeScenario.regulatoryImpact
    } : null,
    financialMetrics: {
      budgetTotalUSD: state.budget.total,
      budgetSpentUSD: state.budget.spent,
      budgetRemainingUSD: state.budget.remaining,
      budgetUtilizationPercent: Math.round((state.budget.spent / state.budget.total) * 100),
      totalEstimatedLossUSD: state.eventsLog.reduce((sum, e) => sum + e.financialImpactUSD, 0),
      illustrativeExposureUSD: systemicRisk.illustrativeFinancialExposure.totalIllustrativeExposureUSD
    },
    riskAssessment: {
      overallRiskScore: state.overallRiskScore,
      riskLevel: state.riskLevel,
      resilienceScore: systemicRisk.resilienceScore,
      concentrationRiskScore: systemicRisk.concentrationRiskScore,
      thirdPartyRiskScore: systemicRisk.thirdPartyDependencyRiskScore
    },
    defensiveControlsDeployed: activeControls.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      costUSD: c.cost,
      mitigationFormula: c.mitigationFormula
    })),
    assetsAffected: state.assets.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      criticality: a.criticality,
      status: a.operationalStatus,
      healthScore: a.healthScore,
      appliedControlsCount: a.appliedControls.length
    })),
    incidentResponseEvaluation: irScorecard,
    chronologicalTimeline: state.eventsLog,
    roundsHistory: state.roundsHistory,
    executiveLessonsLearned: [
      'Proactive zero-trust network micro-segmentation demonstrated the highest mitigation efficacy against ransomware lateral traversal.',
      'Immutable air-gapped backups prevent extortion leverage and ensure RTO recovery under 60 minutes.',
      'Continuous PAM credential rotation neutralizes 90% of insider threat and privilege abuse vectors.',
      'Prompt regulatory disclosure (within statutory 72-hour windows) drastically limits civil enforcement penalties.'
    ]
  };

  res.json({
    success: true,
    report
  });
});

// GET /api/reports/export/json - Export full simulation session as JSON download
router.get('/export/json', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const activeControls = state.controls.filter(c => c.active);
  const systemicRisk = RiskEngine.assessSystemicRisk(state.assets, activeControls);
  const irScorecard = IncidentResponseManager.generateScorecard(state.irProgress.decisionsMade);

  const exportData = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    institution: 'Fictional Financial Institution (Synthetic Simulation)',
    sessionState: state,
    systemicRiskAssessment: systemicRisk,
    incidentResponseScorecard: irScorecard
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cyberwar-defense-report-${state.sessionId}.json"`);
  res.send(JSON.stringify(exportData, null, 2));
});

// GET /api/reports/export/csv - Export simulation timeline & rounds as CSV
router.get('/export/csv', (req: Request, res: Response) => {
  const state = simulationManager.getState();
  const events = state.eventsLog;

  const csvRows: string[] = [];
  csvRows.push('Round,Step,Timestamp,Scenario,TargetAsset,Severity,Title,MitigationSucceeded,MitigationRate,ResultingStatus,HealthDelta,FinancialImpactUSD,Narrative');

  for (const e of events) {
    const row = [
      e.roundNumber,
      e.step,
      `"${e.timestamp}"`,
      `"${e.scenarioId}"`,
      `"${e.targetAssetId}"`,
      `"${e.severity}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.mitigationSucceeded ? 'YES' : 'NO',
      e.totalMitigationRate,
      `"${e.resultingStatus}"`,
      e.healthDelta,
      e.financialImpactUSD,
      `"${e.narrative.replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="cyberwar-defense-timeline-${state.sessionId}.csv"`);
  res.send(csvRows.join('\n'));
});

export default router;

import { 
  SimulationState, 
  BankingAsset, 
  DefensiveControl, 
  AttackScenario, 
  SimulationEvent, 
  Incident,
  RoundSummary, 
  OperationalStatus,
  RiskLevel,
  SupervisoryObservation
} from '../types/index.js';
import { INITIAL_BANKING_ASSETS } from './assets.js';
import { INITIAL_DEFENSIVE_CONTROLS } from './defenseControls.js';
import { ATTACK_SCENARIOS } from './attacks.js';
import { DefenseOptimizer } from './defenseOptimizer.js';
import { RiskEngine } from './riskEngine.js';
import { NIST_IR_STAGES, IncidentResponseManager } from './incidentResponse.js';

export class SimulationManager {
  private state: SimulationState;

  constructor(defaultBudget = 1000000) {
    this.state = this.createInitialState(defaultBudget);
  }

  private createInitialState(budgetAmount: number): SimulationState {
    const assets = JSON.parse(JSON.stringify(INITIAL_BANKING_ASSETS)) as BankingAsset[];
    const controls = JSON.parse(JSON.stringify(INITIAL_DEFENSIVE_CONTROLS)) as DefensiveControl[];
    const activeScenario = ATTACK_SCENARIOS[0]; // Start with DDoS Scenario

    const systemicRisk = RiskEngine.assessSystemicRisk(assets, []);

    return {
      sessionId: `sim-session-${Date.now()}`,
      currentRound: 1,
      maxRounds: 5,
      budget: {
        total: budgetAmount,
        spent: 0,
        remaining: budgetAmount
      },
      assets,
      controls,
      activeScenario,
      currentStageIndex: 0,
      eventsLog: [],
      incidents: [],
      roundsHistory: [],
      irProgress: {
        scenarioId: activeScenario.id,
        currentStageNumber: 1,
        completedStages: [],
        decisionsMade: [],
        totalScore: 0,
        isFinished: false
      },
      operationalHealth: 100,
      overallRiskScore: systemicRisk.overallRiskScore,
      riskLevel: systemicRisk.riskLevel,
      businessContinuityStatus: 'NORMAL',
      activeRole: 'CISO',
      supervisoryObservations: [
        {
          id: 'obs-001',
          timestamp: new Date().toLocaleTimeString(),
          examinerName: 'Federal Financial Institutions Examination Council (FFIEC)',
          category: 'RESILIENCE',
          finding: 'Core Banking Ledger (asset-core-banking) represents single point of failure with high graph centrality.',
          severity: 'MATTER_REQUIRING_ATTENTION',
          actionRequired: 'Ensure Immutable Snapshot Backups and active multi-datacenter replication are deployed to satisfy 4-hour RTO.',
          status: 'OPEN'
        },
        {
          id: 'obs-002',
          timestamp: new Date().toLocaleTimeString(),
          examinerName: 'European Central Bank (DORA Oversight)',
          category: 'THIRD_PARTY',
          finding: 'SWIFT Settlement Rail third-party API lacks dedicated automated circuit-breaker isolation.',
          severity: 'RECOMMENDATION',
          actionRequired: 'Implement rate-limiting and fallback queuing at Internal API Gateway tier.',
          status: 'OPEN'
        }
      ]
    };
  }

  public getState(): SimulationState {
    return this.state;
  }

  public setActiveRole(role: SimulationState['activeRole']): void {
    this.state.activeRole = role;
  }

  public addSupervisoryObservation(obs: Omit<SupervisoryObservation, 'id' | 'timestamp'>): SupervisoryObservation {
    const newObs: SupervisoryObservation = {
      ...obs,
      id: `obs-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString()
    };
    this.state.supervisoryObservations.unshift(newObs);
    return newObs;
  }

  public allocateBudget(selectedControlIds: string[]): {
    success: boolean;
    spent: number;
    remaining: number;
    activeControls: string[];
    riskScore: number;
    error?: string;
  } {
    const activeControls = this.state.controls.filter(c => selectedControlIds.includes(c.id));
    const totalCost = activeControls.reduce((sum, c) => sum + c.cost, 0);

    if (totalCost > this.state.budget.total) {
      return {
        success: false,
        spent: this.state.budget.spent,
        remaining: this.state.budget.remaining,
        activeControls: this.state.controls.filter(c => c.active).map(c => c.id),
        riskScore: this.state.overallRiskScore,
        error: `Allocated budget ($${totalCost.toLocaleString()}) exceeds available capital ($${this.state.budget.total.toLocaleString()}).`
      };
    }

    // Apply active status to controls
    for (const ctrl of this.state.controls) {
      ctrl.active = selectedControlIds.includes(ctrl.id);
    }

    // Associate controls with eligible assets
    for (const asset of this.state.assets) {
      asset.appliedControls = this.state.controls
        .filter(c => c.active && c.eligibleAssetTypes.includes(asset.type))
        .map(c => c.id);
    }

    this.state.budget.spent = totalCost;
    this.state.budget.remaining = this.state.budget.total - totalCost;

    this.recalculateSystemMetrics();

    return {
      success: true,
      spent: this.state.budget.spent,
      remaining: this.state.budget.remaining,
      activeControls: selectedControlIds,
      riskScore: this.state.overallRiskScore
    };
  }

  public selectScenario(scenarioId: string): AttackScenario {
    const found = ATTACK_SCENARIOS.find(s => s.id === scenarioId);
    if (!found) {
      throw new Error(`Scenario ${scenarioId} not found.`);
    }
    this.state.activeScenario = found;
    this.state.currentStageIndex = 0;
    this.state.irProgress.scenarioId = found.id;
    return found;
  }

  /**
   * Executes the next deterministic stage in the active scenario
   */
  public stepSimulation(): {
    event: SimulationEvent;
    completed: boolean;
    stageIndex: number;
    totalStages: number;
  } {
    if (!this.state.activeScenario) {
      throw new Error('No active scenario selected.');
    }

    const scenario = this.state.activeScenario;
    const stages = scenario.stages;

    if (this.state.currentStageIndex >= stages.length) {
      return {
        event: {
          id: `evt-end-${Date.now()}`,
          roundNumber: this.state.currentRound,
          step: stages.length,
          timestamp: new Date().toLocaleTimeString(),
          scenarioId: scenario.id,
          targetAssetId: scenario.initialTargetAssetId,
          severity: 'INFO',
          title: `Scenario "${scenario.name}" Completed`,
          narrative: `All attack stages executed. Final operational health is ${this.state.operationalHealth}%. Review incident report and post-incident lessons.`,
          defensesEvaluated: [],
          mitigationSucceeded: true,
          totalMitigationRate: 1.0,
          resultingStatus: 'HEALTHY',
          healthDelta: 0,
          financialImpactUSD: 0,
          lessonsLearned: 'Simulation round complete. Advance to next round to test different threat vectors.'
        },
        completed: true,
        stageIndex: this.state.currentStageIndex,
        totalStages: stages.length
      };
    }

    const currentStage = stages[this.state.currentStageIndex];
    const targetAsset = this.state.assets.find(a => a.id === currentStage.targetAssetId);

    if (!targetAsset) {
      throw new Error(`Target asset ${currentStage.targetAssetId} not found.`);
    }

    // Evaluate active defenses against this stage
    const activeControls = this.state.controls.filter(c => c.active);
    const relevantActiveControls = activeControls.filter(c =>
      currentStage.relevantControlIds.includes(c.id)
    );

    const defensesEvaluated = currentStage.relevantControlIds.map(ctrlId => {
      const ctrl = this.state.controls.find(c => c.id === ctrlId);
      const isActive = activeControls.some(c => c.id === ctrlId);
      const eff = ctrl ? (ctrl.effectiveness[scenario.vector] || 0) : 0;
      return {
        controlId: ctrlId,
        controlName: ctrl ? ctrl.name : ctrlId,
        effectivenessContribution: eff,
        active: isActive
      };
    });

    // Multi-layer mitigation calculation: 1 - prod(1 - 0.82 * eff)
    let unmitigatedRatio = 1.0;
    for (const ctrl of relevantActiveControls) {
      const eff = ctrl.effectiveness[scenario.vector] || 0;
      unmitigatedRatio *= (1 - eff * 0.82);
    }
    const aggregateMitigation = Math.min(0.98, 1.0 - unmitigatedRatio);
    const mitigationSucceeded = aggregateMitigation >= currentStage.mitigationThreshold;

    const impact = mitigationSucceeded ? currentStage.mitigatedImpact : currentStage.unmitigatedImpact;

    // Apply impact to target asset with strict health vs operational status consistency
    targetAsset.healthScore = Math.max(0, targetAsset.healthScore - impact.healthDrop);
    if (targetAsset.healthScore === 0) {
      targetAsset.operationalStatus = (scenario.vector === 'DDOS' || scenario.vector === 'INFRASTRUCTURE_DISRUPTION' || impact.status === 'OFFLINE')
        ? 'OFFLINE'
        : 'COMPROMISED';
    } else if (targetAsset.healthScore <= 20 && impact.status !== 'HEALTHY') {
      targetAsset.operationalStatus = (scenario.vector === 'DDOS' || impact.status === 'OFFLINE')
        ? 'OFFLINE'
        : 'COMPROMISED';
    } else {
      targetAsset.operationalStatus = impact.status;
    }

    // If unmitigated and secondary assets exist, cascade degradation
    if (!mitigationSucceeded && currentStage.secondaryAssetIds) {
      for (const secId of currentStage.secondaryAssetIds) {
        const secAsset = this.state.assets.find(a => a.id === secId);
        if (secAsset) {
          const drop = Math.round(impact.healthDrop * 0.5);
          secAsset.healthScore = Math.max(0, secAsset.healthScore - drop);
          if (secAsset.healthScore === 0) {
            secAsset.operationalStatus = (scenario.vector === 'DDOS' || scenario.vector === 'INFRASTRUCTURE_DISRUPTION') ? 'OFFLINE' : 'COMPROMISED';
          } else if (secAsset.healthScore < 40 && secAsset.operationalStatus !== 'COMPROMISED' && secAsset.operationalStatus !== 'OFFLINE') {
            secAsset.operationalStatus = 'DEGRADED';
          } else if (secAsset.operationalStatus === 'HEALTHY') {
            secAsset.operationalStatus = 'DEGRADED';
          }
        }
      }
    }

    // Determine event severity
    let severity: SimulationEvent['severity'] = 'INFO';
    if (!mitigationSucceeded) {
      severity = impact.status === 'OFFLINE' || impact.status === 'COMPROMISED' ? 'CRITICAL' : 'ALERT';
    } else if (impact.status === 'DEGRADED') {
      severity = 'WARNING';
    }

    const eventTitle = mitigationSucceeded
      ? `Defended: ${currentStage.phase} [${targetAsset.name}]`
      : `BREACH: ${currentStage.phase} bypassed defenses on ${targetAsset.name}`;

    const narrative = mitigationSucceeded
      ? `Active defenses (${relevantActiveControls.map(c => c.name).join(', ') || 'Baseline Controls'}) successfully absorbed attack wave. Mitigation reached ${(aggregateMitigation * 100).toFixed(0)}% (threshold: ${(currentStage.mitigationThreshold * 100).toFixed(0)}%). Asset health preserved.`
      : `Attack wave exceeded control thresholds. Aggregate mitigation was ${(aggregateMitigation * 100).toFixed(0)}% (needed ${(currentStage.mitigationThreshold * 100).toFixed(0)}%). ${targetAsset.name} transitioned to ${targetAsset.operationalStatus}. Financial loss: $${impact.financialLoss.toLocaleString()}.`;

    const lessonsLearned = mitigationSucceeded
      ? `Strong ROI demonstrated on active controls (${relevantActiveControls.map(c => c.name).join('; ')}). Continual monitoring advised.`
      : `Control gap identified: Missing or underfunded controls (${currentStage.relevantControlIds.filter(id => !relevantActiveControls.some(c => c.id === id)).join(', ')}). Consider prioritizing in next budget cycle.`;

    const event: SimulationEvent = {
      id: `evt-${Date.now()}-${this.state.currentStageIndex}`,
      roundNumber: this.state.currentRound,
      step: currentStage.step,
      timestamp: new Date().toLocaleTimeString(),
      scenarioId: scenario.id,
      targetAssetId: targetAsset.id,
      severity,
      title: eventTitle,
      narrative,
      defensesEvaluated,
      mitigationSucceeded,
      totalMitigationRate: Math.round(aggregateMitigation * 100) / 100,
      resultingStatus: targetAsset.operationalStatus,
      healthDelta: -impact.healthDrop,
      financialImpactUSD: impact.financialLoss,
      lessonsLearned
    };

    this.state.eventsLog.unshift(event);

    // Create an actionable incident if attack caused disruption
    if (!mitigationSucceeded || impact.status !== 'HEALTHY') {
      let stageSeverity: RiskLevel = 'MEDIUM';
      if (targetAsset.operationalStatus === 'OFFLINE' || (currentStage.step >= 4 && !mitigationSucceeded)) {
        stageSeverity = 'CRITICAL';
      } else if (targetAsset.operationalStatus === 'COMPROMISED' || currentStage.step === 3) {
        stageSeverity = 'HIGH';
      } else if (currentStage.step === 2 || targetAsset.operationalStatus === 'DEGRADED') {
        stageSeverity = 'MEDIUM';
      } else {
        stageSeverity = 'LOW';
      }

      const incident: Incident = {
        id: `inc-${Date.now()}-${this.state.incidents.length + 1}`,
        title: `${scenario.vector} Incident: ${currentStage.phase}`,
        scenarioId: scenario.id,
        affectedAssetId: targetAsset.id,
        affectedAssetName: targetAsset.name,
        severity: stageSeverity,
        status: 'DETECTED',
        evidence: `${currentStage.action} Operational status dropped to ${targetAsset.operationalStatus} (Health: ${targetAsset.healthScore}%).`,
        detectedAt: new Date().toLocaleTimeString(),
        mitigatedByControls: relevantActiveControls.map(c => c.name)
      };
      this.state.incidents.unshift(incident);
    }

    this.state.currentStageIndex++;

    this.recalculateSystemMetrics();

    const isCompleted = this.state.currentStageIndex >= stages.length;

    return {
      event,
      completed: isCompleted,
      stageIndex: this.state.currentStageIndex,
      totalStages: stages.length
    };
  }

  /**
   * Incident Management Actions (Acknowledge, Contain, Recover)
   */
  public acknowledgeIncident(incidentId: string): Incident {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found.`);
    if (inc.status === 'DETECTED') {
      inc.status = 'ACKNOWLEDGED';
    }
    return inc;
  }

  public containIncident(incidentId: string): Incident {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found.`);
    inc.status = 'CONTAINED';
    inc.containedAt = new Date().toLocaleTimeString();

    const asset = this.state.assets.find(a => a.id === inc.affectedAssetId);
    if (asset) {
      if (asset.operationalStatus === 'COMPROMISED') {
        asset.operationalStatus = 'DEGRADED'; // Contained lateral spread
      }
      // If health reached 0%, containment establishes quarantine and restores basic telemetry baseline
      if (asset.healthScore === 0) {
        asset.healthScore = 25;
      }
    }

    this.recalculateSystemMetrics();
    return inc;
  }

  public recoverIncident(incidentId: string): Incident {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found.`);
    inc.status = 'RECOVERED';
    inc.recoveredAt = new Date().toLocaleTimeString();

    const asset = this.state.assets.find(a => a.id === inc.affectedAssetId);
    if (asset) {
      asset.healthScore = Math.min(100, asset.healthScore + 35);
      if (asset.healthScore >= 80) {
        asset.operationalStatus = 'HEALTHY';
      } else {
        asset.operationalStatus = 'RECOVERING';
      }
    }

    this.recalculateSystemMetrics();
    return inc;
  }

  public updateIncidentSeverity(incidentId: string, severity: RiskLevel): Incident {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found.`);
    inc.severity = severity === 'MODERATE' ? 'MEDIUM' : severity;
    this.recalculateSystemMetrics();
    return inc;
  }

  /**
   * Advances simulation to the next round, saving round summary
   */
  public advanceRound(): {
    roundSummary: RoundSummary;
    nextRoundNumber: number;
    isSessionComplete: boolean;
  } {
    const scenario = this.state.activeScenario || ATTACK_SCENARIOS[0];
    const roundEvents = this.state.eventsLog.filter(e => e.roundNumber === this.state.currentRound);

    const totalDamage = roundEvents.reduce((sum, e) => sum + e.financialImpactUSD, 0);
    const effectiveCount = roundEvents.filter(e => e.mitigationSucceeded).length;
    const bypassedCount = roundEvents.filter(e => !e.mitigationSucceeded).length;

    const roundSummary: RoundSummary = {
      roundNumber: this.state.currentRound,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      vector: scenario.vector,
      timestamp: new Date().toLocaleTimeString(),
      initialRisk: 75,
      residualRisk: this.state.overallRiskScore,
      budgetAllocatedUSD: this.state.budget.spent,
      operationalHealthEnd: this.state.operationalHealth,
      financialDamageUSD: totalDamage,
      eventsCount: roundEvents.length,
      defensesEffectiveCount: effectiveCount,
      defensesBypassedCount: bypassedCount,
      irScore: this.state.irProgress.totalScore,
      keyTakeaway: effectiveCount >= bypassedCount
        ? `Defenses successfully contained ${scenario.vector} attack vector with minimal systemic contagion.`
        : `High systemic exposure in ${scenario.vector} vector. Urgent control investment recommended.`
    };

    this.state.roundsHistory.push(roundSummary);

    const isSessionComplete = this.state.currentRound >= this.state.maxRounds;

    if (!isSessionComplete) {
      this.state.currentRound++;
      const nextScenarioIndex = (this.state.currentRound - 1) % ATTACK_SCENARIOS.length;
      this.state.activeScenario = ATTACK_SCENARIOS[nextScenarioIndex];
      this.state.currentStageIndex = 0;

      // Partial asset recovery between rounds (simulating maintenance & overnight patching)
      for (const asset of this.state.assets) {
        if (asset.operationalStatus === 'OFFLINE') asset.operationalStatus = 'RECOVERING';
        else if (asset.operationalStatus === 'COMPROMISED') asset.operationalStatus = 'DEGRADED';
        else if (asset.operationalStatus === 'DEGRADED') asset.operationalStatus = 'HEALTHY';
        asset.healthScore = Math.min(100, asset.healthScore + 25);
      }

      this.recalculateSystemMetrics();
    }

    return {
      roundSummary,
      nextRoundNumber: this.state.currentRound,
      isSessionComplete
    };
  }

  public submitIRDecision(stageNumber: number, optionId: string) {
    const evaluation = IncidentResponseManager.evaluateDecision(stageNumber, optionId);

    const existing = this.state.irProgress.decisionsMade.find(d => d.stageNumber === stageNumber);
    if (!existing) {
      this.state.irProgress.decisionsMade.push({
        stageNumber,
        chosenOptionId: optionId,
        score: evaluation.chosenOption.pointsAwarded
      });
      if (!this.state.irProgress.completedStages.includes(stageNumber)) {
        this.state.irProgress.completedStages.push(stageNumber);
      }
      this.state.irProgress.totalScore += evaluation.chosenOption.pointsAwarded;
    }

    if (stageNumber < NIST_IR_STAGES.length) {
      this.state.irProgress.currentStageNumber = stageNumber + 1;
    } else {
      this.state.irProgress.isFinished = true;
    }

    const scorecard = IncidentResponseManager.generateScorecard(
      this.state.irProgress.decisionsMade
    );

    return {
      evaluation,
      scorecard,
      irProgress: this.state.irProgress
    };
  }

  public resetSimulation(resetBudget = 1000000): SimulationState {
    const currentRoundsHistory = [...this.state.roundsHistory];
    this.state = this.createInitialState(resetBudget);
    this.state.roundsHistory = currentRoundsHistory;
    return this.state;
  }

  public fullReset(): SimulationState {
    this.state = this.createInitialState(1000000);
    return this.state;
  }

  private recalculateSystemMetrics(): void {
    // Invariant: Asset with 0% health cannot remain DEGRADED or HEALTHY
    const isDDoS = this.state.activeScenario?.vector === 'DDOS' || this.state.activeScenario?.vector === 'INFRASTRUCTURE_DISRUPTION';
    for (const asset of this.state.assets) {
      if (asset.healthScore === 0 && (asset.operationalStatus === 'DEGRADED' || asset.operationalStatus === 'HEALTHY')) {
        asset.operationalStatus = isDDoS ? 'OFFLINE' : 'COMPROMISED';
      }
    }

    const activeControls = this.state.controls.filter(c => c.active);
    const assessment = RiskEngine.assessSystemicRisk(this.state.assets, activeControls, this.state.incidents);

    this.state.overallRiskScore = assessment.overallRiskScore;
    this.state.riskLevel = assessment.riskLevel;

    // Operational health: mean of all asset health scores
    const avgHealth = this.state.assets.reduce((sum, a) => sum + a.healthScore, 0) / this.state.assets.length;
    this.state.operationalHealth = Math.round(avgHealth);

    // Business continuity status
    const offlineCount = this.state.assets.filter(a => a.operationalStatus === 'OFFLINE').length;
    const compromisedCount = this.state.assets.filter(a => a.operationalStatus === 'COMPROMISED').length;

    if (offlineCount >= 2 || compromisedCount >= 3) {
      this.state.businessContinuityStatus = 'CRITICAL_DISRUPTION';
    } else if (offlineCount >= 1 || compromisedCount >= 1) {
      this.state.businessContinuityStatus = 'FAILOVER_ACTIVE';
    } else if (this.state.assets.some(a => a.operationalStatus === 'DEGRADED')) {
      this.state.businessContinuityStatus = 'DEGRADED_OPERATIONS';
    } else {
      this.state.businessContinuityStatus = 'NORMAL';
    }
  }
}

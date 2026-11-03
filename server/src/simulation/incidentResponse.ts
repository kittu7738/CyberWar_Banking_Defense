import { IRDecisionStage, IRDecisionOption } from '../types/index.js';

export const NIST_IR_STAGES: IRDecisionStage[] = [
  {
    stageNumber: 1,
    stageName: 'Preparation',
    context: 'Threat intelligence alert (FS-ISAC) indicates active exploitation of zero-day vulnerabilities in financial sector VPN gateways and API gateways by threat group "DarkLocker".',
    promptQuestion: 'What preparatory defense posture will the Incident Response Team establish before a confirmed breach occurs?',
    options: [
      {
        id: 'prep-opt-1',
        text: 'Enforce strict MFA with FIDO2 hardware tokens, mandate emergency credential rotation for privileged service accounts, and verify immutable air-gapped backup catalog integrity.',
        rationale: 'Proactive credential hygiene and verified immutable backups drastically limit the adversary’s lateral blast radius and establish clean recovery readiness.',
        operationalImpact: 'Minor friction during initial administrator re-authentication; no business disruption.',
        rtoImpactHours: -2,
        riskReductionScore: 25,
        financialCostUSD: 15000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Aligned with NIST SP 800-61 preparation best practices. Validated backup integrity and credential hardening effectively preempted ransomware leverage.'
      },
      {
        id: 'prep-opt-2',
        text: 'Increase SIEM alert threshold sensitivity and issue a company-wide email warning employees not to open unexpected attachments.',
        rationale: 'Passive warning raises employee awareness but fails to protect against credential stuffing, automated API exploits, or lateral movement.',
        operationalImpact: 'No operational impact, but minimal defensive depth.',
        rtoImpactHours: 0,
        riskReductionScore: 10,
        financialCostUSD: 2000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 60,
        feedback: 'ACCEPTABLE BUT WEAK: Relying solely on employee vigilance without technical access controls leaves perimeter APIs and VPN gateways vulnerable.'
      },
      {
        id: 'prep-opt-3',
        text: 'Defer actions until anomalous inbound traffic or unauthorized access is definitively detected on core banking production systems.',
        rationale: 'Reactive posture allows adversaries to dwell within the environment for days, staging lateral movement and payload deployment undetected.',
        operationalImpact: 'Zero immediate cost, but sets the stage for catastrophic breach dwell time.',
        rtoImpactHours: 4,
        riskReductionScore: -15,
        financialCostUSD: 0,
        compliancePenaltyUSD: 50000,
        pointsAwarded: 20,
        feedback: 'DANGEROUS: Waiting for production failure violates FFIEC and DORA incident preparedness standards. Adversary dwell time will increase drastically.'
      }
    ]
  },
  {
    stageNumber: 2,
    stageName: 'Detection and Analysis',
    context: 'At 02:14 AM, the SOC SIEM alerts on multiple concurrent anomalous PowerShell executions, volume shadow copy deletion attempts, and unauthorized SMB sweeps targeting the Customer Database.',
    promptQuestion: 'How should the CSIRT triage the anomaly and classify incident scope without destroying evidence?',
    options: [
      {
        id: 'det-opt-1',
        text: 'Capture live volatile RAM forensics, preserve hypervisor snapshot artifacts, correlate NetFlow telemetry across the service mesh, and declare Severity-1 Major Cyber Incident.',
        rationale: 'Preserves critical volatile digital forensics required for root-cause analysis and regulatory reporting while triggering coordinated executive response.',
        operationalImpact: 'CSIRT and Core Banking engineers mobilized to War Room; customer transactions monitored under elevated scrutiny.',
        rtoImpactHours: -1,
        riskReductionScore: 20,
        financialCostUSD: 25000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Preserved volatile artifacts essential for attribution and regulatory reporting under SEC / GDPR guidelines while rapidly assessing attack scope.'
      },
      {
        id: 'det-opt-2',
        text: 'Immediately reboot affected virtual machines and run an on-demand antivirus scan on the customer database server.',
        rationale: 'Rebooting purges volatile RAM evidence, unencrypted decryption keys in memory, and process trees, blinding investigators.',
        operationalImpact: 'Causes unnecessary transaction interruption and wipes forensic evidence.',
        rtoImpactHours: 3,
        riskReductionScore: -10,
        financialCostUSD: 40000,
        compliancePenaltyUSD: 75000,
        pointsAwarded: 35,
        feedback: 'POOR PRACTICE: Rebooting compromised machines destroys volatile memory forensics (RAM), preventing identification of injected DLLs and active C2 channels.'
      },
      {
        id: 'det-opt-3',
        text: 'Send automated support ticket to the overnight database administrator to investigate during regular morning shift.',
        rationale: 'Ransomware propagates across network shares in minutes. Delaying response guarantees widespread encryption.',
        operationalImpact: 'Severe delay in containment; ransomware gains 6 hours of uninhibited lateral movement.',
        rtoImpactHours: 8,
        riskReductionScore: -30,
        financialCostUSD: 250000,
        compliancePenaltyUSD: 200000,
        pointsAwarded: 10,
        feedback: 'CRITICAL FAILURE: Delaying triage during an active ransomware detonation leads to complete infrastructure compromise.'
      }
    ]
  },
  {
    stageNumber: 3,
    stageName: 'Containment',
    context: 'Malware has established a beachhead on the VPN jump host and is actively attempting to authenticate against the Core Banking Ledger and SWIFT settlement terminal.',
    promptQuestion: 'What containment strategy should be executed to halt malware propagation while balancing banking business continuity?',
    options: [
      {
        id: 'cont-opt-1',
        text: 'Enforce micro-segmentation isolation at SDN switch level, revoke compromised Kerberos golden tickets, isolate infected hosts via EDR, and route customer payments through emergency fallback queue.',
        rationale: 'Surgically isolates infected assets and revokes authentication tokens, preventing lateral movement into Core Banking without shutting down the entire bank.',
        operationalImpact: 'Partial degraded mode for external jump hosts; online customer transactions continue under throttled inspection.',
        rtoImpactHours: -2,
        riskReductionScore: 30,
        financialCostUSD: 45000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Surgical isolation effectively halted lateral traversal into the SWIFT and Core Banking subnets without incurring catastrophic total outage.'
      },
      {
        id: 'cont-opt-2',
        text: 'Perform an emergency hard-power shutdown of the entire banking datacenter and sever all fiber WAN connections.',
        rationale: 'Completely stops the attack but causes catastrophic systemic financial disruption, ATM blackouts, and regulatory intervention.',
        operationalImpact: '100% bank-wide outage, nationwide ATM collapse, payment clearing deadline misses.',
        rtoImpactHours: 12,
        riskReductionScore: 5,
        financialCostUSD: 1800000,
        compliancePenaltyUSD: 500000,
        pointsAwarded: 50,
        feedback: 'DISPROPORTIONATE: While it prevents data exfiltration, total indiscriminate shutdown creates millions in unrecoverable business interruption and liquidity failure.'
      },
      {
        id: 'cont-opt-3',
        text: 'Leave infected hosts active and connected in order to monitor attacker commands and gather intelligence on their motive.',
        rationale: 'Honeynet deception on active production banking ledgers risks catastrophic encryption or unauthorized wire execution.',
        operationalImpact: 'Extremely high risk of unmitigated ledger corruption.',
        rtoImpactHours: 10,
        riskReductionScore: -40,
        financialCostUSD: 3500000,
        compliancePenaltyUSD: 750000,
        pointsAwarded: 15,
        feedback: 'UNACCEPTABLE: Playing honeytoken games with production banking systems during an active ransomware attack violates core fiduciary duties.'
      }
    ]
  },
  {
    stageNumber: 4,
    stageName: 'Eradication',
    context: 'Infected endpoints have been isolated. Malicious scheduled tasks, persistence registry keys, and compromised service accounts remain on staging hosts.',
    promptQuestion: 'How will the team fully eradicate threat actor persistence mechanisms across the enterprise?',
    options: [
      {
        id: 'erad-opt-1',
        text: 'Rebuild compromised servers from verified golden AMI images, rotate all enterprise Active Directory and service account credentials, and apply vendor hotfixes to the perimeter VPN.',
        rationale: 'Eliminates all unknown backdoors and persistent malware hooks by rebuilding clean infrastructure and resetting the credential chain.',
        operationalImpact: 'Scheduled 90-minute maintenance window to redeploy clean node cluster.',
        rtoImpactHours: -1,
        riskReductionScore: 25,
        financialCostUSD: 30000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Zero-trust rebuild from verified gold images ensures no dormant web shells or persistence mechanisms remain.'
      },
      {
        id: 'erad-opt-2',
        text: 'Manually delete identified suspicious files and registry entries found by the antivirus scan, leaving existing operating system installs intact.',
        rationale: 'Modern advanced persistent threats utilize living-off-the-land binaries (LOLBins) and hidden rootkits that standard AV scans consistently miss.',
        operationalImpact: 'Quick cleanup, but high residual risk of re-infection.',
        rtoImpactHours: 2,
        riskReductionScore: -5,
        financialCostUSD: 10000,
        compliancePenaltyUSD: 50000,
        pointsAwarded: 45,
        feedback: 'HIGH RESIDUAL RISK: Advanced ransomware strains embed secondary persistence modules. Manual file deletion frequently leads to secondary compromise within 30 days.'
      },
      {
        id: 'erad-opt-3',
        text: 'Engage a dark-web negotiation firm and pay the 45 Bitcoin ransom to obtain the threat actor’s proprietary decryptor tool.',
        rationale: 'Paying ransom rewards criminal syndicates, does not guarantee decryption, and violates OFAC sanctions regulations.',
        operationalImpact: 'Direct financial drain; severe regulatory penalties and OFAC sanction violations.',
        rtoImpactHours: 6,
        riskReductionScore: -30,
        financialCostUSD: 2800000,
        compliancePenaltyUSD: 1500000,
        pointsAwarded: 10,
        feedback: 'CRITICAL FAILURE: Paying ransoms violates OFAC sanctions guidance, fails to guarantee clean decryption, and marks the institution as an easy repeat target.'
      }
    ]
  },
  {
    stageNumber: 5,
    stageName: 'Recovery',
    context: 'Infrastructural integrity has been verified. The core transactional database must be brought back into full production synchronization.',
    promptQuestion: 'What recovery and validation protocol will ensure data integrity and avoid database corruption before restoring public access?',
    options: [
      {
        id: 'rec-opt-1',
        text: 'Restore transactional ledger from immutable WORM snapshot, replay signed transactional delta logs, conduct cryptographic hash verification, and execute canary user transactions before full cutover.',
        rationale: 'Guarantees financial ledger integrity, ensures zero transaction drop, and verifies system health before public exposure.',
        operationalImpact: 'Gradual phased recovery; online banking traffic throttled for 30 minutes during canary validation.',
        rtoImpactHours: -2,
        riskReductionScore: 25,
        financialCostUSD: 20000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Controlled ledger replay with cryptographic consistency checks prevented double-spending anomalies and satisfied strict banking audit controls.'
      },
      {
        id: 'rec-opt-2',
        text: 'Immediately direct all incoming web traffic to the restored database without running preliminary reconciliation checks.',
        rationale: 'High probability of ledger desynchronization, duplicate payment processing, and silent database corruption under load.',
        operationalImpact: 'Fast restoration, but potential catastrophic accounting ledger discrepancies.',
        rtoImpactHours: 4,
        riskReductionScore: -15,
        financialCostUSD: 350000,
        compliancePenaltyUSD: 120000,
        pointsAwarded: 40,
        feedback: 'RECKLESS: Restoring high-velocity banking databases without delta reconciliation risks massive accounting imbalances and regulatory restatements.'
      },
      {
        id: 'rec-opt-3',
        text: 'Delay recovery for 72 hours until third-party external forensic consultants complete a comprehensive source code audit.',
        rationale: 'Unnecessary operational delay that breaches contractual RTO and violates customer SLA obligations.',
        operationalImpact: 'Protracted bank outage; reputational destruction; severe regulatory breach penalties.',
        rtoImpactHours: 24,
        riskReductionScore: 5,
        financialCostUSD: 1200000,
        compliancePenaltyUSD: 600000,
        pointsAwarded: 50,
        feedback: 'EXCESSIVE DOWNTIME: Keeping the institution offline for days past technical containment breaches regulatory RTO thresholds and causes severe liquidity damage.'
      }
    ]
  },
  {
    stageNumber: 6,
    stageName: 'Post-Incident Review',
    context: 'The attack has been deflected and all services are operating nominally. Mandatory regulatory reporting and executive debrief are underway.',
    promptQuestion: 'What post-incident governance actions should be executed to harden resilience and satisfy statutory reporting requirements?',
    options: [
      {
        id: 'post-opt-1',
        text: 'Publish formal Post-Mortem within 72 hours, notify primary regulators (OCC/SEC/FINRA/GDPR) with transparent forensic findings, update tabletop simulations, and fund remediation for identified architectural single-points-of-failure.',
        rationale: 'Fulfills legal compliance obligations, builds market trust, and institutionalizes defense hardening against repeat intrusion.',
        operationalImpact: 'Executive board presentation; dedicated engineering sprint to close identified control gaps.',
        rtoImpactHours: 0,
        riskReductionScore: 25,
        financialCostUSD: 35000,
        compliancePenaltyUSD: 0,
        pointsAwarded: 100,
        feedback: 'EXCELLENT: Exemplary corporate governance. Timely regulatory disclosure avoided statutory fines, and architectural findings directly reinforced systemic defenses.'
      },
      {
        id: 'post-opt-2',
        text: 'Restrict incident knowledge to internal IT staff; classify the event as a minor transient hardware failure to avoid public disclosure and stock price volatility.',
        rationale: 'Covering up material cyber incidents is illegal under SEC and banking regulations, leading to criminal investigations and massive penalties.',
        operationalImpact: 'Temporary evasion of bad press, leading to eventual catastrophic legal and regulatory liability.',
        rtoImpactHours: 0,
        riskReductionScore: -40,
        financialCostUSD: 0,
        compliancePenaltyUSD: 5000000,
        pointsAwarded: 0,
        feedback: 'CRIMINAL MALPRACTICE: Concealing material cyber incidents breaches federal securities laws, resulting in executive disqualification, massive fines, and criminal prosecution.'
      },
      {
        id: 'post-opt-3',
        text: 'Archive the incident log file and terminate the shift without scheduling an engineering root-cause debrief.',
        rationale: 'Fails to learn from near-misses, guaranteeing that the same vulnerability will be exploited by other threat groups.',
        operationalImpact: 'Zero follow-up cost, but leaves architecture fragile.',
        rtoImpactHours: 0,
        riskReductionScore: -10,
        financialCostUSD: 0,
        compliancePenaltyUSD: 100000,
        pointsAwarded: 30,
        feedback: 'DEFICIENT GOVERNANCE: Failing to conduct post-incident root cause analysis guarantees repeat vulnerability exploitation and regulatory censure.'
      }
    ]
  }
];

export interface IRScorecard {
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalFinancialCostUSD: number;
  totalCompliancePenaltiesUSD: number;
  netRtoDeltaHours: number;
  netRiskReduction: number;
  stageResults: {
    stageNumber: number;
    stageName: string;
    chosenOptionId: string;
    chosenOptionText: string;
    points: number;
    feedback: string;
  }[];
  cisoExecutiveSummary: string;
}

export class IncidentResponseManager {
  public static getStages(): IRDecisionStage[] {
    return NIST_IR_STAGES;
  }

  public static evaluateDecision(stageNumber: number, optionId: string): {
    stage: IRDecisionStage;
    chosenOption: IRDecisionOption;
    isCorrectBestPractice: boolean;
  } {
    const stage = NIST_IR_STAGES.find(s => s.stageNumber === stageNumber);
    if (!stage) {
      throw new Error(`IR Stage ${stageNumber} not found.`);
    }

    const chosenOption = stage.options.find(o => o.id === optionId);
    if (!chosenOption) {
      throw new Error(`Option ${optionId} not found in Stage ${stageNumber}.`);
    }

    const isCorrectBestPractice = chosenOption.pointsAwarded >= 80;

    return {
      stage,
      chosenOption,
      isCorrectBestPractice
    };
  }

  public static generateScorecard(decisions: { stageNumber: number; chosenOptionId: string }[]): IRScorecard {
    let totalScore = 0;
    const maxScore = NIST_IR_STAGES.length * 100;
    let totalCost = 0;
    let totalPenalties = 0;
    let netRtoDelta = 0;
    let netRiskReduction = 0;

    const stageResults: IRScorecard['stageResults'] = [];

    for (const d of decisions) {
      const stage = NIST_IR_STAGES.find(s => s.stageNumber === d.stageNumber);
      if (stage) {
        const opt = stage.options.find(o => o.id === d.chosenOptionId);
        if (opt) {
          totalScore += opt.pointsAwarded;
          totalCost += opt.financialCostUSD;
          totalPenalties += opt.compliancePenaltyUSD;
          netRtoDelta += opt.rtoImpactHours;
          netRiskReduction += opt.riskReductionScore;

          stageResults.push({
            stageNumber: stage.stageNumber,
            stageName: stage.stageName,
            chosenOptionId: opt.id,
            chosenOptionText: opt.text,
            points: opt.pointsAwarded,
            feedback: opt.feedback
          });
        }
      }
    }

    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const grade: IRScorecard['grade'] =
      scorePercentage >= 95 ? 'A+' :
      scorePercentage >= 85 ? 'A' :
      scorePercentage >= 70 ? 'B' :
      scorePercentage >= 55 ? 'C' :
      scorePercentage >= 40 ? 'D' : 'F';

    let cisoExecutiveSummary = '';
    if (scorePercentage >= 85) {
      cisoExecutiveSummary = 'Exemplary Incident Response Leadership: The team balanced technical containment, forensic preservation, and regulatory compliance with surgical precision. Business continuity was sustained without capitulating to extortion.';
    } else if (scorePercentage >= 70) {
      cisoExecutiveSummary = 'Competent Response with Minor Deficiencies: Incident was contained and systemic collapse avoided, but delays in forensic acquisition or over-aggressive shutdown resulted in excess operational downtime.';
    } else {
      cisoExecutiveSummary = 'Critical IR Governance Failure: Decisions violated fundamental cybersecurity best practices, causing massive regulatory non-compliance, forensic evidence loss, or prolonged operational paralysis.';
    }

    return {
      totalScore,
      maxScore,
      scorePercentage,
      grade,
      totalFinancialCostUSD: totalCost,
      totalCompliancePenaltiesUSD: totalPenalties,
      netRtoDeltaHours: netRtoDelta,
      netRiskReduction,
      stageResults,
      cisoExecutiveSummary
    };
  }
}

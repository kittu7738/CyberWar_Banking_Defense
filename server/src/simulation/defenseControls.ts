import { DefensiveControl } from '../types/index.js';

export const INITIAL_DEFENSIVE_CONTROLS: DefensiveControl[] = [
  {
    id: 'ctrl-firewall-waf',
    name: 'Next-Gen Firewall & Cloud WAF / Anti-DDoS Scrubbing',
    category: 'PERIMETER',
    cost: 120000,
    description: 'BGP Anycast scrubbing, layer-7 HTTP rate limiting, IP reputation filtering, and Web Application Firewall rules.',
    eligibleAssetTypes: ['APPLICATION', 'GATEWAY', 'ATM_NETWORK', 'THIRD_PARTY_SERVICE'],
    effectiveness: {
      DDOS: 0.85,
      RANSOMWARE: 0.20,
      DATA_BREACH: 0.40,
      INSIDER_THREAT: 0.10,
      SUPPLY_CHAIN: 0.25,
      INFRASTRUCTURE_DISRUPTION: 0.45
    },
    limitations: 'Cannot prevent authenticated insider access or memory-resident payload execution.',
    operationalOverhead: 'Periodic rule tuning during promotional traffic spikes.',
    mitigationFormula: 'Absorbs volumetric saturation; limits SYN flood & HTTP cascades by 85%.',
    active: false
  },
  {
    id: 'ctrl-network-segmentation',
    name: 'Micro-Segmentation & Zero Trust Zone Isolation',
    category: 'PERIMETER',
    cost: 150000,
    description: 'Strict software-defined micro-segmentation, East-West firewalling, and isolated VLANs separating DMZ and core databases.',
    eligibleAssetTypes: ['APPLICATION', 'CORE_BANKING', 'DATABASE', 'GATEWAY', 'ATM_NETWORK', 'BACKUP_SYSTEM', 'SETTLEMENT'],
    effectiveness: {
      DDOS: 0.15,
      RANSOMWARE: 0.80,
      DATA_BREACH: 0.65,
      INSIDER_THREAT: 0.50,
      SUPPLY_CHAIN: 0.70,
      INFRASTRUCTURE_DISRUPTION: 0.35
    },
    limitations: 'High configuration complexity; strict rules require service mesh policy maintenance.',
    operationalOverhead: 'Requires automated certificate rotation and mesh policy sync.',
    mitigationFormula: 'Constrains lateral movement by 80%, confining infected nodes to entry tier.',
    active: false
  },
  {
    id: 'ctrl-security-patching',
    name: 'Automated Vulnerability Management & Patch Deployment',
    category: 'ENDPOINT',
    cost: 95000,
    description: 'Continuous CVE scanning, automated container image patching, and emergency zero-day patch cycle for core platforms.',
    eligibleAssetTypes: ['APPLICATION', 'CORE_BANKING', 'DATABASE', 'GATEWAY', 'IDENTITY', 'FRAUD_SYSTEM', 'ATM_NETWORK', 'BACKUP_SYSTEM'],
    effectiveness: {
      DDOS: 0.25,
      RANSOMWARE: 0.70,
      DATA_BREACH: 0.75,
      INSIDER_THREAT: 0.20,
      SUPPLY_CHAIN: 0.80,
      INFRASTRUCTURE_DISRUPTION: 0.60
    },
    limitations: 'Zero-day exploits prior to vendor patch release remain active until virtual patching.',
    operationalOverhead: 'Staging environment regression testing required.',
    mitigationFormula: 'Lowers asset base CVE vulnerability levels by 30-45% across endpoints.',
    active: false
  },
  {
    id: 'ctrl-mfa-identity',
    name: 'FIDO2 / Hardware MFA & Adaptive Risk-Based Identity',
    category: 'IDENTITY',
    cost: 110000,
    description: 'Hardware security keys (FIDO2/WebAuthn), push biometric verification, and step-up auth on high-risk transfers.',
    eligibleAssetTypes: ['APPLICATION', 'GATEWAY', 'IDENTITY', 'CORE_BANKING'],
    effectiveness: {
      DDOS: 0.05,
      RANSOMWARE: 0.55,
      DATA_BREACH: 0.85,
      INSIDER_THREAT: 0.60,
      SUPPLY_CHAIN: 0.40,
      INFRASTRUCTURE_DISRUPTION: 0.10
    },
    limitations: 'Vulnerable to session token hijacking if push notifications lack number matching.',
    operationalOverhead: 'User support burden for lost security keys and mobile authenticator onboarding.',
    mitigationFormula: 'Neutralizes 85% of credential stuffing, password spraying, and phishing vector access.',
    active: false
  },
  {
    id: 'ctrl-edr-xdr',
    name: 'Managed Endpoint Detection & Response (EDR / XDR)',
    category: 'ENDPOINT',
    cost: 140000,
    description: 'Behavioral heuristic agent with automatic host isolation, memory injection defense, and process tree anomaly detection.',
    eligibleAssetTypes: ['APPLICATION', 'CORE_BANKING', 'DATABASE', 'GATEWAY', 'FRAUD_SYSTEM', 'ATM_NETWORK'],
    effectiveness: {
      DDOS: 0.10,
      RANSOMWARE: 0.85,
      DATA_BREACH: 0.70,
      INSIDER_THREAT: 0.65,
      SUPPLY_CHAIN: 0.85,
      INFRASTRUCTURE_DISRUPTION: 0.30
    },
    limitations: 'Legacy mainframe or embedded ATM OS modules may have limited telemetry support.',
    operationalOverhead: 'Continuous alert triage required by Level 2 SOC analysts.',
    mitigationFormula: 'Detects and halts unauthorized crypto-locking and PowerShell living-off-the-land techniques.',
    active: false
  },
  {
    id: 'ctrl-security-awareness',
    name: 'Financial Sector Anti-Phishing & Human Risk Training',
    category: 'GOVERNANCE',
    cost: 45000,
    description: 'Simulated executive spear-phishing campaigns, teller fraud training, and mandatory quarterly security certifications.',
    eligibleAssetTypes: ['APPLICATION', 'IDENTITY', 'ATM_NETWORK'],
    effectiveness: {
      DDOS: 0.05,
      RANSOMWARE: 0.40,
      DATA_BREACH: 0.50,
      INSIDER_THREAT: 0.35,
      SUPPLY_CHAIN: 0.30,
      INFRASTRUCTURE_DISRUPTION: 0.15
    },
    limitations: 'Human error cannot be 100% eliminated; deepfake executive voice spoofing may bypass awareness.',
    operationalOverhead: 'Periodic curriculum creation and employee re-testing.',
    mitigationFormula: 'Lowers initial employee click-through rates on phishing emails from 28% to under 3.5%.',
    active: false
  },
  {
    id: 'ctrl-backup-recovery',
    name: 'Air-Gapped Immutable Backups & Automated DR Failover',
    category: 'RESILIENCE',
    cost: 180000,
    description: 'WORM immutable optical/cloud snapshots, automated database delta replication, and active-active hot site failover.',
    eligibleAssetTypes: ['CORE_BANKING', 'DATABASE', 'BACKUP_SYSTEM', 'APPLICATION'],
    effectiveness: {
      DDOS: 0.30,
      RANSOMWARE: 0.90,
      DATA_BREACH: 0.20,
      INSIDER_THREAT: 0.40,
      SUPPLY_CHAIN: 0.60,
      INFRASTRUCTURE_DISRUPTION: 0.85
    },
    limitations: 'Does not prevent confidential data exfiltration, only facilitates rapid clean recovery.',
    operationalOverhead: 'Bi-annual full DR dress rehearsals required under banking regulatory mandates.',
    mitigationFormula: 'Cuts RTO recovery time from days to under 45 minutes; enables clean bare-metal rebuild.',
    active: false
  },
  {
    id: 'ctrl-siem-soc',
    name: '24/7 Managed SIEM / SOAR & Cyber Threat Intelligence',
    category: 'GOVERNANCE',
    cost: 160000,
    description: 'Centralized log aggregation, real-time correlation across banking tiers, automated playbooks, and FS-ISAC feeds.',
    eligibleAssetTypes: ['APPLICATION', 'CORE_BANKING', 'DATABASE', 'GATEWAY', 'IDENTITY', 'FRAUD_SYSTEM', 'ATM_NETWORK', 'BACKUP_SYSTEM', 'SETTLEMENT'],
    effectiveness: {
      DDOS: 0.65,
      RANSOMWARE: 0.75,
      DATA_BREACH: 0.80,
      INSIDER_THREAT: 0.70,
      SUPPLY_CHAIN: 0.75,
      INFRASTRUCTURE_DISRUPTION: 0.70
    },
    limitations: 'Alert fatigue risk if ingestion rules are noisy; relies on automated playbooks for containment.',
    operationalOverhead: 'Dedicated engineering for log ingestion pipelines and custom parsing.',
    mitigationFormula: 'Shortens Mean Time to Detect (MTTD) from months to minutes; accelerates containment trigger.',
    active: false
  },
  {
    id: 'ctrl-pam-vault',
    name: 'Privileged Access Management (PAM) & Ephemeral Credentials',
    category: 'IDENTITY',
    cost: 130000,
    description: 'Just-in-Time privilege elevation, session recording for DBAs, and automated credential rotation for service accounts.',
    eligibleAssetTypes: ['CORE_BANKING', 'DATABASE', 'GATEWAY', 'IDENTITY', 'BACKUP_SYSTEM', 'SETTLEMENT'],
    effectiveness: {
      DDOS: 0.10,
      RANSOMWARE: 0.75,
      DATA_BREACH: 0.80,
      INSIDER_THREAT: 0.90,
      SUPPLY_CHAIN: 0.65,
      INFRASTRUCTURE_DISRUPTION: 0.50
    },
    limitations: 'Requires operational discipline; emergency break-glass procedures must be carefully audited.',
    operationalOverhead: 'Administrative review of elevated privilege session logs.',
    mitigationFormula: 'Eliminates permanent root/admin credentials; blocks 90% of unauthorized insider data manipulation.',
    active: false
  },
  {
    id: 'ctrl-cyber-insurance',
    name: 'Comprehensive Financial Institution Cyber Insurance Policy',
    category: 'RISK_TRANSFER',
    cost: 80000,
    description: '$25M aggregate coverage for forensic investigations, business interruption reimbursement, and regulatory legal defense.',
    eligibleAssetTypes: ['APPLICATION', 'CORE_BANKING', 'DATABASE', 'SETTLEMENT'],
    effectiveness: {
      DDOS: 0.40,
      RANSOMWARE: 0.50,
      DATA_BREACH: 0.60,
      INSIDER_THREAT: 0.40,
      SUPPLY_CHAIN: 0.50,
      INFRASTRUCTURE_DISRUPTION: 0.50
    },
    limitations: 'Financial risk transfer only; does not eliminate operational downtime during an active attack.',
    operationalOverhead: 'Annual compliance audits and security posture warranty submissions.',
    mitigationFormula: 'Underwrites up to 75% of post-incident financial and legal liability losses.',
    active: false
  }
];

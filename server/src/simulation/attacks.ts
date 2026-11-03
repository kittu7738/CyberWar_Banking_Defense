import { AttackScenario } from '../types/index.js';

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'ddos-surge',
    name: 'Distributed Denial of Service (DDoS) Volumetric & L7 Flood',
    vector: 'DDOS',
    threatActor: 'State-Sponsored Threat Group "VoltBear"',
    severity: 'HIGH',
    objective: 'Overwhelm customer-facing banking channels to induce public panic and mask fraud.',
    narrative: 'A coordinated attack launching 850 Gbps volumetric reflection and a 4.5M req/sec HTTPS application flood targeting login endpoints.',
    initialTargetAssetId: 'asset-online-banking',
    cascadingPotential: 'Severe downstream saturation of Internal API Gateway, stalling Core Banking transactions.',
    regulatoryImpact: 'FINRA & OCC mandatory notification within 24 hours of customer portal availability failure.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:02:00',
        phase: 'Perimeter Pulse Probe',
        targetAssetId: 'asset-online-banking',
        action: 'Adversary probes perimeter edge servers with short 50 Gbps bursts to map rate-limit thresholds.',
        relevantControlIds: ['ctrl-firewall-waf', 'ctrl-siem-soc'],
        mitigationThreshold: 0.50,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 15, financialLoss: 25000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 2, financialLoss: 2000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:08:00',
        phase: 'Volumetric Saturation Flood',
        targetAssetId: 'asset-online-banking',
        secondaryAssetIds: ['asset-internal-api'],
        action: 'SYN flood and SSL negotiation exhaustion swamp web load balancers; ingress bandwidth reaches 98%.',
        relevantControlIds: ['ctrl-firewall-waf', 'ctrl-siem-soc', 'ctrl-network-segmentation'],
        mitigationThreshold: 0.70,
        unmitigatedImpact: { status: 'OFFLINE', healthDrop: 60, financialLoss: 350000 },
        mitigatedImpact: { status: 'DEGRADED', healthDrop: 10, financialLoss: 20000 }
      },
      {
        step: 3,
        timeOffset: 'T+00:18:00',
        phase: 'Cascading Thread Pool Exhaustion',
        targetAssetId: 'asset-internal-api',
        secondaryAssetIds: ['asset-payment-gateway', 'asset-atm-network'],
        action: 'Stalled HTTP connections consume thread pools in Internal API Gateway; payment authorizations time out.',
        relevantControlIds: ['ctrl-firewall-waf', 'ctrl-network-segmentation', 'ctrl-backup-recovery'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 50, financialLoss: 680000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 8, financialLoss: 35000 }
      },
      {
        step: 4,
        timeOffset: 'T+00:35:00',
        phase: 'Perimeter Defense Stabilization',
        targetAssetId: 'asset-online-banking',
        secondaryAssetIds: ['asset-internal-api', 'asset-payment-gateway'],
        action: 'Attack reaches peak persistence. If edge scrubbing is active, malicious traffic is blackholed and banking services stabilize.',
        relevantControlIds: ['ctrl-firewall-waf', 'ctrl-siem-soc', 'ctrl-cyber-insurance'],
        mitigationThreshold: 0.60,
        unmitigatedImpact: { status: 'OFFLINE', healthDrop: 40, financialLoss: 850000 },
        mitigatedImpact: { status: 'RECOVERING', healthDrop: 5, financialLoss: 40000 }
      }
    ]
  },
  {
    id: 'ransomware-lateral',
    name: 'Targeted Ransomware with Lateral Movement (LockBit / BlackCat Variant)',
    vector: 'RANSOMWARE',
    threatActor: 'Financially-Motivated Cartel "DarkLocker Syndicate"',
    severity: 'CRITICAL',
    objective: 'Compromise remote access, dump Kerberos tickets, move laterally, and encrypt ledger snapshots.',
    narrative: 'Attackers exploit an unpatched access portal, harvest active Kerberos tickets, and push encrypted locker payloads into database tiers.',
    initialTargetAssetId: 'asset-corporate-vpn',
    cascadingPotential: 'Catastrophic compromise of Customer Database and Core Banking ledger.',
    regulatoryImpact: 'Mandatory SEC 4-day material cybersecurity incident disclosure.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:04:00',
        phase: 'Perimeter Infiltration via Stolen Credentials',
        targetAssetId: 'asset-corporate-vpn',
        action: 'Attackers leverage compromised VPN credentials acquired from dark web credential broker. MFA bypass attempted.',
        relevantControlIds: ['ctrl-mfa-identity', 'ctrl-security-awareness', 'ctrl-pam-vault'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 30, financialLoss: 80000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 4, financialLoss: 5000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:15:00',
        phase: 'Privilege Escalation & Memory Scraping',
        targetAssetId: 'asset-corporate-vpn',
        secondaryAssetIds: ['asset-auth-identity', 'asset-internal-api'],
        action: 'Adversary uses Mimikatz memory scraping and Active Directory enumeration to obtain Domain Admin tokens.',
        relevantControlIds: ['ctrl-edr-xdr', 'ctrl-pam-vault', 'ctrl-network-segmentation', 'ctrl-security-patching'],
        mitigationThreshold: 0.70,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 45, financialLoss: 300000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 5, financialLoss: 15000 }
      },
      {
        step: 3,
        timeOffset: 'T+00:32:00',
        phase: 'Lateral Movement into Core Data Tier',
        targetAssetId: 'asset-customer-db',
        secondaryAssetIds: ['asset-core-banking'],
        action: 'Adversary breaches internal network segmentation. Malicious locker payload staged across customer database hosts.',
        relevantControlIds: ['ctrl-network-segmentation', 'ctrl-edr-xdr', 'ctrl-siem-soc'],
        mitigationThreshold: 0.75,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 70, financialLoss: 1400000 },
        mitigatedImpact: { status: 'DEGRADED', healthDrop: 12, financialLoss: 60000 }
      },
      {
        step: 4,
        timeOffset: 'T+00:58:00',
        phase: 'Ransomware Detonation & Shadow Copy Purge',
        targetAssetId: 'asset-core-banking',
        secondaryAssetIds: ['asset-customer-db', 'asset-backup-recovery'],
        action: 'Simultaneous AES-256 encryption invoked on primary databases. Attackers attempt to purge backup catalogs.',
        relevantControlIds: ['ctrl-backup-recovery', 'ctrl-edr-xdr', 'ctrl-cyber-insurance'],
        mitigationThreshold: 0.80,
        unmitigatedImpact: { status: 'OFFLINE', healthDrop: 90, financialLoss: 4500000 },
        mitigatedImpact: { status: 'RECOVERING', healthDrop: 15, financialLoss: 150000 }
      }
    ]
  },
  {
    id: 'data-breach-exfiltration',
    name: 'Customer PII & Account Exfiltration (Data Breach)',
    vector: 'DATA_BREACH',
    threatActor: 'Syndicate Cybercrime Ring "FIN-SilentRaven"',
    severity: 'CRITICAL',
    objective: 'Exfiltrate high-net-worth customer records, credit histories, and credentials for monetization.',
    narrative: 'A covert attack utilizing SQL injection vulnerability in an internal microservice, pivoting to the Customer PII database and exfiltrating records.',
    initialTargetAssetId: 'asset-internal-api',
    cascadingPotential: 'Direct exposure of 1.2 million customer KYC profiles, tax IDs, and cardholder records.',
    regulatoryImpact: 'GDPR Article 33 72-hour notification; PCI-DSS Level 1 non-compliance fines.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:03:00',
        phase: 'API Endpoint Exploit & Parameter Tampering',
        targetAssetId: 'asset-internal-api',
        action: 'Threat actor discovers an unauthenticated GraphQL debug endpoint and launches parameter fuzzing.',
        relevantControlIds: ['ctrl-security-patching', 'ctrl-firewall-waf', 'ctrl-siem-soc'],
        mitigationThreshold: 0.60,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 20, financialLoss: 40000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 3, financialLoss: 5000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:14:00',
        phase: 'Blind SQL Injection & Schema Discovery',
        targetAssetId: 'asset-customer-db',
        action: 'Exploit succeeds in executing blind SQL injection against customer database view, dumping schema definitions.',
        relevantControlIds: ['ctrl-network-segmentation', 'ctrl-security-patching', 'ctrl-pam-vault'],
        mitigationThreshold: 0.68,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 40, financialLoss: 250000, dataExposedRecords: 25000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 5, financialLoss: 15000, dataExposedRecords: 0 }
      },
      {
        step: 3,
        timeOffset: 'T+00:29:00',
        phase: 'Bulk PII Record Extraction',
        targetAssetId: 'asset-customer-db',
        secondaryAssetIds: ['asset-fraud-detection'],
        action: 'Automated script dumps 450,000 sensitive financial records including Social Security and routing numbers.',
        relevantControlIds: ['ctrl-siem-soc', 'ctrl-pam-vault', 'ctrl-edr-xdr'],
        mitigationThreshold: 0.72,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 65, financialLoss: 1800000, dataExposedRecords: 450000 },
        mitigatedImpact: { status: 'DEGRADED', healthDrop: 10, financialLoss: 75000, dataExposedRecords: 1200 }
      },
      {
        step: 4,
        timeOffset: 'T+00:46:00',
        phase: 'Covert Outbound Exfiltration & Extortion Notice',
        targetAssetId: 'asset-customer-db',
        secondaryAssetIds: ['asset-online-banking'],
        action: 'Data exfiltrated via encrypted DNS queries to foreign VPS servers. Extortion demand issued.',
        relevantControlIds: ['ctrl-siem-soc', 'ctrl-cyber-insurance', 'ctrl-network-segmentation'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 50, financialLoss: 3200000, dataExposedRecords: 950000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 8, financialLoss: 120000, dataExposedRecords: 5000 }
      }
    ]
  },
  {
    id: 'insider-threat-privilege',
    name: 'Privileged Insider Access Abuse & Unauthorized Fund Diversion',
    vector: 'INSIDER_THREAT',
    threatActor: 'Disgruntled Senior Systems Engineer & Treasury DBA',
    severity: 'HIGH',
    objective: 'Abuse legitimate elevated credentials to modify transaction routing rules and bypass dual control.',
    narrative: 'A senior administrator with standing database privileges exploits lack of ephemeral credential rotation to insert synthetic ledger entries.',
    initialTargetAssetId: 'asset-core-banking',
    cascadingPotential: 'Falsified settlement files passed to SWIFT network and payment processing gateway.',
    regulatoryImpact: 'Sarbanes-Oxley (SOX) Section 404 audit failure; OCC formal enforcement action.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:05:00',
        phase: 'Off-Hours Standing Privilege Abuse',
        targetAssetId: 'asset-core-banking',
        action: 'Administrator logs in during non-business hours using legitimate credentials, disabling secondary audit hooks.',
        relevantControlIds: ['ctrl-pam-vault', 'ctrl-mfa-identity', 'ctrl-siem-soc'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 25, financialLoss: 60000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 3, financialLoss: 5000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:16:00',
        phase: 'Ledger Manipulation & Account Whitelisting',
        targetAssetId: 'asset-core-banking',
        secondaryAssetIds: ['asset-fraud-detection'],
        action: 'Insider alters ledger balances across escrow accounts and whitelists suspect beneficiary accounts in fraud engine.',
        relevantControlIds: ['ctrl-pam-vault', 'ctrl-siem-soc', 'ctrl-edr-xdr'],
        mitigationThreshold: 0.70,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 50, financialLoss: 850000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 6, financialLoss: 25000 }
      },
      {
        step: 3,
        timeOffset: 'T+00:28:00',
        phase: 'Disbursement Dispatch via Settlement Rails',
        targetAssetId: 'asset-settlement-swift',
        secondaryAssetIds: ['asset-payment-gateway'],
        action: 'Insider queues unauthorized SWIFT MT103 wire messages prior to morning accounting reconciliation.',
        relevantControlIds: ['ctrl-pam-vault', 'ctrl-network-segmentation', 'ctrl-cyber-insurance'],
        mitigationThreshold: 0.75,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 60, financialLoss: 2200000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 8, financialLoss: 50000 }
      }
    ]
  },
  {
    id: 'supply-chain-compromise',
    name: 'Upstream FinTech SDK & Software Supply-Chain Compromise',
    vector: 'SUPPLY_CHAIN',
    threatActor: 'Sophisticated State-Aligned Espionage Unit "UNC4899"',
    severity: 'HIGH',
    objective: 'Compromise upstream open-source payment SDK build pipeline to deliver backdoored telemetry libraries.',
    narrative: 'A popular banking microservice dependency is backdoored via poisoned open-source commit, intercepting payment auth tokens and tunneling them to adversary C2 servers.',
    initialTargetAssetId: 'asset-payment-gateway',
    cascadingPotential: 'Cascading token leakage across Payment Processing Gateway and Customer Database.',
    regulatoryImpact: 'PCI-DSS Section 6.4 secure software supply chain non-compliance notice; card brand fines.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:03:00',
        phase: 'Poisoned Upstream Library Ingestion',
        targetAssetId: 'asset-payment-gateway',
        action: 'Automated CI/CD pull deploys a minor version update of third-party payment parsing library containing a hidden obfuscated backdoor.',
        relevantControlIds: ['ctrl-security-patching', 'ctrl-siem-soc'],
        mitigationThreshold: 0.55,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 20, financialLoss: 50000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 3, financialLoss: 4000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:14:00',
        phase: 'Memory Hooking & Token Interception',
        targetAssetId: 'asset-payment-gateway',
        secondaryAssetIds: ['asset-customer-db'],
        action: 'Backdoor dynamically hooks TLS decryption memory buffers in payment gateway to capture unmasked cardholder numbers and CVVs.',
        relevantControlIds: ['ctrl-edr-xdr', 'ctrl-network-segmentation', 'ctrl-pam-vault'],
        mitigationThreshold: 0.70,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 45, financialLoss: 600000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 6, financialLoss: 30000 }
      },
      {
        step: 3,
        timeOffset: 'T+00:27:00',
        phase: 'Encrypted C2 Beaconing & Upstream Quarantine',
        targetAssetId: 'asset-payment-gateway',
        secondaryAssetIds: ['asset-third-party-payment'],
        action: 'Adversary beacons stolen telemetry to bulletproof hosting. If behavioral EDR and segmentation are active, outbound socket is blocked.',
        relevantControlIds: ['ctrl-edr-xdr', 'ctrl-siem-soc', 'ctrl-firewall-waf'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'COMPROMISED', healthDrop: 60, financialLoss: 1500000 },
        mitigatedImpact: { status: 'RECOVERING', healthDrop: 8, financialLoss: 60000 }
      }
    ]
  },
  {
    id: 'infra-disruption-cloud',
    name: 'Major Cloud Availability Zone Outage & Third-Party Dependency Severance',
    vector: 'INFRASTRUCTURE_DISRUPTION',
    threatActor: 'Compound Catastrophic Cloud Provider Hardware Failure & Fiber Cut',
    severity: 'HIGH',
    objective: 'Test institutional operational resilience, business continuity plans, and recovery time objectives under systemic outage.',
    narrative: 'A dual-zone cloud provider electrical substation fire severs primary peering backbones, disconnecting third-party payment gateways and primary routers.',
    initialTargetAssetId: 'asset-third-party-payment',
    cascadingPotential: 'Cascades into Payment Gateway stall, checkout failures across 40,000 merchant terminals, and API backpressure.',
    regulatoryImpact: 'Digital Operational Resilience Act (DORA) operational resilience testing violation.',
    stages: [
      {
        step: 1,
        timeOffset: 'T+00:01:00',
        phase: 'Provider Connectivity Drop & BGP Flapping',
        targetAssetId: 'asset-third-party-payment',
        action: 'Primary peering links to cloud clearinghouse drop packets. Transaction latency spikes from 80ms to over 14,000ms.',
        relevantControlIds: ['ctrl-backup-recovery', 'ctrl-firewall-waf', 'ctrl-siem-soc'],
        mitigationThreshold: 0.50,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 30, financialLoss: 90000 },
        mitigatedImpact: { status: 'HEALTHY', healthDrop: 5, financialLoss: 10000 }
      },
      {
        step: 2,
        timeOffset: 'T+00:12:00',
        phase: 'Cascading Payment Gateway Queue Collapse',
        targetAssetId: 'asset-payment-gateway',
        secondaryAssetIds: ['asset-online-banking'],
        action: 'Stalled upstream payment requests cause thread pool exhaustion in payment gateway. Retail transactions fail across merchant terminals.',
        relevantControlIds: ['ctrl-backup-recovery', 'ctrl-network-segmentation', 'ctrl-security-patching'],
        mitigationThreshold: 0.65,
        unmitigatedImpact: { status: 'OFFLINE', healthDrop: 65, financialLoss: 750000 },
        mitigatedImpact: { status: 'DEGRADED', healthDrop: 15, financialLoss: 45000 }
      },
      {
        step: 3,
        timeOffset: 'T+00:30:00',
        phase: 'Disaster Recovery Hot-Site Failover Execution',
        targetAssetId: 'asset-backup-recovery',
        secondaryAssetIds: ['asset-payment-gateway', 'asset-online-banking'],
        action: 'Institution attempts automated DNS rerouting and failover to secondary air-gapped recovery cluster.',
        relevantControlIds: ['ctrl-backup-recovery', 'ctrl-cyber-insurance', 'ctrl-siem-soc'],
        mitigationThreshold: 0.70,
        unmitigatedImpact: { status: 'DEGRADED', healthDrop: 45, financialLoss: 1200000 },
        mitigatedImpact: { status: 'RECOVERING', healthDrop: 10, financialLoss: 80000 }
      }
    ]
  }
];

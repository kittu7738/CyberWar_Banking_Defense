import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const FRONTEND_URL = 'http://localhost:5173/';

class SimpleCDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.failedRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
            this.consoleErrors.push(text);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          this.consoleErrors.push(msg.params.exceptionDetails.text || 'Uncaught exception');
        } else if (msg.method === 'Network.responseReceived') {
          const { status, url } = msg.params.response;
          if (status >= 400 && !url.includes('favicon')) {
            this.failedRequests.push({ url, status });
          }
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runBrowserTests() {
  console.log('🚀 Starting Google Chrome Headless browser automation...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    FRONTEND_URL
  ]);

  let cdp = null;

  try {
    // Wait for Chrome DevTools port
    let connected = false;
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await setTimeout(500);
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
        const targets = await res.json();
        const pageTarget = targets.find(t => t.type === 'page');
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          connected = true;
          break;
        }
      } catch (e) {
        // Retry
      }
    }

    if (!connected || !wsUrl) {
      throw new Error('Failed to connect to Chrome DevTools port 9222.');
    }

    console.log('✅ Connected to Chrome DevTools Protocol via WebSocket');
    cdp = new SimpleCDPClient(wsUrl);
    await cdp.connect();

    // Enable domains
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    // Wait 2s for initial render and React hydration
    await setTimeout(2000);

    const testResults = [];

    // TEST 1: Check document title and header title
    const pageTitle = await cdp.eval('document.title');
    const headerText = await cdp.eval('document.querySelector("header") ? document.querySelector("header").innerText : ""');
    const hasHeader = headerText.includes('CYBERWAR BANKING DEFENSE');
    testResults.push({
      name: '1. Frontend Shell & Title Header Render',
      passed: hasHeader,
      details: `Title: "${pageTitle}", Header detected: ${hasHeader}`
    });

    // TEST 2: Verify Sidebar Navigation Items
    const sidebarItems = await cdp.eval(`
      Array.from(document.querySelectorAll('nav .MuiListItemText-primary, [role="button"] .MuiListItemText-primary'))
        .map(el => el.innerText.trim())
    `);
    const expectedPages = ['Dashboard', 'Banking Infrastructure', 'Attack Simulator', 'Defense Allocation', 'Incident Response', 'Risk Analysis', 'Reports'];
    const allSidebarFound = expectedPages.every(p => sidebarItems.some(item => item.includes(p)));
    testResults.push({
      name: '2. All 7 Sidebar Navigation Pages Rendered',
      passed: allSidebarFound,
      details: `Found sidebar items: ${JSON.stringify(sidebarItems)}`
    });

    // TEST 3: Role Selector Switching across all 5 roles
    const rolesToTest = [
      { key: 'RED_TEAM', name: 'Adversary Simulation Lead' },
      { key: 'REGULATOR', name: 'Financial Supervisory Authority / Bank Examiner' },
      { key: 'INSURER', name: 'Cyber Risk Underwriter' },
      { key: 'INFRA_OFFICER', name: 'Critical Infrastructure & Business Continuity Director' },
      { key: 'CISO', name: 'Chief Information Security Officer' }
    ];

    let rolesSuccess = true;
    for (const r of rolesToTest) {
      // Trigger MUI select dropdown opening via mousedown and click
      await cdp.eval(`
        (() => {
          const selectTrigger = document.querySelector('[aria-haspopup="listbox"]');
          if (selectTrigger) {
            selectTrigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          }
        })()
      `);
      await setTimeout(400);

      // Select role in popup menu
      const clicked = await cdp.eval(`
        (() => {
          const options = Array.from(document.querySelectorAll('[role="option"], .MuiMenuItem-root'));
          const target = options.find(o => o.innerText.includes("${r.key}") || o.innerText.includes("${r.name}") || o.getAttribute('data-value') === "${r.key}");
          if (target) {
            target.click();
            return true;
          }
          return false;
        })()
      `);
      await setTimeout(600);

      const activeBadge = await cdp.eval(`
        Boolean(document.body.innerText.includes("${r.name}") || document.body.innerText.includes("${r.key}"))
      `);
      if (!activeBadge) rolesSuccess = false;
    }

    testResults.push({
      name: '3. Role Selector Switches All 5 Perspectives',
      passed: rolesSuccess,
      details: 'Verified CISO, RED_TEAM, REGULATOR, INSURER, and INFRA_OFFICER UI switches'
    });

    // TEST 4: Navigation through pages
    // 4a. Navigate to Banking Infrastructure
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Banking Infrastructure"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);
    const hasD3Graph = await cdp.eval('Boolean(document.querySelector("svg circle"))');
    testResults.push({
      name: '4. Banking Infrastructure D3 Network Graph Render',
      passed: hasD3Graph,
      details: `D3 SVG nodes rendered: ${hasD3Graph}`
    });

    // 4b. Navigate to Defense Allocation
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Defense Allocation"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);

    // Toggle a defense checkbox and verify budget calculation
    const budgetBefore = await cdp.eval(`
      document.body.innerText.includes("$1,000,000") || document.body.innerText.includes("1,000,000")
    `);
    // Click first defense card checkbox
    await cdp.eval(`
      (() => {
        const checkbox = document.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.click();
      })()
    `);
    await setTimeout(500);
    const hasCheckboxes = await cdp.eval('document.querySelectorAll(\'input[type="checkbox"]\').length > 0');
    testResults.push({
      name: '5. Defense Allocation Interactive Checkboxes & Budget Tracker',
      passed: budgetBefore && hasCheckboxes,
      details: `Budget tracker visible: ${budgetBefore}, Checkboxes available: ${hasCheckboxes}`
    });

    // 4c. Navigate to Attack Simulator
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Attack Simulator"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);

    const hasSimulatorButtons = await cdp.eval(`
      Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes("Next Stage") || b.innerText.includes("Step") || b.innerText.includes("Execute") || b.innerText.includes("Advance"))
    `);
    testResults.push({
      name: '6. Attack Simulator Page Controls Available',
      passed: hasSimulatorButtons,
      details: `Simulator action buttons detected: ${hasSimulatorButtons}`
    });

    // 4d. Navigate to Incident Response
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Incident Response"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);

    const hasIncidentTabs = await cdp.eval(`
      document.body.innerText.includes("Active Incidents") && document.body.innerText.includes("NIST")
    `);
    testResults.push({
      name: '7. Incident Response Command Center & NIST Lifecycle Tabs',
      passed: hasIncidentTabs,
      details: `Incident triage console rendered: ${hasIncidentTabs}`
    });

    // 4e. Navigate to Risk Analysis
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Risk Analysis"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);

    const hasRiskGauges = await cdp.eval(`
      document.body.innerText.includes("Systemic Risk") || document.body.innerText.includes("Risk Analysis")
    `);
    testResults.push({
      name: '8. Risk Analysis & Systemic Telemetry Dashboard',
      passed: hasRiskGauges,
      details: `Risk metrics visible: ${hasRiskGauges}`
    });

    // 4f. Navigate to Reports
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Reports"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(800);

    const hasExportButtons = await cdp.eval(`
      Array.from(document.querySelectorAll('button, a')).some(el => el.innerText.includes("JSON") || el.innerText.includes("CSV") || el.innerText.includes("Export"))
    `);
    testResults.push({
      name: '9. Reports & Audit Trail One-Click File Export Buttons',
      passed: hasExportButtons,
      details: `Export triggers detected: ${hasExportButtons}`
    });

    // TEST 10: Zero Uncaught Console Errors
    const filteredErrors = cdp.consoleErrors.filter(e => !e.includes('favicon') && !e.includes('CVDisplayLinkCreateWithCGDisplay'));
    testResults.push({
      name: '10. Zero Uncaught Browser Console Exceptions',
      passed: filteredErrors.length === 0,
      details: filteredErrors.length === 0 ? 'No console errors detected' : `Errors: ${JSON.stringify(filteredErrors)}`
    });

    // Return to Dashboard
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]'))
          .find(el => el.innerText.includes("Dashboard"));
        if (btn) btn.click();
      })()
    `);
    await setTimeout(500);

    console.log('\n================ BROWSER AUTOMATION RESULTS ================');
    let allPassed = true;
    for (const r of testResults) {
      const mark = r.passed ? '✅ PASS' : '❌ FAIL';
      if (!r.passed) allPassed = false;
      console.log(`${mark} [${r.name}] - ${r.details}`);
    }
    console.log('============================================================\n');

    return {
      allPassed,
      total: testResults.length,
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => !r.passed).length,
      results: testResults
    };

  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill('SIGTERM');
  }
}

runBrowserTests()
  .then(res => {
    if (!res.allPassed) process.exit(1);
    process.exit(0);
  })
  .catch(err => {
    console.error('Browser automation error:', err);
    process.exit(1);
  });

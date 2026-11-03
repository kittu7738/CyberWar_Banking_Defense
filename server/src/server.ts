import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  CYBERWAR BANKING DEFENSE - SIMULATION ENGINE 🛡️`);
  console.log(`   Running on port ${config.port} (Environment: ${config.nodeEnv})`);
  console.log(`   Health Check: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);
});

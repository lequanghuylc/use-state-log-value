import { createStateLogger } from '../../src/backend/createStateLogger';

const logger = createStateLogger({ phase: 'boot', retries: 0 }, (payload) => {
  console.log(`[backend-example] ${payload.key}: ${payload.prev} -> ${payload.next} @ ${payload.timestamp}`);
});

logger.update('phase', 'running');
logger.update('retries', 1);
logger.update('retries', 2);

console.log('Final state:', logger.getState());

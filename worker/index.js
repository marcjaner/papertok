import { runEmailNotificationSchedule } from './email-notifications.js';
import { handleRequest } from './router.js';

export { KimiBudgetLedger } from './kimi-budget-ledger.js';
export { EmailDeliveryLedger } from './email-delivery-ledger.js';
export { RequestQuotaLedger } from './request-quota-ledger.js';

export default {
  fetch: handleRequest,
  async scheduled(controller, env, context) {
    context.waitUntil(runEmailNotificationSchedule(env, controller.scheduledTime));
  },
};

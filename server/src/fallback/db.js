// Persistence fallback (no DynamoDB, no Kafka/SQS). Uses in-memory maps.
// In real usage, you'd persist to DynamoDB.

export const state = {
  users: new Map(),
  sessions: new Map(),
  accounts: new Map(),
  loans: new Map(),
  investments: new Map(),
  audit: [],
  notifications: []
};

export function resetDemoData() {
  state.users.clear();
  state.sessions.clear();
  state.accounts.clear();
  state.loans.clear();
  state.investments.clear();
  state.audit.length = 0;
  state.notifications.length = 0;
}


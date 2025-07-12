/**
 * Configuration for LaGuard Trust Wrapper
 */
class LaGuardConfig {
  constructor({
    passportEndpoint,
    agentId,
    missionScope,
    complianceMode = 'learning',
    apiKey = null,
    timeout = 5000
  }) {
    this.passportEndpoint = passportEndpoint;
    this.agentId = agentId;
    this.missionScope = missionScope;
    this.complianceMode = complianceMode; // 'learning', 'enforcing', 'audit-only'
    this.apiKey = apiKey;
    this.timeout = timeout;
  }
}

/**
 * Action log structure for LaGuard API
 */
class LaGuardAction {
  constructor({
    agentId,
    action,
    details,
    context = {},
    intent = null
  }) {
    this.agentId = agentId;
    this.action = action;
    this.details = details;
    this.context = context;
    this.intent = intent;
  }
}

module.exports = {
  LaGuardConfig,
  LaGuardAction
};

// CasFlou Environment Configuration
// Switch between dev and production easily

const ENV = {
  // CHANGE THIS TO SWITCH ENVIRONMENTS
  // Options: 'development' or 'production'
  ACTIVE: 'production',

  development: {
    name: 'Development',
    workerUrl: 'http://localhost:8790',
    description: 'Local development (localhost:8790)'
  },

  production: {
    name: 'Production',
    workerUrl: 'https://casflou-app-api-production.manolo-vara.workers.dev',
    description: 'Production Worker'
  }
};

// Get active environment
function getConfig() {
  const active = ENV.ACTIVE;
  return {
    ...ENV[active],
    env: active,
    apiUrl: (path) => `${ENV[active].workerUrl}${path}`
  };
}

// Helper functions
function apiUrl(path) {
  return getConfig().apiUrl(path);
}

function getEnvironmentName() {
  return ENV[ENV.ACTIVE].name;
}

// Display current environment in console
console.log(`🌍 CasFlou using: ${getEnvironmentName()} (${ENV[ENV.ACTIVE].description})`);

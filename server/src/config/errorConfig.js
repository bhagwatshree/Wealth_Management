const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const configPath = path.resolve(__dirname, 'errors.yml');
let errorConfig = null;

function loadErrorConfig() {
  const raw = fs.readFileSync(configPath, 'utf8');
  errorConfig = yaml.load(raw);
  return errorConfig;
}

function getErrorConfig() {
  if (!errorConfig) loadErrorConfig();
  return errorConfig;
}

// Watch for changes in dev mode so edits to errors.yml take effect without restart
if (process.env.NODE_ENV !== 'production') {
  fs.watchFile(configPath, { interval: 2000 }, () => {
    try {
      loadErrorConfig();
      console.log('Reloaded errors.yml');
    } catch (e) {
      console.error('Failed to reload errors.yml:', e.message);
    }
  });
}

module.exports = { getErrorConfig };

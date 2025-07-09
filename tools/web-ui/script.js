// Web UI JavaScript for Auto Build System
class AutoBuildUI {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
    this.logs = {
      build: [],
      test: [],
      deploy: [],
      system: []
    };
    this.currentLogType = 'build';

    this.init();
  }

  init() {
    this.connectWebSocket();
    this.setupEventListeners();
    this.fetchInitialData();
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket('ws://localhost:9001');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);
        this.showNotification('Connected to build system', 'success');
      };

      this.ws.onmessage = event => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateConnectionStatus(false);
        this.attemptReconnect();
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.updateConnectionStatus(false);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connectWebSocket();
      }, this.reconnectInterval);
    } else {
      this.showNotification('Failed to connect to build system', 'error');
    }
  }

  handleWebSocketMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'state':
        this.updateState(data);
        break;
      case 'build-started':
        this.handleBuildStarted(data);
        break;
      case 'build-completed':
        this.handleBuildCompleted(data);
        break;
      case 'build-failed':
        this.handleBuildFailed(data);
        break;
      case 'tests-started':
        this.handleTestsStarted(data);
        break;
      case 'tests-completed':
        this.handleTestsCompleted(data);
        break;
      case 'tests-failed':
        this.handleTestsFailed(data);
        break;
      case 'deployment-completed':
        this.handleDeploymentCompleted(data);
        break;
      case 'deployment-failed':
        this.handleDeploymentFailed(data);
        break;
      case 'health-update':
        this.updateHealthStatus(data);
        break;
      case 'file-change':
        this.handleFileChange(data);
        break;
      case 'incremental-build-completed':
        this.handleIncrementalBuild(data);
        break;
      case 'components-built':
        this.updateServicesStatus(data);
        break;
      case 'cypress-completed':
        this.updateCypressResults(data);
        break;
      case 'auto-fix-completed':
        this.handleAutoFixCompleted(data);
        break;
      case 'auto-fix-failed':
        this.handleAutoFixFailed(data);
        break;
    }
  }

  updateState(state) {
    // Update header stats
    document.getElementById('build-count').textContent = state.buildCount || 0;
    document.getElementById('test-count').textContent = state.testCount || 0;
    document.getElementById('deploy-count').textContent =
      state.deployCount || 0;

    // Update status cards
    this.updateBuildStatus(state.building ? 'building' : 'ready');
    this.updateTestStatus(state.testing ? 'testing' : 'ready');

    // Update services
    this.updateServicesStatus({ services: state.services || {} });

    // Update test results
    if (state.testResults) {
      this.updateTestResults(state.testResults);
    }
  }

  updateBuildStatus(status) {
    const card = document.getElementById('build-status');
    const statusText = card.querySelector('.status-text');
    const statusTime = card.querySelector('.status-time');

    switch (status) {
      case 'building':
        statusText.textContent = 'Building...';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card building';
        break;
      case 'success':
        statusText.textContent = 'Build Success';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card success';
        break;
      case 'failed':
        statusText.textContent = 'Build Failed';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card error';
        break;
      default:
        statusText.textContent = 'Ready';
        card.className = 'status-card';
    }
  }

  updateTestStatus(status) {
    const card = document.getElementById('test-status');
    const statusText = card.querySelector('.status-text');
    const statusTime = card.querySelector('.status-time');

    switch (status) {
      case 'testing':
        statusText.textContent = 'Testing...';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card testing';
        break;
      case 'success':
        statusText.textContent = 'Tests Passed';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card success';
        break;
      case 'failed':
        statusText.textContent = 'Tests Failed';
        statusTime.textContent = new Date().toLocaleTimeString();
        card.className = 'status-card error';
        break;
      default:
        statusText.textContent = 'Ready';
        card.className = 'status-card';
    }
  }

  updateServicesStatus(data) {
    const servicesGrid = document.getElementById('services-grid');
    servicesGrid.innerHTML = '';

    Object.entries(data.services || {}).forEach(([name, service]) => {
      const serviceCard = document.createElement('div');
      serviceCard.className = `service-card ${service.status}`;
      serviceCard.innerHTML = `
        <div class="service-icon">
          <i class="fas fa-${this.getServiceIcon(name)}"></i>
        </div>
        <div class="service-content">
          <h4>${name}</h4>
          <p class="service-status">${service.status}</p>
          <p class="service-time">${new Date(service.timestamp).toLocaleTimeString()}</p>
        </div>
      `;
      servicesGrid.appendChild(serviceCard);
    });
  }

  getServiceIcon(serviceName) {
    const icons = {
      'OSINT Framework': 'search',
      'Facebook Mass Messenger': 'facebook',
      'Messenger Bot Framework': 'robot',
      'Python Tools': 'python',
      'PHP Tools': 'php'
    };
    return icons[serviceName] || 'server';
  }

  updateHealthStatus(data) {
    const healthCount = Object.keys(data.healthChecks || {}).length;
    const healthyCount = Object.values(data.healthChecks || {}).filter(
      h => h.status === 'healthy'
    ).length;

    const card = document.getElementById('health-status');
    const statusText = card.querySelector('.status-text');
    const statusTime = card.querySelector('.status-time');

    statusText.textContent = `${healthyCount}/${healthCount} Healthy`;
    statusTime.textContent = new Date().toLocaleTimeString();

    if (healthyCount === healthCount) {
      card.className = 'status-card success';
    } else {
      card.className = 'status-card warning';
    }
  }

  updateTestResults(results) {
    // Update Cypress results
    if (results.cypress) {
      const { stats } = results.cypress;
      document.getElementById('cypress-total').textContent = stats?.tests || 0;
      document.getElementById('cypress-passed').textContent =
        stats?.passes || 0;
      document.getElementById('cypress-failed').textContent =
        stats?.failures || 0;

      const passRate = stats?.tests
        ? ((stats.passes / stats.tests) * 100).toFixed(1)
        : 0;
      document.getElementById('cypress-progress').style.width = `${passRate}%`;
    }

    // Update unit test results
    const unitResults = Object.values(results).filter(r => r.status);
    const unitPassed = unitResults.filter(r => r.status === 'passed').length;
    const unitFailed = unitResults.filter(r => r.status === 'failed').length;

    document.getElementById('unit-services').textContent = unitResults.length;
    document.getElementById('unit-passed').textContent = unitPassed;
    document.getElementById('unit-failed').textContent = unitFailed;

    const unitPassRate = unitResults.length
      ? ((unitPassed / unitResults.length) * 100).toFixed(1)
      : 0;
    document.getElementById('unit-progress').style.width = `${unitPassRate}%`;

    // Update coverage
    if (results.coverage) {
      const { total } = results.coverage;
      document.getElementById('coverage-lines').textContent =
        `${total?.lines?.pct || 0}%`;
      document.getElementById('coverage-functions').textContent =
        `${total?.functions?.pct || 0}%`;
      document.getElementById('coverage-branches').textContent =
        `${total?.branches?.pct || 0}%`;
      document.getElementById('coverage-progress').style.width =
        `${total?.lines?.pct || 0}%`;
    }
  }

  updateCypressResults(data) {
    this.updateTestResults({ cypress: data.result });
  }

  handleBuildStarted(data) {
    this.updateBuildStatus('building');
    this.addLog('build', 'Build started', 'info');
    this.showNotification('Build started', 'info');
  }

  handleBuildCompleted(data) {
    this.updateBuildStatus('success');
    this.addLog('build', 'Build completed successfully', 'success');
    this.showNotification('Build completed successfully', 'success');
  }

  handleBuildFailed(data) {
    this.updateBuildStatus('failed');
    this.addLog('build', `Build failed: ${data.error}`, 'error');
    this.showNotification(`Build failed: ${data.error}`, 'error');
  }

  handleTestsStarted(data) {
    this.updateTestStatus('testing');
    this.addLog('test', 'Tests started', 'info');
    this.showNotification('Tests started', 'info');
  }

  handleTestsCompleted(data) {
    this.updateTestStatus('success');
    this.addLog('test', 'All tests completed successfully', 'success');
    this.showNotification('All tests passed', 'success');
    this.updateTestResults(data.results);
  }

  handleTestsFailed(data) {
    this.updateTestStatus('failed');
    this.addLog('test', `Tests failed: ${data.error}`, 'error');
    this.showNotification(`Tests failed: ${data.error}`, 'error');
  }

  handleDeploymentCompleted(data) {
    this.addLog('deploy', 'Deployment completed successfully', 'success');
    this.showNotification('Deployment completed', 'success');
  }

  handleDeploymentFailed(data) {
    this.addLog('deploy', `Deployment failed: ${data.error}`, 'error');
    this.showNotification(`Deployment failed: ${data.error}`, 'error');
  }

  handleFileChange(data) {
    this.addLog('system', `File changed: ${data.path}`, 'info');
  }

  handleIncrementalBuild(data) {
    this.addLog(
      'build',
      `Incremental build completed for ${data.changedFiles.length} files`,
      'info'
    );
    this.showNotification('Incremental build completed', 'info');
  }

  handleAutoFixCompleted(data) {
    this.addLog('system', 'Auto-fix completed', 'success');
    this.showNotification('Auto-fix completed', 'success');
  }

  handleAutoFixFailed(data) {
    this.addLog('system', `Auto-fix failed: ${data.error}`, 'error');
    this.showNotification(`Auto-fix failed: ${data.error}`, 'error');
  }

  addLog(type, message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, level };

    this.logs[type].push(logEntry);

    // Keep only last 100 entries
    if (this.logs[type].length > 100) {
      this.logs[type] = this.logs[type].slice(-100);
    }

    // Update UI if current log type
    if (this.currentLogType === type) {
      this.updateLogDisplay();
    }
  }

  updateLogDisplay() {
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    this.logs[this.currentLogType].forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry ${log.level}`;
      logEntry.innerHTML = `
        <span class="log-time">${log.timestamp}</span>
        <span class="log-message">${log.message}</span>
      `;
      logContent.appendChild(logEntry);
    });

    // Scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
  }

  showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;

    notifications.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  updateConnectionStatus(connected) {
    const status = document.getElementById('connection-status');
    if (connected) {
      status.innerHTML = '<i class="fas fa-wifi"></i> Connected';
      status.className = 'connection-status connected';
    } else {
      status.innerHTML = '<i class="fas fa-wifi"></i> Disconnected';
      status.className = 'connection-status disconnected';
    }
  }

  setupEventListeners() {
    // Log tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const type = e.target.textContent.toLowerCase();
        this.showLogs(type);
      });
    });
  }

  async fetchInitialData() {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      this.updateState(data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }

  sendWebSocketMessage(type, data = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      this.showNotification('WebSocket not connected', 'error');
    }
  }
}

// Global functions for button clicks
function triggerBuild() {
  ui.sendWebSocketMessage('build');
  ui.showNotification('Build triggered', 'info');
}

function triggerTest() {
  ui.sendWebSocketMessage('test');
  ui.showNotification('Test triggered', 'info');
}

function triggerDeploy() {
  ui.sendWebSocketMessage('deploy');
  ui.showNotification('Deploy triggered', 'info');
}

function triggerFix() {
  ui.sendWebSocketMessage('fix');
  ui.showNotification('Auto-fix triggered', 'info');
}

function triggerAutoInstall() {
  ui.sendWebSocketMessage('auto-install');
  ui.showNotification('Auto-install triggered', 'info');
}

function triggerAutoConfig() {
  ui.sendWebSocketMessage('auto-configure');
  ui.showNotification('Auto-configure triggered', 'info');
}

function triggerAutoPush() {
  ui.sendWebSocketMessage('auto-push');
  ui.showNotification('Auto-push triggered', 'info');
}

function triggerCypress() {
  ui.sendWebSocketMessage('cypress');
  ui.showNotification('Cypress tests triggered', 'info');
}

function triggerFullCycle() {
  ui.sendWebSocketMessage('full-cycle');
  ui.showNotification('Full build cycle triggered', 'info');
}

function showLogs(type) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  event.target.classList.add('active');

  // Update current log type and display
  ui.currentLogType = type;
  ui.updateLogDisplay();
}

// Initialize the UI when page loads
let ui;
document.addEventListener('DOMContentLoaded', () => {
  ui = new AutoBuildUI();
});

// Add CSS for additional states
const additionalStyles = `
.status-card.building {
  border-left: 4px solid #ffc107;
}

.status-card.success {
  border-left: 4px solid #28a745;
}

.status-card.error {
  border-left: 4px solid #dc3545;
}

.status-card.warning {
  border-left: 4px solid #ffc107;
}

.service-card {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.service-card.built {
  border-left: 4px solid #28a745;
}

.service-card.failed {
  border-left: 4px solid #dc3545;
}

.service-icon {
  font-size: 24px;
  color: #4CAF50;
}

.service-content h4 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #333;
}

.service-status {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-transform: capitalize;
}

.service-time {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.log-entry.error {
  color: #dc3545;
}

.log-entry.success {
  color: #28a745;
}

.log-entry.info {
  color: #333;
}

.connection-status.connected {
  color: #28a745;
}

.connection-status.disconnected {
  color: #dc3545;
}

.notification.info {
  border-color: #17a2b8;
}

.btn.btn-purple {
  background-color: #6f42c1;
  border-color: #6f42c1;
  color: white;
}

.btn.btn-purple:hover {
  background-color: #5a2d91;
  border-color: #5a2d91;
}

.btn.btn-full-cycle {
  background-color: #fd7e14;
  border-color: #fd7e14;
  color: white;
}

.btn.btn-full-cycle:hover {
  background-color: #e8630d;
  border-color: #e8630d;
}

.advanced-controls {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-buttons .btn {
  flex: 1;
  min-width: 120px;
  max-width: 180px;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .control-buttons {
    flex-direction: column;
    align-items: center;
  }

  .header-stats {
    flex-direction: column;
    gap: 10px;
  }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

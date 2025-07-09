const fs = require('fs');
const path = require('path');

/**
 * Generate HTML report from build report data
 * @param {Object} report - Report data object
 * @param {string} outputPath - Path to save HTML report
 */
async function generateHTMLReport(report, outputPath) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Profil3r Build Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .warning { background-color: #fff3cd; color: #856404; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 Profil3r Build Report</h1>
    <p><strong>Generated:</strong> ${report.timestamp}</p>

    <div class="status success">
        <h2>✅ Build Statistics</h2>
        <ul>
            <li>Build Count: ${report.buildCount}</li>
            <li>Test Count: ${report.testCount}</li>
            <li>Deploy Count: ${report.deployCount}</li>
        </ul>
    </div>

    <h2>🏗️ Service Status</h2>
    <table>
        <tr><th>Service</th><th>Status</th><th>Timestamp</th></tr>
        ${Object.entries(report.services)
          .map(
            ([name, status]) => `
            <tr>
                <td>${name}</td>
                <td class="${status.status === 'built' ? 'success' : 'error'}">${status.status}</td>
                <td>${status.timestamp}</td>
            </tr>
        `
          )
          .join('')}
    </table>

    <h2>🔍 Health Checks</h2>
    <table>
        <tr><th>Service</th><th>Status</th><th>Timestamp</th></tr>
        ${Object.entries(report.healthChecks)
          .map(
            ([name, health]) => `
            <tr>
                <td>${name}</td>
                <td class="${health.status === 'healthy' ? 'success' : 'error'}">${health.status}</td>
                <td>${health.timestamp}</td>
            </tr>
        `
          )
          .join('')}
    </table>

    ${
      report.errors.length > 0
        ? `
    <h2>❌ Errors</h2>
    <ul>
        ${report.errors
          .map(
            (error) => `
            <li class="error">
                <strong>${error.type}:</strong> ${error.message}
                <em>(${error.timestamp})</em>
            </li>
        `
          )
          .join('')}
    </ul>
    `
        : ''
    }

</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
}

module.exports = {
  generateHTMLReport,
};

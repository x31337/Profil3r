document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const submissionStatusDiv = document.getElementById('submission-status');
    const reportHistoryContainer = document.getElementById('report-history-container');

    // Fetch and display initial report history
    fetchReportHistory();

    if (reportForm) {
        reportForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            submissionStatusDiv.innerHTML = '<p class="status-pending"><i class="fas fa-spinner fa-spin"></i> Submitting report, please wait...</p>';
            submissionStatusDiv.style.display = 'block';

            const formData = new FormData(reportForm);

            try {
                const response = await fetch('/api/report', {
                    method: 'POST',
                    body: formData, // FormData handles multipart/form-data for file uploads
                });

                const result = await response.json();

                if (response.ok) {
                    let resultsHtml = '<h4>Submission Results:</h4><ul>';
                    let overallSuccess = false;
                    result.results.forEach(res => {
                        resultsHtml += `<li>Account ${res.email}: ${res.success ? '<span class="status-success">Succeeded</span>' : '<span class="status-error">Failed</span>'}${res.error ? ` - ${res.error}` : ''}</li>`;
                        if (res.success) {
                            overallSuccess = true;
                        }
                    });
                    resultsHtml += '</ul>';
                    if (overallSuccess) {
                         submissionStatusDiv.innerHTML = `<p class="status-success"><i class="fas fa-check-circle"></i> Report submitted. Some or all attempts were successful.</p>${resultsHtml}`;
                    } else {
                        submissionStatusDiv.innerHTML = `<p class="status-error"><i class="fas fa-times-circle"></i> Report submission failed for all accounts.</p>${resultsHtml}`;
                    }
                    reportForm.reset(); // Clear the form
                    fetchReportHistory(); // Refresh history
                } else {
                    submissionStatusDiv.innerHTML = `<p class="status-error"><i class="fas fa-times-circle"></i> Error submitting report: ${result.error || response.statusText}</p>`;
                }
            } catch (error) {
                console.error('Submission error:', error);
                submissionStatusDiv.innerHTML = `<p class="status-error"><i class="fas fa-exclamation-triangle"></i> An unexpected error occurred: ${error.message}</p>`;
            }
        });
    }

    async function fetchReportHistory() {
        try {
            reportHistoryContainer.innerHTML = '<p class="status-pending">Loading report history...</p>';
            const response = await fetch('/api/reports');
            if (!response.ok) {
                reportHistoryContainer.innerHTML = `<p class="status-error">Error loading report history: ${response.statusText}</p>`;
                return;
            }
            const reports = await response.json();

            if (reports.length === 0) {
                reportHistoryContainer.innerHTML = '<p>No reports submitted yet.</p>';
                return;
            }

            let historyHtml = '<table><thead><tr><th>ID</th><th>Target URL</th><th>Status</th><th>Justification</th><th>Evidence</th><th>Created At</th></tr></thead><tbody>';
            reports.forEach(report => {
                const evidenceLinks = report.evidence.map(filename =>
                    `<a href="/api/evidence/${encodeURIComponent(filename)}" target="_blank">${filename}</a>`
                ).join('<br>');

                historyHtml += `
                    <tr>
                        <td>${report.id}</td>
                        <td><a href="${report.target_url}" target="_blank" title="${report.target_url}">${report.target_url.substring(0,50)}...</a></td>
                        <td class="status-${report.status.toLowerCase()}">${report.status}</td>
                        <td title="${report.justification}">${report.justification.substring(0, 50)}...</td>
                        <td>${evidenceLinks || 'None'}</td>
                        <td>${new Date(report.created_at).toLocaleString()}</td>
                    </tr>
                `;
            });
            historyHtml += '</tbody></table>';
            reportHistoryContainer.innerHTML = historyHtml;

        } catch (error) {
            console.error('Error fetching report history:', error);
            reportHistoryContainer.innerHTML = `<p class="status-error">An unexpected error occurred while fetching history: ${error.message}</p>`;
        }
    }
});

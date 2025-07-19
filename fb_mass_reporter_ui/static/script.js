document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const cookieDataInput = document.getElementById('cookie-data');
  const accountAliasInput = document.getElementById('account-alias');
  const addAccountBtn = document.getElementById('add-account-btn');
  const clearAccountsBtn = document.getElementById('clear-accounts-btn');
  const accountListUl = document.querySelector('#account-list ul');
  const accountErrorDisplay = document.getElementById('account-error-display');

  const targetUrlsInput = document.getElementById('target-urls');
  const justificationTextInput = document.getElementById('justification-text');
  const evidenceFilesInput = document.getElementById('evidence-files');
  const evidenceFileNamesDiv = document.getElementById('evidence-file-names');
  const reportingErrorDisplay = document.getElementById(
    'reporting-error-display'
  );

  const startReportingBtn = document.getElementById('start-reporting-btn');
  const stopReportingBtn = document.getElementById('stop-reporting-btn');

  const logOutputDiv = document.getElementById('log-output');
  const summaryTotalSpan = document.getElementById('summary-total');
  const summaryProcessedSpan = document.getElementById('summary-processed');
  const summarySuccessfulSpan = document.getElementById('summary-successful');
  const summaryFailedSpan = document.getElementById('summary-failed');
  const summaryDetailsUl = document.getElementById('summary-details-list');

  let accounts = []; // Array to store account { alias, cookieData, c_user_short }
  let statusInterval = null;

  // --- Account Management ---
  addAccountBtn.addEventListener('click', () => {
    accountErrorDisplay.textContent = ''; // Clear previous errors
    try {
      const cookieJson = cookieDataInput.value.trim();
      if (!cookieJson) {
        accountErrorDisplay.textContent = 'Cookie JSON cannot be empty.';
        return;
      }
      const cookies = JSON.parse(cookieJson);
      if (
        !Array.isArray(cookies) ||
        !cookies.every(c => typeof c === 'object' && c.name && c.value)
      ) {
        accountErrorDisplay.textContent =
          'Invalid cookie JSON format. Expected an array of objects with name and value properties.';
        return;
      }

      const c_user_cookie = cookies.find(c => c.name === 'c_user');
      const c_user_short = c_user_cookie
        ? String(c_user_cookie.value).substring(0, 6)
        : 'N/A';
      const alias =
        accountAliasInput.value.trim() ||
        `Account (c_user: ${c_user_short}...)`;

      accounts.push({ alias, cookieData: cookies, c_user_short });
      renderAccountList();
      cookieDataInput.value = '';
      accountAliasInput.value = '';
      updateStartButtonState();
    } catch (e) {
      accountErrorDisplay.textContent =
        'Error parsing cookie JSON: ' + e.message;
    }
  });

  clearAccountsBtn.addEventListener('click', () => {
    accountErrorDisplay.textContent = ''; // Clear error on this action
    if (confirm('Are you sure you want to clear all added accounts?')) {
      accounts = [];
      renderAccountList();
      updateStartButtonState();
    }
  });

  function renderAccountList() {
    accountListUl.innerHTML = ''; // Clear existing list
    accounts.forEach((acc, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <input type="checkbox" id="account-checkbox-${index}" data-index="${index}" checked>
                <label for="account-checkbox-${index}">${acc.alias} (c_user: ${acc.c_user_short}...)</label>
                <button class="remove-account-btn" data-index="${index}">Remove</button>
            `;
      accountListUl.appendChild(li);
    });

    // Add event listeners for new remove buttons
    document.querySelectorAll('.remove-account-btn').forEach(button => {
      button.addEventListener('click', event => {
        const indexToRemove = parseInt(event.target.dataset.index);
        accounts.splice(indexToRemove, 1);
        renderAccountList(); // Re-render the list
        updateStartButtonState();
      });
    });
    updateStartButtonState();
  }

  // --- File Input Display ---
  evidenceFilesInput.addEventListener('change', () => {
    if (evidenceFilesInput.files.length > 0) {
      let fileNames = Array.from(evidenceFilesInput.files)
        .map(f => f.name)
        .join(', ');
      evidenceFileNamesDiv.textContent = `Selected: ${fileNames}`;
    } else {
      evidenceFileNamesDiv.textContent = '';
    }
  });

  // --- Reporting Controls State ---
  function updateStartButtonState() {
    const anyAccountSelected = accounts.some((_, index) => {
      const checkbox = document.getElementById(`account-checkbox-${index}`);
      return checkbox && checkbox.checked;
    });
    const targetsProvided = targetUrlsInput.value.trim() !== '';
    const justificationProvided = justificationTextInput.value.trim() !== ''; // Or make optional

    startReportingBtn.disabled = !(
      anyAccountSelected &&
      targetsProvided &&
      justificationProvided
    );
  }
  // Initial call and on input changes
  [targetUrlsInput, justificationTextInput, accountListUl].forEach(el => {
    if (el === accountListUl) {
      // For account list, need to listen to changes on checkboxes
      el.addEventListener('change', event => {
        if (event.target.type === 'checkbox') updateStartButtonState();
      });
    } else {
      el.addEventListener('input', updateStartButtonState);
    }
  });

  // --- API Interaction ---
  startReportingBtn.addEventListener('click', async() => {
    const selectedAccountsData = accounts
      .filter((_, index) => {
        const checkbox = document.getElementById(`account-checkbox-${index}`);
        return checkbox && checkbox.checked;
      })
      .map(acc => ({ alias: acc.alias, cookieData: acc.cookieData }));

    reportingErrorDisplay.textContent = ''; // Clear previous reporting errors

    if (selectedAccountsData.length === 0) {
      reportingErrorDisplay.textContent =
        'Please select at least one account to use for reporting.';
      return;
    }
    if (targetUrlsInput.value.trim() === '') {
      reportingErrorDisplay.textContent = 'Please provide target URLs.';
      return;
    }
    if (justificationTextInput.value.trim() === '') {
      reportingErrorDisplay.textContent = 'Please provide justification text.';
      return;
    }

    const formData = new FormData();
    selectedAccountsData.forEach(acc => {
      formData.append('accountsData', JSON.stringify(acc)); // Send each account as a JSON string
    });
    formData.append('targetUrls', targetUrlsInput.value.trim());
    formData.append('justificationText', justificationTextInput.value.trim());

    for (let i = 0; i < evidenceFilesInput.files.length; i++) {
      formData.append('evidenceFiles', evidenceFilesInput.files[i]);
    }

    // UI updates for starting
    setReportingState(true);
    logOutputDiv.innerHTML = 'Starting reporting process...\n';
    summaryDetailsUl.innerHTML = ''; // Clear previous summary details

    try {
      const response = await fetch('/api/start-reporting', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        addLogMessage(
          'Backend process started successfully. Polling for status...'
        );
        startStatusPolling();
      } else {
        reportingErrorDisplay.textContent = `Error starting backend process: ${result.message}`;
        addLogMessage(
          `Error starting backend process: ${result.message}`,
          'ERROR'
        );
        setReportingState(false);
      }
    } catch (error) {
      reportingErrorDisplay.textContent = `Network or server error: ${error.message}`;
      addLogMessage(`Network or server error: ${error.message}`, 'ERROR');
      setReportingState(false);
    }
  });

  stopReportingBtn.addEventListener('click', async() => {
    if (
      !confirm('Are you sure you want to stop the current reporting process?')
    )
      return;
    reportingErrorDisplay.textContent = ''; // Clear error on this action

    addLogMessage('Attempting to stop reporting process...');
    try {
      const response = await fetch('/api/stop-reporting', { method: 'POST' });
      const result = await response.json();
      addLogMessage(result.message);
      if (!result.success) {
        reportingErrorDisplay.textContent = result.message;
      }
      // Polling will eventually reflect the stopped state from backend
      // No need to call setReportingState(false) here, let status poll handle it.
    } catch (error) {
      reportingErrorDisplay.textContent = `Error stopping process: ${error.message}`;
      addLogMessage(`Error stopping process: ${error.message}`, 'ERROR');
    }
  });

  function startStatusPolling() {
    if (statusInterval) clearInterval(statusInterval); // Clear existing interval if any
    statusInterval = setInterval(async() => {
      try {
        const response = await fetch('/api/status');
        const status = await response.json();

        // Update logs
        logOutputDiv.innerHTML = ''; // Clear and re-render logs
        status.logs.forEach(logMsg => {
          const logP = document.createElement('p');
          logP.textContent = logMsg;
          logOutputDiv.appendChild(logP);
        });
        logOutputDiv.scrollTop = logOutputDiv.scrollHeight; // Scroll to bottom

        // Update summary
        summaryTotalSpan.textContent = status.summary.total_targets || 0;
        summaryProcessedSpan.textContent =
          status.summary.processed_targets || 0;
        summarySuccessfulSpan.textContent =
          status.summary.successful_reports || 0;
        summaryFailedSpan.textContent = status.summary.failed_reports || 0;

        summaryDetailsUl.innerHTML = ''; // Clear and re-render details
        if (status.summary.details) {
          status.summary.details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = `[${detail.account_alias}] Target: ${detail.target_url.substring(0, 50)}... - ${detail.status}: ${detail.message}`;
            summaryDetailsUl.appendChild(li);
          });
        }

        if (!status.active) {
          addLogMessage('Reporting process finished or stopped.');
          setReportingState(false);
          clearInterval(statusInterval);
          statusInterval = null;
        }
      } catch (error) {
        addLogMessage(`Error fetching status: ${error.message}`, 'ERROR');
        // Optionally stop polling on repeated errors
      }
    }, 2000); // Poll every 2 seconds
  }

  function setReportingState(isReporting) {
    startReportingBtn.disabled = isReporting;
    stopReportingBtn.style.display = isReporting ? 'inline-block' : 'none';

    // Disable form inputs during reporting
    [
      cookieDataInput,
      accountAliasInput,
      addAccountBtn,
      clearAccountsBtn,
      targetUrlsInput,
      justificationTextInput,
      evidenceFilesInput
    ].forEach(el => {
      el.disabled = isReporting;
    });
    // Disable account list checkboxes and remove buttons
    document
      .querySelectorAll(
        '#account-list input[type="checkbox"], #account-list .remove-account-btn'
      )
      .forEach(el => {
        el.disabled = isReporting;
      });
  }

  function addLogMessage(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const logP = document.createElement('p');
    logP.textContent = `[${timestamp}] [${type}] ${message}`;
    logOutputDiv.appendChild(logP);
    logOutputDiv.scrollTop = logOutputDiv.scrollHeight;
  }

  // Initial UI setup
  updateStartButtonState(); // Set initial state of start button
  renderAccountList(); // Render empty account list initially (or from localStorage if implemented)
});

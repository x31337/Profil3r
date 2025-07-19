/// <reference types="cypress" />

describe('Facebook Mass Reporter UI', () => {
  const baseUrl = 'http://localhost:5001'; // Assuming the Flask app runs here

  const validCookieJsonString = JSON.stringify([
    { name: 'c_user', value: '123456789', domain: '.facebook.com' },
    { name: 'xs', value: 'dummyxsvalue', domain: '.facebook.com' }
  ]);
  const accountAlias = 'Test Account 1';

  beforeEach(() => {
    // Visit the page before each test
    cy.visit(baseUrl);
    // Clear accounts for a clean state (optional, good practice)
    cy.get('#clear-accounts-btn').click();
    // Cypress automatically handles confirmation dialogs by clicking "OK"
  });

  it('should load the page with all UI elements', () => {
    cy.get('h1').should('contain', 'Facebook Mass Reporter');
    cy.get('#account-management-section').should('be.visible');
    cy.get('#reporting-details-section').should('be.visible');
    cy.get('#reporting-controls-section').should('be.visible');
    cy.get('#live-log-section').should('be.visible');
    cy.get('#summary-section').should('be.visible');
    cy.get('#start-reporting-btn').should('be.disabled');
  });

  describe('Account Management', () => {
    it('should allow adding a valid account', () => {
      cy.get('#cookie-data').type(validCookieJsonString, {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#account-alias').type(accountAlias);
      cy.get('#add-account-btn').click();
      cy.get('#account-list ul li').should('have.length', 1);
      cy.get('#account-list ul li').first().should('contain', accountAlias);
      cy.get('#account-list ul li')
        .first()
        .should('contain', 'c_user: 123456...');
    });

    it('should show an alert for invalid cookie JSON', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.get('#cookie-data').type('{"invalid": "json"}', {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#add-account-btn')
        .click()
        .then(() => {
          expect(alertStub).to.be.calledOnce;
          // Check if the alert message contains expected text (flexible check)
          expect(alertStub.getCall(0).args[0]).to.contain(
            'Invalid cookie JSON format'
          );
        });
      cy.get('#account-list ul li').should('have.length', 0);
    });

    it('should allow removing an account', () => {
      cy.get('#cookie-data').type(validCookieJsonString, {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#account-alias').type(accountAlias);
      cy.get('#add-account-btn').click();
      cy.get('#account-list ul li').should('have.length', 1);
      cy.get('#account-list ul li .remove-account-btn').first().click();
      cy.get('#account-list ul li').should('have.length', 0);
    });

    it('should allow clearing all accounts', () => {
      // Add two accounts
      cy.get('#cookie-data').type(validCookieJsonString, {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#account-alias').type('Account 1');
      cy.get('#add-account-btn').click();

      // Need to clear inputs for the next one if not cleared by app logic
      cy.get('#cookie-data')
        .clear()
        .type(validCookieJsonString.replace('123456789', '987654321'), {
          parseSpecialCharSequences: false,
          delay: 0
        });
      cy.get('#account-alias').clear().type('Account 2');
      cy.get('#add-account-btn').click();

      cy.get('#account-list ul li').should('have.length', 2);
      cy.get('#clear-accounts-btn').click();
      cy.get('#account-list ul li').should('have.length', 0);
    });
  });

  describe('Reporting Controls State', () => {
    it('should enable Start button when prerequisites are met', () => {
      cy.get('#start-reporting-btn').should('be.disabled');

      // Add account
      cy.get('#cookie-data').type(validCookieJsonString, {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#add-account-btn').click();
      cy.get('#start-reporting-btn').should('be.disabled'); // Targets and justification still missing

      // Add targets
      cy.get('#target-urls').type('http://facebook.com/someuser');
      cy.get('#start-reporting-btn').should('be.disabled'); // Justification still missing

      // Add justification
      cy.get('#justification-text').type('This is a test justification.');
      cy.get('#start-reporting-btn').should('not.be.disabled');

      // Uncheck the account
      cy.get('#account-list ul li input[type="checkbox"]').first().uncheck();
      cy.get('#start-reporting-btn').should('be.disabled');

      // Recheck the account
      cy.get('#account-list ul li input[type="checkbox"]').first().check();
      cy.get('#start-reporting-btn').should('not.be.disabled');
    });
  });

  describe('Reporting Process Flow (with mocked backend)', () => {
    beforeEach(() => {
      // Mock API responses
      cy.intercept('POST', '/api/start-reporting', {
        statusCode: 200,
        body: { success: true, message: 'Reporting process started.' }
      }).as('startReporting');

      cy.intercept('GET', '/api/status', req => {
        // Simulate backend status updates
        // This needs to be more dynamic for a real test, possibly using cy.fixture or state
        req.reply({
          active: true,
          logs: [
            `[${new Date().toLocaleTimeString()}] [INFO] Backend process started...`,
            `[${new Date().toLocaleTimeString()}] [INFO] Processing target 1...`
          ],
          summary: {
            total_targets: 1,
            processed_targets: 0,
            successful_reports: 0,
            failed_reports: 0,
            details: []
          }
        });
      }).as('getStatus');

      cy.intercept('POST', '/api/stop-reporting', {
        statusCode: 200,
        body: { success: true, message: 'Stop request sent.' }
      }).as('stopReporting');

      // Setup UI for reporting
      cy.get('#cookie-data').type(validCookieJsonString, {
        parseSpecialCharSequences: false,
        delay: 0
      });
      cy.get('#add-account-btn').click();
      cy.get('#target-urls').type(
        'http://facebook.com/someuser\nhttp://facebook.com/anotheruser'
      );
      cy.get('#justification-text').type('Test justification for Cypress.');
      // Optionally, test file uploads
      // cy.get('#evidence-files').selectFile('cypress/fixtures/example.json'); // Assuming an example file
    });

    it('should start reporting, show logs, and allow stopping', () => {
      cy.get('#start-reporting-btn').should('not.be.disabled').click();
      cy.wait('@startReporting');

      // Check UI state after starting
      cy.get('#start-reporting-btn').should('be.disabled');
      cy.get('#stop-reporting-btn').should('be.visible').and('not.be.disabled');
      cy.get('#log-output').should(
        'contain',
        'Backend process started successfully.'
      );

      // Wait for a couple of status polls (Cypress automatically waits for aliased routes)
      cy.wait('@getStatus'); // First poll
      cy.get('#log-output').should('contain', 'Processing target 1...');

      // Test summary update (basic check based on mocked initial status)
      cy.get('#summary-total').should('contain', '1');

      // Simulate a second status update where process is no longer active
      cy.intercept('GET', '/api/status', {
        active: false,
        logs: [
          `[${new Date().toLocaleTimeString()}] [INFO] Backend process started...`,
          `[${new Date().toLocaleTimeString()}] [INFO] Processing target 1...`,
          `[${new Date().toLocaleTimeString()}] [INFO] Reporting finished.`
        ],
        summary: {
          total_targets: 2,
          processed_targets: 2,
          successful_reports: 1,
          failed_reports: 1,
          details: [
            {
              account_alias: accountAlias,
              target_url: 'http://facebook.com/someuser',
              status: 'Success',
              message: 'Reported'
            },
            {
              account_alias: accountAlias,
              target_url: 'http://facebook.com/anotheruser',
              status: 'Failure',
              message: 'Failed'
            }
          ]
        }
      }).as('getStatusFinished');

      cy.wait('@getStatusFinished'); // Wait for the "finished" status
      cy.get('#log-output').should(
        'contain',
        'Reporting process finished or stopped.'
      ); // From JS
      cy.get('#summary-successful').should('contain', '1');
      cy.get('#summary-failed').should('contain', '1');
      cy.get('#summary-details-list li').should('have.length', 2);

      // Check UI state after finishing
      cy.get('#start-reporting-btn').should('not.be.disabled'); // Re-enabled by JS logic
      cy.get('#stop-reporting-btn').should('not.be.visible');
    });

    it('should allow stopping an in-progress report', () => {
      cy.get('#start-reporting-btn').click();
      cy.wait('@startReporting');
      cy.wait('@getStatus'); // Initial status

      cy.get('#stop-reporting-btn').click();
      cy.wait('@stopReporting');
      cy.get('#log-output').should('contain', 'Stop request sent.');

      // Simulate backend acknowledging stop and finishing
      cy.intercept('GET', '/api/status', {
        active: false, // Process is no longer active
        logs: [
          `[${new Date().toLocaleTimeString()}] [INFO] Stop request sent. Process will halt soon.`,
          `[${new Date().toLocaleTimeString()}] [INFO] Reporting stopped by user.`
        ],
        summary: {
          /* ... potentially incomplete summary ... */ total_targets: 2,
          processed_targets: 1,
          successful_reports: 0,
          failed_reports: 1,
          details: [
            {
              account_alias: accountAlias,
              target_url: 'http://facebook.com/someuser',
              status: 'Failure',
              message: 'Stopped by user'
            }
          ]
        }
      }).as('getStatusStopped');

      cy.wait('@getStatusStopped');
      cy.get('#log-output').should(
        'contain',
        'Reporting process finished or stopped.'
      );
      cy.get('#start-reporting-btn').should('not.be.disabled');
      cy.get('#stop-reporting-btn').should('not.be.visible');
    });
  });
});

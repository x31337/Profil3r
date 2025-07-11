/// <reference types="cypress" />

describe('Facebook Mass Reporter UI', () => {
    beforeEach(() => {
        // Base URL is configured in cypress.config.js, typically http://localhost:3000
        // The Nginx frontend for tools/web-ui runs on port 3000.
        cy.visit('/');
    });

    it('should display the report submission form and history section', () => {
        cy.get('h1').should('contain.text', 'Facebook Mass Reporter');
        cy.get('form#report-form').should('be.visible');
        cy.get('#target-url').should('be.visible');
        cy.get('#justification').should('be.visible');
        cy.get('#evidence').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
        cy.get('#report-history-container').should('be.visible');
    });

    it('should successfully submit a report without evidence and update history', () => {
        const targetUrl = `https://www.facebook.com/testpage_${Date.now()}`;
        const justification = 'This is a test justification for Cypress: no evidence.';

        // Mock the API response for a successful report
        // Note: If fb_accounts.json is empty, the API will correctly report failure for all accounts.
        // For this test, we assume at least one account in fb_accounts.json would succeed.
        // If fb_accounts.json is not present or empty, this test might show "failed for all accounts".
        // This test focuses on UI interaction and API call, less on backend logic outcome which varies by setup.
        cy.intercept('POST', '/api/report', (req) => {
            // We can inspect req.body if it's FormData and check its parts
            // For now, just return a generic success for any call to /api/report
            req.reply({
                statusCode: 200,
                body: {
                    results: [{ email: 'test@example.com', success: true, message: 'Mocked success' }],
                    report_id: 123
                }
            });
        }).as('submitReport');

        cy.intercept('GET', '/api/reports', {
            statusCode: 200,
            body: [
                { id: 123, target_url: targetUrl, status: 'success', justification: justification, evidence: [], created_at: new Date().toISOString() }
            ]
        }).as('getReports');

        cy.get('#target-url').type(targetUrl);
        cy.get('#justification').type(justification);
        cy.get('button[type="submit"]').click();

        cy.wait('@submitReport');
        cy.get('#submission-status')
            .should('be.visible')
            .and('contain.text', 'Report submitted')
            .and('contain.text', 'Mocked success'); // Check for our mocked message

        cy.wait('@getReports');
        cy.get('#report-history-container table tbody tr').should('have.length.at.least', 1);
        cy.get('#report-history-container table tbody tr td').should('contain', targetUrl.substring(0,50));
        cy.get('#report-history-container table tbody tr td').should('contain', justification.substring(0,50));
        cy.get('#report-history-container table tbody tr td.status-success').should('contain.text', 'success');
    });

    it('should successfully submit a report with an evidence file', () => {
        const targetUrl = `https://www.facebook.com/testpage_evidence_${Date.now()}`;
        const justification = 'This is a test justification for Cypress: with evidence.';
        const fixtureFile = 'sample_evidence.png'; // From cypress/fixtures

        cy.intercept('POST', '/api/report', {
            statusCode: 200,
            body: {
                results: [{ email: 'test@example.com', success: true, message: 'Mocked success with evidence' }],
                report_id: 124
            }
        }).as('submitReportWithEvidence');

        cy.intercept('GET', '/api/reports', (req) => {
            req.reply({
                statusCode: 200,
                body: [
                    { id: 124, target_url: targetUrl, status: 'success', justification: justification, evidence: [fixtureFile], created_at: new Date().toISOString() }
                ]
            });
        }).as('getReportsAfterEvidence');

        cy.get('#target-url').type(targetUrl);
        cy.get('#justification').type(justification);
        cy.get('#evidence').selectFile(`cypress/fixtures/${fixtureFile}`);

        cy.get('button[type="submit"]').click();

        cy.wait('@submitReportWithEvidence');
        cy.get('#submission-status')
            .should('be.visible')
            .and('contain.text', 'Report submitted')
            .and('contain.text', 'Mocked success with evidence');

        cy.wait('@getReportsAfterEvidence');
        cy.get('#report-history-container table tbody tr').should('have.length.at.least', 1);
        cy.get('#report-history-container table tbody tr td').should('contain', fixtureFile);
    });

    it('should require Target URL and Justification fields (HTML5 validation)', () => {
        // Attempt to submit without filling Target URL
        cy.get('#justification').type('Some justification');
        cy.get('button[type="submit"]').click();
        // Check for HTML5 validation message on the input (browser-dependent)
        // Cypress doesn't easily catch native validation popups, so we check if the input is invalid
        cy.get('#target-url:invalid').should('exist');
        // Clear justification and try submitting without it
        cy.get('#justification').clear();
        cy.get('#target-url').type(`https://www.facebook.com/test_no_justification_${Date.now()}`);
        cy.get('button[type="submit"]').click();
        cy.get('#justification:invalid').should('exist');
    });

    it('should display an error message if API submission fails', () => {
        const targetUrl = `https://www.facebook.com/testpage_apifail_${Date.now()}`;
        const justification = 'This submission should be mocked to fail.';

        cy.intercept('POST', '/api/report', {
            statusCode: 500,
            body: {
                error: 'Internal Server Error (mocked)'
            }
        }).as('submitReportFail');

        cy.get('#target-url').type(targetUrl);
        cy.get('#justification').type(justification);
        cy.get('button[type="submit"]').click();

        cy.wait('@submitReportFail');
        cy.get('#submission-status')
            .should('be.visible')
            .and('contain.text', 'Error submitting report')
            .and('contain.text', 'Internal Server Error (mocked)');
    });
});

describe('API Health Checks', () => {
  before(() => {
    // Wait for all services to be ready before running tests
    cy.waitForService(Cypress.env('osint_url'));
    cy.waitForService(Cypress.env('mass_messenger_url'));
    cy.waitForService(Cypress.env('messenger_bot_url'));
  });

  describe('Health Endpoints', () => {
    it('Checks OSINT API Health', () => {
      cy.testAPIEndpoint(`${Cypress.env('osint_url')}/api/health`, 200);
    });

    it('Checks Mass Messenger API Health', () => {
      cy.testAPIEndpoint(
        `${Cypress.env('mass_messenger_url')}/api/health`,
        200
      );
    });

    it('Checks Messenger Bot API Health', () => {
      cy.testAPIEndpoint(`${Cypress.env('messenger_bot_url')}/api/health`, 200);
    });
  });

  describe('Service Configuration', () => {
    it('All services respond with correct ports', () => {
      cy.request(`${Cypress.env('osint_url')}/api/health`).then(response => {
        expect(response.body.port).to.equal(8000);
        expect(response.body.service).to.equal('osint-framework');
      });

      cy.request(`${Cypress.env('mass_messenger_url')}/api/health`).then(
        response => {
          expect(response.body.port).to.equal(4444);
          expect(response.body.service).to.equal('facebook-mass-messenger');
        }
      );

      cy.request(`${Cypress.env('messenger_bot_url')}/api/health`).then(
        response => {
          expect(response.body.port).to.equal(3000);
          expect(response.body.service).to.equal('messenger-bot-framework');
        }
      );
    });
  });

  describe('Static Assets', () => {
    it('OSINT Framework serves static files', () => {
      cy.request(`${Cypress.env('osint_url')}/js/arf.js`).then(response => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include(
          'application/javascript'
        );
      });
    });

    it('Mass Messenger serves static files', () => {
      cy.request(`${Cypress.env('mass_messenger_url')}/index.js`).then(
        response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.include(
            'application/javascript'
          );
        }
      );
    });
  });
});

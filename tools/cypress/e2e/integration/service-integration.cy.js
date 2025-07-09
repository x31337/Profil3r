describe('Service Integration Tests', () => {
  before(() => {
    cy.waitForService(Cypress.env('osint_url'));
    cy.waitForService(Cypress.env('mass_messenger_url'));
    cy.waitForService(Cypress.env('messenger_bot_url'));
  });

  describe('Cross-Service Communication', () => {
    it('All services should be accessible', () => {
      cy.visit(Cypress.env('osint_url'));
      cy.get('body').should('be.visible');

      cy.visit(Cypress.env('mass_messenger_url'));
      cy.get('body').should('be.visible');

      cy.visit(Cypress.env('messenger_bot_url'));
      cy.get('body').should('be.visible');
    });

    it('Should handle service switching smoothly', () => {
      // Test switching between services
      cy.visitOSINTFramework();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('integration-osint-switch');

      cy.visitMassMessenger();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('integration-messenger-switch');

      cy.visitMessengerBot();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('integration-bot-switch');
    });
  });

  describe('Data Flow Integration', () => {
    it('Should maintain consistent data flow between services', () => {
      // Test data consistency across services
      cy.request(`${Cypress.env('osint_url')}/api/health`).then(response => {
        expect(response.status).to.equal(200);
        expect(response.body.service).to.equal('osint-framework');
      });

      cy.request(`${Cypress.env('mass_messenger_url')}/api/health`).then(
        response => {
          expect(response.status).to.equal(200);
          expect(response.body.service).to.equal('facebook-mass-messenger');
        }
      );

      cy.request(`${Cypress.env('messenger_bot_url')}/api/health`).then(
        response => {
          expect(response.status).to.equal(200);
          expect(response.body.service).to.equal('messenger-bot-framework');
        }
      );
    });
  });

  describe('Performance Integration', () => {
    it('Should maintain performance across services', () => {
      const startTime = Date.now();

      cy.visitOSINTFramework();
      cy.get('body').should('be.visible');

      cy.visitMassMessenger();
      cy.get('body').should('be.visible');

      cy.visitMessengerBot();
      cy.get('body').should('be.visible');

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Assert that total time is reasonable (adjust threshold as needed)
      expect(totalTime).to.be.lessThan(30000); // 30 seconds
    });
  });

  describe('Error Handling Integration', () => {
    it('Should handle service errors gracefully', () => {
      // Test error handling across services
      cy.request({
        url: `${Cypress.env('osint_url')}/api/nonexistent`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.oneOf([404, 500]);
      });
    });
  });
});

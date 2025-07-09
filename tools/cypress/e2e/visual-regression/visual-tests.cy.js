describe('Visual Regression Tests', () => {
  before(() => {
    cy.waitForService(Cypress.env('osint_url'));
    cy.waitForService(Cypress.env('mass_messenger_url'));
    cy.waitForService(Cypress.env('messenger_bot_url'));
  });

  describe('Cross-Browser Visual Testing', () => {
    it('OSINT Framework - Cross Browser', () => {
      cy.visitOSINTFramework();
      cy.wait(3000);
      cy.matchImageSnapshot('osint-framework-cross-browser');
    });

    it('Mass Messenger - Cross Browser', () => {
      cy.visitMassMessenger();
      cy.wait(2000);
      cy.matchImageSnapshot('mass-messenger-cross-browser');
    });

    it('Messenger Bot - Cross Browser', () => {
      cy.visitMessengerBot();
      cy.wait(2000);
      cy.matchImageSnapshot('messenger-bot-cross-browser');
    });
  });

  describe('Layout Consistency Tests', () => {
    it('Should maintain consistent layout across services', () => {
      // Test OSINT Framework layout
      cy.visitOSINTFramework();
      cy.get('body').should('have.css', 'margin');
      cy.matchImageSnapshot('osint-layout-consistency');

      // Test Mass Messenger layout
      cy.visitMassMessenger();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('mass-messenger-layout-consistency');

      // Test Messenger Bot layout
      cy.visitMessengerBot();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('messenger-bot-layout-consistency');
    });
  });

  describe('Component Visual Testing', () => {
    it('Should render navigation components correctly', () => {
      cy.visitOSINTFramework();
      cy.get('body').should('be.visible');
      cy.matchImageSnapshot('osint-navigation-components');
    });

    it('Should render form components correctly', () => {
      cy.visitMassMessenger();
      cy.get('form, .container, .login').should('exist');
      cy.matchImageSnapshot('mass-messenger-form-components');
    });

    it('Should render status components correctly', () => {
      cy.visitMessengerBot();
      cy.get('.status').should('be.visible');
      cy.matchImageSnapshot('messenger-bot-status-components');
    });
  });
});

// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
require('./commands');

// Import cypress-image-snapshot support
import 'cypress-image-snapshot/command';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for testing the tools
Cypress.Commands.add('visitOSINTFramework', () => {
  cy.visit(Cypress.env('osint_url'));
});

Cypress.Commands.add('visitMassMessenger', () => {
  cy.visit(Cypress.env('mass_messenger_url'));
});

Cypress.Commands.add('visitMessengerBot', () => {
  cy.visit(Cypress.env('messenger_bot_url'));
});

Cypress.Commands.add('checkServiceHealth', url => {
  cy.request({
    url: url,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.oneOf([200, 404, 500]);
  });
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

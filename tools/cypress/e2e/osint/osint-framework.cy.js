/// <reference types="cypress" />

describe('OSINT Framework Tests', () => {
  before(() => {
    cy.waitForService(Cypress.env('osint_url'));
  });

  describe('OSINT Framework UI', () => {
    it('Visits OSINT Framework main page', () => {
      cy.visitOSINTFramework();
      cy.get('title').should('contain', 'OSINT Framework');
      cy.get('body').should('be.visible');
    });

    it('Loads OSINT Framework resources', () => {
      cy.visitOSINTFramework();
      cy.get('body').should('exist');
      // Check if D3 visualization loads
      cy.get('svg').should('exist');
    });

    it('Tests OSINT Framework visual appearance', () => {
      cy.visitOSINTFramework();
      cy.wait(3000); // Wait for D3 to render
      cy.matchImageSnapshot('osint-framework-main');
    });
  });

  describe('OSINT Framework Navigation', () => {
    it('Should have proper navigation elements', () => {
      cy.visitOSINTFramework();
      cy.get('body').should('contain.text', 'OSINT');
      // Add more navigation tests as needed
    });
  });

  describe('OSINT Framework D3 Visualization', () => {
    it('Should render D3 visualization correctly', () => {
      cy.visitOSINTFramework();
      cy.get('svg').should('be.visible');
      cy.get('svg').within(() => {
        cy.get('g').should('exist'); // Check for D3 group elements
      });
    });
  });
});

/// <reference types="cypress" />

describe('Basic Test', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('Profil3r');
  });
});

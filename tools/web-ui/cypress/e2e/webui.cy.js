/// <reference types="cypress" />

describe('Facebook Mass Report API', () => {
  it('should accept a report POST and return results', () => {
    cy.request({
      method: 'POST',
      url: '/api/report',
      form: true,
      body: {
        target_url: 'https://www.facebook.com/example',
        justification: 'Test privacy violation justification.'
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.oneOf([200, 400, 500]);
      expect(response.body).to.have.property('results');
      expect(response.body.results).to.be.an('array');
    });
  });
});

// cypress/support/commands.js

// Custom commands for Profil3r tools testing

Cypress.Commands.add('waitForService', (url, timeout = 30000) => {
  cy.request({
    url: url,
    timeout: timeout
  }).then((response) => {
    expect(response.status).to.equal(200)
  })
})

// Command to test form submissions
Cypress.Commands.add('fillAndSubmitForm', (formData) => {
  Object.keys(formData).forEach(key => {
    cy.get(`[name="${key}"]`).type(formData[key])
  })
  cy.get('form').submit()
})

// Command to test API endpoints
Cypress.Commands.add('testAPIEndpoint', (endpoint, expectedStatus = 200) => {
  cy.request({
    url: endpoint,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.equal(expectedStatus)
  })
})

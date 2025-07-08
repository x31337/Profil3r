// cypress/support/commands.js

// Import cypress-image-snapshot command
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

// Add the custom image snapshot command
addMatchImageSnapshotCommand({
  failureThreshold: 0.03, // threshold for pixel differences
  failureThresholdType: 'percent', // percent of image or number of pixels
  customDiffConfig: { threshold: 0.1 }, // threshold for the difference sensitivity
  capture: 'viewport' // capture viewport in screenshot
});

// Custom commands for Profil3r tools testing

Cypress.Commands.add('waitForService', (url, timeout = 30000) => {
  cy.request({
    url: url,
    timeout: timeout
  }).then(response => {
    expect(response.status).to.equal(200);
  });
});

// Command to test form submissions
Cypress.Commands.add('fillAndSubmitForm', formData => {
  Object.keys(formData).forEach(key => {
    cy.get(`[name="${key}"]`).type(formData[key]);
  });
  cy.get('form').submit();
});

// Command to test API endpoints
Cypress.Commands.add('testAPIEndpoint', (endpoint, expectedStatus = 200) => {
  cy.request({
    url: endpoint,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.equal(expectedStatus);
  });
});

// Command for visual regression testing
Cypress.Commands.add('matchImageSnapshot', (name, options = {}) => {
  const device = Cypress.env('device') || 'desktop';
  const snapshotName = `${name}-${device}`;

  cy.matchImageSnapshot(snapshotName, {
    ...options,
    customSnapshotsDir: 'cypress/snapshots',
    customDiffDir: 'cypress/snapshots/diffs'
  });
});

// Command to set mobile viewport
Cypress.Commands.add('setMobileViewport', device => {
  if (device === 'iphone-6') {
    cy.viewport(375, 667);
  } else if (device === 'ipad-2') {
    cy.viewport(768, 1024);
  } else {
    cy.viewport(1280, 720); // default desktop
  }
});

// Command to test responsive design
Cypress.Commands.add('testResponsiveDesign', (url, testName) => {
  const devices = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'iphone-6', width: 375, height: 667 },
    { name: 'ipad-2', width: 768, height: 1024 }
  ];

  devices.forEach(device => {
    cy.viewport(device.width, device.height);
    cy.visit(url);
    cy.wait(2000); // Wait for page to load
    cy.matchImageSnapshot(`${testName}-${device.name}`);
  });
});

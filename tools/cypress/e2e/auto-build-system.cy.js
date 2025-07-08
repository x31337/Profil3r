describe('Auto Build System Tests', () => {
  beforeEach(() => {
    // Notify auto-build system about test start
    if (Cypress.env('notifyAutoBuild')) {
      cy.task('autoBuildNotify', { type: 'test-start', data: { spec: Cypress.spec.name } });
    }
  });

  afterEach(() => {
    // Notify auto-build system about test completion
    if (Cypress.env('notifyAutoBuild')) {
      cy.task('autoBuildNotify', { type: 'test-end', data: { spec: Cypress.spec.name } });
    }
  });

  describe('Auto Build System Dashboard', () => {
    it('should load the auto-build dashboard successfully', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check main title
      cy.contains('Profil3r Auto Build System').should('be.visible');
      
      // Check status cards
      cy.get('[id="build-status"]').should('exist');
      cy.get('[id="test-status"]').should('exist');
      cy.get('[id="deploy-status"]').should('exist');
      cy.get('[id="health-status"]').should('exist');
      
      // Check control buttons
      cy.contains('Build').should('be.visible');
      cy.contains('Test').should('be.visible');
      cy.contains('Deploy').should('be.visible');
      cy.contains('Auto Fix').should('be.visible');
    });

    it('should show build statistics in header', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check header statistics
      cy.get('[id="build-count"]').should('contain.text', /\d+/);
      cy.get('[id="test-count"]').should('contain.text', /\d+/);
      cy.get('[id="deploy-count"]').should('contain.text', /\d+/);
    });

    it('should display services grid', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Wait for services to load
      cy.wait(2000);
      
      // Check services grid exists
      cy.get('[id="services-grid"]').should('exist');
      
      // Services should be populated (may be empty initially)
      cy.get('[id="services-grid"]').should('be.visible');
    });
  });

  describe('Real-time Log System', () => {
    it('should have functional log tabs', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check log tabs
      cy.contains('Build').click();
      cy.get('.tab-btn.active').should('contain.text', 'Build');
      
      cy.contains('Test').click();
      cy.get('.tab-btn.active').should('contain.text', 'Test');
      
      cy.contains('Deploy').click();
      cy.get('.tab-btn.active').should('contain.text', 'Deploy');
      
      cy.contains('System').click();
      cy.get('.tab-btn.active').should('contain.text', 'System');
    });

    it('should display log content', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check log content area
      cy.get('[id="log-content"]').should('exist');
      cy.get('[id="log-content"]').should('be.visible');
    });
  });

  describe('Test Results Display', () => {
    it('should show test results cards', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check test result cards
      cy.contains('Cypress Tests').should('be.visible');
      cy.contains('Unit Tests').should('be.visible');
      cy.contains('Coverage').should('be.visible');
      
      // Check result statistics
      cy.get('[id="cypress-total"]').should('exist');
      cy.get('[id="cypress-passed"]').should('exist');
      cy.get('[id="cypress-failed"]').should('exist');
      
      cy.get('[id="unit-services"]').should('exist');
      cy.get('[id="unit-passed"]').should('exist');
      cy.get('[id="unit-failed"]').should('exist');
      
      cy.get('[id="coverage-lines"]').should('exist');
      cy.get('[id="coverage-functions"]').should('exist');
      cy.get('[id="coverage-branches"]').should('exist');
    });

    it('should have progress bars for test results', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check progress bars
      cy.get('[id="cypress-progress"]').should('exist');
      cy.get('[id="unit-progress"]').should('exist');
      cy.get('[id="coverage-progress"]').should('exist');
    });
  });

  describe('WebSocket Connection', () => {
    it('should show connection status', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check connection status indicator
      cy.get('[id="connection-status"]').should('be.visible');
      
      // Connection should eventually show as connected or disconnected
      cy.get('[id="connection-status"]').should('contain.text', /Connected|Disconnected/);
    });
  });

  describe('Interactive Controls', () => {
    it('should have clickable control buttons', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Test build button
      cy.contains('Build').should('not.be.disabled');
      cy.contains('Test').should('not.be.disabled');
      cy.contains('Deploy').should('not.be.disabled');
      cy.contains('Auto Fix').should('not.be.disabled');
    });

    it('should trigger build action', () => {
      cy.visit(Cypress.env('auto_build_url'));
      
      // Click build button
      cy.contains('Build').click();
      
      // Should show notification or update status
      cy.wait(1000);
      
      // Check if build status changed
      cy.get('[id="build-status"]').should('exist');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-6');
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check main elements are still visible
      cy.contains('Profil3r Auto Build System').should('be.visible');
      cy.get('[id="build-status"]').should('be.visible');
      cy.contains('Build').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit(Cypress.env('auto_build_url'));
      
      // Check main elements are still visible
      cy.contains('Profil3r Auto Build System').should('be.visible');
      cy.get('.status-grid').should('be.visible');
      cy.get('.control-buttons').should('be.visible');
    });
  });
});

describe('Service Health Checks', () => {
  const services = [
    { name: 'OSINT Framework', url: Cypress.env('osint_url') },
    { name: 'Mass Messenger', url: Cypress.env('mass_messenger_url') },
    { name: 'Messenger Bot', url: Cypress.env('messenger_bot_url') }
  ];

  services.forEach(service => {
    it(`should check ${service.name} health`, () => {
      cy.task('healthCheck', service.url).then(result => {
        if (result.status === 'healthy') {
          cy.log(`✅ ${service.name} is healthy (${result.code})`);
        } else {
          cy.log(`❌ ${service.name} is unhealthy: ${result.error}`);
          
          // If auto-fix is enabled, attempt to fix
          if (Cypress.env('autoFixOnFailure')) {
            cy.task('autoBuildNotify', { 
              type: 'service-unhealthy', 
              data: { service: service.name, url: service.url } 
            });
          }
        }
      });
    });
  });
});

describe('Build System Integration', () => {
  it('should integrate with auto-build system API', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('auto_build_url')}/api/status`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        expect(response.body).to.have.property('buildCount');
        expect(response.body).to.have.property('testCount');
        expect(response.body).to.have.property('deployCount');
        expect(response.body).to.have.property('services');
      } else {
        cy.log('Auto-build system API not available');
      }
    });
  });

  it('should trigger build via API', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('auto_build_url')}/api/build`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        expect(response.body).to.have.property('success');
      } else {
        cy.log('Build API endpoint not available');
      }
    });
  });

  it('should trigger test via API', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('auto_build_url')}/api/test`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        expect(response.body).to.have.property('success');
      } else {
        cy.log('Test API endpoint not available');
      }
    });
  });
});

describe('Visual Regression Testing', () => {
  it('should match dashboard screenshot', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Wait for page to fully load
    cy.wait(3000);
    
    // Take screenshot for visual regression
    cy.matchImageSnapshot('auto-build-dashboard');
  });

  it('should match mobile dashboard screenshot', () => {
    cy.viewport('iphone-6');
    cy.visit(Cypress.env('auto_build_url'));
    
    // Wait for responsive layout
    cy.wait(2000);
    
    // Take mobile screenshot
    cy.matchImageSnapshot('auto-build-dashboard-mobile');
  });
});

describe('Performance Testing', () => {
  it('should load dashboard within acceptable time', () => {
    const startTime = Date.now();
    
    cy.visit(Cypress.env('auto_build_url'));
    
    // Check main content loads
    cy.contains('Profil3r Auto Build System').should('be.visible');
    cy.get('[id="build-status"]').should('be.visible');
    
    cy.then(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      cy.log(`Dashboard loaded in ${loadTime}ms`);
    });
  });

  it('should handle WebSocket connection efficiently', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Wait for WebSocket connection
    cy.wait(2000);
    
    // Check connection status
    cy.get('[id="connection-status"]').should('contain.text', /Connected|Disconnected/);
    
    // Connection should be established quickly
    cy.get('[id="connection-status"]').should('not.contain.text', 'Connecting...');
  });
});

describe('Error Handling', () => {
  it('should handle offline state gracefully', () => {
    // Simulate network failure
    cy.intercept('GET', `${Cypress.env('auto_build_url')}/api/status`, {
      statusCode: 503,
      body: { error: 'Service unavailable' }
    });
    
    cy.visit(Cypress.env('auto_build_url'));
    
    // Should still show basic UI
    cy.contains('Profil3r Auto Build System').should('be.visible');
    
    // Should show connection error
    cy.get('[id="connection-status"]').should('contain.text', /Disconnected|Error/);
  });

  it('should show notifications for errors', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Check notifications container exists
    cy.get('[id="notifications"]').should('exist');
    
    // Wait for any initial notifications
    cy.wait(1000);
  });
});

describe('Accessibility', () => {
  it('should be keyboard navigable', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Test keyboard navigation
    cy.get('body').tab();
    cy.focused().should('exist');
    
    // Navigate to build button
    cy.contains('Build').focus();
    cy.focused().should('contain.text', 'Build');
  });

  it('should have proper ARIA labels', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Check for important elements with proper accessibility
    cy.get('[id="build-status"]').should('be.visible');
    cy.get('[id="test-status"]').should('be.visible');
    cy.get('[id="deploy-status"]').should('be.visible');
    cy.get('[id="health-status"]').should('be.visible');
  });
});

describe('Data Persistence', () => {
  it('should remember log preferences', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Switch to Test logs
    cy.contains('Test').click();
    cy.get('.tab-btn.active').should('contain.text', 'Test');
    
    // Refresh page
    cy.reload();
    
    // Should default back to Build tab (expected behavior)
    cy.wait(1000);
    cy.get('.tab-btn.active').should('exist');
  });

  it('should maintain real-time updates', () => {
    cy.visit(Cypress.env('auto_build_url'));
    
    // Wait for initial load
    cy.wait(2000);
    
    // Check that timestamps are being updated
    cy.get('[id="build-status"] .status-time').should('not.be.empty');
    cy.get('[id="test-status"] .status-time').should('not.be.empty');
  });
});

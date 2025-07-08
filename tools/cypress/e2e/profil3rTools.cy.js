describe('Profil3r Tools End-to-End Tests', () => {

    before(() => {
        // Wait for all services to be ready before running tests
        cy.waitForService(Cypress.env('osint_url'))
        cy.waitForService(Cypress.env('mass_messenger_url'))
        cy.waitForService(Cypress.env('messenger_bot_url'))
    })

    describe('Health Checks', () => {
        it('Checks OSINT API Health', () => {
            cy.testAPIEndpoint(`${Cypress.env('osint_url')}/api/health`, 200)
        })

        it('Checks Mass Messenger API Health', () => {
            cy.testAPIEndpoint(`${Cypress.env('mass_messenger_url')}/api/health`, 200)
        })

        it('Checks Messenger Bot API Health', () => {
            cy.testAPIEndpoint(`${Cypress.env('messenger_bot_url')}/api/health`, 200)
        })
    })

    describe('OSINT Framework', () => {
        it('Visits OSINT Framework main page', () => {
            cy.visitOSINTFramework()
            cy.get('title').should('contain', 'OSINT Framework')
            cy.get('body').should('be.visible')
        })

        it('Loads OSINT Framework resources', () => {
            cy.visitOSINTFramework()
            cy.get('body').should('exist')
            // Check if D3 visualization loads
            cy.get('svg').should('exist')
        })
    })

    describe('Facebook Mass Messenger', () => {
        it('Visits Mass Messenger main page', () => {
            cy.visitMassMessenger()
            cy.get('title').should('contain', 'facebook-mass-message')
            cy.get('body').should('be.visible')
        })

        it('Loads Mass Messenger interface', () => {
            cy.visitMassMessenger()
            cy.get('body').should('exist')
            // Check for login or main interface elements
            cy.get('form, .container, .login').should('exist')
        })
    })

    describe('Messenger Bot Framework', () => {
        it('Visits Messenger Bot Framework test page', () => {
            cy.visitMessengerBot()
            cy.get('title').should('contain', 'Messenger Bot Framework')
            cy.contains('Facebook Messenger Bot Framework')
        })

        it('Shows framework information', () => {
            cy.visitMessengerBot()
            cy.contains('Server is running')
            cy.contains('Port: 3000')
            cy.get('.status').should('contain', '✅')
        })
    })

    describe('Service Integration', () => {
        it('All services respond with correct ports', () => {
            cy.request(`${Cypress.env('osint_url')}/api/health`).then((response) => {
                expect(response.body.port).to.equal(8000)
                expect(response.body.service).to.equal('osint-framework')
            })
            
            cy.request(`${Cypress.env('mass_messenger_url')}/api/health`).then((response) => {
                expect(response.body.port).to.equal(4444)
                expect(response.body.service).to.equal('facebook-mass-messenger')
            })
            
            cy.request(`${Cypress.env('messenger_bot_url')}/api/health`).then((response) => {
                expect(response.body.port).to.equal(3000)
                expect(response.body.service).to.equal('messenger-bot-framework')
            })
        })
    })

    describe('Static Assets', () => {
        it('OSINT Framework serves static files', () => {
            cy.request(`${Cypress.env('osint_url')}/js/arf.js`).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.headers['content-type']).to.include('application/javascript')
            })
        })

        it('Mass Messenger serves static files', () => {
            cy.request(`${Cypress.env('mass_messenger_url')}/index.js`).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.headers['content-type']).to.include('application/javascript')
            })
        })
    })

})

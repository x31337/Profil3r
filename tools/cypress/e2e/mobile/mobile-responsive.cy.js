describe('Mobile Responsive Tests', () => {

    before(() => {
        cy.waitForService(Cypress.env('osint_url'))
        cy.waitForService(Cypress.env('mass_messenger_url'))
        cy.waitForService(Cypress.env('messenger_bot_url'))
    })

    describe('iPhone 6 Viewport Tests', () => {
        beforeEach(() => {
            cy.setMobileViewport('iphone-6')
        })

        it('OSINT Framework - iPhone 6 Layout', () => {
            cy.visitOSINTFramework()
            cy.wait(3000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('osint-framework-iphone-6')
        })

        it('Mass Messenger - iPhone 6 Layout', () => {
            cy.visitMassMessenger()
            cy.wait(2000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('mass-messenger-iphone-6')
        })

        it('Messenger Bot - iPhone 6 Layout', () => {
            cy.visitMessengerBot()
            cy.wait(2000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('messenger-bot-iphone-6')
        })
    })

    describe('iPad 2 Viewport Tests', () => {
        beforeEach(() => {
            cy.setMobileViewport('ipad-2')
        })

        it('OSINT Framework - iPad 2 Layout', () => {
            cy.visitOSINTFramework()
            cy.wait(3000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('osint-framework-ipad-2')
        })

        it('Mass Messenger - iPad 2 Layout', () => {
            cy.visitMassMessenger()
            cy.wait(2000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('mass-messenger-ipad-2')
        })

        it('Messenger Bot - iPad 2 Layout', () => {
            cy.visitMessengerBot()
            cy.wait(2000)
            cy.get('body').should('be.visible')
            cy.matchImageSnapshot('messenger-bot-ipad-2')
        })
    })

    describe('Responsive Design Tests', () => {
        it('Should adapt layout for different screen sizes', () => {
            cy.testResponsiveDesign(Cypress.env('osint_url'), 'osint-responsive')
            cy.testResponsiveDesign(Cypress.env('mass_messenger_url'), 'mass-messenger-responsive')
            cy.testResponsiveDesign(Cypress.env('messenger_bot_url'), 'messenger-bot-responsive')
        })

        it('Should maintain usability on mobile devices', () => {
            cy.setMobileViewport('iphone-6')
            
            // Test OSINT Framework mobile usability
            cy.visitOSINTFramework()
            cy.get('body').should('be.visible')
            cy.get('svg').should('be.visible') // D3 should still render
            
            // Test Mass Messenger mobile usability
            cy.visitMassMessenger()
            cy.get('body').should('be.visible')
            cy.get('form, .container, .login').should('exist')
            
            // Test Messenger Bot mobile usability
            cy.visitMessengerBot()
            cy.get('body').should('be.visible')
            cy.get('.status').should('be.visible')
        })
    })

    describe('Touch Interface Tests', () => {
        it('Should support touch interactions on mobile', () => {
            cy.setMobileViewport('iphone-6')
            
            cy.visitOSINTFramework()
            cy.get('body').should('be.visible')
            // Test touch interactions if applicable
            cy.get('svg').should('be.visible')
        })
    })

})

describe('Messenger Bot Framework Tests', () => {

    before(() => {
        cy.waitForService(Cypress.env('messenger_bot_url'))
    })

    describe('Messenger Bot Framework UI', () => {
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

        it('Tests Messenger Bot Framework visual appearance', () => {
            cy.visitMessengerBot()
            cy.wait(2000) // Wait for page load
            cy.matchImageSnapshot('messenger-bot-main')
        })
    })

    describe('Messenger Bot Framework Functionality', () => {
        it('Should display correct status information', () => {
            cy.visitMessengerBot()
            cy.get('.status').should('be.visible')
            cy.contains('✅').should('be.visible')
        })
    })

})

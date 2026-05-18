describe('Google Search', () => {
  it('opens google', () => {
    cy.allure().step("Visit Google homepage");
    cy.visit('https://google.com')
    cy.screenshot('google-homepage')
  })
})
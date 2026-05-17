export const createToken = () => {

  return cy.request({
    method: 'POST',
    url: `${Cypress.env("api_baseUrl")}/auth`,

    body: {
      username: Cypress.env("api_username"),
      password: Cypress.env("api_password")
    }
  })
}
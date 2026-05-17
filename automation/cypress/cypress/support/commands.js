// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import LoginPage from "../page/loginPage.js";
import BurgerMenu from "../page/burgerMenu.js";

Cypress.Commands.add("login", () => {
  cy.allure().step("Login with valid credentials");
  cy.get(LoginPage.usernameField).type(Cypress.env("web_username"));
  cy.get(LoginPage.passwordField).type(Cypress.env("web_password"));
  cy.get(LoginPage.loginButton).click();
});

Cypress.Commands.add("logout", () => {
  cy.allure().step("Logout from current account");
  cy.get(BurgerMenu.burgerButton).click();
  cy.get(BurgerMenu.logoutButton).click();
});

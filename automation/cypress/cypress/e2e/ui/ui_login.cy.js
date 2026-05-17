/// <reference types='cypress' />
import LoginPage from "../../page/loginPage.js";
import BurgerMenu from "../../page/burgerMenu.js";
import InventoryPage from "../../page/inventoryPage.js";

context("Visit all pages", () => {
  beforeEach(() => {
    cy.allure().step("Open SauceDemo website");
    cy.visit("/");
  });

  it("should visit login page", () => {
    cy.allure().step("Verify username field is visible");
    cy.get(LoginPage.usernameField).should("be.visible");

    cy.allure().step("Verify password field is visible");
    cy.get(LoginPage.passwordField).should("be.visible");

    cy.allure().step("Verify login button is visible");
    cy.get(LoginPage.loginButton).should("be.visible");

    cy.allure().step("Verify login credentials are visible");
    cy.get(LoginPage.loginCredentials).should("be.visible");

    cy.allure().step("Verify login password is visible");
    cy.get(LoginPage.loginPassword).should("be.visible");
    cy.screenshot("login-page");
  });

  it("should be able to login without errors", () => {
    cy.login();

    cy.allure().step("Verify user is redirected to inventory page");
    cy.url().should("include", "inventory.html");

    cy.allure().step("Verify inventory title is visible");
    cy.get(InventoryPage.inventoryTitle).contains("Products");
    cy.screenshot("inventory-page");
  });

  it("should be able to logout without errors", () => {
    cy.login();
    cy.logout();

    cy.allure().step("Verify user is redirected to login page");
    cy.url().should("eq", "https://www.saucedemo.com/");

    cy.allure().step("Verify username field is visible");
    cy.get(LoginPage.usernameField).should("be.visible");

    cy.allure().step("Verify password field is visible");
    cy.get(LoginPage.passwordField).should("be.visible");

    cy.allure().step("Verify login button is visible");
    cy.get(LoginPage.loginButton).should("be.visible");
    cy.screenshot("logout");
  });

  it("should not be able to login with random credentials", () => {
    cy.allure().step("Enter random username");
    cy.get(LoginPage.usernameField).type("randomuser");

    cy.allure().step("Enter random password");
    cy.get(LoginPage.passwordField).type("randompassword");

    cy.allure().step("Click login button");
    cy.get(LoginPage.loginButton).click();

    cy.allure().step("Verify error message is visible");
    cy.get(LoginPage.errorMessage).contains(
      "Epic sadface: Username and password do not match any user in this service",
    );
    cy.screenshot("login-error");
  });
});

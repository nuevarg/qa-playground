/// <reference types='cypress' />
import InventoryPage from "../../../page/inventoryPage.js";
import CartPage from "../../../page/cartPage.js";
import CheckoutInfoPage from "../../../page/checkoutInfoPage.js";
import CheckoutOverviewPage from "../../../page/checkoutOverviewPage.js";
import CheckoutCompletePage from "../../../page/checkoutCompletePage.js";
import { faker } from "@faker-js/faker";

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const postalCode = faker.location.zipCode();

context("Purchase flow", () => {
  beforeEach(() => {
    cy.allure().step("Open SauceDemo website");
    cy.visit("/");
    cy.login();
  });

  it("should be able to add items to cart and complete purchase", () => {
    cy.allure().step("Add items to cart");
    cy.get(InventoryPage.addToCartButton).eq(0).click();
    cy.get(InventoryPage.addToCartButton).eq(1).click();

    cy.allure().step("Navigate to cart");
    cy.get(InventoryPage.shoppingCartButton).click();

    cy.allure().step("Verify cart is visible");
    cy.get(CartPage.cartTitle)
      .should("be.visible")
      .get(CartPage.cartList)
      .should("be.visible");

    cy.allure().step("Proceed to checkout");
    cy.get(CartPage.checkoutButton).click();

    cy.allure().step("Fill out checkout information");
    cy.get(CheckoutInfoPage.checkoutInfoTitle).should("be.visible");
    cy.get(CheckoutInfoPage.firstName)
      .type(firstName)
      .get(CheckoutInfoPage.lastName)
      .type(lastName)
      .get(CheckoutInfoPage.postalCode)
      .type(postalCode)
      .get(CheckoutInfoPage.continueButton)
      .click();

    cy.allure().step("Verify checkout overview is visible");
    cy.get(CheckoutOverviewPage.checkoutOverviewTitle)
      .should("be.visible")
      .get(CheckoutOverviewPage.cartList)
      .should("be.visible")
      .get(CheckoutOverviewPage.cartItem)
      .should("be.visible");

    cy.allure().step("Complete the purchase");
    cy.get(CheckoutOverviewPage.finishButton).click();
    cy.get(CheckoutCompletePage.checkoutCompleteTitle).should(
      "have.text",
      "Thank you for your order!",
    );
    cy.get(CheckoutCompletePage.checkoutCompleteText).should(
      "have.text",
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );
    cy.screenshot("checkout-complete");
    cy.get(CheckoutCompletePage.backHomeButton).click();
    cy.url().should("include", "inventory.html");
  });
});

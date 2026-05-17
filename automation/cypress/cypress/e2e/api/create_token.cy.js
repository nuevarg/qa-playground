/// <reference types='cypress' />
import { createToken } from "../../support/api/auth.js";

describe("Create Token API", () => {
  it("should create token", () => {
    
    createToken().then((response) => {
      // validate status
      expect(response.status).to.eq(200);

      // validate response body
      expect(response.body).to.have.property("token");

      // optional: print token
      cy.log(response.body.token);

      const token = response.body.token;
      cy.wrap(token).as("authToken");
    });
  });
});

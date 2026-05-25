/// <reference types='cypress' />

describe("Login API", () => {
  it("should login successfully", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/users/login",
      body: {
        user: {
          email: "pasta@mail.com",
          password: "pasta",
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);

      expect(response.body.success).to.eq(true);

      expect(response.body.message).to.eq("Login successful");

      expect(response.body.data).to.have.property("token");
    });
  });

  it("should fail login with wrong password", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/users/login",
      failOnStatusCode: false,
      body: {
        user: {
          email: "pasta@mail.com",
          password: "wrongpassword",
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(403);

      expect(response.body.success).to.eq(false);

      expect(response.body.code).to.eq("APPLICATION_ERROR");
    });
  });
});

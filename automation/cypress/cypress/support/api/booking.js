export const createBooking = (payload, token) => {
  return cy.request({
    method: "POST",

    url: `${Cypress.env("api_baseUrl")}/booking`,

    headers: {
      Cookie: `token=${token}`,
    },

    body: payload,
  });
};

export const updateBooking = (bookingId, payload, token) => {
  return cy.request({
    method: "PUT",

    url: `${Cypress.env("api_baseUrl")}/booking/${bookingId}`,

    headers: {
      Cookie: `token=${token}`,
    },

    body: payload,
  });
};

export const deleteBooking = (bookingId, token) => {
  return cy.request({
    method: "DELETE",

    url: `${Cypress.env("api_baseUrl")}/booking/${bookingId}`,

    headers: {
      Cookie: `token=${token}`,
    },
  });
};

export const getBooking = (bookingId, options = {}) => {
  return cy.request({
    method: "GET",

    url: `${Cypress.env("api_baseUrl")}/booking/${bookingId}`,

    failOnStatusCode: options.failOnStatusCode ?? true,
  });
};

export const partialUpdateBooking = (bookingId, payload, token) => {
  return cy.request({
    method: "PATCH",

    url: `${Cypress.env("api_baseUrl")}/booking/${bookingId}`,

    headers: {
      Cookie: `token=${token}`,
    },

    body: payload,
  });
};

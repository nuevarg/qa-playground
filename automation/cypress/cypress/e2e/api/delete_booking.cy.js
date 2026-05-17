/// <reference types='cypress' />
import { createToken } from "../../support/api/auth";
import {
  createBooking,
  deleteBooking,
  getBooking,
} from "../../support/api/booking";
import { parseDynamicObject } from "../../support/parser/dynamicParser";

const bookingFixture = require("../../fixtures/createBooking.json");
const bookingData = bookingFixture.default || bookingFixture;

describe("Delete Booking API", () => {
  let token;

  before(() => {
    createToken().then((response) => {
      token = response.body.token;
    });
  });

  bookingData.forEach((data) => {
    const payload = parseDynamicObject(data);

    const testTitle =
      `Delete booking | ` + `${payload.firstname} ` + `${payload.lastname}`;

    it(testTitle, () => {
      // STEP 1 — Create Booking
      createBooking(payload, token).then((createResponse) => {
        const bookingId = createResponse.body.bookingid;

        expect(createResponse.status).to.eq(200);

        cy.log(
          `BOOKING CREATED bookingId: ${bookingId} BOOKING DATA: ${JSON.stringify(createResponse.body.booking, null, 2)}`,
        );

        // STEP 2 — Delete Booking
        deleteBooking(bookingId, token).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(201);

          cy.log(
            `BOOKING DELETED bookingId: ${bookingId} DELETE STATUS: ${deleteResponse.status}`,
          );

          // STEP 3 — Verify Deleted
          getBooking(bookingId, { failOnStatusCode: false }).then(
            (getResponse) => {
              expect(getResponse.status).to.eq(404);

              cy.log(
                `BOOKING VERIFIED DELETED bookingId: ${bookingId} GET STATUS: ${getResponse.status}`,
              );
            },
          );
        });
      });
    });
  });
});

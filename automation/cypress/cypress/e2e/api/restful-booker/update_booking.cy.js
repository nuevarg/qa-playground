/// <reference types='cypress' />
import { createToken } from "../../../support/api/auth";
import {
  createBooking,
  updateBooking,
  getBooking,
} from "../../../support/api/booking";
import { parseDynamicObject } from "../../../support/parser/dynamicParser";

const createFixture = require("../../../fixtures/createBooking.json");
const updateFixture = require("../../../fixtures/updateBooking.json");
const createBookingData = createFixture.default || createFixture;
const updateBookingData = updateFixture.default || updateFixture;

describe("Update Booking API", () => {
  let token;

  before(() => {
    createToken().then((response) => {
      token = response.body.token;
    });
  });

  createBookingData.forEach((originalData, index) => {
    const originalPayload = parseDynamicObject(originalData);
    const updatePayload = parseDynamicObject(updateBookingData[index]);
    const testTitle =
      `Update booking | ` +
      `${originalPayload.firstname} ` +
      `${originalPayload.lastname}`;

    it(testTitle, () => {
      // STEP 1 — Create Original Booking
      createBooking(originalPayload, token).then((createResponse) => {
        const bookingId = createResponse.body.bookingid;

        cy.log(
          `BOOKING CREATED bookingId: ${bookingId} ORIGINAL DATA: ${JSON.stringify(originalPayload, null, 2)}`,
        );

        // STEP 2 — Update Booking
        updateBooking(bookingId, updatePayload, token).then(
          (updateResponse) => {
            expect(updateResponse.status).to.eq(200);

            // Validate ENTIRE response body
            expect(updateResponse.body).to.deep.equal(updatePayload);

            cy.log(
              `BOOKING UPDATED bookingId: ${bookingId} UPDATED DATA: ${JSON.stringify(updateResponse.body, null, 2)}`,
            );

            // STEP 3 — Verify GET response
            getBooking(bookingId).then((getResponse) => {
              expect(getResponse.body).to.deep.equal(updatePayload);

              cy.log(
                `BOOKING VERIFIED bookingId: ${bookingId} VERIFIED DATA: ${JSON.stringify(getResponse.body, null, 2)}`,
              );
            });
          },
        );
      });
    });
  });
});

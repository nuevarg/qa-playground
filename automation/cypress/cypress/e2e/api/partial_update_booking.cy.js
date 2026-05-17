/// <reference types='cypress' />
import { createToken } from "../../support/api/auth";
import {
  createBooking,
  partialUpdateBooking,
  getBooking,
} from "../../support/api/booking";
import { parseDynamicObject } from "../../support/parser/dynamicParser";

const createFixture = require("../../fixtures/createBooking.json");
const patchFixture = require("../../fixtures/partialUpdateBooking.json");
const createBookingData = createFixture.default || createFixture;
const partialUpdateData = patchFixture.default || patchFixture;

describe("Partial Update Booking API", () => {
  let token;

  before(() => {
    createToken().then((response) => {
      token = response.body.token;
    });
  });

  createBookingData.forEach((originalData, index) => {
    const originalPayload = parseDynamicObject(originalData);
    const patchPayload = parseDynamicObject(partialUpdateData[index]);
    const testTitle =
      `Partial update booking | ` +
      `${originalPayload.firstname} ` +
      `${originalPayload.lastname}`;

    it(testTitle, () => {
      // STEP 1 — Create Original Booking
      createBooking(originalPayload, token).then((createResponse) => {
        const bookingId = createResponse.body.bookingid;

        expect(createResponse.status).to.eq(200);

        cy.log(
          `BOOKING CREATED bookingId: ${bookingId} ORIGINAL DATA: ${JSON.stringify(createResponse.body.booking, null, 2)}`,
        );

        // STEP 2 — Partial Update Booking
        partialUpdateBooking(bookingId, patchPayload, token).then(
          (patchResponse) => {
            expect(patchResponse.status).to.eq(200);

            cy.log(
              `BOOKING PARTIALLY UPDATED bookingId: ${bookingId} PATCH PAYLOAD: ${JSON.stringify(patchPayload, null, 2)}`,
            );

            // STEP 3 — Validate Patched Fields
            Object.keys(patchPayload).forEach((key) => {
              expect(patchResponse.body[key]).to.deep.equal(patchPayload[key]);
            });

            // STEP 3 — Validate Patched Fields
            Object.keys(patchPayload).forEach((key) => {
              expect(patchResponse.body[key]).to.deep.equal(patchPayload[key]);
            });

            // STEP 4 — Validate Unchanged Fields
            Object.keys(originalPayload).forEach((key) => {
              if (!patchPayload.hasOwnProperty(key)) {
                expect(patchResponse.body[key]).to.deep.equal(
                  originalPayload[key],
                );
              }
            });

            // STEP 5 — Verify Latest State
            getBooking(bookingId).then((getResponse) => {
              expect(getResponse.status).to.eq(200);

              Object.keys(patchPayload).forEach((key) => {
                expect(getResponse.body[key]).to.deep.equal(patchPayload[key]);
              });

              cy.log(
                `BOOKING VERIFIED bookingId: ${bookingId} FINAL BOOKING DATA: ${JSON.stringify(getResponse.body, null, 2)}`,
              );
            });
          },
        );
      });
    });
  });
});

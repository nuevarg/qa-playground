/// <reference types='cypress' />
import { createToken } from "../../../support/api/auth";
import { createBooking } from "../../../support/api/booking";
import { parseDynamicObject } from "../../../support/parser/dynamicParser";

const bookingFixture = require("../../../fixtures/createBooking.json");
const bookingData = bookingFixture.default || bookingFixture;

describe("Create Booking API", () => {
  let token;

  before(() => {
    createToken().then((response) => {
      token = response.body.token;
    });
  });

  bookingData.forEach((data) => {
    const payload = parseDynamicObject(data);

    const testTitle =
      `Create booking | ` +
      `${payload.firstname} ` +
      `${payload.lastname} | ` +
      `Price: ${payload.totalprice} | ` +
      `${payload.bookingdates.checkin} -> ` +
      `${payload.bookingdates.checkout}`;

    it(testTitle, () => {
      createBooking(payload, token).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.booking).to.have.property(
          "firstname",
          payload.firstname,
        );
      });
    });
  });
});

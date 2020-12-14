import { expect } from "chai";
const sinon = require("sinon");
const {
  calculateAverage,
  labdaHandler,
  Client,
} = require("../src/endpoints/getAverage");

describe("1. Get Average Function Test Suite", function () {
  after(() => {
    console.log("====================***=====================");
  });
  before(() => {
    console.log("====================***=====================");
  });

  beforeEach(() => {
    // sinon.restore();
    console.log("--------------------------------------------");
  });

  describe("Calculate Average Function", function () {
    it("returns the average of numbers passed in an array", (done) => {
      const result1 = calculateAverage([3, 4, 5]);
      const result2 = calculateAverage([5]);
      expect(result1).to.eq((3 + 4 + 5) / 3);
      expect(result2).to.eq(5 / 1);
      done();
    });
    it("returns 0 if empty array is passed", (done) => {
      const result1 = calculateAverage([]);
      expect(result1).to.eq(0);
      done();
    });
  });

  describe("Lambda Handler", function () {
    // sample response from calling 3 external api links
    const extApiResponse = {
      status: 200,
      response: { price: 18000, price1: 17920, price2: 17998 },
    };
    describe("Request Handler", function () {
      let makeRequestStub;
      beforeEach(() => {});
      afterEach(() => {
        makeRequestStub.restore();
      });
      it("should visit a url and return data", async () => {
        makeRequestStub = sinon.stub(Client, "makeRequests");
        makeRequestStub.resolves(extApiResponse);
        await Client.makeRequests("http://an-ext-api.com").then((res) => {
          expect(res).to.eq(extApiResponse);
        });
        expect(makeRequestStub.calledOnce).to.eq(true);
      });
      it("should throw error if no url is passed", async function () {
        await expect(
          Client.makeRequests()
            .then((res) => {
              expect(res).to.be.undefined;
            })
            .catch((err) => {
              expect(err.status).to.be.eq(404);
            })
        );
        expect(makeRequestStub.calledOnce).to.eq(true);
      });
    });
  });
});

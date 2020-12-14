import { expect } from "chai";
const sinon = require("sinon");
const {
  calculateAverage,
  lambdaHandler,
  Client,
} = require("../src/endpoints/getAverage");

describe("1. Get Average Function Test Suite", function () {
  after(() => {
    console.log(
      "================================***================================="
    );
  });
  before(() => {
    console.log(
      "================================***================================="
    );
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

  describe("Handle Request", function () {
    // sample response from calling 3 external api links
    const extApiResponse = {
      status: 200,
      response: { price: 18000, price1: 17920, price2: 17998 },
    };
    describe("Make request method", function () {
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
    describe("getData method", function () {
      let links = ["http://an-ext-api.com", "http://an-ext-api.com"];
      let makeRequestStub;
      beforeEach(() => {});
      afterEach(() => {
        makeRequestStub.restore();
      });
      it("should return an array with length of links", async () => {
        makeRequestStub = sinon.stub(Client, "makeRequests");
        makeRequestStub.resolves(extApiResponse);
        await Client.getData(links).then((res) => {
          expect(res.length).to.eq(links.length);
        });
        expect(makeRequestStub.calledTwice).to.eq(true);
      });
    });
    describe("lambda Handler function", function () {
      let links = ["http://an-ext-api.com", "http://an-ext-api.com"];
      let getDataStub;
      beforeEach(() => {
        getDataStub = sinon.stub(Client, "getData");
      });
      afterEach(() => {
        getDataStub.restore();
      });
      describe("when requests are successful", function () {
        const [val1, val2, val3] = [18456, 19000, 18882];
        beforeEach(() => {
          getDataStub.resolves(
            Promise.resolve([
              { data: { bid: val1 } },
              { data: { data: { rates: { USD: val2 } } } },
              { data: [["rates", val3]] },
            ])
          );
        });
        it("should return status code 200", async () => {
          const event = {
            httpMethod: "GET",
          };
          await lambdaHandler(event).then((res) => {
            expect(res.statusCode).to.be.eq(200);
          });
        });
        it("should return the average of prices", async () => {
          const event = {
            httpMethod: "GET",
          };
          await lambdaHandler(event).then((res) => {
            expect(JSON.parse(res.body)).to.be.eq(
              calculateAverage([val1, val2, val3])
            );
          });
        });
      });
      describe("when requests are unsuccessful", function () {
        const errMessage = "error in one link";
        beforeEach(() => {
          getDataStub.resolves(Promise.reject(new Error(errMessage)));
        });
        it("should return status code 503", async () => {
          const event = {
            httpMethod: "GET",
          };
          await lambdaHandler(event).then((res) => {
            expect(res.statusCode).to.be.eq(503);
          });
        });
        it("should return error message in body", async () => {
          const event = {
            httpMethod: "GET",
          };
          await lambdaHandler(event).then((res) => {
            expect(res.body).to.be.eq(errMessage);
          });
        });
      });
    });
  });
});

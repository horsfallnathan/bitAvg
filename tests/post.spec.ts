import { expect } from "chai";
const sinon = require("sinon");
const { Client, lambdaHandler } = require("../src/endpoints/post");

describe("2. Post Function Test Suite", function () {
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

  describe("Handle Request", function () {
    // sample response from calling 3 external api links
    const avgApiResponse = {
      status: 200,
      response: 18555,
    };
    describe("Make request method", function () {
      let makeRequestStub;
      beforeEach(() => {});
      afterEach(() => {
        makeRequestStub.restore();
      });
      it("should visit avg api and return data", async () => {
        makeRequestStub = sinon.stub(Client, "makeRequests");
        makeRequestStub.resolves(avgApiResponse);
        await Client.makeRequests("http://avg-api.com").then((res) => {
          expect(res).to.eq(avgApiResponse);
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
              expect(err.status).to.be.eq(400);
            })
        );
        expect(makeRequestStub.calledOnce).to.eq(true);
      });
    });
    describe("Send message method", function () {
      const event = {
        httpMethod: "GET",
      };
      describe("when email is sent successfully", function () {
        let makeRequestStub;
        let sendMessageStub;
        const resp = { id: "<20201213161330", message: "Queued. No thanks" };
        const avgApiResp = { data: { statusCode: 200, body: 19877 } };
        beforeEach(function () {
          sendMessageStub = sinon
            .stub(Client, "sendMessage")
            .resolves(Promise.resolve(resp));
          makeRequestStub = sinon
            .stub(Client, "makeRequests")
            .resolves(Promise.resolve(avgApiResp));
        });
        afterEach(function () {
          sendMessageStub.restore();
          makeRequestStub.restore();
        });
        it("should return a status code of 200", async () => {
          const result = await lambdaHandler(event);
          expect(result.statusCode).to.eq(200);
        });
        it("should return a success message", async () => {
          const result = await lambdaHandler(event);
          expect(result.body).to.eq(JSON.stringify(resp));
        });
      });
      describe("when email post is unsuccessful", function () {
        let makeRequestStub;
        let sendMessageStub;
        const resp = "test error sending data";
        const avgApiResp = { data: { statusCode: 200, body: 19877 } };
        beforeEach(function () {
          sendMessageStub = sinon
            .stub(Client, "sendMessage")
            .rejects(new Error(resp));
          makeRequestStub = sinon
            .stub(Client, "makeRequests")
            .resolves(Promise.resolve(avgApiResp));
        });
        afterEach(function () {
          sendMessageStub.restore();
          makeRequestStub.restore();
        });
        it("should return a status code of 500", async () => {
          const result = await lambdaHandler(event);
          expect(result.statusCode).to.eq(500);
        });
        it("should return an error message in the body", async () => {
          const result = await lambdaHandler(event);
          expect(result.body).to.eq(JSON.stringify(resp));
        });
      });
    });
  });
});

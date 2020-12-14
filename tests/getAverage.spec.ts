import { expect } from "chai";
const sinon = require("sinon");
const {
  calculateAverage,
  labdaHandler,
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

  describe("Calculate Average", function () {
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
});

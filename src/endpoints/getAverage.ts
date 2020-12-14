import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Types
 */
type HTTPResponse = {
  statusCode: number;
  body: any;
};

/**
 * Extract calls to external APIs to provide for custom error management and easier testing
 */
class HandleRequests {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    this.service = Axios.create(config);
  }

  // Expose method to make calls
  public async makeRequests(url: string): Promise<AxiosResponse> {
    if (!url)
      return Promise.reject({ status: 404, response: "Pass url string" });
    let response: AxiosResponse | Promise<any>;
    try {
      response = await this.service(url);
    } catch (error) {
      response = Promise.reject(error);
    }
    return response;
  }

  /**
   * Returns data from an array of APIs
   * @param links Links of urls to visit
   * @return {Promise.AxiosResponse[]}
   */
  public getData(links: string[]): Promise<AxiosResponse[]> {
    return Promise.all(links.map((x) => this.makeRequests(x)));
  }
}

// Base config for axios instance
const AxiosConfig: AxiosRequestConfig = {
  method: "GET",
  timeout: 30000,
  headers: {
    common: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
};

// instatiate new handleRequest instance with base axios config
const Client = new HandleRequests(AxiosConfig);
// intantiate function response
let response;

// define API links to visit
const links: string[] = [
  "https://www.bitstamp.net/api/v2/ticker/btcusd",
  "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
  "https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD",
];
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // const ret = await axios(url);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "hello world",
        // location: ret.data.trim()
      }),
    };
  } catch (err) {
    console.log(err);
    return err;
  }
  return response;
};

/**
 *
 * @param numbers Array of numbers
 */
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length < 1) return 0;
  const average = numbers.reduce((x, y) => x + y, 0) / numbers.length;
  return average;
};

/**
 * Parses the returned data, calculates their average and returns this
 * @param returnedData response from resolved promise.all request to all APIs
 */

const getValue = (returnedData: AxiosResponse[]): number => {
  // extract exchange rates from each api result
  const bitstamp_val: number = Number(returnedData[0].data.bid) || 0;
  const coinbase_val: number =
    Number(returnedData[1].data.data.rates?.USD) || 0;
  const bitfinex_val: number = Number(returnedData[2].data[0][1]) || 0;
  // calculate and return their average
  const average = calculateAverage([bitstamp_val, coinbase_val, bitfinex_val]);
  return average;
};

module.exports = {
  lambdaHandler,
  calculateAverage,
  Client,
};

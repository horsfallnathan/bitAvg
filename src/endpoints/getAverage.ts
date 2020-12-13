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
      return Promise.reject({ status: 400, response: "Pass url string" });
    let response: AxiosResponse | Promise<any>;
    try {
      response = await this.service(url);
    } catch (error) {
      response = Promise.reject(error);
    }
    return response;
  }
}

let response;
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

const calculateAverage = (numbers: number[]): number => {
  if (numbers.length < 1) return 0;
  const average = numbers.reduce((x, y) => x + y, 0) / numbers.length;
  return average;
};

module.exports = {
  lambdaHandler,
  calculateAverage,
};

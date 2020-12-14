import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Import environment variables
const API_KEY = process.env.MAILER_API_KEY || "testkey";
const DOMAIN = process.env.MAILER_DOMAIN || "testdomain";

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
class HandleRequests {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    this.service = Axios.create(config);
  }
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
  public async postRequests(
    average: number | string,
    email: string
  ): Promise<AxiosResponse> {
    // if (!url)
    //   return Promise.reject({ status: 400, response: "Pass url string" });
    let response: AxiosResponse | Promise<any>;
    const data = {
      from: "roundingle@gmail.com",
      to: email,
      subject: "BitUSD - Exchange Average",
      text: `The BitUSD - Exchange Average is ${average}`,
    };
    try {
      response = await Axios({
        method: "post",
        url: `${DOMAIN}/messages`,
        auth: {
          username: "api",
          password: `${API_KEY}`,
        },
        params: data,
      });
    } catch (error) {
      response = Promise.reject(error);
    }
    return response;
  }
}
// instatiate new handleRequest instance with base axios config
const Client = new HandleRequests(AxiosConfig);

/**
 *
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let average;
  let mailResponse;

  const body = JSON.parse(event.body);
  const email = body.email;

  try {
    await Client.makeRequests(process.env.GET_AVERAGE_URL).then((res) => {
      average = res.data;
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: "Error fetching average",
    };
  }
  try {
    await Client.postRequests(average, email).then((res) => {
      mailResponse = res.data;
    });
    return {
      statusCode: 200,
      body: JSON.stringify(mailResponse),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Error posting message",
    };
  }
};
module.exports = { lambdaHandler, Client };

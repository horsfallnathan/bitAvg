import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as MailGunner from "mailgun-js";

// Import environment variables
const API_KEY = process.env.MAILER_API_KEY;
const DOMAIN = process.env.MAILER_DOMAIN;

type HTTPResponse = {
  statusCode: number;
  body: any;
};

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
  mailgun: MailGunner.Mailgun;
  public constructor(config: AxiosRequestConfig) {
    this.service = Axios.create(config);
    this.mailgun = MailGunner({ apiKey: API_KEY, domain: DOMAIN });
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

  public async sendMessage(average: number | string) {
    const data = {
      from: "roundingle@gmail.com",
      to: "roundingle@gmail.com",
      subject: "BitUSD - Exchange Average",
      text: `The BitUSD - Exchange Average is ${average}`,
    };

    return this.mailgun.messages().send(data);
  }
}

// instatiate new handleRequest instance with base axios config
const Client = new HandleRequests(AxiosConfig);
// intantiate function response
let response: HTTPResponse;

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
    // make request to average api for value
    await Client.makeRequests(process.env.GET_AVERAGE_URL)
      .then((res) => {
        Client.sendMessage(res.data.body || 19870)
          .then((res) => {
            response = {
              statusCode: 200,
              body: JSON.stringify(res),
            };
          })
          .catch((error) => {
            // handle errors from sending message
            response = {
              statusCode: 500,
              body: JSON.stringify(error.message),
            };
          });
      })
      .catch((error) => {
        // handle errors from call to average API
        Promise.reject(
          JSON.stringify({
            error: error || "",
            message: "error fetching average",
          })
        );
      });
  } catch (error) {
    // handle try catch error
    response = {
      statusCode: 500,
      body: error,
    };
  }
  return response;
};

module.exports = { lambdaHandler, Client };

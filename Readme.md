# Bit Averaging Lambda Functions

> This repository contains two lambda functions:

1. **getAverage:** an API that returns average bitcoin - USD exchange rates and
2. **post:** Receives an email address, and forwards the response from calling the first API to it.

## Running it locally

> To ease DX, I used the Amazon [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html) cli.

- Create a `.env.json` _(yeah I know)_ file at the root of the directory. It should contain:
- ```json
  {
    "PostFunction": {
      "MAILER_API_KEY": "<mailgun_api_key>",
      "MAILER_DOMAIN": "<mailgun_domain>",
      "MAILER_FROM_EMAIL": "<senders_email>",
      "MAILER_FROM_TITLE": "Some rando title",
      "GET_AVERAGE_URL": "<link to first api>" // you can populate this after deployment
    }
  }
  ```

- Run `$ yarn` to install packages
- Run `$ yarn dev` to start the SAM local server.

## Deployment

- AWS Lambda deployment configuration is contained in the [template.yaml](template.yaml)

- To deploy run `$ yarn deploy`

## Packages Used

- Axios: For requests

#### Dev Dependencies

- Typescript
- `aws-sdk`

#### Testing

- Mocha: Used as test runner
- Chai: Assertion library
- Sinon: For mocking functions and class methods


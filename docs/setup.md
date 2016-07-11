# Setup

To setup the project you will require the following requirements:

* AWS Account
* NodeJS
* The serverless framework tool installed locally

### Steps to deploy the application

Run the initial serverless setup

```
serverless project init
```

Install the dependencies in api folder

```
npm install
```

Deploy the lambda functions

```
serverless dash deploy
```

Deploy endpoints with CORS Options

```
serverless endpoint deploy -a
```

# NoBin
NoBin is a "Serverless" NoOps implementation of a client side encrypted pastebin, running in AWS S3/Lambda.

Based on 0bin from [sametmax](https://github.com/sametmax/0bin), originally created by [kadima-services](https://github.com/kadima-services/NoBin)

It has since been updated to modern Serverless (as of February 2019).

----
## Setup
At this time, minor changes to the code are required.

### Modify behavior.js
`src\static\js\behavior.js`

Update the `apiGatewayUrl` var to your API gateway ID.

### Update Serverless.yaml
Ensure that your buckets (`bucketName`) are correct for the deployment.

### Deploy
serverless deploy

#### S3Sync
In order to deploy to an s3 bucket, S3Sync is included. This allows hosting of the `src` files.

----
## So how is it different from 0bin?

NoBin is built using AWS S3, API Gateway, Lambda, and DynamoDB as the core technology to host the application. This provides an advantage of deploy once. There is no further infrastructure management or monitoring of the application required.

Pasting multiple files in one paste is supported, with a configurable 20 MB total size limit.

## Architecture of NoBin

The back end is built using NodeJS which runs in AWS Lambda and is invoked by AWS API Gateway. The encrypted content from the client is stored in a private S3 bucket, while the metadata about the object status and expiry is maintained in DynamoDB.

The client side application which encrypts the pastebin content is hosted in a separate public S3 bucket.

All encrypted pastes are automatically deleted from the private S3 bucket upon 30 days, or less if specified by the user.

## How it works

### When creating the paste:
* The browser generates a random key.
* The pasted content is encrypted with this key using AES256.
* Request is sent to API Gateway with the expiration time which triggers the lambda function.
* The lambda function generates an S3 signed url, and also saves the expiration and location of the content in DynamoDB.
* The lambda function sends the response with the S3 signed url.
* The encrypted pasted content is uploaded to the S3 location.
* The browser uses the location detail to create a URL and adds the key in the URL hash (#).

### When reading the paste:
* The browser makes the GET request with the location details in the URL to API Gateway.
* Because the key is in the hash, the key is not part of the request.
* The lambda is triggered which checks the expiration detail in DynamoDB, if the content is not expired then a S3 signed get URL is generated.
* Browser receives the S3 URL and fetches the data from S3.
* Browser gets the encrypted content and decrypts it using the key.
* The pasted decrypted content is displayed and source code is highlighted.


### Key points:
* Because the key is in the hash, the key is never sent to the back end, therefore it won't appear in the back end logs.
* All operations, including code coloration, happen on the client-side.
* The use of managed services like Lambda, DynamoDB and S3 means that there is no server running, and no management is required.
* The [S3 Object Expiration](https://aws.amazon.com/blogs/aws/amazon-s3-object-expiration/) is used to manage the auto deletion of the encrypted content.

## Other features
* Automatic code coloration (no need to specify)
* Pastebin expiration: 1 day and 1 month (Can be modified to have more options)
* Burn after reading: the paste is destroyed after the first reading
* Clone paste: you can't edit a paste, but you can duplicate any of them
* Code upload: if a file is too big, you can upload it instead of using copy/paste
* Copy paste to clipboard in a click
* Get paste short URL in a click
* Own previous pastes history
* Visual hash of a paste to easily tell it apart from others in a list

## Technologies used
* [Serverless Framework](https://github.com/serverless/serverless)
* [NodeJS](http://nodejs.org/)
* [SJCL](http://crypto.stanford.edu/sjcl/) (js crypto tools)
* [jQuery](http://jquery.com/)
* [Bootstrap](http://twitter.github.com/bootstrap/), the Twitter HTML5/CSS3 framework
* [VizHash.js](https://github.com/sametmax/VizHash.js) to create visual hashes from pastes

## Credits
[0bin.net](http://0bin.net/) by [sametmax](https://github.com/sametmax/0bin).
[NoBin](https://github.com/kadima-services/NoBin) by [kadima-services]


## License
MIT

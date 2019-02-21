'use strict';
console.log('Loading function...');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

var lib = require('../lib');

exports.handler = (event, context, callback) => {
    lib.getObjectS3URL(event, function (error, response) {
        returnResponse({response}, callback);
    });
};

var returnResponse = function (body, callback) {
    callback(null, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        isBase64Encoded: false,
        body: JSON.stringify(body)
    });
}
'use strict';
console.log('Loading function...');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

var lib = require('../lib');

exports.handler = (event, context) => {
    lib.getObjectS3URL(event, function(error, response) {
        return context.done(error, response);
    });
};

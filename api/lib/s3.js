'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
var Q = require('q');

const stage = process.env.SERVERLESS_STAGE;
const projectName = process.env.SERVERLESS_PROJECT;
const uploadDataBucket = projectName + '-upload-data-' + stage;

/**
  * To get the signed url getObject
  */
module.exports.getObjectSignedURL = function(location) {
  var deferred = Q.defer();

  let params = {Bucket: uploadDataBucket, Key: location};

  s3.getSignedUrl('getObject', params, (err, url) => {
    if(err) deferred.reject(err);

    deferred.resolve(url);
  });

  return deferred.promise;
};

/**
  * To get the signed url putObject
  */
module.exports.putObjectSignedURL = function(location) {
  var deferred = Q.defer();

  let params = {Bucket: uploadDataBucket, Key: location, ContentType: 'application/json'};

  s3.getSignedUrl('putObject', params, (err, url) => {
    if(err) deferred.reject(err);

    deferred.resolve(url);
  });

  return deferred.promise;
};

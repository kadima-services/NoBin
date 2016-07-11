'use strict';

var AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
var Q = require('q');

const stage = process.env.SERVERLESS_STAGE;
const projectName = process.env.SERVERLESS_PROJECT;
const uploadMetadataTable = projectName + '-upload-metadata-' + stage;

/**
  * For setting the value to EMPTY for ''
  * Reason - DynamoDB Error for empty String
  */
function removeNull(obj) {
    for(let key in obj) {
        if( '' === obj[key] ) obj[key] = 'EMPTY';
        if ( typeof obj[key] === 'object' ) removeNull(obj[key]);
    }
    return obj;
}

/**
  * To Create the DB Record
  * Partition Key - uid
  */
module.exports.createData = function(data) {
  let deferred = Q.defer();
  let dbItem = removeNull(data);

  if(!dbItem.uid){
    deferred.reject('uid undefined');
  }

  let paramsDB = {
    TableName: uploadMetadataTable,
    Item: dbItem
  };

  docClient.put(paramsDB, function(err, data) {
      if (err){
				deferred.reject(err);
			}
      else{
				deferred.resolve(data);
			}
  });

  return deferred.promise;
};

/**
  * To Fetch the DB Record
  * Partition Key - uid
  */
module.exports.getData = function(uidKey) {
  let deferred = Q.defer();

  if(!uidKey){
    deferred.reject('uid value is undefined');
  }

  let paramsDB = {
    TableName: uploadMetadataTable,
    Key:{
      uid: uidKey
    }
  };

  docClient.get(paramsDB, function(err, data) {
      if (err){
				deferred.reject(err);
			}
      else{
				deferred.resolve(data);
			}
  });

  return deferred.promise;
};

/**
  * To Delete the DB Record
  * Partition Key - uid
  */
module.exports.deleteData = function(uidKey) {
  let deferred = Q.defer();

  if(!uidKey){
    deferred.reject('uid value is undefined');
  }

  let paramsDB = {
    TableName: uploadMetadataTable,
    Key:{
      uid: uidKey
    }
  };

  docClient.delete(paramsDB, function(err, data) {
      if (err){
				deferred.reject(err);
			}
      else{
				deferred.resolve(data);
			}
  });

  return deferred.promise;
};

/**
  * To Update the DB Record
  * Partition Key - uid
  */
module.exports.updateData = function(uidKey, expirationVal) {
  let deferred = Q.defer();

  if(!uidKey){
    deferred.reject('uid value is undefined');
  }

  let paramsDB = {
    TableName: uploadMetadataTable,
    Key:{
      uid: uidKey
    },
    UpdateExpression: 'set expiration = :e',
    ExpressionAttributeValues:{
        ':e':expirationVal,
    },
    ReturnValues:'UPDATED_NEW'
  };

  docClient.update(paramsDB, function(err, data) {
      if (err){
				deferred.reject(err);
			}
      else{
				deferred.resolve(data);
			}
  });

  return deferred.promise;
};

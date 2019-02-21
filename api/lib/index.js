'use strict';

var moment = require('moment');

var dynamo = require('./dynamo');
var s3 = require('./s3');

module.exports.getObjectS3URL = function (event, cb) {
    let obj = JSON.parse(event.body);
    let location = obj.location;
    if (location === undefined || location === null) {
        return cb(null, {'error': 'location undefined'});
    }

    let locationVal = location.split('/');
    let uid = locationVal[1];
    if (uid === undefined) {
        return cb(null, {'error': 'uid undefined'});
    }

    dynamo.getData(uid)
        .then((data) => {
            if (data.Item === undefined) {
                return cb(null, {'error': 'Data not found or expired'});
            } else if (data.Item.expiration === 'once') {
                return dynamo.updateData(uid, 'delete')
                    .then((data) => {
                        return s3.getObjectSignedURL(location);
                    })
                    .then((s3SignedURL) => {
                        return cb(null, {
                            'location': location,
                            's3SignedUrl': s3SignedURL,
                            'expiration': 'burn_after_reading'
                        });
                    });
            } else if (data.Item.expiration === 'delete') {
                return dynamo.deleteData(uid)
                    .then((data) => {
                        return s3.getObjectSignedURL(location);
                    })
                    .then((s3SignedURL) => {
                        return cb(null, {
                            'location': location,
                            's3SignedUrl': s3SignedURL,
                            'expiration': 'deleted'
                        });
                    });
            } else if (data.Item.expiration < new Date().getTime()) {
                return dynamo.deleteData(uid)
                    .then((data) => {
                        return cb(null, {'error': 'Data not found or expired'});
                    });
            } else {
                var expiration = moment(data.Item.expiration);
                const timeToExpiry = moment().to(expiration);

                return s3.getObjectSignedURL(location)
                    .then((s3SignedURL) => {
                        return cb(null, {
                            'location': location,
                            's3SignedUrl': s3SignedURL,
                            'timeToExpiry': timeToExpiry
                        });
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            return cb(null, {'error': err}); // Error message
        });
};


module.exports.createObjectS3URL = function (event, cb) {
    let obj = JSON.parse(event.body);
    if (JSON.parse(event.body) === undefined || JSON.parse(event.body) === null) {
        return cb(null, {'error': 'expiration undefined'}); // Error message
    }

    const currentTime = moment().valueOf();
    const uid = +Math.floor((Math.random() * 10000) + 1) + '-' + currentTime;
    let location;
    let expiration;

    switch (obj.expiration) {
        case 'burn_after_reading':
            expiration = 'once';
            location = 'once/' + uid;
            break;
        case '1_day':
            expiration = moment(currentTime).add(1, 'days').valueOf();
            location = '1_day/' + uid;
            break;
        case '1_month':
            expiration = moment(currentTime).add(1, 'months').valueOf();
            location = '1_month/' + uid;
            break;
        default:
            expiration = 'once';
            location = 'once/' + uid;
    }

    let s3SignedURL;

    //fetch the signed url
    s3.putObjectSignedURL(location)
        .then((url) => {
            s3SignedURL = url;
            return dynamo.createData({
                uid: uid,
                expiration: expiration,
                location: location,
                s3SignedUrl: s3SignedURL
            });
        })
        .then((dbData) => {
            return cb(null, {
                'location': location,
                's3SignedUrl': s3SignedURL
            });
        })
        .catch((err) => {
            console.log(err);
            return cb(null, {'error': err}); // Error message
        });
};

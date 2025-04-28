const AWS = require('aws-sdk');
const config = require('./config');
const log = require('./log');

config.addPartialSchema({
  required: ['AWS'],
  properties: {
    AWS: {
      required: [
        'ACCESS_KEY_ID',
        'SECRET_ACCESS_KEY',
      ],
      properties: {
        ACCESS_KEY_ID: { type: 'string' },
        SECRET_ACCESS_KEY: { type: 'string' },
      },
    },
  },
});

const {
  AWS: {
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
  },
} = config.get(['SES', 'AWS']);

const credentials = new AWS.Credentials({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

AWS.config.update({
  region: 'us-east-1',
  credentials,
});

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

/**
 * Check a bucket exists and is accessible.
 *
 * @param {string} bucketName - The name of the bucket to check.
 * @returns {Promise<boolean>} - True if the bucket exists, false otherwise.
 * @throws {Error} - If an error occurs while checking the bucket.
 */
const doesBucketExist = async (bucketName) => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    return true;
  } catch (err) {
    if (err.statusCode === 404) {
      log.debug(`Bucket ${bucketName} does not exist.`);
      return false;
    }
    log.error(`Error checking bucket ${bucketName}: ${err.message}`);
    throw err;
  }
};

/**
 * Upload some data to a bucket.
 *
 * @param {string} bucketName - The name of the bucket to upload to.
 * @param {string} key - The key (path) for the object in the bucket.
 * @param {string} body - The data to upload.
 * @returns {Promise<void>} - Resolves when the upload is complete.
 */
const putObject = async (bucketName, key, body) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
    };
    await s3.putObject(params).promise();
    log.debug(`Successfully uploaded data to ${bucketName}/${key}`);
  } catch (err) {
    log.error(`Error uploading data to ${bucketName}/${key}: ${err.message}`);
    throw err;
  }
};

module.exports = {
  doesBucketExist,
  putObject,
  // getObject,
};

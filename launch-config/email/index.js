const AWS = require('aws-sdk');
const { hostname } = require('os');
const { readFileSync } = require('fs');

const {
  SES: {
    TO_ADDRESS,
    SENDER_ADDRESS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  },
} = require('./config.json');

const { HOME } = process.env;
/** This device hostname */
const HOSTNAME = hostname();
/** Name of the log saved by cron */
const CRONLOG_NAME = 'crontab.log';

let report = '';

//////////////////////////////////// Copied from ses.js module /////////////////////////////////////

const credentials = new AWS.Credentials({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});
AWS.config.update({ region: 'eu-west-2', credentials });

const sesApi = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Send a notification email.
 */
const notify = async () => {
  const finalMsg = `--------------------------------
${report}
--------------------------------
`;

  const res = await sesApi.sendEmail({
    Source: SENDER_ADDRESS,
    Destination: { ToAddresses: [TO_ADDRESS] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: finalMsg,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `nms launch report for ${HOSTNAME}`,
      },
    },
  }).promise();
  console.log(`ses: Sent email ${res.MessageId}`);
};

////////////////////////////////////////////// Script //////////////////////////////////////////////

/**
 * The main functions.
 */
const main = async () => {
  try {
    report = readFileSync(`${HOME}/${CRONLOG_NAME}`);
  } catch (e) {
    report += 'Failed to load report\n';
    report += e.message;
  }
  
  await notify();
};

main();

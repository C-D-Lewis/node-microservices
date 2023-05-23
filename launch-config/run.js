const { execSync, spawn } = require('child_process');
const AWS = require('aws-sdk');
const { hostname } = require('os');

/** This device hostname */
const HOSTNAME = hostname();

//////////////////////////////////// Copied from ses.js module /////////////////////////////////////

const {
  SES: {
    TO_ADDRESS,
    SENDER_ADDRESS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  },
} = require('./config.json');

const credentials = new AWS.Credentials({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

AWS.config.update({
  region: 'eu-west-2',
  credentials,
});

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

const { HOME } = process.env;
/** Time to wait between app launches */
const WAIT_S = 15;

const startTime = Date.now();
let report = '';

/**
 * Add a log line to the report.
 *
 * @param {string} line - Line to add.
 */
const log = (line) => {
  console.log(`log: ${line}`);
  report += `${line}\n`;
};

/**
 * The main functions.
 */
const main = async () => {
  try {
    // Wait for network
    log('Waiting for network...');
    execSync('until ping -c 1 -W 1 8.8.8.8; do sleep 1; done');

    // HACK - allow access to gpiomem on Raspberry Pi
    execSync('sudo chmod a+rwX /dev/gpiomem || true');
    log('Applied /dev/gpiomem hack');

    // Repo update
    execSync('git pull origin master');
    log('Repo updated');
    
    // Get config for this host
    const config = require('./launchConfig.json').hosts[HOSTNAME];
    log(JSON.stringify(config, null, 2));

    // For each app
    for (let { location, start } of config) {
      // TODO: install / update?

      // Start
      const startCmd = `cd ${HOME}/${location} && ${start}`;
      log(`Starting ${startCmd}`);
      spawn(startCmd, {
        stdio: 'ignore',
        shell: true,
        detatched: true,
      });

      // Wait
      log(`Waiting ${WAIT_S}s`);
      await new Promise(r => setTimeout(r, WAIT_S * 1000));
    };

    log(`Completed in ${(Date.now() - startTime) / 1000}s`);
  } catch (e) {
    log(e.message);
    log(e.stack);
    log(`Failed after ${(Date.now() - startTime) / 1000}s`);
  }

  notify();
};

main();

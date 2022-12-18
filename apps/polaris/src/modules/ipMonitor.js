const AWSSDK = require('aws-sdk');
const { config, log, ip } = require('../node-common')(['config', 'log', 'ip']);

const { OPTIONS, AWS } = config.withSchema('server.js', {
  required: ['OPTIONS', 'AWS'],
  properties: {
    OPTIONS: {
      required: ['UPDATE_INTERVAL_M'],
      properties: {
        UPDATE_INTERVAL_M: { type: 'number' },
      },
    },
    AWS: {
      required: ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY', 'REGION', 'HOSTED_ZONE_NAME', 'RECORD_NAME_PREFIX'],
      properties: {
        ACCESS_KEY_ID: { type: 'string' },
        SECRET_ACCESS_KEY: { type: 'string' },
        REGION: { type: 'string' },
        HOSTED_ZONE_NAME: { type: 'string' },
        RECORD_NAME_PREFIX: { type: 'string' },
      },
    },
  },
});

const { UPDATE_INTERVAL_M } = OPTIONS;
const {
  ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION, HOSTED_ZONE_NAME, RECORD_NAME_PREFIX,
} = AWS;

AWSSDK.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION,
});

const route53 = new AWSSDK.Route53();

/**
 * Create the record if it doesn't exist.
 *
 * @param {string} hostedZoneId - Hosted zone ID.
 * @param {string} recordUrlName - Full record name.
 * @param {string} publicIp - Current public IP of the network.
 */
const createRecord = async (hostedZoneId, recordUrlName, publicIp) => {
  const res = await route53.changeResourceRecordSets({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [{
        Action: 'CREATE',
        ResourceRecordSet: {
          Name: `${recordUrlName}.`,
          Type: 'A',
          TTL: 60 * 5, // 5 minutes
          ResourceRecords: [{ Value: publicIp }],
        },
      }],
    },
  }).promise();
  log.debug(res);
  log.info(`Created record ${recordUrlName}`);
};

/**
 * Fetch the Route53 record's current state.
 *
 * @param {string} publicIp - Current public IP of the network.
 * @returns {object} Hosted zone ID, current IP, record name.
 */
const fetchRecordData = async (publicIp) => {
  // Find the hosted zone
  const listZonesRes = await route53.listHostedZones().promise();
  const zone = listZonesRes.HostedZones.find(({ Name }) => Name.includes(HOSTED_ZONE_NAME));
  if (!zone) throw new Error(`Hosted zone with name including ${HOSTED_ZONE_NAME} not found`);

  // List the records
  const hostedZoneId = zone.Id;
  const recordUrlName = `${RECORD_NAME_PREFIX}.${HOSTED_ZONE_NAME}`;
  const listRecordsRes = await route53.listResourceRecordSets({
    HostedZoneId: hostedZoneId,
    MaxItems: '100',
  }).promise();
  const record = listRecordsRes.ResourceRecordSets.find(
    ({ Name }) => Name.includes(recordUrlName),
  );

  // Create it as up-to-date
  if (!record) {
    await createRecord(hostedZoneId, recordUrlName, publicIp);
    return publicIp;
  }

  // Get the record value
  return {
    currentIp: record.ResourceRecords[0].Value,
    hostedZoneId,
    recordFullName: record.Name,
  };
};

/**
 * Update the Route53 record with the current public IP of the network.
 *
 * @param {string} publicIp - Current public IP of the network.
 * @param {string} hostedZoneId - Hosted zone ID.
 * @param {string} recordFullName - Full record name.
 */
const updateRoute53RecordIp = async (publicIp, hostedZoneId, recordFullName) => {
  const res = await route53.changeResourceRecordSets({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [{
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: recordFullName,
          Type: 'A',
          TTL: 60 * 5, // 5 minutes
          ResourceRecords: [{ Value: publicIp }],
        },
      }],
    },
  }).promise();
  log.debug(res);
  log.info(`Updated record ${recordFullName}`);
};

/**
 * When a refresh should be performed.
 */
const onIpMonitorRefresh = async () => {
  // Get public IP
  const publicIp = await ip.getPublic();
  log.info(`Current public IP address: ${publicIp}`);

  // Read the Route53 record
  const { currentIp, hostedZoneId, recordFullName } = await fetchRecordData(publicIp);
  log.info(`Current record IP address: ${currentIp}`);

  // Update if required
  if (publicIp === currentIp) {
    log.debug('IP addresses match, nothing to do');
    return;
  }

  log.info('Record is out of date, updating');
  await updateRoute53RecordIp(publicIp, hostedZoneId, recordFullName);
};

/**
 * Start monitoring the IP.
 */
const start = () => {
  setInterval(onIpMonitorRefresh, UPDATE_INTERVAL_M * 60 * 1000);
  onIpMonitorRefresh();
};

module.exports = {
  start,
  fetchRecordData,
};

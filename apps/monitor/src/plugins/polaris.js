const AWSSDK = require('aws-sdk');
const {
  config, log, ip, attic,
} = require('../node-common')(['config', 'log', 'ip', 'attic']);

config.addPartialSchema({
  required: ['AWS'],
  properties: {
    AWS: {
      required: [
        'ACCESS_KEY_ID',
        'SECRET_ACCESS_KEY',
        'REGION',
      ],
      properties: {
        ACCESS_KEY_ID: { type: 'string' },
        SECRET_ACCESS_KEY: { type: 'string' },
        REGION: { type: 'string' },
      },
    },
  },
});

const {
  AWS: {
    ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION,
  },
} = config.get(['AWS']);

/** Attic key for IP history */
const ATTIC_KEY_HISTORY = 'ip_history';

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
 * @param {string} hostedZoneName - Hosted zone name.
 * @param {string} recordNamePrefix - Record name prefix.
 * @returns {object} Hosted zone ID, current IP, record name.
 */
const fetchRecordData = async (publicIp, hostedZoneName, recordNamePrefix) => {
  // Find the hosted zone
  const listZonesRes = await route53.listHostedZones().promise();
  const zone = listZonesRes.HostedZones.find(({ Name }) => Name.includes(hostedZoneName));
  if (!zone) throw new Error(`Hosted zone with name including ${hostedZoneName} not found`);

  // List the records
  const hostedZoneId = zone.Id;
  const recordUrlName = `${recordNamePrefix}.${hostedZoneName}`;
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
 *
 * @param {string} hostedZoneName - Hosted zone name.
 * @param {string} recordNamePrefix - Record name prefix.
 */
const onIpMonitorRefresh = async (hostedZoneName, recordNamePrefix) => {
  // Get public IP
  const publicIp = await ip.getPublic();
  log.debug(`Current public IP address: ${publicIp}`);

  // Read the Route53 record
  const {
    currentIp,
    hostedZoneId,
    recordFullName,
  } = await fetchRecordData(publicIp, hostedZoneName, recordNamePrefix);
  log.debug(`Current record IP address: ${currentIp}`);

  // Update history list
  if (!await attic.exists(ATTIC_KEY_HISTORY)) await attic.set(ATTIC_KEY_HISTORY, []);
  const list = await attic.get(ATTIC_KEY_HISTORY);
  await attic.set(ATTIC_KEY_HISTORY, Array.from(new Set([...list, currentIp])));

  // Update if required
  if (publicIp === currentIp) {
    log.info('IP addresses match, nothing to do');
    return;
  }

  log.info('Record is out of date, updating');
  await updateRoute53RecordIp(publicIp, hostedZoneId, recordFullName);
};

/**
 * Monitor specified DNS records and update to current public IP if required.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = (args) => {
  const { HOSTED_ZONE_NAME, RECORD_NAME_PREFIX } = args;
  if (!HOSTED_ZONE_NAME || !RECORD_NAME_PREFIX) {
    throw new Error('Missing required arguments: HOSTED_ZONE_NAME, RECORD_NAME_PREFIX');
  }

  onIpMonitorRefresh(HOSTED_ZONE_NAME, RECORD_NAME_PREFIX);
};

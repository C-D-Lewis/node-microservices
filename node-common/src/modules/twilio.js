const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');

config.requireKeys('twilio.js', {
  required: ['TWILIO'],
  properties: {
    TWILIO: {
      required: ['ACCOUNT_SID', 'RECIPIENT', 'AUTH_TOKEN', 'MESSAGING_SERVICE_SID'],
      properties: {
        ACCOUNT_SID: { type: 'string' },
        RECIPIENT: { type: 'string' },
        AUTH_TOKEN: { type: 'string' },
        MESSAGING_SERVICE_SID: { type: 'string'},
      },
    },
  },
});

const {
  RECIPIENT,
  MESSAGING_SERVICE_SID,
  ACCOUNT_SID,
  AUTH_TOKEN,
} = config.TWILIO;

/**
 * Send an SMS notification to one pre-configured recipient with Twilio.
 *
 * curl 'https://api.twilio.com/2010-04-01/Accounts/$ACCOUNT_SID/Messages.json' -X POST \
 * --data-urlencode 'To=RECIPIENT' \
 * --data-urlencode 'MessagingServiceSid=$MESSAGING_SERVICE_SID' \
 * --data-urlencode 'Body=$body' \
 * -u $ACCOUNT_SID:$AUTH_TOKEN
 *
 * @param {string} body - Message body.
 */
const sendSmsNotification = async (body) => {
  const payload = {
    To: RECIPIENT,
    MessagingServiceSid: MESSAGING_SERVICE_SID,
    Body: body,
  };
  log.debug(`Twilio >> ${JSON.stringify(payload)}`);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const formBody = Object.entries(payload)
    .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
    .join('&');
  const authBase64 = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');
  const { body: responseBody } = await requestAsync({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Basic ${authBase64}`,
    },
    body: formBody,
  });

  log.debug(`Twilio << ${JSON.stringify(JSON.parse(responseBody), null, 2)}`);
  return responseBody.status === 'accepted';
};

module.exports = {
  sendSmsNotification,
};

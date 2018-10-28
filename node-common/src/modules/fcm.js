const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');

config.requireKeys('fcm.js', {
  required: [ 'FCM' ],
  type: 'object', properties: {
    FCM: {
      required: [ 'API_KEY' ],
      type: 'object', properties: {
        API_KEY: { type: 'string' }
      }
    }
  }
});

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

// Note: Android client MUST subscribe to topic!
const post = async (title, topic, body) => {
  const payload = {
    to: `/topics/${topic}`,
    notification: { title, body }
  };

  log.info(`FCM >> ${JSON.stringify(payload)}`);
  const data = await requestAsync({
    url: FCM_URL,
    method: 'post',
    headers: {
      Authorization: `key=${config.FCM.API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  log.info(`FCM << ${data.body}`);
};

module.exports = { post };

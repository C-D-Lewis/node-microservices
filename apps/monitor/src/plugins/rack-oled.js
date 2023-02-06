const {
  hostname, loadavg, freemem, totalmem, uptime,
} = require('os');
const visuals = require('../modules/visuals');
const { ip, log, bifrost } = require('../node-common')(['ip', 'log', 'bifrost']);

const {
  TOPIC_KNOWN_APPS,
} = bifrost;

let maxSeen = 0;

/**
 * Monitor stats for display on rack-mounted OLED display
 */
module.exports = async () => {
  const ipLastTwoOctets = ip.getLocal().split('.').slice(2, 4).join('.');

  const [cpuMinute] = loadavg();
  const freeMemory = freemem();
  const totalMemory = totalmem();
  const memoryPerc = 100 - (Math.round((freeMemory * 100) / totalMemory));

  const uptimeStr = Math.round(uptime() / (60 * 60));
  const [, time] =  new Date().toISOString().split('T');
  const timeNow = time.split(':').slice(0, 2).join(':');

  const { apps } = await bifrost.send({ to: 'bifrost', topic: TOPIC_KNOWN_APPS });
  const seenNow = apps.length;
  maxSeen = Math.max(maxSeen, seenNow);

  const lines = [
    `${hostname} (.${ipLastTwoOctets})`,
    `${timeNow} (Up ${uptimeStr} hrs)`,
    `C:${cpuMinute} / M:${memoryPerc} / A:${seenNow}/${maxSeen}`,
    '',
  ];
  log.info(lines);
  await visuals.setText(lines);
};

const {
  hostname, loadavg, freemem, totalmem, uptime,
} = require('os');
const visuals = require('../modules/visuals');
const {
  ip, log, temperature, wait,
} = require('../node-common')(['ip', 'log', 'temperature', 'wait']);

/**
 * Monitor stats for display on rack-mounted OLED display.
 *
 * Should be called with EVERY: 1
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

  // Running conduit apps
  // const { message: apps } = await conduit.send({ to: 'conduit', topic: 'getApps' });
  // const appsUp = apps.filter((p) => p.status === 'OK').length;

  const temp = temperature.get();

  const lines = [
    `${hostname} (.${ipLastTwoOctets})`,
    '',
    `${timeNow} (Up ${uptimeStr} hrs)`,
    `C:${cpuMinute} | M:${memoryPerc} | T:${temp}`,
  ];
  log.debug(lines);

  await visuals.setText(lines);

  // Prevent oled burn-in
  // await wait(10000);
  // await visuals.setText([]);
};

const {
  hostname, loadavg, freemem, totalmem, uptime,
} = require('os');
const fetch = require('node-fetch');
const display = require('../modules/display');
const { ip, log } = require('../node-common')(['ip', 'log']);

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

  const apps = await fetch('http://localhost:5959/apps').then((r) => r.json());
  const appsUp = apps.filter((p) => p.status === 'OK').length;

  const lines = [
    `${hostname} (.${ipLastTwoOctets})`,
    `${timeNow} (Up ${uptimeStr} hrs)`,
    `C:${cpuMinute} / M:${memoryPerc} / A:${appsUp}/${apps.length}`,
    '',
  ];
  log.debug(lines);
  await display.setText(lines);
};

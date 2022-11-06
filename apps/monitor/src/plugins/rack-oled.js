const {
  hostname, loadavg, freemem, totalmem,
} = require('os');
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

  const lines = [
    `${hostname} (${ipLastTwoOctets})`,
    `${cpuMinute}% / ${memoryPerc}%`,
  ];
  log.debug(lines);
  await display.setText(lines);
};

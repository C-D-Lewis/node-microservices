const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Command to execute */
const CMD = 'cat /proc/mdstat';

/**
 * Check disk state of RAID device (assume just 1)
 */
module.exports = () => {
  const [, nameLine, blocksLine, line3] = execSync(CMD).toString().split('\n');
  const [arrayName] = nameLine.split(' ');
  const [, diskState] = blocksLine.split('[');

  // Number of active devices
  const desired = parseInt(diskState[0], 10);
  const current = parseInt(diskState[2], 10);
  const degraded = current < desired;

  // Recovery state
  let recoveryPercent;
  if (line3.includes('recov')) {
    recoveryPercent = parseFloat(line3.slice(line3.indexOf(' = ') + 3, line3.indexOf('%')));
  }
  log.info({
    arrayName, desired, current, degraded, recoveryPercent,
  });

  // TODO - send alert if degraded:true
};

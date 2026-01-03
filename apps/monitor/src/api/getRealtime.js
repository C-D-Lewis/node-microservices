const { execSync } = require('child_process');
const { conduit, temperature } = require('../node-common')(['conduit', 'temperature']);

/**
 * Handle a 'getRealtime' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetRealtimePacket = async (packet, res) => {
  const procs = execSync('ps -eo pid,%cpu,%mem,comm --sort=-%cpu | head -n 6')
    .toString()
    .split('\n')
    .slice(1)
    .filter((p) => !!p.length)
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      const [pid, cpu, mem] = parts;
      const cmd = parts.slice(3).join(' ');
      return {
        pid, cpu, mem, cmd,
      };
    });

  const data = {
    timestamp: Date.now(),
    temperature: temperature.get(),
    procs,
  };

  conduit.respond(res, { status: 200, message: data });
};

module.exports = handleGetRealtimePacket;

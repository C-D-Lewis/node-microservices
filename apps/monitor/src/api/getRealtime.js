const si = require('systeminformation');
const { conduit, temperature } = require('../node-common')(['conduit', 'temperature']);

/**
 * Handle a 'getRealtime' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetRealtimePacket = async (packet, res) => {
  const siRes = await si.processes();
  const procs = siRes.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5)
    .map((p) => ({
      pid: p.pid,
      cpu: p.cpu.toFixed(2),
      mem: p.mem.toFixed(2),
      cmd: `${p.command} ${p.params}`,
    }));

  const data = {
    timestamp: Date.now(),
    temperature: temperature.get(),
    procs,
  };

  conduit.respond(res, { status: 200, message: data });
};

module.exports = handleGetRealtimePacket;

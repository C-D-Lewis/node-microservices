const { conduit, attic } = require('../node-common')(['conduit', 'attic']);

/**
 * Handle a 'getAlarms' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetAlarmsPacket = async (packet, res) => {
  const alarms = await attic.get('alarms') || [];
  
  return conduit.respond(
    res,
    { status: 200, message: alarms },
  );
};

module.exports = handleGetAlarmsPacket;

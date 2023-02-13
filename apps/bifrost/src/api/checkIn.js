const { attic } = require('../node-common')(['attic']);

/** Attic key for fleet list data */
const FLEET_LIST_KEY = 'fleetList';

/**
 * Sort item by lastCheckIn timestamp.
 *
 * @param {number} a - First item.
 * @param {number} b - Second item.
 * @returns {number} -1 to sort above, 1 to sort below.
 */
const sortByLastCheckIn = (a, b) => (a.lastCheckIn > b.lastCheckIn ? -1 : 1);

/**
 * Handle a 'checkIn' topic packet, updating local attic.
 * Should only be called towards the fleet host.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleCheckInPacket = async (packet) => {
  const { message: updatePayload } = packet;
  const { deviceName } = updatePayload;

  // Create the remote list if it doesn't already exist
  if (!await attic.exists(FLEET_LIST_KEY)) await attic.set(FLEET_LIST_KEY, []);

  const fleetList = await attic.get(FLEET_LIST_KEY);
  const existing = fleetList.find((p) => p.deviceName === deviceName);
  if (!existing) {
    // Add a new entry - new device
    fleetList.push(updatePayload);
  } else {
    // Update existing in place - seen device before
    Object.assign(existing, updatePayload);
  }

  await attic.set(FLEET_LIST_KEY, fleetList.sort(sortByLastCheckIn));
  return { content: 'OK' };
};

module.exports = handleCheckInPacket;

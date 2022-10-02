const Utils = {};

/**
 * Create state key for if a device's IP type is reachable.
 *
 * @param {string} deviceName - Device name.
 * @param {string} type - public or local
 * @returns {string}
 */
Utils.isReachableKey = (deviceName, type) => `isReachable:${deviceName}:${type}`;

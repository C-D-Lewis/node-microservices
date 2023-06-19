const Utils = {};

/**
 * Create state key for if a device's IP type is reachable.
 *
 * @param {string} deviceName - Device name.
 * @param {string} type - public or local
 * @returns {string} Key
 */
Utils.isReachableKey = (deviceName, type) => `isReachable:${deviceName}:${type}`;

/**
 * Get friendly string for time ago.
 *
 * @param {number} time - Time to use.
 * @returns {string} Friendly time ago.
 */
Utils.getTimeAgoStr = (time) => {
  const minsAgo = Math.round((Date.now() - time) / (1000 * 60));
  if (minsAgo > (60 * 24)) {
    return `${Math.round(minsAgo / (60 * 24))} days ago`;
  }

  if (minsAgo > 60) {
    return `${Math.round(minsAgo / 60)} hours ago`;
  }

  return `${minsAgo} mins ago`;
};

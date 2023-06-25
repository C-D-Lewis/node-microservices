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

/**
 * Shorter representation of a date time.
 *
 * @param {number} timestamp - Input time.
 * @returns {string} Short date time.
 */
Utils.shortDateTime = (timestamp) => {
  const [date, time] = new Date(timestamp).toISOString().split('T');
  const shortTime = time.split(':').slice(0, 2).join(':');
  return `${date} ${shortTime}`;
};

/**
 * Add a log entry.
 *
 * @param {object} state - App state.
 * @param {string|object} content - New item content.
 */
Utils.addLogEntry = (state, content) => {
  const text = (typeof content === 'string' ? content : JSON.stringify(content, null, 2)).slice(0, 10000);
  const logEntries = [
    ...state.logEntries,
    text,
  ];
  fabricate.update({ logEntries });
};

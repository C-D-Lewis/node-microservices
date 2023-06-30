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
 * Get the best reachable IP for the selected device.
 *
 * @param {object} state - App state.
 * @returns {string|undefined} Preferred IP to use.
 */
Utils.getReachableIp = (state) => {
  const { selectedDevice } = state;
  if (!selectedDevice) throw new Error('No selectedDevice yet');

  const { publicIp, localIp, deviceName } = selectedDevice;
  const publicIpValidKey = Utils.isReachableKey(deviceName, 'public');
  const localIpValidKey = Utils.isReachableKey(deviceName, 'local');

  if (state[localIpValidKey]) return localIp;

  return state[publicIpValidKey] ? publicIp : undefined;
};

/**
 * Get friendly string for time ago.
 *
 * @param {number} time - Time to use.
 * @returns {string} Friendly time ago.
 */
Utils.getTimeAgoStr = (time) => {
  const minsAgo = Math.round((Date.now() - time) / (1000 * 60));
  if (minsAgo > (60 * 24)) {
    return `${Math.round(minsAgo / (60 * 24))} days`;
  }

  if (minsAgo > 60) {
    return `${Math.round(minsAgo / 60)} hours`;
  }

  return `${minsAgo} mins`;
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

/**
 * Load apps for all fleet devices.
 *
 * @param {object} state - App state.
 */
Utils.fetchApps = async (state) => {
  fabricate.update('deviceApps', []);

  const { fleet } = state;
  const result = {};

  // eslint-disable-next-line no-restricted-syntax
  await Promise.all(fleet.map(async (device) => {
    const { deviceName } = device;

    try {
      const { message: apps } = await ConduitService.sendPacket(
        state,
        { to: 'conduit', topic: 'getApps' },
        undefined,
        deviceName,
      );

      result[deviceName] = apps;
      fabricate.update('deviceApps', result);
    } catch (err) {
      console.error(err);
    }
  }));
};

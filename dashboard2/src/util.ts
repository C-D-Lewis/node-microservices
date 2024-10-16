import { Fabricate, FabricateComponent } from 'fabricate.js';
import {
  AppState, DataPoint, Device, DeviceApp, MetricName,
} from './types';
import { CONDUIT_PORT, FLEET_HOST } from './constants';
import { sendConduitPacket } from './services/conduitService';

declare const fabricate: Fabricate<AppState>;

/**
 * Re-load the devices list data.
 *
 * @param {object} state - App state.
 */
export const fetchFleetList = async (state: AppState) => {
  const { token } = state;
  fabricate.update({ devices: [] });

  try {
    // Can't use sendConduitPacket, not a device by name
    const res = await fetch(`http://${FLEET_HOST}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'attic',
        topic: 'get',
        message: { app: 'conduit', key: 'fleetList' },
        auth: token || '',
      }),
    });
    const { message } = await res.json();
    fabricate.update({ devices: message.value });
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Parse query params.
 */
export const parseParams = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) {
    alert('Please provide token param');
    return;
  }

  fabricate.update({ token });
};

/**
 * Sort devices by deviceName.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
export const sortDeviceByName = (a: Device, b: Device) => (a.deviceName > b.deviceName ? 1 : -1);

/**
 * Get friendly string for time ago.
 *
 * @param {number} time - Time to use.
 * @returns {string} Friendly time ago.
 */
export const getTimeAgoStr = (time: number) => {
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
 * Send a device command by URL.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - Current state.
 * @param {object} device - Device to command.
 * @param {string} topic - Command topic, either 'reboot' or 'shutdown'.
 */
export const commandDevice = async (
  el: FabricateComponent<AppState>,
  state: AppState,
  device: Device,
  topic: string,
) => {
  const { deviceName } = device;
  const stateKey = fabricate.buildKey('command', topic);
  const pressed = !!state[stateKey];

  // Reset color regardless
  setTimeout(() => {
    el.setStyles(({ palette }) => ({ backgroundColor: palette.grey3 }));
    fabricate.update(stateKey, false);
  }, 2000);

  el.setStyles({ backgroundColor: !pressed ? 'red' : '#0003' });
  fabricate.update(stateKey, !pressed);
  if (!pressed) return;

  try {
    const { error } = await sendConduitPacket(state, { to: 'conduit', topic }, deviceName);
    if (error) throw new Error(error);

    console.log(`Device ${deviceName} sent ${topic} command`);
    el.setStyles(({ palette }) => ({ backgroundColor: palette.statusOk }));
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * Sort apps by name.
 *
 * @param {Device} a - Device to compare.
 * @param {Device} b - Device to compare.
 * @returns {number} Sort ordering.
 */
const sortAppByName = (a: DeviceApp, b: DeviceApp) => (a.app! > b.app! ? 1 : -1);

/**
 * Load apps for all fleet devices.
 *
 * @param {AppState} state - App state.
 * @param {Device} device - Device to use.
 */
export const fetchDeviceApps = async (state: AppState, device: Device) => {
  const { deviceName } = device!;

  fabricate.update({ selectedDeviceApps: [] });

  try {
    const { message } = await sendConduitPacket(
      state,
      { to: 'conduit', topic: 'getApps' },
      deviceName,
    );

    let selectedDeviceApps: DeviceApp[] = [];
    if (message && message.error) {
      console.error(message.error);
      selectedDeviceApps = [];
    } else if (!message) {
      console.error('No response in fetchApps');
      selectedDeviceApps = [];
    } else {
      selectedDeviceApps = (message as DeviceApp[]).sort(sortAppByName);
    }

    fabricate.update({ selectedDeviceApps });
  } catch (err: unknown) {
    console.error(err);
    fabricate.update({ selectedDeviceApps: [] });
  }
};

/**
 * Shorter representation of a date time.
 *
 * @param {number} timestamp - Input time.
 * @returns {string} Short date time.
 */
export const shortDateTime = (timestamp: string) => {
  const [, time] = new Date(timestamp).toISOString().split('T');
  const shortTime = time.split(':').slice(0, 2).join(':');
  return `${shortTime}`;
};

/**
 * Fetch data for a metric.
 *
 * @param {AppState} state - App state.
 * @param {MetricName} name - Metric name.
 */
export const fetchMetric = async (state: AppState, name: MetricName) => {
  const dataKey = fabricate.buildKey('metricData', name);
  fabricate.update(
    dataKey,
    {
      buckets: [],
      minTime: 0,
      maxTime: 0,
      minValue: 0,
      maxValue: 0,
    },
  );

  const res = await sendConduitPacket(
    state,
    {
      to: 'monitor',
      topic: 'getMetricToday',
      message: { name },
    },
  );
  const { message: newHistory } = res;
  if (res.error) console.log(res);
  if (!newHistory) return;

  const type = Array.isArray(newHistory[0][1]) ? 'array' : 'number';

  const minTime = shortDateTime(newHistory[0][0]);
  const maxTime = shortDateTime(newHistory[newHistory.length - 1][0]);
  let minValue = 0;
  let maxValue = 0;

  if (type === 'number') {
    // Aggregate values
    minValue = name.includes('Perc')
      ? 0
      : newHistory.reduce(
        // @ts-expect-error handled with 'type'
        (acc: number, [, value]: MetricPoint) => (value < acc ? value : acc),
        9999999,
      );
    maxValue = name.includes('Perc')
      ? 100
      : newHistory.reduce(
        // @ts-expect-error handled with 'type'
        (acc: number, [, value]: MetricPoint) => (value > acc ? value : acc),
        0,
      );
  } else {
    throw new Error('Unexpected metric data type');
  }

  // Average into buckets
  const copy = [...newHistory];
  const buckets: DataPoint[] = [];
  while (copy.length) {
    const points = copy.splice(0, 5);
    const avgIndex = Math.floor(points.length / 2);
    buckets.push({
      value: points.reduce((acc, [, value]) => acc + value, 0) / points.length,
      timestamp: points[avgIndex][0],
      dateTime: new Date(points[avgIndex][0]).toISOString(),
    });
  }

  fabricate.update(
    dataKey,
    {
      buckets,
      minTime,
      maxTime,
      minValue,
      maxValue,
    },
  );
};

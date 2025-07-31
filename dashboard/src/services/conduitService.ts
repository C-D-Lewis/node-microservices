import { Fabricate } from 'fabricate.js';
import {
  AppState, DataPoint, Device, DeviceApp,
  Packet,
} from '../types.ts';
import { BUCKET_SIZE, CONDUIT_PORT, FLEET_HOST } from '../constants.ts';
import { shortDateTime, sortAppByName } from '../util.ts';

declare const fabricate: Fabricate<AppState>;

/** Extra Y for visibility */
const Y_EXTRA = 1.1;

/**
 * Send a conduit packet.
 *
 * @param {AppState} state - App state.
 * @param {Packet} packet - Packet to send.
 * @param {string} deviceNameOverride - Override device name.
 * @param {string} [tokenOverride] - Override auth token sent.
 * @returns {Promise<object>} Response.
 * @throws {Error} Any error encountered.
 */
// eslint-disable-next-line import/prefer-default-export
export const sendConduitPacket = async (
  state: AppState,
  packet: Packet,
  deviceNameOverride?: string,
  tokenOverride?: string,
) => {
  const {
    token, selectedDevice, devices, publicIp: currentPublicIp,
  } = state;
  // const reqStateKey = appRequestStateKey(packet.to);
  // fabricate.update(reqStateKey, 'pending');

  try {
    const finalDevice = deviceNameOverride
      ? devices.find(({ deviceName }) => deviceName === deviceNameOverride)!
      : selectedDevice;
    if (!finalDevice) throw new Error('Unable to identify device to send message to.');

    // If we're on the same local detwork, use local IP, else try conduit forwarding
    const { localIp, publicIp } = finalDevice;
    const isLocalDevice = publicIp === currentPublicIp;
    const finalIp = isLocalDevice ? localIp : publicIp;
    const finalHost = isLocalDevice ? undefined : localIp;

    // Destination is local if reachable, else forward local via public
    console.log(`${finalDevice?.deviceName} >>> ${JSON.stringify(packet)}`);

    const res = await fetch(`http://${finalIp}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...packet,
        auth: tokenOverride || token || '',
        host: finalHost,
        device: finalDevice && finalDevice.deviceName,
      }),
    });
    const json = await res.json();
    console.log(`<<< ${finalDevice?.deviceName} ${JSON.stringify(json)}`);

    // fabricate.update(reqStateKey, 'success');
    return json;
  } catch (error) {
    console.log(error);
    // fabricate.update(reqStateKey, 'error');
    throw error;
  }
};

/**
 * Re-load the devices list data.
 *
 * @param {object} state - App state.
 */
export const fetchFleetList = async (state: AppState) => {
  const { token } = state;
  fabricate.update({ devices: [] });

  // First get this machine's public IP to know if we can use local IPs
  const { ip: publicIp } = await fetch('https://api.ipify.org?format=json')
    .then((r) => r.json());

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
    fabricate.update({ devices: message.value, publicIp });
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

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
 * Fetch data for a metric.
 *
 * @param {AppState} state - App state.
 * @param {string} name - Metric name.
 */
export const fetchMetric = async (state: AppState, name: string) => {
  const dataKey = fabricate.buildKey('metricData', name);
  // fabricate.update(
  //   dataKey,
  //   {
  //     buckets: [],
  //     minTime: 0,
  //     maxTime: 0,
  //     minValue: 0,
  //     maxValue: 0,
  //   },
  // );

  const res = await sendConduitPacket(
    state,
    {
      to: 'monitor',
      topic: 'getMetricHistory',
      message: { name },
    },
  );
  const { message: newHistory } = res;
  if (res.error) console.log(res);
  if (!newHistory.length) return;

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
      ? Math.round(100 * Y_EXTRA)
      : Math.round(
        newHistory.reduce(
          // @ts-expect-error handled with 'type'
          (acc: number, [, value]: MetricPoint) => (value > acc ? value : acc),
          0,
        ) * Y_EXTRA,
      );
  } else {
    throw new Error('Unexpected metric data type');
  }

  // Average into buckets
  const copy = [...newHistory];
  const buckets: DataPoint[] = [];
  while (copy.length) {
    const points = copy.splice(0, BUCKET_SIZE);
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

/**
 * Fetch metric names, triggering update of graphs if they are shown.
 *
 * @param {AppState} state - App state.
 */
export const fetchMetricNames = async (state: AppState) => {
  const {
    message: metricNames = [],
  } = await sendConduitPacket(state, { to: 'monitor', topic: 'getMetricNames' });
  fabricate.update({ metricNames });
};

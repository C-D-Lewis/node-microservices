import { Fabricate, FabricateComponent } from 'fabricate.js';
import { sendConduitPacket } from '../../services/conduitService';
import { AppState, MetricPoint, MonitorPlugin } from '../../types';
import { shortDateTime } from '../../utils';
import ItemPill from '../ItemPill';
import MetricGraph from '../MetricGraph';
import TextButton from '../TextButton';
import { ControlContainer } from '../AppControls';

declare const fabricate: Fabricate<AppState>;

type SetPropFunction = (k: string, v: string | []) => void;

/**
 * Fetch data for a metric.
 *
 * @param {AppState} state - App state.
 * @param {string} metric - Metric name.
 * @param {SetPropFunction} setProp - Prop setter.
 */
const fetchMetric = async (state: AppState, metric: string, setProp: SetPropFunction) => {
  const res = await sendConduitPacket(
    state,
    {
      to: 'monitor',
      topic: 'getMetricToday',
      message: { name: metric },
    },
  );
  let { message: newHistory } = res;

  const type: AppState['monitorData']['type'] = Array.isArray(newHistory[0][1]) ? 'array' : 'number';
  setProp('type', type);

  const minTime = shortDateTime(newHistory[0][0]);
  const maxTime = shortDateTime(newHistory[newHistory.length - 1][0]);
  let minValue = '-';
  let maxValue;

  if (type === 'number') {
    // Aggregate values
    minValue = metric.includes('Perc')
      ? 0
      : newHistory.reduce(
        // @ts-expect-error handled with 'type'
        (acc: number, [, value]: MetricPoint) => (value < acc ? value : acc),
        9999999,
      );
    maxValue = metric.includes('Perc')
      ? 100
      : newHistory.reduce(
        // @ts-expect-error handled with 'type'
        (acc: number, [, value]: MetricPoint) => (value > acc ? value : acc),
        0,
      );
  } else if (type === 'array') {
    // Just show the data in the maxValue label
    const lastArrValue = newHistory.slice(-1)[0][1];
    maxValue = lastArrValue.length ? lastArrValue.join(', ') : '-';

    // Points irrelevant for array type currently
    newHistory = [];
  }

  // Save data
  setProp('minValue', minValue);
  setProp('maxValue', maxValue);
  setProp('minTime', minTime);
  setProp('maxTime', maxTime);
  fabricate.update({ metricHistory: newHistory });
};

/** PluginRow prop types */
type PluginRowPropTypes = {
  setProp: SetPropFunction;
};

/**
 * Get schedule string for plugin.
 *
 * @param {MonitorPlugin} plugin - Plugin.
 * @returns {string} Schedule string.
 */
const getSchedule = (plugin: MonitorPlugin) => {
  const { EVERY, AT } = plugin;

  if (EVERY) return ` (~${EVERY})`;
  if (AT) return ` (at ${AT})`;
  return ' (1)';
};

/**
 * Plugin row component.
 *
 * @param {PluginRowPropTypes} props - Component props.
 * @returns {FabricateComponent} PluginRow component.
 */
const PluginRow = ({ setProp }: PluginRowPropTypes) => fabricate('Row')
  .setStyles({ flexWrap: 'wrap', padding: '7px' })
  .onUpdate((el, state) => {
    const { monitorData: { plugins } } = state;
    if (!plugins) return;

    // Show running plugins
    el.setChildren(plugins.map((plugin) => {
      const { FILE_NAME, ENABLED } = plugin;
      const disabled = ENABLED === false;

      return ItemPill({
        src: 'assets/plugin.png',
        text: `${FILE_NAME.replace('.js', '')}${getSchedule(plugin)}`,
        disabled,
      });
    }));
  }, ['monitorData'])
  .onCreate(async (el, state) => {
    // Fetch all plugins
    const res = await sendConduitPacket(state, { to: 'monitor', topic: 'getPlugins' });
    setProp('plugins', res.message);
  });

/** MetricRow prop types */
type MetricRowPropTypes = {
  setProp: (k: string, v: string | []) => void;
};

/**
 * Metric row component.
 *
 * @param {MetricRowPropTypes} props - Component props.
 * @returns {FabricateComponent} MetricRow component.
 */
const MetricRow = ({ setProp }: MetricRowPropTypes) => fabricate('Row')
  .setStyles({ flexWrap: 'wrap' })
  .onCreate(async (el, state) => {
    const { message: newNames } = await sendConduitPacket(state, { to: 'monitor', topic: 'getMetricNames' });
    setProp('metricNames', newNames);

    // Load the first
    if (newNames.length) fetchMetric(state, newNames[0], setProp);
  })
  .onUpdate((el, state) => {
    const { monitorData: { metricNames } } = state;
    if (!metricNames?.length) return;

    // Show button for each metric once loaded
    const buttons = metricNames.map((metric) => TextButton()
      .setText(metric)
      .setStyles(({ styles }) => ({ ...styles.controlButton, minWidth: '25%', flex: 1 }))
      .onClick(() => fetchMetric(state, metric, setProp)));
    el.setChildren(buttons);
  }, ['monitorData']);

/**
 * MonitorControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const MonitorControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string | []) => fabricate.update('monitorData', ({ monitorData }) => ({ ...monitorData, [k]: v }));

  return ControlContainer()
    .setChildren([
      PluginRow({ setProp }),
      MetricRow({ setProp }),
      MetricGraph(),
    ])
    .onCreate(() => {
      setProp('metricHistory', []);
      setProp('metricNames', []);
      setProp('plugins', []);
    });
};

export default MonitorControls;

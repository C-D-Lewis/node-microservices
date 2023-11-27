import { Fabricate, FabricateComponent } from 'fabricate.js';
import { sendConduitPacket } from '../../services/conduitService';
import { AppState, MetricPoint } from '../../types';
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
  const { message: newHistory } = res;

  // Aggregate values
  const minValue = metric.includes('Perc')
    ? 0
    : newHistory.reduce(
      (acc: number, [, value]: MetricPoint) => (value < acc ? value : acc),
      9999999,
    );
  const maxValue = metric.includes('Perc')
    ? 100
    : newHistory.reduce(
      (acc: number, [, value]: MetricPoint) => (value > acc ? value : acc),
      0,
    );
  const minTime = shortDateTime(newHistory[0][0]);
  const maxTime = shortDateTime(newHistory[newHistory.length - 1][0]);

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
      const {
        FILE_NAME, EVERY, AT, ENABLED,
      } = plugin;
      return ItemPill({
        src: 'assets/plugin.png',
        text: `${FILE_NAME.replace('.js', '')}${EVERY ? ` (~${EVERY})` : ` (at ${AT})`}`,
      })
        .setStyles(({ palette }) => ({
          backgroundColor: ENABLED !== false ? palette.grey5 : palette.grey3,
        }));
    }));
  }, ['monitorData'])
  .onUpdate(async (el, state) => {
    // Fetch all plugins
    const res = await sendConduitPacket(state, { to: 'monitor', topic: 'getPlugins' });
    setProp('plugins', res.message);
  }, ['fabricate:created']);

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
  .onUpdate(async (el, state, keys) => {
    const { monitorData: { metricNames } } = state;

    // Fetch all metric names, load the first
    if (keys.includes('fabricate:created')) {
      const { message: newNames } = await sendConduitPacket(state, { to: 'monitor', topic: 'getMetricNames' });
      setProp('metricNames', newNames);

      // Load the first
      if (newNames.length) {
        fetchMetric(state, newNames[0], setProp);
      }
      return;
    }

    // Show button for each metric once loaded
    if (!metricNames || !metricNames.length) return;
    if (keys.includes('monitorData')) {
      const buttons = metricNames.map((metric) => TextButton()
        .setText(metric)
        .setStyles(({ styles }) => ({ ...styles.controlButton, width: '25%' }))
        .onClick(() => fetchMetric(state, metric, setProp)));
      el.setChildren(buttons);
    }
  }, ['fabricate:created', 'monitorData']);

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
      fabricate.conditional(({ metricHistory }) => !!metricHistory.length, MetricGraph),
    ])
    .onUpdate(() => {
      setProp('metricHistory', []);
      setProp('metricNames', []);
      setProp('plugins', []);
    }, ['fabricate:created']);
};

export default MonitorControls;

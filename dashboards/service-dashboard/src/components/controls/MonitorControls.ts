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
      const disabled = ENABLED === false;
      return ItemPill({
        src: 'assets/plugin.png',
        text: `${FILE_NAME.replace('.js', '')}${EVERY ? ` (~${EVERY})` : ` (at ${AT})`}`,
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

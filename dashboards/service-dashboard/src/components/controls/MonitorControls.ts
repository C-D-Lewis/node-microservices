import { Fabricate } from 'fabricate.js';
import { sendConduitPacket } from '../../services/conduitService';
import Theme from '../../theme';
import { AppState, MetricPoint } from '../../types';
import { shortDateTime } from '../../utils';
import ItemPill from '../ItemPill';
import MetricGraph from '../MetricGraph';
import TextButton from '../TextButton';
import { ControlContainer } from '../AppControls';

declare const fabricate: Fabricate<AppState>;

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

  /**
   * Fetch data for a metric.
   *
   * @param {AppState} state - App state.
   * @param {string} metric - Metric name.
   */
  const fetchMetric = async (state: AppState, metric: string) => {
    const res = await sendConduitPacket(
      state,
      {
        to: 'monitor',
        topic: 'getMetricToday',
        message: { name: metric },
      },
    );
    const { message: metricHistory } = res;

    // Aggregate values
    const minValue = metric.includes('Perc')
      ? 0
      : metricHistory.reduce(
        (acc: number, [, value]: MetricPoint) => (value < acc ? value : acc),
        9999999,
      );
    const maxValue = metric.includes('Perc')
      ? 100
      : metricHistory.reduce(
        (acc: number, [, value]: MetricPoint) => (value > acc ? value : acc),
        0,
      );
    const minTime = shortDateTime(metricHistory[0][0]);
    const maxTime = shortDateTime(metricHistory[metricHistory.length - 1][0]);

    // Save data
    setProp('metricHistory', res.message);
    setProp('minValue', minValue);
    setProp('maxValue', maxValue);
    setProp('minTime', minTime);
    setProp('maxTime', maxTime);
  };

  return ControlContainer()
    .setChildren([
      fabricate('Row')
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
              .setStyles({
                backgroundColor: ENABLED !== false ? Theme.palette.grey5 : Theme.palette.grey3,
              });
          }));
        }, ['monitorData'])
        .onCreate(async (el, state) => {
          // Fetch all plugins
          const res = await sendConduitPacket(state, { to: 'monitor', topic: 'getPlugins' });
          setProp('plugins', res.message);
        }),
      fabricate('Row')
        .onUpdate((el, state) => {
          const { monitorData: { metricNames } } = state;
          if (!metricNames || !metricNames.length) return;

          // Show button for each metric
          const buttons = metricNames.map((metric) => TextButton()
            .setText(metric)
            .setStyles({ ...Theme.styles.controlButton, width: '25%' })
            .onClick(() => fetchMetric(state, metric)));
          el.setChildren(buttons);
        }, ['monitorData'])
        .onCreate(async (el, state) => {
          // Fetch all metric names
          const { message: metricNames } = await sendConduitPacket(state, { to: 'monitor', topic: 'getMetricNames' });
          setProp('metricNames', metricNames);

          // Load the first
          if (metricNames.length) {
            fetchMetric(state, metricNames[0]);
          }
        }),
      fabricate.conditional(({ monitorData }) => !!monitorData.metricHistory.length, MetricGraph),
    ])
    .onCreate(() => {
      setProp('metricHistory', []);
      setProp('metricNames', []);
      setProp('plugins', []);
    });
};

export default MonitorControls;

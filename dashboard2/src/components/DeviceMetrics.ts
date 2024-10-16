import { Fabricate, FabricateComponent } from 'fabricate.js';
import {
  AppState, DataPoint, MetricData, MetricName,
} from '../types';
import { fetchMetric } from '../util';
import Theme from '../theme';

declare const fabricate: Fabricate<AppState>;

/**
 * NoDeviceLabel component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const NoMetricsLabel = () => fabricate('Text')
  .setStyles(({ palette }) => ({
    color: palette.grey5,
    cursor: 'default',
    height: '100px',
    backgroundColor: palette.grey2,
    width: '100%',
    textAlign: 'center',
    alignContent: 'center',
  }))
  .setNarrowStyles({
    margin: '0px',
  })
  .setText('No metrics to show');

/**
 * MetricGraph component.
 *
 * @param {object} props - Component props.
 * @param {MetricName} props.name - Metric name to fetch and graph.
 * @returns {FabricateComponent} MetricGraph component.
 */
const MetricGraph = ({ name } : { name: MetricName }) => {
  const dataKey = fabricate.buildKey('metricData', name);
  const canvas = fabricate('canvas') as unknown as HTMLCanvasElement;

  /**
   * Draw metric data on the canvas.
   *
   * @param {AppState} state - App state.
   */
  const draw = (state: AppState) => {
    const { width, height } = canvas;
    const { buckets, minValue, maxValue } = state[dataKey] as MetricData;

    const range = maxValue - minValue;

    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = Theme.palette.grey2;
    ctx.fillRect(0, 0, width, height);

    if (!buckets.length) {
      // ctx.font = '24px Arial';
      // ctx.fillStyle = 'white';
      // ctx.fillText('No data', width / 2, height / 2);
      return;
    }

    // Latest data
    ctx.fillStyle = Theme.palette.secondary;
    const points = buckets.length > width ? buckets.slice(buckets.length - width) : buckets;
    points.forEach((p: DataPoint, i: number) => {
      const pHeight = ((p.value - minValue) * height) / range;
      const x = i;
      const y = height - pHeight;

      ctx.fillRect(x, y, 2, 2);
    });
  };

  return fabricate('div')
    .setStyles(({ palette }) => ({
      width: '100%',
      height: '100%',
    }))
    .setChildren([canvas as unknown as FabricateComponent<AppState>])
    .onUpdate(async (el, state, keys) => {
      if (keys.includes(fabricate.StateKeys.Created)) {
        fetchMetric(state, name);
        return;
      }

      if (keys.includes(dataKey)) {
        canvas.width = el.offsetWidth - 1;
        canvas.height = el.offsetHeight;

        draw(state);
      }
    }, [fabricate.StateKeys.Created, dataKey]);
};

/**
 * MetricContainer component.
 *
 * @param {object} props - Component props.
 * @param {MetricName} props.name - Metric name to fetch and graph.
 * @returns {FabricateComponent} MetricContainer component.
 */
const MetricContainer = ({ name } : { name: MetricName }) => fabricate('Column')
  .setStyles(({ palette }) => ({
    margin: '15px',
    width: '30%',
    height: '180px',
    border: `solid 2px ${palette.grey6}`,
  }))
  .setNarrowStyles({
    width: '100%',
  })
  .setChildren([
    fabricate('Text')
      .setStyles(({ fonts, palette }) => ({
        color: 'white',
        fontSize: '0.9rem',
        fontFamily: fonts.code,
        margin: '5px 0px 0px 0px',
        padding: '0px 5px',
        borderBottom: `solid 2px ${palette.grey6}`,
      }))
      .setText(name),
    MetricGraph({ name }),
  ]);

/**
 * DeviceMetrics component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceMetrics = () => fabricate('Row')
  .setStyles({
    margin: '15px',
    flexWrap: 'wrap',
  })
  .onUpdate(async (el, state) => {
    const { selectedDevice } = state;

    if (!selectedDevice) {
      el.setChildren([NoMetricsLabel()]);
      return;
    }

    el.setChildren([
      MetricContainer({ name: 'cpu' }),
      MetricContainer({ name: 'memoryPerc' }),
      MetricContainer({ name: 'tempRaw' }),
    ]);
  }, [fabricate.StateKeys.Created, 'selectedDevice']);

export default DeviceMetrics;

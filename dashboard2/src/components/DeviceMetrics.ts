import { Fabricate, FabricateComponent } from 'fabricate.js';
import {
  AppState, DataPoint, MetricData,
} from '../types';
import Theme from '../theme';
import { BUCKET_SIZE } from '../constants';
import { fetchMetric, fetchMetricNames } from '../services/conduitService';

declare const fabricate: Fabricate<AppState>;

/** Plot point label offset */
const LABEL_OFFSET = 3;
/** Graph width based on length of a day */
const GRAPH_WIDTH = Math.round(1440 / BUCKET_SIZE);
/** Map of friendly metric names */
const METRIC_NAME_MAP: Record<string, string> = {
  cpu: 'CPU',
  memoryPerc: 'Memory (%)',
  memoryMb: 'Memory (MB)',
  diskGb: 'Disk (GB)',
  discPerc: 'Disk (%)',
  tempRaw: 'Temperature',
  freqPerc: 'CPU Frequency (%)',
  fanSpeed: 'Fan Speed (RPM)',
};

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

/** Chart plot point */
type PlotPoint = {
  x: number;
  y: number;
  value: number;
};

/**
 * MetricGraph component.
 *
 * @param {object} props - Component props.
 * @param {string} props.name - Metric name to fetch and graph.
 * @returns {FabricateComponent} MetricGraph component.
 */
const MetricGraph = ({ name } : { name: string }) => {
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
    ctx.imageSmoothingEnabled = false;
    ctx.translate(0.5, 0.5);

    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    if (!buckets.length) {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('No data', 25, 25);
      return;
    }

    // Hour lines
    const hourInterval = Math.round(width / 24);
    for (let x = 0; x < 24; x += 3) {
      ctx.fillStyle = (x % 6 === 0) ? Theme.palette.grey5 : Theme.palette.grey2;
      ctx.fillRect(x * hourInterval, 0, 1, height);
    }

    // Latest data
    const points = buckets.length > width ? buckets.slice(buckets.length - width) : buckets;
    let minPoint: PlotPoint = { x: 0, y: 0, value: 0 };
    let maxPoint: PlotPoint = { x: 0, y: 99999999, value: 0 };
    let lastPoint: PlotPoint = { x: 0, y: 0, value: 0 };

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = Theme.palette.secondary;
    ctx.beginPath();
    points.forEach((p: DataPoint, i: number, arr) => {
      const { value } = p;
      const pHeight = ((value - minValue) * height) / range;
      const x = i;
      const y = height - pHeight;

      if (y > minPoint.y) {
        minPoint = { x, y, value };
      }
      if (y < maxPoint.y) {
        maxPoint = { x, y, value };
      }

      ctx.lineTo(x, y);

      // Record last value
      if (i === arr.length - 1) {
        lastPoint = { x, y, value };
      }
    });
    ctx.stroke();

    // Label min/max
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(minPoint.value.toFixed(1), minPoint.x + LABEL_OFFSET, minPoint.y - LABEL_OFFSET);
    ctx.fillText(maxPoint.value.toFixed(1), maxPoint.x + LABEL_OFFSET, maxPoint.y - LABEL_OFFSET);

    // Most recent value
    ctx.fillText(
      lastPoint.value.toFixed(1),
      lastPoint.x + LABEL_OFFSET,
      lastPoint.y - LABEL_OFFSET,
    );
  };

  return fabricate('div')
    .setStyles(() => ({
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }))
    .setChildren([canvas as unknown as FabricateComponent<AppState>])
    .onUpdate(async (el, state, keys) => {
      canvas.width = el.offsetWidth - 1;
      canvas.height = el.offsetHeight - 1;

      if (keys.includes(fabricate.StateKeys.Created)) {
        fetchMetric(state, name);
        return;
      }

      if (keys.includes(dataKey)) {
        draw(state);
      }
    }, [fabricate.StateKeys.Created, dataKey]);
};

/**
 * MetricContainer component.
 *
 * @param {object} props - Component props.
 * @param {string} props.name - Metric name to fetch and graph.
 * @returns {FabricateComponent} MetricContainer component.
 */
const MetricContainer = ({ name } : { name: string }) => fabricate('Column')
  .setStyles(({ palette }) => ({
    margin: '15px',
    width: `${GRAPH_WIDTH}px`,
    height: '180px',
    border: `solid 2px ${palette.grey6}`,
  }))
  .setNarrowStyles({
    margin: '10px 0px',
  })
  .setChildren([
    fabricate('Text')
      .setStyles(({ fonts, palette }) => ({
        color: 'white',
        fontSize: '0.9rem',
        fontFamily: fonts.body,
        margin: '0px',
        padding: '5px',
        borderBottom: `solid 2px ${palette.grey6}`,
      }))
      .setText(METRIC_NAME_MAP[name] || name),
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
  .onCreate(async (el, state) => {
    // Get the metrics available, each graph loads its own
    fetchMetricNames(state);
  })
  .onUpdate(async (el, state, keys) => {
    const { selectedDevice, metricNames } = state;

    if (!selectedDevice) {
      el.setChildren([NoMetricsLabel()]);
      return;
    }

    if (keys.includes('metricNames')) {
      el.setChildren(
        metricNames
          .filter((name) => !!METRIC_NAME_MAP[name])
          .map((name) => MetricContainer({ name })),
      );
    }
  }, [fabricate.StateKeys.Created, 'selectedDevice', 'metricNames']);

export default DeviceMetrics;

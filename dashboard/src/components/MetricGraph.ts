import { Fabricate } from 'fabricate.js';
import { APP_CARD_WIDTH } from '../constants';
import { AppState, DataPoint } from '../types';
import { shortDateTime } from '../utils';

declare const fabricate: Fabricate<AppState>;

/** Graph height */
const GRAPH_HEIGHT = 180;
/** Y axis marign */
const Y_AXIS_MARGIN = 32;
/** Point size */
const POINT_SIZE = 2;
/** Number of points in a bucket */
const BUCKET_SIZE = 5;
/** Graph width */
export const GRAPH_WIDTH = APP_CARD_WIDTH - Y_AXIS_MARGIN - 2;

/**
 * DataPointLabel component.
 *
 * @param {object} props - Component props.
 * @param {object} props.point - Data point.
 * @returns {HTMLElement} Fabricate component.
 */
const DataPointLabel = ({ point }: { point: DataPoint }) => fabricate('Text')
  .setStyles(({ palette }) => ({
    fontSize: '0.9rem',
    color: 'white',
    backgroundColor: palette.translucentGrey,
    padding: '5px',
    position: 'relative',
    bottom: '0px',
    width: 'fit-content',
    minWidth: '160px',
  }))
  .setText(`${Math.round(point.value * 100) / 100}\n(${shortDateTime(point.dateTime)})`);

/** DataPoint prop types */
type DataPointPropTypes = {
  point: DataPoint;
  minValue: number;
  maxValue: number;
};

/**
 * Graph DataPoint component.
 *
 * @param {object} props - Component props.
 * @param {DataPoint} props.point - Data point.
 * @param {number} props.minValue - Min dataset value.
 * @param {number} props.maxValue - Max dataset value.
 * @returns {HTMLElement} Fabricate component.
 */
const DataPoint = ({ point, minValue, maxValue }: DataPointPropTypes) => {
  const range = maxValue - minValue;
  const height = ((point.value - minValue) * GRAPH_HEIGHT) / range;
  return fabricate('div')
    .setStyles(({ palette }) => ({
      width: `${POINT_SIZE}px`,
      height: `${POINT_SIZE}px`,
      borderRadius: '10px',
      backgroundColor: palette.datapoint,
      marginBottom: `${height}px`,
    }))
    .onHover((el, state, isHovered) => {
      el.setChildren(
        isHovered ? [DataPointLabel({ point })] : [],
      );
    });
};

/**
 * MetricGraph component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const GraphView = () => fabricate('Row')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey1,
    // borderBottom: `solid 2px ${palette.lightGrey}`,
    // borderLeft: `solid 2px ${palette.lightGrey}`,
    alignItems: 'end',
    width: '100%',
    height: `${GRAPH_HEIGHT}px`,
  }))
  .onUpdate((el, { metricHistory, monitorData: { minValue, maxValue } }) => {
    if (!metricHistory.length) return;

    // Average into buckets
    const copy = [...metricHistory];
    const buckets = [];
    while (copy.length) {
      const points = copy.splice(0, BUCKET_SIZE);
      const avgIndex = Math.floor(points.length / 2);
      buckets.push({
        value: points.reduce((acc, [, value]) => acc + value, 0) / points.length,
        timestamp: points[avgIndex][0],
        dateTime: new Date(points[avgIndex][0]).toISOString(),
      });
    }

    // Update points - last that will fit
    const points = buckets
      .slice(-GRAPH_WIDTH)
      .map((point) => DataPoint({ point, minValue, maxValue }));
    el.setChildren(points);
  }, ['metricHistory']);

/**
 * YAxisLabels component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const YAxisLabels = () => fabricate('Column')
  .setStyles({
    width: `${Y_AXIS_MARGIN}px`,
    position: 'absolute',
    left: '5px',
  })
  .setChildren([
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white' })
      .onUpdate((el, { monitorData: { maxValue } }) => {
        el.setText(String(maxValue));
      }, ['monitorData']),
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white', marginTop: 'auto' })
      .onUpdate((el, { monitorData: { minValue } }) => {
        el.setText(String(minValue));
      }, ['monitorData']),
  ]);

/**
 * HAxisLabels component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const HAxisLabels = () => fabricate('Row')
  .setStyles({ paddingLeft: `${Y_AXIS_MARGIN}px` })
  .setChildren([
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white' })
      .onUpdate((el, { monitorData: { minTime } }) => {
        el.setText(String(minTime));
      }, ['monitorData']),
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white', marginLeft: 'auto' })
      .onUpdate((el, { monitorData: { maxTime } }) => {
        el.setText(String(maxTime));
      }, ['monitorData']),
  ]);

/**
 * MetricGraph component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const MetricGraph = () => fabricate('Column')
  .setStyles({ width: '100%' })
  .setChildren([
    fabricate('Row')
      .setStyles({ position: 'relative' })
      .setChildren([
        YAxisLabels(),
        GraphView(),
      ]),
    // HAxisLabels(),
  ]);

export default MetricGraph;

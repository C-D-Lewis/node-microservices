import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import { APP_CARD_WIDTH } from "../constants";
import Theme from "../theme";
import { AppState, DataPoint } from "../types";
import { shortDateTime } from "../utils";

declare const fabricate: Fabricate<AppState>;

/** Graph width */
const GRAPH_WIDTH = 2 * APP_CARD_WIDTH;
/** Graph height */
const GRAPH_HEIGHT = 250;
/** Y axis marign */
const Y_AXIS_MARGIN = 60;
/** Point size */
const POINT_SIZE = 3;
/** Number of points in a bucket */
const BUCKET_SIZE = 5;

/**
 * DataPointLabel component.
 *
 * @param {object} props - Component props.
 * @param {object} props.point - Data point.
 * @returns {HTMLElement} Fabricate component.
 */
const DataPointLabel = ({ point }: { point: DataPoint }) => fabricate('Text')
  .setStyles({
    fontSize: '0.9rem',
    color: 'white',
    backgroundColor: Theme.colors.DataPointLabel.background,
    padding: '5px',
    position: 'relative',
    bottom: '0px',
    width: 'fit-content',
    minWidth: '160px',
  })
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
    .setStyles({
      width: `${POINT_SIZE}px`,
      height: `${POINT_SIZE}px`,
      borderRadius: '10px',
      backgroundColor: Theme.colors.DataPoint.background,
      marginBottom: `${height}px`,
    })
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
  .setStyles({
    backgroundColor: Theme.colors.MetricGraph.background,
    borderBottom: `solid 2px ${Theme.colors.MetricGraph.border}`,
    borderLeft: `solid 2px ${Theme.colors.MetricGraph.border}`,
    alignItems: 'end',
    width: '100%',
    height: `${GRAPH_HEIGHT}px`,
  })
  .onUpdate((el, { monitorData: { metricHistory, minValue, maxValue } }) => {
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
  }, ['monitorData']);

/**
 * YAxisLabels component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const YAxisLabels = () => fabricate('Column')
  .setStyles({ width: `${Y_AXIS_MARGIN}px` })
  .setChildren([
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white' })
      .onUpdate((el, { monitorData: { metricHistory, maxValue } }) => {
        if (!metricHistory.length) return;

        el.setText(String(maxValue));
      }, ['monitorData']),
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white', marginTop: 'auto' })
      .onUpdate((el, { monitorData: { metricHistory, minValue } }) => {
        if (!metricHistory.length) return;

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
      .onUpdate((el, { monitorData: { metricHistory, minTime } }) => {
        if (!metricHistory.length) return;

        el.setText(String(minTime));
      }, ['monitorData']),
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white', marginLeft: 'auto' })
      .onUpdate((el, { monitorData: { metricHistory, maxTime } }) => {
        if (!metricHistory.length) return;

        el.setText(String(maxTime));
      }, ['monitorData']),
  ]);

/**
 * MetricGraph component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const MetricGraph = () => fabricate('Column')
  .setStyles({ width: `${GRAPH_WIDTH}px` })
  .setChildren([
    fabricate('Row')
      .setChildren([
        YAxisLabels(),
        GraphView(),
      ]),
    HAxisLabels(),
  ])
  .when(({ monitorData }) => !!monitorData.metricHistory.length);

export default MetricGraph;

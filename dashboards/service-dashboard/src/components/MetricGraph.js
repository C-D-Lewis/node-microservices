/** Graph width */
const GRAPH_WIDTH = 2 * Constants.APP_CARD_WIDTH;
/** Graph height */
const GRAPH_HEIGHT = 250;
/** Y axis marign */
const Y_AXIS_MARGIN = 60;
/** Point size */
const POINT_SIZE = 3;
/** Number of points in a bucket */
const BUCKET_SIZE = 5;

/**
 * Label component.
 *
 * @param {object} props - Component props.
 * @param {object} props.point - Data point.
 * @returns {HTMLElement} Fabricate component.
 */
const Label = ({ point }) => fabricate('Text')
  .setStyles({
    fontSize: '0.9rem',
    color: 'white',
    backgroundColor: 'black',
    padding: '5px',
    position: 'relative',
    bottom: '0px',
    width: 'fit-content',
  })
  .setText(`${point.value}\n(${point.dateTime})`);

/**
 * Graph DataPoint component.
 *
 * @param {object} props - Component props.
 * @param {object} props.point - Data point.
 * @param {number} props.minValue - Min dataset value.
 * @param {number} props.maxValue - Max dataset value.
 * @returns {HTMLElement} Fabricate component.
 */
const DataPoint = ({ point, minValue, maxValue }) => {
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
    .onHover({
      /**
       * When hover starts.
       *
       * @param {HTMLElement} el - This component.
       * @returns {void}
       */
      start: (el) => el.setChildren([Label({ point })]),
      /**
       * When hover ends.
       *
       * @param {HTMLElement} el - This component.
       * @returns {void}
       */
      end: (el) => el.setChildren([]),
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
    width: `${GRAPH_WIDTH - Y_AXIS_MARGIN}px`,
  })
  .setChildren([
    fabricate('div')
      .setStyles({ color: 'white', padding: '10px' })
      .setText('No data yet'),
  ])
  .onUpdate((el, { monitorData: { metricHistory, minValue, maxValue } }) => {
    if (!metricHistory.length) return;

    // Average into buckets
    const copy = [...metricHistory];
    const buckets = [];
    while (copy.length) {
      const items = copy.splice(0, BUCKET_SIZE);
      const avgIndex = Math.floor(items.length / 2);
      buckets.push({
        value: items.reduce((acc, p) => acc + p.value, 0) / items.length,
        timestamp: items[avgIndex].timestamp,
        dateTime: items[avgIndex].dateTime,
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
  .setStyles({ width: Y_AXIS_MARGIN })
  .setChildren([
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white' })
      .onUpdate((el, { monitorData: { metricHistory, maxValue } }) => {
        if (!metricHistory.length) return;

        el.setText(maxValue);
      }, ['monitorData']),
    fabricate('Text')
      .setStyles({ fontSize: '0.9rem', color: 'white', marginTop: 'auto' })
      .onUpdate((el, { monitorData: { metricHistory, minValue } }) => {
        if (!metricHistory.length) return;

        el.setText(minValue);
      }, ['monitorData']),
  ]);

/**
 * MetricGraph component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
fabricate.declare('MetricGraph', () => fabricate('Row')
  .setStyles({
    width: `${GRAPH_WIDTH}px`,
    height: `${GRAPH_HEIGHT}px`,
  })
  .setChildren([
    YAxisLabels(),
    GraphView(),
  ]));

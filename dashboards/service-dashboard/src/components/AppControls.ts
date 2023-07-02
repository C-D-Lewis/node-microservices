import { Fabricate, FabricateComponent } from "../../node_modules/fabricate.js/types/fabricate";
import { connectClacks, disconnectClacks, sendClacksMessage } from "../services/clacksService";
import { sendConduitPacket } from "../services/conduitService";
import Theme from "../theme";
import { AppState, DataPoint, MetricPoint } from "../types";
import { getReachableIp, shortDateTime } from "../utils";
import ItemPill from "./ItemPill";
import MetricGraph from "./MetricGraph";
import TextBox from "./TextBox";
import TextButton from "./TextButton";

declare const fabricate: Fabricate<AppState>;

const buttonStyle = {
  borderRadius: 0,
  margin: 0,
  minWidth: '50px',
};

/**
 * ControlRow component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ControlRow = () => fabricate('Row').setStyles({ padding: '0px 10px', alignItems: 'center' });

/**
 * Control container component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ControlContainer = () => fabricate('Column')
  .setStyles({ backgroundColor: Theme.colors.AppControls.background });

/**
 * AtticControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AtticControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) =>
    fabricate.update('atticData', ({ atticData }) => ({ ...atticData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'App name' })
            .setStyles({ width: '40%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((el, state, value) => setProp('app', value)),
          TextBox({ placeholder: 'Key' })
            .setStyles({ width: '60%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((el, state, value) => setProp('key', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Value' })
            .onUpdate((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('value', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Get')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick(async (el, state) => {
              const { atticData } = state;
              const { app, key } = atticData;
              const res = await sendConduitPacket(state, { to: 'attic', topic: 'get', message: { app, key } });
              setProp('value', JSON.stringify(res.message.value));
            }),
          TextButton()
            .setText('Set')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { atticData } = state;
              const { app, key, value } = atticData;
              sendConduitPacket(state, { to: 'attic', topic: 'set', message: { app, key, value } });
            }),
          TextButton()
            .setText('List Apps')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              sendConduitPacket(state, { to: 'attic', topic: 'listApps', message: {} });
            }),
        ]),
    ]);
};

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ConduitControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) =>
    fabricate.update('conduitData', ({ conduitData }) => ({ ...conduitData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'App name' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.app))
            .setStyles({ width: '40%' })
            .onChange((el, state, value) => setProp('app', value)),
          TextBox({ placeholder: 'Topic' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.topic))
            .setStyles({ width: '60%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Message (JSON)' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.message))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Send')
            .setStyles({ ...buttonStyle, width: '100%' })
            .onClick((el, state) => {
              const { conduitData } = state;
              const { app: to, topic, message } = conduitData;
              sendConduitPacket(state, { to, topic, message: JSON.parse(message) });
            }),
        ]),
    ]);
};

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const VisualsControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string | number) =>
    fabricate.update('visualsData', ({ visualsData }) => ({ ...visualsData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Red' })
            .onUpdate((el, { visualsData: { red } }) => el.setText(String(red)))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('red', parseInt(value, 10))),
          TextBox({ placeholder: 'Green' })
            .onUpdate((el, { visualsData: { green } }) => el.setText(String(green)))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('green', parseInt(value, 10))),
          TextBox({ placeholder: 'Blue' })
            .onUpdate((el, { visualsData: { blue } }) => el.setText(String(blue)))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Text' })
            .onUpdate((el, { visualsData: { text } }) => el.setText(text))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('text', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('All')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { red, green, blue } = visualsData;
              const message = { all: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setAll', message });
            }),
          TextButton()
            .setText('Pixel')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setPixel', message });
            }),
          TextButton()
            .setText('Blink')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              sendConduitPacket(state, { to: 'visuals', topic: 'blink', message });
            }),
          TextButton()
            .setText('Text')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { text } = visualsData;
              const message = { lines: [text] };
              sendConduitPacket(state, { to: 'visuals', topic: 'setText', message });
            }),
          TextButton()
            .setText('State')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => sendConduitPacket(state, { to: 'visuals', topic: 'state' })),
        ]),
    ]);
};

/**
 * GuestlistControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const GuestlistControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) =>
    fabricate.update('guestlistData', ({ guestlistData }) => ({ ...guestlistData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Name' })
            .onUpdate((el, { guestlistData: { name } }) => el.setText(name))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('name', value)),
          TextBox({ placeholder: 'Apps' })
            .onUpdate((el, { guestlistData: { apps } }) => el.setText(apps))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('apps', value)),
          TextBox({ placeholder: 'Topics' })
            .onUpdate((el, { guestlistData: { topics } }) => el.setText(topics))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('topics', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Admin password' })
            .onUpdate((el, { guestlistData: { adminPassword } }) => el.setText(adminPassword))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('adminPassword', value)),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('List Users')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => sendConduitPacket(state, { to: 'guestlist', topic: 'getAll' })),
          TextButton()
            .setText('Create User')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { guestlistData } = state;
              const {
                name, apps, topics, adminPassword,
              } = guestlistData;
              const message = {
                name,
                apps: apps.split(','),
                topics: topics.split(','),
                adminPassword,
              };
              sendConduitPacket(state, { to: 'guestlist', topic: 'create', message });
            }),
          TextButton()
            .setText('Delete User')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { guestlistData } = state;
              const {
                name, adminPassword,
              } = guestlistData;
              const message = {
                name,
                adminPassword,
              };
              sendConduitPacket(state, { to: 'guestlist', topic: 'delete', message });
            }),
        ]),
    ]);
};

/**
 * ClacksControls component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ClacksControls = () => {
  // list devices, most recent messages, and send messages

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   * @returns {void}
   */
  const setProp = (k: string, v: string) =>
    fabricate.update('clacksData', ({ clacksData }) => ({ ...clacksData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Topic' })
            .onUpdate((el, { clacksData: { topic } }) => el.setText(topic))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          TextBox({ placeholder: 'Message' })
            .onUpdate((el, { clacksData: { message } }) => el.setText(message))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value))
            .onCreate((el) => {
              // Default value
              // @ts-ignore
              el.value = '{}';
            }),
        ]),
      fabricate('Row')
        .setChildren([
          TextButton()
            .setText('Send')
            .setStyles({ ...buttonStyle, width: '100%', backgroundColor: Theme.colors.AppNavBar.background })
            .onClick((el, { clacksData }) => {
              const { topic, message } = clacksData;
              sendClacksMessage(topic, message);
            })
            .onUpdate((el, { clacksData: { connected } }) => el.setStyles({
              backgroundColor: connected ? Theme.colors.primary : Theme.colors.AppNavBar.background,
            })),
        ]),
    ])
    .onCreate((el, state) => {
      const { clacksData } = state;

      // Try and connect if not connected
      if (clacksData.connected) disconnectClacks();
      setTimeout(() => connectClacks(getReachableIp(state)!), 500);
    });
};

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
  const setProp = (k: string, v: string | []) =>
    fabricate.update('monitorData', ({ monitorData }) => ({ ...monitorData, [k]: v }));

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
      : metricHistory.reduce((acc: number, [, value]: MetricPoint) => (value < acc ? value : acc), 9999999);
    const maxValue = metric.includes('Perc')
      ? 100
      : metricHistory.reduce((acc: number, [, value]: MetricPoint) => (value > acc ? value : acc), 0);
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
            const {
              AppCard: { titleBar },
              ItemPill: { disabled },
            } = Theme.colors;
            return ItemPill({
              src: 'assets/plugin.png',
              text: `${FILE_NAME.replace('.js', '')}${EVERY ? ` (~${EVERY})` : ` (at ${AT})`}`,
            })
              .setStyles({ backgroundColor: ENABLED !== false ? titleBar : disabled });
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
            .setStyles({ ...buttonStyle, width: '25%' })
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
      MetricGraph(),
    ])
    .onCreate(() => {
      setProp('metricHistory', []);
      setProp('metricNames', []);
      setProp('plugins', []);
    });
};

const controlsMap: Record<string, Function> = {
  attic: AtticControls,
  conduit: ConduitControls,
  visuals: VisualsControls,
  clacks: ClacksControls,
  // concierge: list hooks?
  guestlist: GuestlistControls,
  // polaris: show current record IP? Needs conduit API
  monitor: MonitorControls,
};

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement} Fabricate component.
 */
const AppControls = ({ app }: { app: string }) => {
  const Controls = controlsMap[app] || (() => fabricate('div'));
  return Controls();
};

export default AppControls;

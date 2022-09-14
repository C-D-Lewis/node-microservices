/* global Theme ClacksService ConduitService */

const buttonStyle = {
  borderRadius: 0,
  margin: 0,
  minWidth: '50px',
};

/**
 * Empty component.
 *
 * @returns {HTMLElement}
 */
const Empty = () => fabricate('div');

/**
 * ControlRow component.
 *
 * @returns {HTMLElement}
 */
const ControlRow = () => fabricate.Row().withStyles({ padding: '0px 10px' });

/**
 * Control container component.
 *
 * @returns {HTMLElement}
 */
const ControlContainer = () => fabricate.Column()
  .withStyles({ backgroundColor: Theme.colors.AppControls.background });

/**
 * AtticControls component.
 *
 * @returns {HTMLElement}
 */
const AtticControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fabricate.updateState('atticData', ({ atticData }) => ({ ...atticData, [k]: v }));

  return ControlContainer()
    .withChildren([
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'App name' })
            .withStyles({ width: '40%' })
            .watchState((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((el, value) => setProp('app', value)),
          fabricate('TextBox', { placeholder: 'Key' })
            .withStyles({ width: '60%' })
            .watchState((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((el, value) => setProp('key', value)),
        ]),
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Value' })
            .watchState((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('value', value)),
        ]),
      fabricate.Row()
        .withChildren([
          fabricate('TextButton')
            .setText('Get')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick(async (el, state) => {
              const { atticData } = state;
              const { app, key } = atticData;
              const res = await ConduitService.sendPacket(state, { to: 'attic', topic: 'get', message: { app, key } });
              setProp('value', JSON.stringify(res.message.value));
            }),
          fabricate('TextButton')
            .setText('Set')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { atticData } = state;
              const { app, key, value } = atticData;
              ConduitService.sendPacket(state, { to: 'attic', topic: 'set', message: { app, key, value } });
            }),
          fabricate('TextButton')
            .setText('List Apps')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              ConduitService.sendPacket(state, { to: 'attic', topic: 'listApps', message: {} });
            }),
        ]),
    ]);
};

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement}
 */
const ConduitControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fabricate.updateState('conduitData', ({ conduitData }) => ({ ...conduitData, [k]: v }));

  return ControlContainer()
    .withChildren([
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'App name' })
            .watchState((el, { conduitData }) => el.setText(conduitData.app))
            .withStyles({ width: '40%' })
            .onChange((el, value) => setProp('app', value)),
          fabricate('TextBox', { placeholder: 'Topic' })
            .watchState((el, { conduitData }) => el.setText(conduitData.topic))
            .withStyles({ width: '60%' })
            .onChange((el, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Message (JSON)' })
            .watchState((el, { conduitData }) => el.setText(conduitData.message))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('message', value)),
        ]),
      fabricate.Row()
        .withChildren([
          fabricate('TextButton')
            .setText('Send')
            .withStyles({ ...buttonStyle, width: '100%' })
            .onClick((el, state) => {
              const { conduitData } = state;
              const { app: to, topic, message } = conduitData;
              ConduitService.sendPacket(state, { to, topic, message: JSON.parse(message) });
            }),
        ]),
    ]);
};

/**
 * ConduitControls component.
 *
 * @returns {HTMLElement}
 */
const VisualsControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fabricate.updateState('visualsData', ({ visualsData }) => ({ ...visualsData, [k]: v }));

  return ControlContainer()
    .withChildren([
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Red' })
            .watchState((el, { visualsData: { red } }) => el.setText(red))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('red', parseInt(value, 10))),
          fabricate('TextBox', { placeholder: 'Green' })
            .watchState((el, { visualsData: { green } }) => el.setText(green))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('green', parseInt(value, 10))),
          fabricate('TextBox', { placeholder: 'Blue' })
            .watchState((el, { visualsData: { blue } }) => el.setText(blue))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Text' })
            .watchState((el, { visualsData: { text } }) => el.setText(text))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('text', value)),
        ]),
      fabricate.Row()
        .withChildren([
          fabricate('TextButton')
            .setText('All')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { red, green, blue } = visualsData;
              const message = { all: [red, green, blue] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'setAll', message });
            }),
          fabricate('TextButton')
            .setText('Pixel')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'setPixel', message });
            }),
          fabricate('TextButton')
            .setText('Blink')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const {
                index, red, green, blue,
              } = visualsData;
              const message = { [index]: [red, green, blue] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'blink', message });
            }),
          fabricate('TextButton')
            .setText('Text')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { text } = visualsData;
              const message = { lines: [text] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'setText', message });
            }),
          fabricate('TextButton')
            .setText('State')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => ConduitService.sendPacket(state, { to: 'visuals', topic: 'state' })),
        ]),
    ]);
};

/**
 * GuestlistControls component.
 *
 * @returns {HTMLElement}
 */
const GuestlistControls = () => {
  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fabricate.updateState('guestlistData', ({ guestlistData }) => ({ ...guestlistData, [k]: v }));

  return ControlContainer()
    .withChildren([
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Name' })
            .watchState((el, { guestlistData: { name } }) => el.setText(name))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('name', value)),
          fabricate('TextBox', { placeholder: 'Apps' })
            .watchState((el, { guestlistData: { apps } }) => el.setText(apps))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('apps', value)),
          fabricate('TextBox', { placeholder: 'Topics' })
            .watchState((el, { guestlistData: { topics } }) => el.setText(topics))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('topics', value)),
        ]),
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Admin password' })
            .watchState((el, { guestlistData: { adminPassword } }) => el.setText(adminPassword))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('adminPassword', value)),
        ]),
      fabricate.Row()
        .withChildren([
          fabricate('TextButton')
            .setText('List Users')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => ConduitService.sendPacket(state, { to: 'guestlist', topic: 'getAll' })),
          fabricate('TextButton')
            .setText('Create User')
            .withStyles({ ...buttonStyle, width: '33%' })
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
              ConduitService.sendPacket(state, { to: 'guestlist', topic: 'create', message });
            }),
          fabricate('TextButton')
            .setText('Delete User')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { guestlistData } = state;
              const {
                name, adminPassword,
              } = guestlistData;
              const message = {
                name,
                adminPassword,
              };
              ConduitService.sendPacket(state, { to: 'guestlist', topic: 'delete', message });
            }),
        ]),
    ]);
};

/**
 * ClacksControls component.
 *
 * @returns {HTMLElement}
 */
const ClacksControls = () => {
  // list devices, most recent messages, and send messages

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fabricate.updateState('clacksData', ({ clacksData }) => ({ ...clacksData, [k]: v }));

  return ControlContainer()
    .withChildren([
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Topic' })
            .watchState((el, { clacksData: { topic } }) => el.setText(topic))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .withChildren([
          fabricate('TextBox', { placeholder: 'Message' })
            .watchState((el, { clacksData: { message } }) => el.setText(message))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('message', value))
            .then((el) => {
              // Default value
              el.value = '{}';
            }),
        ]),
      fabricate.Row()
        .withChildren([
          fabricate('TextButton')
            .setText('Send')
            .withStyles({ ...buttonStyle, width: '100%', backgroundColor: Theme.colors.darkGrey })
            .onClick((el, { clacksData }) => {
              const { topic, message } = clacksData;
              ClacksService.sendMessage(topic, message);
            })
            .watchState((el, { clacksData: { connected } }) => el.addStyles({
              backgroundColor: connected ? Theme.colors.primary : Theme.colors.darkGrey,
            })),
        ]),
    ])
    .then((el, { clacksData, ip }) => {
      // Try and connect if not connected
      if (clacksData.connected) ClacksService.disconnect();
      setTimeout(() => ClacksService.connect(ip), 500);
    });
};

const controlsMap = {
  attic: AtticControls,
  conduit: ConduitControls,
  visuals: VisualsControls,
  clacks: ClacksControls,
  // concierge: list hooks?
  guestlist: GuestlistControls,
  // polaris: show current record IP? Needs conduit API
};

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
fabricate.declare('AppControls', ({ app }) => {
  const Controls = controlsMap[app] || Empty;
  return Controls();
});

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
const ControlRow = () => fabricate('Row').setStyles({ padding: '0px 10px' });

/**
 * Control container component.
 *
 * @returns {HTMLElement}
 */
const ControlContainer = () => fabricate('Column')
  .setStyles({ backgroundColor: Theme.colors.AppControls.background });

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
  const setProp = (k, v) => fabricate.update('atticData', ({ atticData }) => ({ ...atticData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'App name' })
            .setStyles({ width: '40%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((el, state, value) => setProp('app', value)),
          fabricate('TextBox', { placeholder: 'Key' })
            .setStyles({ width: '60%' })
            .onUpdate((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((el, state, value) => setProp('key', value)),
        ]),
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Value' })
            .onUpdate((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('value', value)),
        ]),
      fabricate('Row')
        .setChildren([
          fabricate('TextButton')
            .setText('Get')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick(async (el, state) => {
              const { atticData } = state;
              const { app, key } = atticData;
              const res = await ConduitService.sendPacket(state, { to: 'attic', topic: 'get', message: { app, key } });
              setProp('value', JSON.stringify(res.message.value));
            }),
          fabricate('TextButton')
            .setText('Set')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => {
              const { atticData } = state;
              const { app, key, value } = atticData;
              ConduitService.sendPacket(state, { to: 'attic', topic: 'set', message: { app, key, value } });
            }),
          fabricate('TextButton')
            .setText('List Apps')
            .setStyles({ ...buttonStyle, width: '33%' })
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
  const setProp = (k, v) => fabricate.update('conduitData', ({ conduitData }) => ({ ...conduitData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'App name' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.app))
            .setStyles({ width: '40%' })
            .onChange((el, state, value) => setProp('app', value)),
          fabricate('TextBox', { placeholder: 'Topic' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.topic))
            .setStyles({ width: '60%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Message (JSON)' })
            .onUpdate((el, { conduitData }) => el.setText(conduitData.message))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value)),
        ]),
      fabricate('Row')
        .setChildren([
          fabricate('TextButton')
            .setText('Send')
            .setStyles({ ...buttonStyle, width: '100%' })
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
  const setProp = (k, v) => fabricate.update('visualsData', ({ visualsData }) => ({ ...visualsData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Red' })
            .onUpdate((el, { visualsData: { red } }) => el.setText(red))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('red', parseInt(value, 10))),
          fabricate('TextBox', { placeholder: 'Green' })
            .onUpdate((el, { visualsData: { green } }) => el.setText(green))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('green', parseInt(value, 10))),
          fabricate('TextBox', { placeholder: 'Blue' })
            .onUpdate((el, { visualsData: { blue } }) => el.setText(blue))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Text' })
            .onUpdate((el, { visualsData: { text } }) => el.setText(text))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('text', value)),
        ]),
      fabricate('Row')
        .setChildren([
          fabricate('TextButton')
            .setText('All')
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { red, green, blue } = visualsData;
              const message = { all: [red, green, blue] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'setAll', message });
            }),
          fabricate('TextButton')
            .setText('Pixel')
            .setStyles({ ...buttonStyle, width: '20%' })
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
            .setStyles({ ...buttonStyle, width: '20%' })
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
            .setStyles({ ...buttonStyle, width: '20%' })
            .onClick((el, state) => {
              const { visualsData } = state;
              const { text } = visualsData;
              const message = { lines: [text] };
              ConduitService.sendPacket(state, { to: 'visuals', topic: 'setText', message });
            }),
          fabricate('TextButton')
            .setText('State')
            .setStyles({ ...buttonStyle, width: '20%' })
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
  const setProp = (k, v) => fabricate.update('guestlistData', ({ guestlistData }) => ({ ...guestlistData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Name' })
            .onUpdate((el, { guestlistData: { name } }) => el.setText(name))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('name', value)),
          fabricate('TextBox', { placeholder: 'Apps' })
            .onUpdate((el, { guestlistData: { apps } }) => el.setText(apps))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('apps', value)),
          fabricate('TextBox', { placeholder: 'Topics' })
            .onUpdate((el, { guestlistData: { topics } }) => el.setText(topics))
            .setStyles({ width: '30%' })
            .onChange((el, state, value) => setProp('topics', value)),
        ]),
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Admin password' })
            .onUpdate((el, { guestlistData: { adminPassword } }) => el.setText(adminPassword))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('adminPassword', value)),
        ]),
      fabricate('Row')
        .setChildren([
          fabricate('TextButton')
            .setText('List Users')
            .setStyles({ ...buttonStyle, width: '33%' })
            .onClick((el, state) => ConduitService.sendPacket(state, { to: 'guestlist', topic: 'getAll' })),
          fabricate('TextButton')
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
              ConduitService.sendPacket(state, { to: 'guestlist', topic: 'create', message });
            }),
          fabricate('TextButton')
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
  const setProp = (k, v) => fabricate.update('clacksData', ({ clacksData }) => ({ ...clacksData, [k]: v }));

  return ControlContainer()
    .setChildren([
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Topic' })
            .onUpdate((el, { clacksData: { topic } }) => el.setText(topic))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .setChildren([
          fabricate('TextBox', { placeholder: 'Message' })
            .onUpdate((el, { clacksData: { message } }) => el.setText(message))
            .setStyles({ width: '100%' })
            .onChange((el, state, value) => setProp('message', value))
            .onCreate((el) => {
              // Default value
              el.value = '{}';
            }),
        ]),
      fabricate('Row')
        .setChildren([
          fabricate('TextButton')
            .setText('Send')
            .setStyles({ ...buttonStyle, width: '100%', backgroundColor: Theme.colors.darkGrey })
            .onClick((el, { clacksData }) => {
              const { topic, message } = clacksData;
              ClacksService.sendMessage(topic, message);
            })
            .onUpdate((el, { clacksData: { connected } }) => el.setStyles({
              backgroundColor: connected ? Theme.colors.primary : Theme.colors.darkGrey,
            })),
        ]),
    ])
    .onCreate((el, { clacksData, ip }) => {
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
  // monitor:
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

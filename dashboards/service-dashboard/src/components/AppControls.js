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
  const setProp = (k, v) => fabricate.updateState('atticData', () => ({ ...fabricate.getState('atticData'), [k]: v }));

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
            .onClick(async () => {
              const { app, key } = fabricate.getState('atticData');
              const message = { app, key };
              const res = await ConduitService.sendPacket({ to: 'attic', topic: 'get', message });
              setProp('value', JSON.stringify(res.message.value));
            }),
          fabricate('TextButton')
            .setText('Set')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick(() => {
              const { app, key, value } = fabricate.getState('atticData');
              const message = { app, key, value };
              ConduitService.sendPacket({ to: 'attic', topic: 'set', message });
            }),
          fabricate('TextButton')
            .setText('List Apps')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick(() => {
              ConduitService.sendPacket({ to: 'attic', topic: 'listApps', message: {} });
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
  const setProp = (k, v) => fabricate.updateState('conduitData', () => ({ ...fabricate.getState('conduitData'), [k]: v }));

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
            .onClick(() => {
              const { app: to, topic, message } = fabricate.getState('conduitData');
              ConduitService.sendPacket({ to, topic, message: JSON.parse(message) });
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
  const setProp = (k, v) => fabricate.updateState('visualsData', () => ({ ...fabricate.getState('visualsData'), [k]: v }));

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
            .onClick(() => {
              const { red, green, blue } = fabricate.getState('visualsData');
              const message = { all: [red, green, blue] };
              ConduitService.sendPacket({ to: 'visuals', topic: 'setAll', message });
            }),
          fabricate('TextButton')
            .setText('Pixel')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick(() => {
              const {
                index, red, green, blue,
              } = fabricate.getState('visualsData');
              const message = { [index]: [red, green, blue] };
              ConduitService.sendPacket({ to: 'visuals', topic: 'setPixel', message });
            }),
          fabricate('TextButton')
            .setText('Blink')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick(() => {
              const {
                index, red, green, blue,
              } = fabricate.getState('visualsData');
              const message = { [index]: [red, green, blue] };
              ConduitService.sendPacket({ to: 'visuals', topic: 'blink', message });
            }),
          fabricate('TextButton')
            .setText('Text')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick(() => {
              const { text } = fabricate.getState('visualsData');
              const message = { lines: [text] };
              ConduitService.sendPacket({ to: 'visuals', topic: 'setText', message });
            }),
          fabricate('TextButton')
            .setText('State')
            .withStyles({ ...buttonStyle, width: '20%' })
            .onClick(() => ConduitService.sendPacket({ to: 'visuals', topic: 'state' })),
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
  const setProp = (k, v) => fabricate.updateState('guestlistData', () => ({ ...fabricate.getState('guestlistData'), [k]: v }));

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
            .onClick(() => ConduitService.sendPacket({ to: 'guestlist', topic: 'getAll' })),
          fabricate('TextButton')
            .setText('Create User')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick(() => {
              const {
                name, apps, topics, adminPassword,
              } = fabricate.getState('guestlistData');
              const message = {
                name,
                apps: apps.split(','),
                topics: topics.split(','),
                adminPassword,
              };
              ConduitService.sendPacket({ to: 'guestlist', topic: 'create', message });
            }),
          fabricate('TextButton')
            .setText('Delete User')
            .withStyles({ ...buttonStyle, width: '33%' })
            .onClick(() => {
              const {
                name, adminPassword,
              } = fabricate.getState('guestlistData');
              const message = {
                name,
                adminPassword,
              };
              ConduitService.sendPacket({ to: 'guestlist', topic: 'delete', message });
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
  const setProp = (k, v) => fabricate.updateState('clacksData', () => ({ ...fabricate.getState('clacksData'), [k]: v }));

  // Try and connect if not connected
  const clacksData = fabricate.getState('clacksData');
  if (clacksData.connected) ClacksService.disconnect();
  setTimeout(ClacksService.connect, 500);

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
            .onClick(() => {
              const { topic, message } = fabricate.getState('clacksData');
              ClacksService.sendMessage(topic, message);
            })
            .watchState((el, { clacksData: { connected } }) => el.addStyles({
              backgroundColor: connected ? Theme.colors.primary : Theme.colors.darkGrey,
            })),
        ]),
    ]);
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

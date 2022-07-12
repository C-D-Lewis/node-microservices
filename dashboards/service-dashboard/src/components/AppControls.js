/* global sendPacket TextButton TextBox */

/**
 * Empty component.
 *
 * @returns {HTMLElement}
 */
const Empty = () => fab('div');

/**
 * ControlRow component.
 *
 * @returns {HTMLElement}
 */
const ControlRow = () => fab.Row().withStyles({ padding: '0px 10px' });

/**
 * AtticControls component.
 *
 * @returns {HTMLElement}
 */
const AtticControls = () => {
  const buttonStyle = {
    width: '33%',
    borderRadius: 0,
    margin: 0,
  };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fab.updateState('atticData', () => ({ ...fab.getState('atticData'), [k]: v }));

  return fab.Column()
    .withStyles({ backgroundColor: 'white' })
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .withStyles({ width: '40%' })
            .watchState((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((el, value) => setProp('app', value)),
          TextBox({ placeholder: 'Key' })
            .withStyles({ width: '60%' })
            .watchState((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((el, value) => setProp('key', value)),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'Value' })
            .watchState((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('value', value)),
        ]),
      fab.Row()
        .withChildren([
          TextButton()
            .setText('Get')
            .withStyles(buttonStyle)
            .onClick(async () => {
              const { app, key } = fab.getState('atticData');
              const message = { app, key };
              const res = await sendPacket({ to: 'attic', topic: 'get', message });
              setProp('value', JSON.stringify(res.message.value));
            }),
          TextButton()
            .setText('Set')
            .withStyles(buttonStyle)
            .onClick(() => {
              const { app, key, value } = fab.getState('atticData');
              const message = { app, key, value };
              sendPacket({ to: 'attic', topic: 'set', message });
            }),
          TextButton()
            .setText('List Apps')
            .withStyles(buttonStyle)
            .onClick(() => {
              sendPacket({ to: 'attic', topic: 'listApps', message: {} });
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
  const buttonStyle = { borderRadius: 0, margin: 0 };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fab.updateState('conduitData', () => ({ ...fab.getState('conduitData'), [k]: v }));

  return fab.Column()
    .withStyles({ backgroundColor: 'white' })
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .watchState((el, { conduitData }) => el.setText(conduitData.app))
            .withStyles({ width: '40%' })
            .onChange((el, value) => setProp('app', value)),
          TextBox({ placeholder: 'Topic' })
            .watchState((el, { conduitData }) => el.setText(conduitData.topic))
            .withStyles({ width: '60%' })
            .onChange((el, value) => setProp('topic', value)),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'Message (JSON)' })
            .watchState((el, { conduitData }) => el.setText(conduitData.message))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('message', value)),
        ]),
      fab.Row()
        .withChildren([
          TextButton()
            .setText('Send')
            .withStyles({ width: '100%', ...buttonStyle })
            .onClick(() => {
              const { app: to, topic, message } = fab.getState('conduitData');
              sendPacket({ to, topic, message: JSON.parse(message) });
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
  const buttonStyle = {
    width: '20%',
    borderRadius: 0,
    margin: 0,
    minWidth: '50px',
  };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} k - Prop key.
   * @param {*} v - Prop value.
   */
  const setProp = (k, v) => fab.updateState('visualsData', () => ({ ...fab.getState('visualsData'), [k]: v }));

  return fab.Column()
    .withStyles({ backgroundColor: 'white' })
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'red' })
            .watchState((el, { visualsData: { red } }) => el.setText(red))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('red', parseInt(value, 10))),
          TextBox({ placeholder: 'green' })
            .watchState((el, { visualsData: { green } }) => el.setText(green))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('green', parseInt(value, 10))),
          TextBox({ placeholder: 'blue' })
            .watchState((el, { visualsData: { blue } }) => el.setText(blue))
            .withStyles({ width: '30%' })
            .onChange((el, value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'text' })
            .watchState((el, { visualsData: { text } }) => el.setText(text))
            .withStyles({ width: '100%' })
            .onChange((el, value) => setProp('text', value)),
        ]),
      fab.Row()
        .withChildren([
          TextButton()
            .setText('All')
            .withStyles(buttonStyle)
            .onClick(() => {
              const { red, green, blue } = fab.getState('visualsData');
              const message = { all: [red, green, blue] };
              sendPacket({ to: 'visuals', topic: 'setAll', message });
            }),
          TextButton()
            .setText('Pixel')
            .withStyles(buttonStyle)
            .onClick(() => {
              const {
                index, red, green, blue,
              } = fab.getState('visualsData');
              const message = { [index]: [red, green, blue] };
              sendPacket({ to: 'visuals', topic: 'setPixel', message });
            }),
          TextButton()
            .setText('Blink')
            .withStyles(buttonStyle)
            .onClick(() => {
              const {
                index, red, green, blue,
              } = fab.getState('visualsData');
              const message = { [index]: [red, green, blue] };
              sendPacket({ to: 'visuals', topic: 'blink', message });
            }),
          TextButton()
            .setText('Text')
            .withStyles(buttonStyle)
            .onClick(() => {
              const { text } = fab.getState('visualsData');
              const message = { lines: [text] };
              sendPacket({ to: 'visuals', topic: 'setText', message });
            }),
          TextButton()
            .setText('State')
            .withStyles(buttonStyle)
            .onClick(() => sendPacket({ to: 'visuals', topic: 'state' })),
        ]),
    ]);
};

const controlsMap = {
  attic: AtticControls,
  conduit: ConduitControls,
  visuals: VisualsControls,
};

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppControls = ({ app }) => {
  const Controls = controlsMap[app] || Empty;
  return Controls();
};

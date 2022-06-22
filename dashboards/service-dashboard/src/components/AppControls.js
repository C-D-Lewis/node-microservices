/* global sendPacket TextButton TextBox */

/**
 * NoControls component.
 *
 * @returns {HTMLElement}
 */
const NoControls = () => fab('div');

/**
 * ControlRow component.
 *
 * @returns {HTMLElement}
 */
const ControlRow = () => fab.Row()
  .withStyles({
    marginTop: '10px',
    justifyContent: 'initial',
    padding: '0px 10px',
  });

/**
 * ButtonBar component.
 *
 * @returns {HTMLElement}
 */
const ButtonBar = () => fab.Row()
  .withStyles({
    marginTop: '10px',
    justifyContent: 'initial',
  });

/**
 * AtticControls component.
 *
 * @returns {HTMLElement}
 */
const AtticControls = () => {
  const buttonStyle = { width: '50%' };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} key - Prop key.
   * @param {*} value - Prop value.
   */
  const setProp = (key, value) => {
    const atticData = fab.getState('atticData');
    fab.updateState('atticData', () => ({
      ...atticData,
      [key]: value,
    }));
  };

  return fab.Column()
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .withStyles({ width: '40%' })
            .watchState((el, { atticData }) => el.setText(atticData.app), ['atticData'])
            .onChange((value) => setProp('app', value)),
          TextBox({ placeholder: 'Key' })
            .withStyles({ width: '60%' })
            .watchState((el, { atticData }) => el.setText(atticData.key), ['atticData'])
            .onChange((value) => setProp('key', value)),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: '{}' })
            .watchState((el, { atticData }) => el.setText(atticData.value), ['atticData'])
            .withStyles({ width: '100%' })
            .onChange((value) => setProp('value', value)),
        ]),
      ButtonBar()
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
   * @param {string} key - Prop key.
   * @param {*} value - Prop value.
   */
  const setProp = (key, value) => {
    const conduitData = fab.getState('conduitData');
    fab.updateState('conduitData', () => ({
      ...conduitData,
      [key]: value,
    }));
  };

  return fab.Column()
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .watchState((el, { conduitData }) => el.setText(conduitData.app))
            .withStyles({ width: '40%' })
            .onChange((value) => setProp('app', value)),
          TextBox({ placeholder: 'Topic' })
            .watchState((el, { conduitData }) => el.setText(conduitData.topic))
            .withStyles({ width: '60%' })
            .onChange((value) => setProp('topic', value)),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: '{}' })
            .watchState((el, { conduitData }) => el.setText(conduitData.message))
            .withStyles({ width: '100%' })
            .onChange((value) => setProp('message', value)),
        ]),
      ButtonBar()
        .withChildren([
          TextButton()
            .setText('Send')
            .withStyles({ width: '100%', borderRadius: '0px 0px 3px 3px' })
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
  const buttonStyle = { width: '20%' };

  /**
   * Set a property within the app controls state.
   *
   * @param {string} key - Prop key.
   * @param {*} value - Prop value.
   */
  const setProp = (key, value) => {
    const visualsData = fab.getState('visualsData');
    fab.updateState('visualsData', () => ({
      ...visualsData,
      [key]: value,
    }));
  };

  return fab.Column()
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'red' })
            .watchState((el, { visualsData }) => el.setText(visualsData.red))
            .withStyles({ width: '30%' })
            .onChange((value) => setProp('red', parseInt(value, 10))),
          TextBox({ placeholder: 'green' })
            .watchState((el, { visualsData }) => el.setText(visualsData.green))
            .withStyles({ width: '30%' })
            .onChange((value) => setProp('green', parseInt(value, 10))),
          TextBox({ placeholder: 'blue' })
            .watchState((el, { visualsData }) => el.setText(visualsData.blue))
            .withStyles({ width: '30%' })
            .onChange((value) => setProp('blue', parseInt(value, 10))),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'text' })
            .watchState((el, { visualsData }) => el.setText(visualsData.text))
            .withStyles({ width: '100%' })
            .onChange((value) => setProp('text', value)),
        ]),
      ButtonBar()
        .withChildren([
          TextButton()
            .setText('All')
            .withStyles({ width: '20%' })
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
            .withStyles({ width: '20%' })
            .onClick(() => sendPacket({ to: 'visuals', topic: 'state' })),
        ]),
    ]);
};

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppControls = ({ data }) => {
  const controlsMap = {
    attic: AtticControls,
    conduit: ConduitControls,
    visuals: VisualsControls,
  };
  const Controls = controlsMap[data.app] || NoControls;

  return Controls();
};

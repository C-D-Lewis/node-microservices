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
  const atticState = fab.manageState('AtticControls', 'atticData', {});

  const buttonStyle = { width: '50%' };

  const setProp = (key, value) => atticState.set({ ...atticState.get(), [key]: value });

  return fab.Column()
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .withStyles({ width: '40%' })
            .setText(atticData.app)
            .onChange(value => setProp('app', value)),
          TextBox({ placeholder: 'Key' })
            .withStyles({ width: '60%' })
            .setText(atticData.key)
            .onChange(value => setProp('key', value)),
        ]),
      ControlRow()
        .withChildren([
          TextBox({ placeholder: '{}' })
            .setText(atticData.value)
            .withStyles({ width: '100%' })
            .onChange(value => setProp('value', value)),
        ]),
      ButtonBar()
        .withChildren([
          TextButton()
            .setText('Get')
            .withStyles(buttonStyle)
            .onClick(async () => {
              const { app, key } = atticData;
              const message = { app, key };
              const res = await sendPacket({ to: 'attic', topic: 'get', message });
              setProp('value', JSON.stringify(res.message.value));
            }),
          TextButton()
            .setText('Set')
            .withStyle(buttonStyle)
            .onClick(() => {
              const { app, key, value } = atticData;
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
  const conduitState = fab.manageState('AtticControls', 'conduitData', {});

  const setProp = (key, value) => conduitState.set({ ...conduitState.get(), [key]: value });

  return fab.Column()
    .withChildren([
      ControlRow()
        .withChildren([
          TextBox({ placeholder: 'App name' })
            .setText(conduitData.app)
            .withStyles({ width: '40%' })
            .onChange(value => setProp('app', value)),
          TextBox({ placeholder: 'Topic' })
            .setText(conduitData.topic)
            .withStyles({ width: '60%' })
            .onChange(value => setProp('topic', value)),
        ]),

      <ControlRow>
        <TextBox value={conduitData.message}
          placeholder="{}"
          style={{ width: "100%" }}
          onChange={value => setProp('message', value)}/>
      </ControlRow>
      <ButtonBar>
        <TextButton label="Send"
          style={{ width: '100%', borderRadius: '0px 0px 3px 3px' }}
          onClick={() => {
            const { app: to, topic, message } = conduitData;
            sendPacket({ to, topic, message: JSON.parse(message) });
          }}/>
      </ButtonBar>
    </ControlColumn>
  );
};

const VisualsControls = () => {
  const dispatch = useDispatch();
  const visualsData = useSelector(state => state.visualsData);

  const buttonStyle = { width: '20%' };

  const setProp = (key, value) => dispatch(setVisualsData({ ...visualsData, [key]: value }));

  return (
    <ControlColumn>
      <ControlRow>
        {/* <TextBox value={visualsData.index} */}
        {/*   placeholder="index" */}
        {/*   style={{ width: "10%" }} */}
        {/*   onChange={value => setProp('index', parseInt(value))}/> */}
        <TextBox value={visualsData.red}
          placeholder="red"
          style={{ width: "30%" }}
          onChange={value => setProp('red', parseInt(value))}/>
        <TextBox value={visualsData.green}
          placeholder="green"
          style={{ width: "30%" }}
          onChange={value => setProp('green', parseInt(value))}/>
        <TextBox value={visualsData.blue}
          placeholder="blue"
          style={{ width: "30%" }}
          onChange={value => setProp('blue', parseInt(value))}/>
      </ControlRow>
      <ControlRow>
        <TextBox value={visualsData.text}
          placeholder="text"
          style={{ width: "100%" }}
          onChange={value => setProp('text', value)}/>
      </ControlRow>
      <ButtonBar>
        <TextButton label="All"
          style={{ width: '20%' }}
          onClick={() => {
            const { red, green, blue } = visualsData;
            const message = { all: [red, green, blue] };
            sendPacket({ to: 'visuals', topic: 'setAll', message });
          }}/>
        <TextButton label="Pixel"
          style={buttonStyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            const message = { [index]: [red, green, blue] };
            sendPacket({ to: 'visuals', topic: 'setPixel', message });
          }}/>
        <TextButton label="Blink"
          style={buttonStyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            const message = { [index]: [red, green, blue] };
            sendPacket({ to: 'visuals', topic: 'blink', message });
          }}/>
        <TextButton label="Text"
          style={buttonStyle}
          onClick={() => {
            const { text } = visualsData;
            const message = { lines: [text] }
            sendPacket({ to: 'visuals', topic: 'setText', message });
          }}/>
        <TextButton label="State"
          style={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => sendPacket({ to: 'visuals', topic: 'state' })}/>
      </ButtonBar>
    </ControlColumn>
  );
};

const AppControls = ({ data }) => {
  const controlsMap = {
    attic: AtticControls,
    conduit: ConduitControls,
    visuals: VisualsControls,
  };
  const Controls = controlsMap[data.app] || NoControls;

  return <Controls />;
};

export default AppControls;

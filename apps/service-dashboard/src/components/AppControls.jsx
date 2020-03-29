import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAtticData, setConduitData, setAmbienceData, setVisualsData } from '../actions';
import { Colors, Fonts } from '../theme';
import IconButton from './IconButton';
import TextBox from './TextBox';
import TextButton from './TextButton';

const NoControls = () => <div/>;

const Row = ({ children, align }) =>
  <div style={{
    display: 'flex',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
    padding: '0px 10px',
  }}>
    {children}
  </div>;

const ButtonBar = ({ children, align }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
  }}>
    {children}
  </div>;

const Column = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }}>
    {children}
  </div>;

const AtticControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const atticData = useSelector(state => state.atticData);

  const getButtonStyle = { width: '50%', borderBottomLeftRadius: 3 };
  const setButtonStyle = { width: '50%', borderBottomRightRadius: 3 };

  const setProp = (key, value) => dispatch(setAtticData({ ...atticData, [key]: value }));

  return (
    <Column>
      <Row>
        <TextBox value={atticData.app}
          placeholder="App name"
          style={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={atticData.key}
          placeholder="Key"
          style={{ width: '60%' }}
          onChange={value => setProp('key', value)}/>
      </Row>
      <Row>
        <TextBox value={atticData.value}
          placeholder="{}"
          style={{ width: "100%" }}
          onChange={value => setProp('value', value)}/>
      </Row>
      <ButtonBar>
        <TextButton label="Get"
          style={getButtonStyle}
          onClick={async () => {
            const { app, key } = atticData;
            const message = { app, key };
            const res = await conduitSend({ to: 'attic', topic: 'get', message });
            setProp('value', JSON.stringify(res.message.value));
          }}/>
        <TextButton label="Set"
          style={setButtonStyle}
          onClick={() => {
            const { app, key, value } = atticData;
            const message = { app, key, value };
            conduitSend({ to: 'attic', topic: 'set', message });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const ConduitControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const conduitData = useSelector(state => state.conduitData);

  const setProp = (key, value) => dispatch(setConduitData({ ...conduitData, [key]: value }));

  return (
    <Column>
      <Row>
        <TextBox value={conduitData.app}
          placeholder="App name"
          style={{ width: '40%' }}
          onChange={value => setProp('app', value)}/>
        <TextBox value={conduitData.topic}
          placeholder="Topic"
          style={{ width: '60%' }}
          onChange={value => setProp('topic', value)}/>
      </Row>
      <Row>
        <TextBox value={conduitData.message}
          placeholder="{}"
          style={{ width: "100%" }}
          onChange={value => setProp('message', value)}/>
      </Row>
      <ButtonBar>
        <TextButton label="Send"
          style={{ width: '100%', borderRadius: '0px 0px 3px 3px' }}
          onClick={() => {
            const { app: to, topic, message } = conduitData;
            conduitSend({ to, topic, message: JSON.parse(message) });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const AmbienceControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const ambienceData = useSelector(state => state.ambienceData);

  const buttonStyle = { width: '20%' };

  const setProp = (key, value) => dispatch(setAmbienceData({ ...ambienceData, [key]: value }));

  return (
    <Column>
      <Row>
        <TextBox value={ambienceData.red}
          placeholder="red"
          style={{ width: "33%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={ambienceData.green}
          placeholder="green"
          style={{ width: "33%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={ambienceData.blue}
          placeholder="blue"
          style={{ width: "33%" }}
          onChange={value => setProp('blue', value)}/>
      </Row>
      <ButtonBar>
        <TextButton label="Off"
          style={{ width: '20%', borderBottomLeftRadius: 3 }}
          onClick={() => conduitSend({ to: 'ambience', topic: 'off' })}/>
        <TextButton label="Spotify"
          style={buttonStyle}
          onClick={() => conduitSend({ to: 'ambience', topic: 'spotify' })}/>
        <TextButton label="Demo"
          style={buttonStyle}
          onClick={() => conduitSend({ to: 'ambience', topic: 'demo' })}/>
        <TextButton label="Set"
          style={buttonStyle}
          onClick={() => {
            const { red, green, blue } = ambienceData;
            const message = { all: [parseInt(red), parseInt(green), parseInt(blue)] };
            conduitSend({ to: 'ambience', topic: 'set', message });
          }}/>
        <TextButton label="Fade"
          style={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = ambienceData;
            const message = { all: [parseInt(red), parseInt(green), parseInt(blue)] };
            conduitSend({ to: 'ambience', topic: 'fade', message });
          }}/>
      </ButtonBar>
    </Column>
  );
};

const VisualsControls = ({ conduitSend }) => {
  const dispatch = useDispatch();
  const visualsData = useSelector(state => state.visualsData);

  const buttonStyle = { width: '20%' };

  const setProp = (key, value) => dispatch(setVisualsData({ ...visualsData, [key]: value }));

  return (
    <Column>
      <Row>
        <TextBox value={visualsData.index}
          placeholder="index"
          style={{ width: "10%" }}
          onChange={value => setProp('index', value)}/>
        <TextBox value={visualsData.red}
          placeholder="red"
          style={{ width: "30%" }}
          onChange={value => setProp('red', value)}/>
        <TextBox value={visualsData.green}
          placeholder="green"
          style={{ width: "30%" }}
          onChange={value => setProp('green', value)}/>
        <TextBox value={visualsData.blue}
          placeholder="blue"
          style={{ width: "30%" }}
          onChange={value => setProp('blue', value)}/>
      </Row>
      <Row>
        <TextBox value={visualsData.text}
          placeholder="text"
          style={{ width: "100%" }}
          onChange={value => setProp('text', value)}/>
      </Row>
      <ButtonBar>
        <TextButton label="All"
          style={{ width: '20%', borderBottomLeftRadius: 3 }}
          onClick={() => {
            const { red, green, blue } = visualsData;
            const message = { all: [red, green, blue] };
            conduitSend({ to: 'visuals', topic: 'setAll', message });
          }}/>
        <TextButton label="Pixel"
          style={buttonStyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            const message = { [index]: [red, green, blue] };
            conduitSend({ to: 'visuals', topic: 'setPixel', message });
          }}/>
        <TextButton label="Blink"
          style={buttonStyle}
          onClick={() => {
            const { index, red, green, blue } = visualsData;
            const message = { [index]: [red, green, blue] };
            conduitSend({ to: 'visuals', topic: 'blink', message });
          }}/>
        <TextButton label="Text"
          style={buttonStyle}
          onClick={() => {
            const { text } = visualsData;
            const message = { lines: [text] }
            conduitSend({ to: 'visuals', topic: 'setText', message });
          }}/>
        <TextButton label="State"
          style={{ width: '20%', borderBottomRightRadius: 3 }}
          onClick={() => conduitSend({ to: 'visuals', topic: 'state' })}/>
      </ButtonBar>
    </Column>
  );
};

// FIXME - conduitSend should be done through a service, not a prop

const AppControls = ({ data, conduitSend }) => {
  const controlsMap = {
    attic: AtticControls,
    conduit: ConduitControls,
    ambience: AmbienceControls,
    visuals: VisualsControls,
  };
  const Controls = controlsMap[data.app] || NoControls;

  return <Controls conduitSend={conduitSend}/>;
};

export default AppControls;

import React from 'react';
import { Colors, Fonts } from '../util';
import IconButton from './IconButton';
import TextBox from './TextBox';
import TextButton from './TextButton';

const NoControls = () => <div/>;

const Bar = ({ children, align }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
  };

  return <div style={style}>{children}</div>;
};

const Column = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  return <div style={style}>{children}</div>;
};

const AtticControls = ({ state, setState, conduitSend }) => {
  const setAtticControlsProp = (key, value) => {
    const { atticControls } = state;
    atticControls[key] = value;
    setState({ atticControls });
  };
  const sendButtonRestyle = { width: '50%' };

  return (
    <Column>
      <Bar>
        <TextBox value={state.atticControls.app} placeholder="App name"
          restyle={{ width: '130px' }}
          onChange={value => setAtticControlsProp('app', value)}/>
        <TextBox value={state.atticControls.key} placeholder="Key"
          restyle={{ width: '188px' }}
          onChange={value => setAtticControlsProp('key', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.atticControls.value} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setAtticControlsProp('value', value)}/>
      </Bar>
      <Bar>
        <TextButton label="Get" restyle={sendButtonRestyle}
          onClick={() => {
            const { app, key } = state.atticControls;
            const message = { app, key };
            conduitSend({ to: 'attic', topic: 'get', message })
              .then(res => setAtticControlsProp('value', res.message.value));
          }}/>
        <TextButton label="Set" restyle={sendButtonRestyle}
          onClick={() => {
            const { app, key, value } = state.atticControls;
            const message = { app, key, value };
            conduitSend({ to: 'attic', topic: 'set', message });
          }}/>
      </Bar>
    </Column>
  );
};

const ConduitControls = ({ state, setState, conduitSend }) => {
  const setConduitControlsProp = (key, value) => {
    const { conduitControls } = state;
    conduitControls[key] = value;
    setState({ conduitControls });
  };

  return (
    <Column>
      <Bar>
        <TextBox value={state.conduitControls.app} placeholder="App name"
          restyle={{ width: '130px' }}
          onChange={value => setConduitControlsProp('app', value)}/>
        <TextBox value={state.conduitControls.topic} placeholder="Topic"
          restyle={{ width: '188px' }}
          onChange={value => setConduitControlsProp('topic', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.conduitControls.message} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setConduitControlsProp('message', value)}/>
      </Bar>
      <Bar>
        <TextButton label="Send" onClick={() => {
          const { app: to, topic, message } = state.conduitControls;
          conduitSend({ to, topic, message: JSON.parse(message) });
        }}/>
      </Bar>
    </Column>
  );
};

const BacklightServerControls = ({ state, setState, conduitSend }) => {
  const setBacklightServerControlsProp = (key, value) => {
    const { backlightServerControls } = state;
    backlightServerControls[key] = value;
    setState({ backlightServerControls });
  };

  return (
    <Column>
      <Bar>
        <TextBox value={state.backlightServerControls.red} placeholder="red"
          restyle={{ width: "33%" }}
          onChange={value => setBacklightServerControlsProp('red', value)}/>
        <TextBox value={state.backlightServerControls.green} placeholder="green"
          restyle={{ width: "33%" }}
          onChange={value => setBacklightServerControlsProp('green', value)}/>
        <TextBox value={state.backlightServerControls.blue} placeholder="blue"
          restyle={{ width: "33%" }}
          onChange={value => setBacklightServerControlsProp('blue', value)}/>
      </Bar>
      <Bar>
        <TextButton label="Off" restyle={{ width: '33%' }}
          onClick={() => conduitSend({ to: 'ambience', topic: 'off' })}/>
        <TextButton label="Spotify" restyle={{ width: '33%' }}
          onClick={() => conduitSend({ to: 'ambience', topic: 'spotify' })}/>
        <TextButton label="Demo" restyle={{ width: '33%' }}
          onClick={() => conduitSend({ to: 'ambience', topic: 'demo' })}/>
      </Bar>
      <Bar>
        <TextButton label="Set" restyle={{ width: '50%' }}
          onClick={() => {
            const { red, green, blue } = state.backlightServerControls;
            conduitSend({
              to: 'ambience',
              topic: 'set',
              message: { all: [red, green, blue] },
            });
          }}/>
        <TextButton label="Fade" restyle={{ width: '50%' }}
          onClick={() => {
            const { red, green, blue } = state.backlightServerControls;
            conduitSend({
              to: 'ambience',
              topic: 'fade',
              message: { all: [parseInt(red), parseInt(green), parseInt(blue)] },
            });
          }}/>
      </Bar>
    </Column>
  );
};

const Container = ({ children }) => {
  const style = {
    padding: '0px 10px',
  };

  return <div style={style}>{children}</div>;
}

const AppControls = ({ state, setState, data, conduitSend }) => {
  const controlsMap = {
    Attic: AtticControls,
    Conduit: ConduitControls,
    BacklightServer: BacklightServerControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return (
    <Container>
      <Controls data={data} state={state} setState={setState}
        conduitSend={conduitSend}/>
    </Container>
  );
};

export default AppControls;

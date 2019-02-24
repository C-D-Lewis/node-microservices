import React from 'react';
import { Colors, Fonts } from '../util';
import IconButton from './IconButton';
import TextBox from './TextBox';
import TextButton from './TextButton';

const NoControls = () => {
  const style = {
    fontFamily: Fonts.body,
    color: Colors.darkGrey,
    paddingTop: '5px',
  }

  return <div style={style}></div>;;
};

const Bar = ({ children, align }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
  };

  return <div style={style}>{children}</div>;
};

const Column = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
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

  const sendButtonRestyle = {
    backgroundColor: Colors.primary,
    color: 'white',
  };

  return (
    <Column>
      <Bar>
        <TextBox value={state.atticControls.app} placeholder="App name"
          restyle={{ width: '130px' }}
          onChange={value => setAtticControlsProp('app', value)}/>
        <TextBox value={state.atticControls.key} placeholder="Key"
          restyle={{ width: '177px' }}
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
            conduitSend({ to: 'Attic', topic: 'get', message });
          }}/>
        <TextButton label="Set" restyle={sendButtonRestyle}
          onClick={() => {
            const { app, key, value } = state.atticControls;
            const message = { app, key, value };
            conduitSend({ to: 'Attic', topic: 'set', message });
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

  const sendButtonRestyle = {
    backgroundColor: Colors.primary,
    color: 'white',
    width: '100%',
  };

  return (
    <Column>
      <Bar>
        <TextBox value={state.conduitControls.app} placeholder="App name"
          restyle={{ width: '130px' }}
          onChange={value => setConduitControlsProp('app', value)}/>
        <TextBox value={state.conduitControls.topic} placeholder="Topic"
          restyle={{ width: '177px' }}
          onChange={value => setConduitControlsProp('topic', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.conduitControls.message} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setConduitControlsProp('message', value)}/>
      </Bar>
      <Bar>
        <TextButton label="Send" restyle={sendButtonRestyle}
          onClick={() => {
            const { app: to, topic, message } = state.conduitControls;
            conduitSend({ to, topic, message: JSON.parse(message) });
          }}/>
      </Bar>
    </Column>
  );
};

const BacklightServerControls = ({ conduitSend }) => (
  <Column>
    <Bar>
      <IconButton iconSrc="../../assets/off.png"
        onClick={() => conduitSend({ to: 'BacklightServer', topic: 'off' })}/>
      <IconButton iconSrc="../../assets/spotify.png"
        onClick={() => conduitSend({ to: 'BacklightServer', topic: 'spotify' })}/>
    </Bar>
  </Column>
);

const AppControls = ({ state, setState, data, conduitSend }) => {
  const controlsMap = {
    Attic: AtticControls,
    Conduit: ConduitControls,
    BacklightServer: BacklightServerControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return (
    <Controls data={data} state={state} setState={setState}
      conduitSend={conduitSend}/>
  );
};

export default AppControls;

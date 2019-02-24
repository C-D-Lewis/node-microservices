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

const Bar = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
  };

  return <div style={style}>{children}</div>;
};

const Column = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
  };

  return <div style={style}>{children}</div>;
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
          restyle={{ width: '153px' }}
          onChange={value => setConduitControlsProp('app', value)}/>
        <TextBox value={state.conduitControls.topic} placeholder="Topic"
          restyle={{ width: '153px' }}
          onChange={value => setConduitControlsProp('topic', value)}/>
      </Bar>
      <Bar>
        <TextBox value={state.conduitControls.message} placeholder="{}"
          restyle={{ width: "100%" }}
          onChange={value => setConduitControlsProp('message', value)}/>
      </Bar>
      <TextButton label="Send" onClick={() => {
        const { app: to, topic, message } = state.conduitControls;
        conduitSend({ to, topic, message: JSON.parse(message) });
      }}/>
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

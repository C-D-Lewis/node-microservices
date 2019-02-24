import React from 'react';
import { Colors, Fonts } from '../util';
import IconButton from '../components/IconButton';

const NoControls = () => {
  const style = {
    fontFamily: Fonts.body,
    color: Colors.darkGrey,
    paddingTop: '5px',
  }

  return <div style={style}></div>;;
};

const ButtonBar = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: '10px',
  };

  return <div style={style}>{children}</div>;
};

const ConduitControls = ({ conduitSend }) => (
  <div>

  </div>
);

const BacklightServerControls = ({ conduitSend }) => (
  <ButtonBar>
    <IconButton iconSrc="../../assets/off.png"
      onClick={() => conduitSend({ to: 'BacklightServer', topic: 'off' })}/>
    <IconButton iconSrc="../../assets/spotify.png"
      onClick={() => conduitSend({ to: 'BacklightServer', topic: 'spotify' })}/>
  </ButtonBar>
);

const AppControls = ({ state, setState, data, conduitSend }) => {
  const controlsMap = {
    Conduit: ConduitControls,
    BacklightServer: BacklightServerControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return <Controls data={data} conduitSend={conduitSend}/>;
};

export default AppControls;

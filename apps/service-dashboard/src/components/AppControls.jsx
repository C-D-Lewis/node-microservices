import React from 'react';
import { Colors, Fonts } from '../util';

const NoControls = () => {
  const style = {
    fontFamily: Fonts.body,
    color: Colors.darkGrey,
    paddingTop: '5px',
  }

  return <div style={style}>No controls</div>;;
};

const ConduitControls = () => <div>Conduit!</div>;

const AppControls = ({ state, setState, data, conduitSend }) => {
  const controlsMap = {
    Conduit: ConduitControls,
  };

  const Controls = controlsMap[data.app] || NoControls;
  return <Controls data={data}/>;
};

export default AppControls;

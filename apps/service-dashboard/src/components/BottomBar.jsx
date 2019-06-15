import React from 'react';
import { BOTTOM_BAR_HEIGHT } from '../util';

const BottomBar = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'monospace',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    minHeight: BOTTOM_BAR_HEIGHT,
    padding: '5px',
    backgroundColor: '#333',
    color: 'white',
    alignItems: 'center',
  };

  return <div style={style}>{children}</div>;
};

export default BottomBar;

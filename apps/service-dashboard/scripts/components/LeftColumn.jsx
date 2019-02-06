import React from 'react';
import { Colors } from '../util';

const LeftColumn = ({ children }) => {
  const style = {
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: Colors.lightGrey,
    height: '600px',
  };

  return <div style={style}>{children}</div>;
};

export default LeftColumn;

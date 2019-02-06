import React from 'react';

export const FlexColumn = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 0,
  };

  return <div style={style}>{children}</div>;
};


export const FlexRow = ({ chilren }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    padding: '10px initial 0px',
  };

  return <div style={style}>{children}</div>;
};

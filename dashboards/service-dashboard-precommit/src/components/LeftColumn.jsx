import React from 'react';

const LeftColumn = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'flex-start',
    borderRight: 'solid 1px #0004',
    boxShadow: '0px 2px 3px 1px #5557',
  }}>
    {children}
  </div>;

export default LeftColumn;
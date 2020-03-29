import React from 'react';

const LeftColumn = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: '100vh',
    alignItems: 'flex-start',
    borderRight: 'solid 1px #0004',
    paddingTop: 10,
    boxShadow: '0px 2px 3px 1px #5557',
  }}>
    {children}
  </div>;

export default LeftColumn;

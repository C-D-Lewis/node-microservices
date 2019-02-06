import React from 'react';

const RightColumn  = ({ children }) => {
  const style = {
    width: '100%',
    backgroundColor: 'white',
    paddingLeft: '15px',
    paddingTop: '15px',
    paddingBottom: '20px',
  };

  return <div style={style}>{children}</div>;
};

export default RightColumn;

import React from 'react';

const Container = ({ children, style }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    ...style,
  }}>
    {children}
  </div>;

export default Container;

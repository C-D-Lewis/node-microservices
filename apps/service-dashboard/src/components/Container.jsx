import React from 'react';

const Container = ({ children, restyle }) => {
  const style = Object.assign({
    display: 'flex',
    flexDirection: 'row',
  }, restyle);

  return <div style={style}>{children}</div>;
};

export default Container;

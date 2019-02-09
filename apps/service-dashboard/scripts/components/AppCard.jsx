import React from 'react';

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    height: '100px',
    padding: '10px',
    margin: '20px',
    backgroundColor: 'white',
    borderRadius: '3px',
    boxShadow: '1px 2px 3px 1px #8884',
  };

  return <div style={style}>{children}</div>;
};

const AppCard = ({ data }) => (
  <Container>

  </Container>
);

export default AppCard;

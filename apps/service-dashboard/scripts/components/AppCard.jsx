import React from 'react';
import { Colors } from '../util';
import { FlexRow } from './FlexComponents';

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    height: '100px',
    padding: '15px',
    margin: '20px',
    backgroundColor: 'white',
    borderRadius: '3px',
    boxShadow: '1px 2px 3px 1px #8884',
  };

  return <div style={style}>{children}</div>;
};

const Title = ({ children }) => {
  const style = { fontSize: '1.3rem' };

  return <span style={style}>{children}</span>;
};

const Subtitle = ({ children }) => {
  const style = { fontSize: '0.9rem', color: Colors.darkGrey };

  return <span style={style}>{children}</span>;
};

const LED = ({ status }) => {
  const style = {
    backgroundColor: Colors.statusDown,
    width: '14px',
    height: '14px',
    borderRadius: '9px',
    marginRight: '5px',
  };

  if (status.includes('OK')) {
    style.backgroundColor = Colors.statusOk;
  }

  return <div style={style}/>;
};

const Row = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  return <div style={style}>{children}</div>;
};

const Status = ({ data }) => (
  <Row>
    <LED status={data.status}/>
    <Subtitle>{data.status} ({data.port})</Subtitle>
  </Row>
);

const AppCard = ({ data }) => (
  <Container>
    <Title>{data.app}</Title>
    <Status data={data}/>
  </Container>
);

export default AppCard;

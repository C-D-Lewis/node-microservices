import React from 'react';
import { Colors } from '../util';
import { FlexRow } from './FlexComponents';

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    height: '100px',
    padding: '20px',
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
  const style = { color: Colors.darkGrey };

  return <span style={style}>{children}</span>;
};

const LED = ({ status }) => {
  const style = {
    width: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: status.includes('OK') ? Colors.statusOK : Colors.statusDown,
    marginRight: '10px',
  };

  return <div style={style}/>;
};

const Status = ({ status }) => (
  <FlexRow>
    <LED status={status}/>
    <Subtitle>{status}</Subtitle>
  </FlexRow>
);

const AppCard = ({ data }) => (
  <Container>
    <Title>{data.app}</Title>
    <Status status={data.status}/>
  </Container>
);

export default AppCard;

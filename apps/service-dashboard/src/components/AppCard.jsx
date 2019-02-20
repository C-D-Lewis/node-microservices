import React from 'react';
import { Colors } from '../util';
import { FlexRow } from './FlexComponents';
import AppControls from './AppControls';

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '340px',
    height: '100px',
    padding: '15px',
    margin: '10px 20px',
    backgroundColor: 'white',
    borderRadius: '3px',
    boxShadow: '1px 2px 3px 1px #8884',
  };

  return <div style={style}>{children}</div>;
};

const Title = ({ children }) => {
  const style = { fontSize: '1.3rem', flex: 1 };

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

const Status = ({ data }) => {
  const ledRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  };

  return (
    <div style={ledRowStyle}>
      <LED status={data.status}/>
      <Subtitle>{data.status} ({data.port})</Subtitle>
    </div>
  );
};

const Row = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  return <div style={style}>{children}</div>;
};

const AppCard = ({ state, setState, data, conduitSend }) => (
  <Container>
    <Row>
      <Title>{data.app}</Title>
      <Status data={data}/>
    </Row>
    <AppControls state={state} setState={setState}
      data={data}
      conduitSend={conduitSend}/>
  </Container>
);

export default AppCard;

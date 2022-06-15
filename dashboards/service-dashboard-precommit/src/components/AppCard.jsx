import React, { useEffect, useState } from 'react';
import { Colors } from '../theme';
import AppControls from './AppControls';

const CardContainer = ({ children, visible }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    width: '375px',
    margin: '10px 0px 10px 20px',
    backgroundColor: 'white',
    borderRadius: '3px',
    boxShadow: '1px 2px 3px 1px #8884',
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: '0.6s',
    overflow: 'hidden',
  }}>
    {children}
  </div>;

const CardTitle = ({ children }) =>
  <span style={{
    fontSize: '1.2rem',
    flex: 1,
    color: 'white',
  }}>
    {children}
  </span>;

const LEDText = ({ children }) =>
  <span style={{
    fontSize: '0.9rem',
    color: Colors.lightGrey,
    paddingTop: 1,
  }}>
    {children}
  </span>;

const LED = ({ status }) =>
  <div style={{
    backgroundColor: Colors.statusDown,
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
    backgroundColor: status.includes('OK') ? Colors.statusOk : Colors.statusDown,
  }}/>;

const Status = ({ data }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  }}>
    <LED status={data.status} />
    <LEDText>{data.status} ({data.port})</LEDText>
  </div>;

const CardTitleRow = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryDarkGrey,
    padding: '5px 15px',
  }}>
    {children}
  </div>;

const AppCard = ({ appData }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <CardContainer visible={visible}>
      <CardTitleRow>
        <CardTitle>{appData.app}</CardTitle>
        <Status data={appData}/>
      </CardTitleRow>
      <AppControls data={appData} />
    </CardContainer>
  );
};

export default AppCard;

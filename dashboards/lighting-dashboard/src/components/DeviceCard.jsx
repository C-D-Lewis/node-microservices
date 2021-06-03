import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors } from '../theme';
import { pingDevice } from '../services/apiService';
import DeviceControls from './DeviceControls';

const CardContainer = ({ children, visible }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    width: 375,
    margin: '20px 0px 10px 0px',
    backgroundColor: Colors.darkGrey,
    borderRadius: 5,
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: '0.6s',
    overflow: 'hidden',
  }}>
    {children}
  </div>;

const CardTitle = ({ children }) =>
  <span style={{
    fontSize: '1.3rem',
    flex: 1,
    color: 'white',
  }}>
    {children}
  </span>;

const CardSubtitle = ({ children }) =>
  <span style={{
    fontSize: '1rem',
    color: Colors.lightGrey,
    paddingRight: 10,
    paddingTop: 2,
    color: '#ddd',
  }}>
    {children}
  </span>;

const LED = ({ available }) => {
  const requestInProgress = useSelector(state => state.requestInProgress);

  return requestInProgress
    ? (
      <img style={{
        width: 15, height: 15,
        marginRight: 5,
      }} src="../../assets/spinner.gif" />
    )
    : (
      <div style={{
        backgroundColor: Colors.statusDown,
        width: '15px',
        height: '15px',
        borderRadius: '9px',
        marginRight: '5px',
        backgroundColor: available ? Colors.statusOk : Colors.statusDown,
      }}/>
    );
};

const Status = ({ device, available }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  }}>
    <CardSubtitle>{device.ip}</CardSubtitle>
    <LED available={available} />
  </div>;

const CardTitleRow = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryDarkGrey,
    padding: '10px 15px',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }}>
    {children}
  </div>;

const DeviceCard = ({ device }) => {
  const [visible, setVisible] = useState(false);
  const [available, setAvailable] = useState(false);

  // When the card appears
  useEffect(() => {
    setTimeout(() => setVisible(true), 200);

    pingDevice(device)
      .then(apps => {
        const visuals = apps.find(p => p.app === 'visuals');
        setAvailable(visuals && visuals.status === 'OK');
      });
  }, []);

  return (
    <CardContainer visible={visible}>
      <CardTitleRow>
        <CardTitle>{device.name}</CardTitle>
        <Status device={device} available={available} />
      </CardTitleRow>
      <DeviceControls device={device} />
    </CardContainer>
  );
};

export default DeviceCard;

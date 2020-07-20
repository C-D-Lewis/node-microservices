import React, { useEffect, useState } from 'react';
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
    fontSize: '1.0rem',
    color: Colors.lightGrey,
    paddingTop: 1,
  }}>
    {children}
  </span>;

const LED = ({ available }) =>
  <div style={{
    backgroundColor: Colors.statusDown,
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
    backgroundColor: available ? Colors.statusOk : Colors.statusDown,
  }}/>;

const Status = ({ device, available }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  }}>
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
        const ambience = apps.find(p => p.app === 'ambience');
        setAvailable(ambience && ambience.status === 'OK');
      });
  }, []);

  return (
    <CardContainer visible={visible}>
      <CardTitleRow>
        <CardTitle>{device.ip}</CardTitle>
        <Status device={device} available={available} />
      </CardTitleRow>
      <DeviceControls device={device} />
    </CardContainer>
  );
};

export default DeviceCard;

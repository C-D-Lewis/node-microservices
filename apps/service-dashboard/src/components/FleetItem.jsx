import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setIp } from '../actions';

const ItemName = ({ children }) =>
  <span style={{
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    paddingLeft: '15px',
    marginBottom: '5px',
  }}>
    {children}
  </span>;

const ItemIP = ({ children, onClick, reachable }) =>
  <span style={{
    color: reachable ? 'black' : 'lightgrey',
    fontSize: '1.1rem',
    paddingLeft: '25px',
    fontFamily: 'monospace',
    margin: '3px 0px 3px 0px',
    cursor: 'pointer',
  }}
  onClick={onClick}>
    {children}
  </span>;

const ItemContainer = ({ children }) =>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    border: '0',
    margin: '7px 0px 7px 0px',
  }}>
    {children}
  </div>;

const FleetItem = ({ itemData }) => {
  const dispatch = useDispatch();
  const [publicIpValid, setPublicIpValid] = useState(false);
  const [localIpValid, setLocalIpValid] = useState(false);

  const { deviceName, publicIp, localIp } = itemData;

  const testPublicIp = async () => {
    try {
      const res = await fetch(`http://${publicIp}:5959/apps`);
      setPublicIpValid(true);
    } catch (err) { /* It isn't available */ }
  };

  const testLocalIp = async () => {
    try {
      const res = await fetch(`http://${localIp}:5959/apps`);
      setLocalIpValid(true);
    } catch (err) { /* It isn't available */ }
  };

  useEffect(() => {
    testPublicIp();
    testLocalIp();
  }, []);

  return (
    <ItemContainer>
      <ItemName>{deviceName}</ItemName>
      <ItemIP reachable={publicIpValid}
        onClick={() => dispatch(setIp(publicIp))}>
        {publicIp}
      </ItemIP>
      <ItemIP reachable={localIpValid}
        onClick={() => dispatch(setIp(localIp))}>
        {localIp}
      </ItemIP>
    </ItemContainer>
  );
};

export default FleetItem;

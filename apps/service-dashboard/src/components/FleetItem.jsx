import React, { useState, useEffect } from 'react';

const Name = ({ children }) => {
  const style = {
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    paddingLeft: '15px',
    marginBottom: '5px',
  };

  return <span style={style}>{children}</span>;
};

const IP = ({ children, onClick, reachable }) => {
  const style = {
    color: reachable ? 'black' : 'lightgrey',
    fontSize: '1.1rem',
    paddingLeft: '25px',
    fontFamily: 'monospace',
    margin: '3px 0px 3px 0px',
    cursor: 'pointer',
  };

  return <span style={style} onClick={onClick}>{children}</span>;
};

const Container = ({ children }) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    border: '0',
    margin: '7px 0px 7px 0px',
  };

  return <div style={style}>{children}</div>;
};

const FleetItem = ({ data, loadFromIp }) => {
  const [publicIpValid, setPublicIpValid] = useState(false);
  const [localIpValid, setLocalIpValid] = useState(false);
  const [tested, setTested] = useState(false);

  const testPublicIp = async () => {
    setTested(true);
    try {
      const json = await fetch(`http://${data.publicIp}:5959/apps`)
        .then(res => res.json());
      setPublicIpValid(true);
    } catch (err) {}
  };

  const testLocalIp = async () => {
    try {
      const json = await fetch(`http://${data.localIp}:5959/apps`)
        .then(res => res.json());
      setLocalIpValid(true);
    } catch (err) {}
  };

  useEffect(() => {
    testPublicIp();
    testLocalIp();
  }, []);

  const { deviceName, publicIp, localIp } = data;

  return (
    <Container>
      <Name>{deviceName}</Name>
      <IP reachable={publicIpValid} onClick={() => loadFromIp(publicIp)}>
        {publicIp}
      </IP>
      <IP reachable={localIpValid} onClick={() => loadFromIp(localIp)}>
        {localIp}
      </IP>
    </Container>
  );
};

export default FleetItem;

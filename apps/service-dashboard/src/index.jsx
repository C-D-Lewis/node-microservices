import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BottomBar } from './components/BottomBar';
import { setFleetList, setApps, setIp, setBottomBarText } from './actions';
import AppCard from './components/AppCard';
import Container from './components/Container';
import FleetItem from './components/FleetItem';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import LeftColumn from './components/LeftColumn';
import MainArea from './components/MainArea';
import Navbar from './components/Navbar';
import store from './store';

const {
  /* Where the fleet list can be found. */
  FLEET_HOST,
} = window.config;
/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

const Dashboard = () => {
  const dispatch = useDispatch();

  const ip = useSelector(state => state.ip);
  const fleetList = useSelector(state => state.fleetList);
  const apps = useSelector(state => state.apps);
  const bottomBarText = useSelector(state => state.bottomBarText);

  const loadFleetList = async () => {
    dispatch(setFleetList([]));

    const packet = {
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    };
    const opts = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    };

    try {
      const json = await fetch(`http://${FLEET_HOST}:${CONDUIT_PORT}/conduit`, opts)
        .then(res => res.json());
      const fleetList = json.message.value;
      dispatch(setFleetList(fleetList));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setTimeout(loadFleetList, 200);
  }, []);

  const loadApps = async (ip) => {
    dispatch(setApps([]));

    try {
      const json = await fetch(`http://${ip}:${CONDUIT_PORT}/apps`)
        .then(res => res.json());
      const apps =  json.sort((a, b) => a.app < b.app ? -1 : 1);
      dispatch(setApps(apps));
    } catch (err) {
      console.error(err);
    }
  }

  const loadFromIp = ip => {
    dispatch(setIp(ip));
    loadApps(ip);
  };

  const conduitSend = async (packet) => {
    dispatch(setBottomBarText('Sending...'));

    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    };
    const json = await fetch(`http://${ip}:5959/conduit`, opts)
      .then(res => res.json());
    dispatch(setBottomBarText(JSON.stringify(json)));
    return json;
  };

  return (
    <div>
      <Navbar title="Service Dashboard" icon="../assets/raspberrypi.png">
        <IPTextBox ip={ip} onChange={ip => dispatch(setIp(ip))}/>
        <IconButton iconSrc="../assets/reload.png" onClick={() => loadApps()}/>
      </Navbar>
      <Container restyle={{ width: '100%' }}>
        <LeftColumn>
          {fleetList.map(p => (
            <FleetItem key={p.deviceName} data={p} loadFromIp={v => loadFromIp(v)}/>
          ))}
        </LeftColumn>
        <MainArea>
          {apps.map(p => (
            <AppCard key={p.app} data={p} conduitSend={data => conduitSend(data)}/>
          ))}
        </MainArea>
        <BottomBar>{bottomBarText}</BottomBar>
      </Container>
    </div>
  );
};

const Application = () => (
  <Provider store={store}>
    <Dashboard/>
  </Provider>
);

ReactDOM.render(<Application/>, document.getElementById('app'));

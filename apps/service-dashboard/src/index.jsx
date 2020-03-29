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

const ServiceDashboard = () => {
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
      const res = await fetch(`http://${FLEET_HOST}:${CONDUIT_PORT}/conduit`, opts)
      const { message } = await res.json();
      const fleetList = message.value;
      dispatch(setFleetList(fleetList));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setTimeout(loadFleetList, 200);
  }, []);

  const loadApps = async () => {
    dispatch(setApps([]));

    try {
      const res = await fetch(`http://${ip}:${CONDUIT_PORT}/apps`);
      const json = await res.json();
      const apps =  json.sort((a, b) => a.app < b.app ? -1 : 1);
      dispatch(setApps(apps));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApps();
  }, [ip]);

  const conduitSend = async (packet) => {
    dispatch(setBottomBarText('Sending...'));

    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    };
    const res = await fetch(`http://${ip}:5959/conduit`, opts);
    const json = await res.json();
    dispatch(setBottomBarText(JSON.stringify(json)));
    return json;
  };

  return (
    <div>
      <Navbar title="Service Dashboard"
        icon="../assets/raspberrypi.png">
        <IPTextBox value={ip}
          onChange={ip => dispatch(setIp(ip))}/>
        <IconButton iconSrc="../assets/reload.png"
          onClick={() => loadApps()}/>
      </Navbar>
      <Container style={{ width: '100%' }}>
        <LeftColumn>
          {fleetList.map(p => (
            <FleetItem key={p.deviceName}
              itemData={p} />
          ))}
        </LeftColumn>
        <MainArea>
          {apps.map(p => (
            <AppCard key={p.app}
              appData={p}
              conduitSend={data => conduitSend(data)} />
          ))}
        </MainArea>
        <BottomBar>{bottomBarText}</BottomBar>
      </Container>
    </div>
  );
};

const Application = () => (
  <Provider store={store}>
    <ServiceDashboard/>
  </Provider>
);

ReactDOM.render(<Application/>, document.getElementById('app'));

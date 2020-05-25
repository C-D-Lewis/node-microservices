import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BottomBar } from './components/BottomBar';
import { setFleetList, setApps, setIp, setBottomBarText, setToken } from './actions';
import { sendPacket } from './services/conduitService';
import AppCard from './components/AppCard';
import Container from './components/Container';
import FleetItem from './components/FleetItem';
import IconButton from './components/IconButton';
import IPTextBox from './components/IPTextBox';
import TokenTextBox from './components/TokenTextBox';
import LeftColumn from './components/LeftColumn';
import MainArea from './components/MainArea';
import Navbar from './components/Navbar';
import store from './store';

/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;

const ServiceDashboard = () => {
  const dispatch = useDispatch();

  const ip = useSelector(state => state.ip);
  const token = useSelector(state => state.token);
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
    try {
      const { message } = await sendPacket(packet);
      const fleetList = message.value;
      dispatch(setFleetList(fleetList));
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div>
      <Navbar title="Service Dashboard"
        icon="../assets/raspberrypi.png">
        <IPTextBox value={ip}
          onChange={value => dispatch(setIp(value))}/>
        <TokenTextBox value={token}
          onChange={value => dispatch(setToken(value))}/>
        <IconButton iconSrc="../assets/reload.png"
          onClick={() => loadApps()}/>
      </Navbar>
      <Container style={{ width: '100%' }}>
        <LeftColumn>
          {fleetList.map(p => <FleetItem key={p.deviceName} itemData={p} />)}
        </LeftColumn>
        <MainArea>
          {apps.map(p => <AppCard key={p.app} appData={p} />)}
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

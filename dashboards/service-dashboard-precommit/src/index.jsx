import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { ResponseBar } from './components/ResponseBar';
import { setFleetList, setApps, setIp, setToken } from './actions';
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

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement}
 */
const ServiceDashboard = () => {
  const dispatch = useDispatch();

  const ip = useSelector(state => state.ip);
  const token = useSelector(state => state.token);
  const fleetList = useSelector(state => state.fleetList);
  const apps = useSelector(state => state.apps);
  const ResponseBarText = useSelector(state => state.ResponseBarText);

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

  const parseParams = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Token
    const tokenVal = params.get('token');
    if (tokenVal) {
      dispatch(setToken(tokenVal));
    }
  };

  // When the IP selection changes, reload apps from there
  useEffect(() => {
    loadApps();
  }, [ip]);

  // When the component mounts
  useEffect(() => {
    parseParams();
  }, []);

  // When the token changes, reload the fleet list
  useEffect(() => {
    loadFleetList();
  }, [token]);

  return (
    <div>
      <Navbar title="Service Dashboard"
        icon="../assets/raspberrypi.png">
        <IPTextBox value={ip}
          onChange={value => dispatch(setIp(value))}/>
        <TokenTextBox value={token}
          onChange={value => dispatch(setToken(value))}/>
        <IconButton iconSrc="../assets/reload.png"
          onClick={async () => {
            await loadFleetList();
            loadApps();
          }}/>
      </Navbar>
      <Container style={{ width: '100%' }}>
        <LeftColumn>
          {fleetList.map(p => <FleetItem key={p.deviceName} itemData={p} />)}
        </LeftColumn>
        <MainArea>
          <ResponseBar>{ResponseBarText}</ResponseBar>
          {apps.map(p => <AppCard key={p.app} appData={p} />)}
        </MainArea>
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
